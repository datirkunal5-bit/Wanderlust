if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const cookieParser = require("cookie-parser");

const User = require("./models/user.js");
const ExpressError = require("./utils/ExpressError.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// ---------- Configuration ----------
const MONGO_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";
const SECRET = process.env.SECRET || "wanderlustsupersecretkey2026";
const PORT = process.env.PORT || 8080;

// ---------- MongoDB Connection ----------
async function main() {
  await mongoose.connect(MONGO_URL);
}

main()
  .then(() => console.log("✓ Connected to MongoDB database successfully"))
  .catch((err) => console.error("✗ MongoDB connection error:", err));

// ---------- View Engine & Static Files ----------
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(cookieParser(SECRET));

// ---------- Session & Flash ----------
const sessionOptions = {
  secret: SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// ---------- Passport Authentication ----------
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ---------- Global Locals Middleware ----------
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  res.locals.searchQuery = req.query.q || "";
  res.locals.activeCategory = req.query.category || "all";
  next();
});

// ---------- Basic Routes ----------
app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/about", (req, res) => {
  res.render("about.ejs", {
    title: "About Wanderlust",
    name: "Wanderlust",
    description: "Discover handcrafted stays, unique experiences, and unforgettable journeys around the world.",
  });
});

// ---------- Mounted Routers ----------
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// ---------- 404 & Error Handlers ----------
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { statusCode, message });
});

// ---------- Start Server ----------
app.listen(PORT, () => {
  console.log(`✓ Wanderlust server running at http://localhost:${PORT}`);
});