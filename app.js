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

const User = require("./models/user.js");
const Listing = require("./models/listing");
const ExpressError = require("./utils/ExpressError.js");
const wrapAsync = require("./utils/wrapAsync.js");
const { listingSchema } = require("./schema.js");
const Review = require("./models/review.js");
const { listingSchema, reviewSchema } = require("./schema.js");

const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  }
  next();
};

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  }
  next();
};
// ---------- Middleware ----------
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

// Single source of truth for locals - runs once per request
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

// ---------- Basic Routes ----------
app.get("/", (req, res) => {
  res.render("home.ejs");
});

const isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be logged in to do that!");
    return res.redirect("/login");
  }
  next();
};

app.get("/about", (req, res) => {
  res.render("about", {
    title: "About Us",
    name: "Wanderlust",
    description: "We are a travel company dedicated to providing the best travel experiences.",
  });
});

// ---------- Auth Routes ----------
app.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

app.post("/signup", wrapAsync(async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({ username, email });
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Wanderlust!");
      res.redirect("/listings");
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/signup");
  }
}));

app.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect("/listings");
  }
);

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "Logged out successfully!");
    res.redirect("/listings");
  });
});

// ---------- Listing Routes ----------
app.get("/listings", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));

app.get("/listings/new", isLoggedIn, (req, res) => {
  res.render("listings/new.ejs");
});

app.post("/listings", isLoggedIn, validateListing, wrapAsync(async (req, res) => {
  try {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  } catch (err) {
    if (err.name === "ValidationError") {
      req.flash("error", err.message);
      return res.redirect("/listings/new");
    }
    throw err;
  }
}));
const isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing.owner.equals(req.user._id)) {
    req.flash("error", "You don't have permission to do that!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

app.get("/listings/:id/edit", isLoggedIn, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) throw new ExpressError(404, "Listing not found");
  res.render("listings/edit.ejs", { listing });
}));

app.put("/listings/:id", isLoggedIn, validateListing, wrapAsync(async (req, res) => {
  try {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { runValidators: true });
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    if (err.name === "ValidationError") {
      req.flash("error", err.message);
      return res.redirect(`/listings/${req.params.id}/edit`);
    }
    throw err;
  }
}));
app.get("/listings/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");
  if (!listing) throw new ExpressError(404, "Listing not found");
  res.render("listings/show.ejs", { listing });
}));

app.delete("/listings/:id", isLoggedIn, wrapAsync(async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
}));
// CREATE review
app.post("/listings/:id/reviews", isLoggedIn, validateReview, wrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  const newReview = new Review(req.body.review);
  newReview.author = req.user._id;

  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  req.flash("success", "New Review Added!");
  res.redirect(`/listings/${listing._id}`);
}));

// DELETE review
app.delete("/listings/:id/reviews/:reviewId", isLoggedIn, wrapAsync(async (req, res) => {
  const { id, reviewId } = req.params;

  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Review Deleted!");
  res.redirect(`/listings/${id}`);
}));

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