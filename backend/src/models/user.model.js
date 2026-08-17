import mongoose from "mongoose";

const securityQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      select: false, // never return answer
    },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      minlength: 6,
      select: false,
    },

    profilePic: {
      type: String,
      default: "",
    },

    //Role system
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // Ban system
    isBanned: {
      type: Boolean,
      default: false,
    },

    banReason: {
      type: String,
      default: "",
    },

    // AI bot account
    isAI: {
      type: Boolean,
      default: false,
    },

    // Presence
    isOnline: {
      type: Boolean,
      default: false,
    },

    lastSeen: {
      type: Date,
      default: null,
    },

    chatWallpapers: {
      type: Map,
      of: String,
      default: {},
    },

    pinnedChats: {
      type: [
        {
          chatId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
          },
          chatType: {
            type: String,
            enum: ["user", "group"],
            required: true,
          },
        },
      ],
      default: [],
    },

    // Security Questions (Max 3)
    securityQuestions: {
      type: [securityQuestionSchema],
      validate: [
        {
          validator: function (arr) {
            return arr.length <= 3;
          },
          message: "Maximum 3 security questions allowed",
        },
      ],
      default: [],
    },

    // Temporary reset session (very important)
    passwordResetSession: {
      type: String,
      select: false,
      default: null,
    },

    // OTP-based password recovery
    resetOtp: {
      type: String,
      select: false,
      default: null,
    },

    resetOtpExpiry: {
      type: Date,
      default: null,
    },

    // OTP-based email verification
    isVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationOtp: {
      type: String,
      select: false,
      default: null,
    },

    emailVerificationOtpExpiry: {
      type: Date,
      default: null,
    },

    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    googleId: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
    },

    refreshTokenHash: {
      type: String,
      select: false,
      default: null,
    },
  },
  { timestamps: true },
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
