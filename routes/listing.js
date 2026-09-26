const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

// INDEX - View all listings with optional search & category filter
router.get("/", wrapAsync(async (req, res) => {
  const { q, category } = req.query;
  const filter = {};

  if (category && category.trim() !== "" && category.toLowerCase() !== "all") {
    filter.category = category.toLowerCase().trim();
  }

  if (q && q.trim() !== "") {
    const searchRegex = new RegExp(q.trim(), "i");
    filter.$or = [
      { title: searchRegex },
      { location: searchRegex },
      { country: searchRegex },
      { description: searchRegex },
    ];
  }

  const allListings = await Listing.find(filter).populate("owner");
  res.render("listings/index.ejs", {
    allListings,
    searchQuery: q || "",
    activeCategory: category || "all",
  });
}));

// NEW - Form to create a new listing
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new.ejs");
});

// CREATE - Create new listing
router.post("/", isLoggedIn, validateListing, wrapAsync(async (req, res) => {
  try {
    const listingData = { ...req.body.listing };
    if (!listingData.image || listingData.image.trim() === "") {
      listingData.image = "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200";
    }
    if (!listingData.category || listingData.category.trim() === "") {
      listingData.category = "trending";
    }

    const newListing = new Listing(listingData);
    newListing.owner = req.user._id;
    await newListing.save();

    req.flash("success", "New Listing Created!");
    res.redirect(`/listings/${newListing._id}`);
  } catch (err) {
    if (err.name === "ValidationError") {
      req.flash("error", err.message);
      return res.redirect("/listings/new");
    }
    throw err;
  }
}));

// SHOW - Details for a specific listing
router.get("/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  if (!listing) {
    req.flash("error", "The listing you requested does not exist!");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
}));

// EDIT - Form to edit an existing listing
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "The listing you requested does not exist!");
    return res.redirect("/listings");
  }

  res.render("listings/edit.ejs", { listing });
}));

// UPDATE - Update an existing listing
router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body.listing };
    if (!updateData.image || updateData.image.trim() === "") {
      delete updateData.image;
    }

    await Listing.findByIdAndUpdate(id, updateData, { runValidators: true });
    req.flash("success", "Listing Updated Successfully!");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    if (err.name === "ValidationError") {
      req.flash("error", err.message);
      return res.redirect(`/listings/${req.params.id}/edit`);
    }
    throw err;
  }
}));

// DELETE - Delete a listing
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted Successfully!");
  res.redirect("/listings");
}));

module.exports = router;