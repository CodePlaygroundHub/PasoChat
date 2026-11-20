import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

dotenv.config();

const createAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    const password = process.env.ADMIN_PASSWORD;
    const fullName = process.env.ADMIN_NAME?.trim() || "PasoChat Admin";

    if (!email || !password) {
      throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
    }

    if (password.length < 6) {
      throw new Error("ADMIN_PASSWORD must be at least 6 characters long");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const hashedPassword = await bcrypt.hash(password, 12);

    let admin = await User.findOne({ email });

    if (admin) {
      admin.password = hashedPassword;
      admin.role = "admin";
      admin.isVerified = true;
      await admin.save();

      console.log("Existing account updated and promoted to admin.");
    } else {
      admin = await User.create({
        fullName,
        email,
        password: hashedPassword,
        role: "admin",
        isVerified: true,
        provider: "local",
      });

      console.log("Admin account created successfully.");
    }

    console.log(`Admin email: ${admin.email}`);
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();