const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const Listing = require("./models/listing");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const sessionOptions = {
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// View Engine
app.set("view engine", "ejs");
app.set("layout", "layouts/boilerplate");
app.engine("ejs", ejsMate);

// MongoDB Connection
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

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

// ---------- Listing Routes (REST order matters) ----------

// INDEX - show all listings
app.get("/listings", async (req, res, next) => {
  try {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  } catch (err) {
    next(err);
  }
});

// NEW - show form to create a listing (must be before /:id)
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// CREATE - save the submitted listing
app.post("/listings", async (req, res, next) => {
  try {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  } catch (err) {
    next(err);
  }
});

// SHOW - view a single listing
app.get("/listings/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).send("Listing not found");
    }
    res.render("listings/show.ejs", { listing });
  } catch (err) {
    next(err);
  }
});

// EDIT - show form to edit a listing
app.get("/listings/:id/edit", async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).send("Listing not found");
    }
    res.render("listings/edit.ejs", { listing });
  } catch (err) {
    next(err);
  }
});

// UPDATE - save the edited listing
app.put("/listings/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    next(err);
  }
});

// DELETE - remove a listing
app.delete("/listings/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
  } catch (err) {
    next(err);
  }
});

// ---------- 404 + Error Handlers (always last) ----------
app.use((req, res) => {
  res.status(404).send("Page not found");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// ---------- Start Server ----------
app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});