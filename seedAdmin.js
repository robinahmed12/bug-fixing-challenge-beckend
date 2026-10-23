// Admin credential seed script (safe, non-destructive)
// Creates the admin account if missing, or promotes/updates it if it already
// exists (e.g. the seeded admin@coursemaster.com had role "student").
// Usage: node seedAdmin.js

const dotenv = require("dotenv");
dotenv.config();

const bcrypt = require("bcrypt");
const connectDB = require("./src/config/db");
const User = require("./src/models/User");

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@coursemaster.com").toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const ADMIN_NAME = process.env.ADMIN_NAME || "Super Admin";

const seedAdmin = async () => {
  try {
    await connectDB();

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Upsert: create the admin if missing, otherwise fix its role/password.
    const admin = await User.findOneAndUpdate(
      { email: ADMIN_EMAIL },
      { name: ADMIN_NAME, passwordHash, role: "admin" },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    console.log("Admin seed complete ✅");
    console.log("-----------------------------------------");
    console.log(`Email:    ${admin.email}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log(`Role:     ${admin.role}`);
    console.log(`Id:       ${admin._id}`);
    console.log("-----------------------------------------");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Admin seeding Error:", error.message);
    process.exit(1);
  }
};

const mongoose = require("mongoose");
seedAdmin();
