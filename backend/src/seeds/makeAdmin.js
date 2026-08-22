/**
 * makeAdmin.js — Promote a user to admin role
 *
 * Usage:
 *   node src/seeds/makeAdmin.js <email>
 *
 * Example:
 *   node src/seeds/makeAdmin.js you@example.com
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";

dotenv.config();

const email = process.argv[2];

if (!email) {
  console.error("❌  Please provide an email address.");
  console.error("    Usage: node src/seeds/makeAdmin.js <email>");
  process.exit(1);
}

async function makeAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅  Connected to MongoDB");

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { $set: { role: "admin" } },
      { new: true }
    );

    if (!user) {
      console.error(`❌  No user found with email: ${email}`);
      process.exit(1);
    }

    console.log(`✅  Success! "${user.fullName}" (${user.email}) is now an admin.`);
  } catch (err) {
    console.error("❌  Error:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌  Disconnected from MongoDB");
  }
}

makeAdmin();
