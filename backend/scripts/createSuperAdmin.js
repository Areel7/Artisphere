/**
 * Promote an existing user to superadmin, or create a new superadmin user.
 * Usage:
 *   node backend/scripts/createSuperAdmin.js <email> <password> [username]
 * Or set env: SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD, SUPERADMIN_USERNAME
 *
 * Requires MongoDB connection string in .env (same as app).
 */
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../Models/User.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const emailArg = process.argv[2] || process.env.SUPERADMIN_EMAIL;
const passwordArg = process.argv[3] || process.env.SUPERADMIN_PASSWORD;
const usernameArg = process.argv[4] || process.env.SUPERADMIN_USERNAME || "Super Admin";

async function main() {
  if (!emailArg) {
    console.error(
      "Usage: node backend/scripts/createSuperAdmin.js <email> [password] [username]\n" +
        "  New user: email + password required.\n" +
        "  Existing user: email only promotes to superadmin; add password to reset it.\n" +
        "Or set SUPERADMIN_EMAIL (and SUPERADMIN_PASSWORD for new accounts) in the environment.",
    );
    process.exit(1);
  }

  const uri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    process.env.DATABASE_URL ||
    "";
  if (!uri) {
    console.error("Missing MONGODB_URI, MONGO_URI, or DATABASE_URL in .env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  const email = String(emailArg).trim().toLowerCase();
  let user = await User.findOne({ email });

  if (user) {
    user.role = "superadmin";
    if (passwordArg) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(String(passwordArg), salt);
    }
    await user.save();
    console.log(
      passwordArg
        ? `Updated existing user to superadmin (password reset): ${email}`
        : `Promoted existing user to superadmin: ${email}`,
    );
  } else {
    if (!passwordArg) {
      console.error("User not found; password is required to create a new superadmin.");
      await mongoose.disconnect();
      process.exit(1);
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(String(passwordArg), salt);
    user = await User.create({
      username: String(usernameArg).trim(),
      email,
      password: hashedPassword,
      role: "superadmin",
    });
    console.log(`Created superadmin: ${email}`);
  }

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
