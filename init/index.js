if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
}

const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");
const initData = require("./data.js");

const MONGO_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("✓ Connected to MongoDB for seeding");
}

async function initDB() {
  try {
    await main();

    // Check for an existing owner user
    let defaultOwner = await User.findOne({ username: "kunal" });
    if (!defaultOwner) {
      defaultOwner = await User.findOne({});
    }

    if (!defaultOwner) {
      console.log("No user found. Creating default 'wanderlust_host' user...");
      const newUser = new User({
        username: "wanderlust_host",
        email: "host@wanderlust.com",
      });
      defaultOwner = await User.register(newUser, "wanderlust123");
      console.log("✓ Default user created:", defaultOwner.username);
    } else {
      console.log(`✓ Using existing owner: ${defaultOwner.username} (${defaultOwner._id})`);
    }

    // Clear old listings and seed fresh sample data
    await Listing.deleteMany({});
    console.log("✓ Cleared old listings");

    const preparedListings = initData.data.map((obj) => ({
      ...obj,
      owner: defaultOwner._id,
    }));

    await Listing.insertMany(preparedListings);
    console.log(`✓ Successfully seeded ${preparedListings.length} premium listings!`);

    await mongoose.connection.close();
    console.log("✓ Database connection closed cleanly.");
    process.exit(0);
  } catch (err) {
    console.error("✗ Error seeding database:", err);
    process.exit(1);
  }
}

initDB();
