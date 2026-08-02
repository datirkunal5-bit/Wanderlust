const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const { listingSchema } = require("../schema.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

// INDEX
router.get("/", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));

// NEW
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new.ejs");
});

// CREATE
router.post("/", isLoggedIn, validateListing, wrapAsync(async (req, res) => {
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

// SHOW
router.get("/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) throw new ExpressError(404, "Listing not found");
  res.render("listings/show.ejs", { listing });
}));

// EDIT
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) throw new ExpressError(404, "Listing not found");
  res.render("listings/edit.ejs", { listing });
}));

// UPDATE
router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(async (req, res) => {
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

// DELETE
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
}));

module.exports = router;