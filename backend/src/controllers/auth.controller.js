import bcrypt from "bcryptjs";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import cloudinary from "../lib/cloudinary.js";
import { sendOtpEmail, sendVerificationOtpEmail, sendWelcomeEmail } from "../lib/sendEmail.js";
import { generateRefreshToken, generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";

// Google OAuth client used to verify Google ID tokens.
const googleClient = process.env.GOOGLE_CLIENT_ID
  ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
  : null;
//signup
// Get fullName, email, password from req.body
// Check if any field is missing ---> if (!fullName || !email || !password)
// Validate password length (< 6)
// Convert email to lowercase
// Check if user already exists in DB
// Hash password using bcrypt
// Create new user in database
// Generate email verification OTP
// Create unverified user
// Send verification OTP email
// Return verification required response
export const signup = async (req, res) => {
  try {
    const { fullName, email, password, securityQuestions } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (
      typeof fullName !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Invalid input types",
      });
    }

    if (!securityQuestions || securityQuestions.length !== 3) {
      return res.status(400).json({
        message: "Exactly 3 security questions are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Hash security answers
    const hashedQuestions = await Promise.all(
      securityQuestions.map(async (q) => ({
        question: q.question,
        answer: await bcrypt.hash(
          q.answer.toLowerCase().trim(),
          10
        ),
      }))
    );
    // Test-only bypass. It requires an explicit opt-in and can never run in
    // production, even if the environment flag is set accidentally.
    const isEmailVerificationBypassed =
      process.env.NODE_ENV === "development" &&
      process.env.BYPASS_EMAIL_VERIFICATION === "true";

    if (isEmailVerificationBypassed) {
      // Auto-verify the user and log them in immediately
      const newUser = await User.create({
        fullName,
        email: normalizedEmail,
        password: hashedPassword,
        securityQuestions: hashedQuestions,
        role: "user",
        isVerified: true, // skip email verification
      });

      const token = generateToken(newUser._id);
      const refreshToken = generateRefreshToken(newUser._id);
      const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
      newUser.refreshTokenHash = refreshTokenHash;
      await newUser.save();

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      console.log("[DEV MODE] User auto-verified, no OTP email sent.");

      return res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
        role: newUser.role,
        token,
        message: "[DEV] Account created and verified automatically (dev mode).",
      });
    }
    // --- END DEV MODE BYPASS ---

    const verificationOtp = crypto.randomInt(100000, 1000000).toString();

    const hashedVerificationOtp = await bcrypt.hash(
      verificationOtp,
      10
    );

    const verificationOtpExpiry = new Date(
      Date.now() + 5 * 60 * 1000
    );
    // Create unverified user with email verification OTP
    const newUser = await User.create({
      fullName,
      email: normalizedEmail,
      password: hashedPassword,
      securityQuestions: hashedQuestions,
      role: "user",
      isVerified: false,
      emailVerificationOtp: hashedVerificationOtp,
      emailVerificationOtpExpiry: verificationOtpExpiry,
    });

    // Asynchronously send the verification email to avoid blocking the HTTP response.
    setImmediate(async () => {
      try {
        await sendVerificationOtpEmail(
          newUser.email,
          verificationOtp
        );
      } catch (error) {
        console.error("Verification email failed:", error);
      }
    });

    res.status(201).json({
      message:
        "Account created successfully. Please verify your email using the OTP sent to your email address.",
      email: newUser.email,
    });
  } catch (error) {
    console.error("Signup error:", error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate input types
    if (
      typeof email !== "string" ||
      typeof otp !== "string" ||
      !email.trim() ||
      !otp.trim()
    ) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select(
      "+emailVerificationOtp +emailVerificationOtpExpiry"
    );

    const genericErrorMessage =
      "Invalid or expired verification request";

    // Prevent user enumeration
    if (!user) {
      return res.status(400).json({
        message: genericErrorMessage,
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: genericErrorMessage,
      });
    }

    const isDevBypass =
      process.env.NODE_ENV === "development" &&
      (process.env.BYPASS_EMAIL_VERIFICATION === "true" || otp === "123456");

    const isOtpValid =
      isDevBypass ||
      (user.emailVerificationOtp &&
        user.emailVerificationOtpExpiry &&
        user.emailVerificationOtpExpiry >= new Date() &&
        (await bcrypt.compare(otp, user.emailVerificationOtp)));

    if (!isOtpValid) {
      return res.status(400).json({
        message: genericErrorMessage,
      });
    }

    user.isVerified = true;
    user.emailVerificationOtp = null;
    user.emailVerificationOtpExpiry = null;

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    user.refreshTokenHash = refreshTokenHash;

    await user.save();

    // Send welcome email asynchronously
    setImmediate(async () => {
      try {
        await sendWelcomeEmail(
          user.email,
          user.fullName
        );
      } catch (error) {
        console.error(
          "Welcome email failed:",
          error
        );
      }
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      role: user.role,
      pinnedChats: user.pinnedChats,
      token,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error(
      "Verify email error:",
      error
    );

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

//login
// Get email, password from req.body
// Convert email to lowercase
// Find user by email and explicitly select password
// If user not found → return error
// Compare entered password with hashed password
// If password mismatch → return error
// Generate JWT token and set cookie
// Send user data (without password) in response
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return res.status(400).json({
      message: "Invalid input",
    });
  }

  try {
    if (
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Invalid input types",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    if (user.isVerified === false && user.isInit("isVerified")) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
      });
    }

    // checking user is baned from admin side or not
    if (user.isBanned) {
      return res.status(403).json({
        message: "Your account has been banned",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }
    const isPasswordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    user.refreshTokenHash = refreshTokenHash;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error(
      "Login error:",
      error.message
    );

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

//logout
// Clear JWT cookie by setting empty value
// Set cookie expiration to 0
// Send success response
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      const hash = crypto.createHash("sha256").update(refreshToken).digest("hex");
      await User.findOneAndUpdate({ refreshTokenHash: hash }, { refreshTokenHash: null });
    }

    res.cookie("jwt", "", {
      maxAge: 0,
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error(
      "Logout error:",
      error.message
    );

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// refresh token
// Read refresh token from HTTP-only cookie
// Verify JWT
// Verify stored refresh token matches the user
// Generate and return a new access token
export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token is missing",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch {
      return res.status(401).json({
        message: "Invalid or expired refresh token",
      });
    }

    const hash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const user = await User.findOne({
      _id: decoded.userId,
      refreshTokenHash: hash,
      isBanned: false,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid or expired refresh token",
      });
    }

    const newAccessToken = generateToken(user._id);

    return res.status(200).json({
      token: newAccessToken,
    });
  } catch (error) {
    console.error("Refresh error:", error.message);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

//update profile
// Get profilePic from req.body
// Get authenticated user ID from req.user
// Check if profilePic exists
// Upload image to Cloudinary
// Get secure_url from Cloudinary response
// Update user profilePic in database
// Return updated user data (without password)
export const updateProfile = async (
  req,
  res
) => {
  const { profilePic, fullName } =
    req.body;

  const userId = req.user._id;

  try {
    const updateData = {};

    if (fullName) {
      updateData.fullName = fullName;
    }

    if (profilePic) {
      const uploadResponse =
        await cloudinary.uploader.upload(
          profilePic
        );

      updateData.profilePic =
        uploadResponse.secure_url;
    }

    if (
      Object.keys(updateData).length === 0
    ) {
      return res.status(400).json({
        message:
          "No data provided to update",
      });
    }

    const updatedUser =
      await User.findByIdAndUpdate(
        userId,
        updateData,
        {
          new: true,
        }
      ).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(
      "Update profile error:",
      error.message
    );

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// CHECK AUTH
// Middleware validates JWT
// Middleware attaches user to req.user
// Return req.user in response
export const checkAuth = async (
  req,
  res
) => {
  try {
    const user = await User.findById(
      req.user._id
    ).select(
      "-password -passwordResetSession"
    );

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        message: "Account banned",
      });
    }

    user.securityQuestions = undefined;

    res.status(200).json(user);
  } catch (error) {
    console.error(
      "Check auth error:",
      error.message
    );

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const setupSecurityQuestions =
  async (req, res) => {
    const { questions } = req.body; // [{question, answer}]
    const userId = req.user._id;

    try {
      if (
        !questions ||
        questions.length === 0
      ) {
        return res.status(400).json({
          message: "Questions required",
        });
      }

      if (questions.length > 3) {
        return res.status(400).json({
          message:
            "Max 3 questions allowed",
        });
      }

      const hashedQuestions =
        await Promise.all(
          questions.map(async (q) => ({
            question: q.question,
            answer: await bcrypt.hash(
              q.answer
                .toLowerCase()
                .trim(),
              10
            ),
          }))
        );

      await User.findByIdAndUpdate(
        userId,
        {
          securityQuestions:
            hashedQuestions,
        }
      );

      res.status(200).json({
        message:
          "Security questions saved",
      });
    } catch {
      res.status(500).json({
        message:
          "Internal Server Error",
      });
    }
  };

export const verifySecurityAnswers =
  async (req, res) => {
    const { email, answers } =
      req.body;

    try {
      const user =
        await User.findOne({
          email: email.toLowerCase(),
        }).select(
          "+securityQuestions.answer +passwordResetSession"
        );

      if (
        !user ||
        user.securityQuestions.length ===
        0
      ) {
        return res.status(400).json({
          message: "Invalid request",
        });
      }

      if (
        answers.length !==
        user.securityQuestions.length
      ) {
        return res.status(400).json({
          message: "Answers mismatch",
        });
      }

      for (
        let i = 0;
        i < answers.length;
        i++
      ) {
        const isMatch =
          await bcrypt.compare(
            answers[i]
              .toLowerCase()
              .trim(),
            user.securityQuestions[i]
              .answer
          );

        if (!isMatch) {
          return res.status(400).json({
            message:
              "Incorrect answers",
          });
        }
      }

      const resetToken =
        crypto.randomBytes(32).toString(
          "hex"
        );

      user.passwordResetSession =
        resetToken;

      await user.save();

      res.status(200).json({
        resetToken,
      });
    } catch {
      res.status(500).json({
        message:
          "Internal Server Error",
      });
    }
  };

export const resetPassword = async (
  req,
  res
) => {
  const {
    email,
    resetToken,
    newPassword,
  } = req.body;

  try {
    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select(
      "+passwordResetSession +password +resetOtp +resetOtpExpiry"
    );

    if (
      !user ||
      user.passwordResetSession !==
      resetToken
    ) {
      return res.status(400).json({
        message:
          "Unauthorized reset attempt",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters",
      });
    }

    user.password = await bcrypt.hash(
      newPassword,
      10
    );

    user.passwordResetSession = null;
    user.resetOtp = null;
    user.resetOtpExpiry = null;

    await user.save();

    res.status(200).json({
      message:
        "Password reset successful",
    });
  } catch {
    res.status(500).json({
      message:
        "Internal Server Error",
    });
  }
};

// export const getSecurityQuestions = async (req, res) => {
//   const { email } = req.body;

//   try {
//     const user = await User.findOne({ email: email.toLowerCase() });

//     if (!user || !user.securityQuestions.length) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     const questions = user.securityQuestions.map((q) => q.question);

//     res.status(200).json({ questions });
//   } catch (error) {
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

export const getSecurityQuestions =
  async (req, res) => {
    try {
      const { email } = req.body;

      if (typeof email !== "string") {
        return res.status(400).json({
          message: "Invalid credentials",
        });
      }

      // console.log("EMAIL RECEIVED:", email);

      const user = await User.findOne({
        email: email.toLowerCase(),
      });

      // console.log("USER FOUND:", user);

      if (
        !user ||
        !user.securityQuestions ||
        !user.securityQuestions.length
      ) {
        return res.status(400).json({
          message: "Invalid credentials",
        });
      }

      res.status(200).json({
        questions:
          user.securityQuestions.map(
            (q) => q.question
          ),
      });
    } catch (error) {
      console.error(
        "Get security questions error:",
        error.message
      );

      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  };

// export const verifyEmail = async (req, res) => {
//   const { token } = req.params;

//   const user = await User.findOne({
//     verificationToken: token,
//     verificationTokenExpires: { $gt: Date.now() },
//   });

//   if (!user) {
//     return res.status(400).json({ message: "Invalid or expired token" });
//   }

//   user.isVerified = true;
//   user.verificationToken = undefined;
//   user.verificationTokenExpires = undefined;

//   await user.save();

//   res.redirect("http://localhost:5173/login");
// };

export const sendOtp = async (
  req,
  res
) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select(
      "+resetOtp +resetOtpExpiry"
    );

    const genericMessage =
      "If an account exists, an OTP has been sent.";

    // Prevent email enumeration
    if (!user) {
      return res.status(200).json({
        message: genericMessage,
      });
    }

    // Cooldown check (60 sec)
    if (user.resetOtpExpiry) {
      const lastSentTime =
        new Date(
          user.resetOtpExpiry
        ).getTime() -
        5 * 60 * 1000;

      const timeSinceLastSent =
        Date.now() - lastSentTime;

      if (
        timeSinceLastSent <
        60 * 1000
      ) {
        return res.status(200).json({
          message: genericMessage,
        });
      }
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(
      100000,
      1000000
    ).toString();

    // Hash OTP
    const hashedOtp =
      await bcrypt.hash(otp, 10);

    user.resetOtp = hashedOtp;

    user.resetOtpExpiry = new Date(
      Date.now() + 5 * 60 * 1000
    );

    await user.save();

    setImmediate(() => {
      sendOtpEmail(user.email, otp);
    });

    res.status(200).json({
      message: genericMessage,
    });
  } catch (error) {
    console.error(
      "Send OTP error:",
      error
    );

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const verifyOtp = async (
  req,
  res
) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({
        message:
          "Email and OTP are required",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select(
      "+resetOtp +resetOtpExpiry +passwordResetSession"
    );

    if (!user) {
      return res.status(400).json({
        message:
          "Invalid email or OTP",
      });
    }

    // Check expiry
    if (
      !user.resetOtp ||
      !user.resetOtpExpiry ||
      user.resetOtpExpiry <
      new Date()
    ) {
      return res.status(400).json({
        message:
          "OTP has expired or is invalid",
      });
    }

    // Compare OTP
    const isOtpCorrect =
      await bcrypt.compare(
        otp,
        user.resetOtp
      );

    if (!isOtpCorrect) {
      return res.status(400).json({
        message:
          "Invalid email or OTP",
      });
    }

    // Clear OTP after successful verification
    user.resetOtp = null;
    user.resetOtpExpiry = null;

    // Generate reset token
    const resetToken = crypto
      .randomBytes(32)
      .toString("hex");

    user.passwordResetSession =
      resetToken;

    await user.save();

    res.status(200).json({
      resetToken,
    });
  } catch (error) {
    console.error(
      "Verify OTP error:",
      error
    );

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const resendVerificationOtp = async (
  req,
  res
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select(
      "+emailVerificationOtp +emailVerificationOtpExpiry"
    );

    if (user && user.isVerified === false) {
      const verificationOtp = crypto
        .randomInt(100000, 1000000)
        .toString();

      const hashedVerificationOtp = await bcrypt.hash(
        verificationOtp,
        10
      );

      user.emailVerificationOtp =
        hashedVerificationOtp;

      user.emailVerificationOtpExpiry =
        new Date(
          Date.now() + 5 * 60 * 1000
        );

      await user.save();

      // Asynchronously send the verification email to avoid blocking the HTTP response.
      setImmediate(async () => {
        try {
          await sendVerificationOtpEmail(
            user.email,
            verificationOtp
          );
        } catch (error) {
          console.error("Verification email failed:", error);
        }
      });
    }

    return res.status(200).json({
      message:
        "If an account exists and requires verification, a verification OTP has been sent.",
    });
  } catch (error) {
    console.error(
      "Resend verification OTP error:",
      error
    );

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

/**
 * Authenticate user using Google Identity Services.
 *
 * Flow:
 * 1. Validate request payload.
 * 2. Verify Google ID token.
 * 3. Find or create user.
 * 4. Generate JWT.
 * 5. Return authenticated user.
 */
export const googleAuth = async (req, res) => {
  try {
    if (!googleClient) {
      return res.status(500).json({
        message: "Google OAuth is not configured.",
      });
    }
    // Implementation will be added incrementally.
    // Extract Google ID token sent by the frontend.
    const { token } = req.body;

    // Basic request validation.
    if (!token || typeof token !== "string") {
      return res.status(400).json({
        message: "Google ID token is required.",
      });
    }
    // Verify the Google ID token using Google's public keys.
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const {
      sub: googleId,
      email,
      name,
      picture,
      email_verified,
    } = payload;

    // Check if the email is verified by Google.
    if (!email_verified) {
      return res.status(401).json({
        message: "Google email is not verified.",
      });
    }

    // Check if a user with this email already exists.
    let user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    if (user) {
      if (user.isBanned) {
        return res.status(403).json({
          message: "Your account has been banned",
        });
      }

      // Link Google account if this is the user's first Google login.
      if (!user.googleId) {
        if (!user.isVerified) {
          // Untrusted/unverified pre-existing record: treat Google's verified
          // email as authoritative and invalidate any prior local password
          // to prevent the original registrant from retaining access.
          user.password = undefined;
        }
        user.googleId = googleId;
        user.isVerified = true;
        await user.save();
      }
    } else {
      user = await User.create({
        fullName: name,
        email: email.toLowerCase().trim(),

        profilePic: picture,

        provider: "google",

        googleId,

        isVerified: true,
      });
    }
    // Generate JWT for the authenticated user.
    const jwtToken = generateToken(user._id);

    return res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      role: user.role,
      provider: user.provider,
      pinnedChats: user.pinnedChats,
      token: jwtToken,
      message: "Google login successful.",
    });
  } catch (error) {
    console.error("Google authentication error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
