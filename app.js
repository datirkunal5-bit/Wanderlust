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

// ---------- Middleware ----------
app.use(cookieParser("mysupersecretcode"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const sessionOptions = {
  secret: "mysupersecretcode",
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

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

// ---------- View Engine ----------
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);

// ---------- MongoDB Connection ----------
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}
app.get("/cookie-test", (req, res) => {
  res.cookie("greeting", "hello from server");
  res.send("Cookie sent! Check your browser dev tools.");
});
app.get("/cookie-signed-test", (req, res) => {
  res.cookie("signedGreeting", "secure hello", { signed: true });
  res.send("Signed cookie sent!");
});

app.get("/cookie-read-test", (req, res) => {
  res.send({
    normalCookies: req.cookies,
    signedCookies: req.signedCookies,
  });
});
// ---------- Basic Routes ----------
app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/about", (req, res) => {
  res.render("about", {
    title: "About Us",
    name: "Wanderlust",
    description: "We are a travel company dedicated to providing the best travel experiences.",
  });
});

// ---------- Mounted Routers ----------
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// ---------- 404 + Error Handlers ----------
app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

// ---------- Start Server ----------
app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});