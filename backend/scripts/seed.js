require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Business = require("../models/Business");
const Insights = require("../models/Insights");
const Review = require("../models/Review");

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Set MONGODB_URI in backend/.env");
  process.exit(1);
}

async function run() {
  await mongoose.connect(uri);
  const dbName = mongoose.connection.db?.databaseName ?? "?";
  console.log(`[seed] MongoDB connected (database: ${dbName})`);
  await Promise.all([
    User.deleteMany({}),
    Business.deleteMany({}),
    Insights.deleteMany({}),
    Review.deleteMany({}),
  ]);
  const hash = await bcrypt.hash("demo1234", 10);
  await User.create({ email: "shuklamanya99@gmail.com", password: hash });
  await Business.create({
    name: "ABC Salon",
    category: "Beauty Salon",
    address: "Hyderabad",
    phone: "9876543210",
    rating: 4.2,
    total_reviews: 120,
  });
  await Insights.create({
    profile_views: 1200,
    search_views: 800,
    website_clicks: 150,
    phone_calls: 60,
    direction_requests: 40,
  });
  await Review.create([
    { name: "Ravi", rating: 5, comment: "Good service", date: new Date("2026-03-20T00:00:00.000Z") },
    { name: "Priya", rating: 4, comment: "Nice experience", date: new Date("2026-03-18T00:00:00.000Z") },
  ]);
  console.log("[seed] Seed completed successfully (business_app_users, business, insights, bi_reviews).");
  console.log("[seed] Demo login: shuklamanya99@gmail.com / demo1234");
  await mongoose.disconnect();
  console.log("[seed] MongoDB disconnected.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
