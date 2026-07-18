const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const methodOverride = require("method-override");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// View Engine
app.set("view engine", "ejs");

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

// Routes
app.get("/", (req, res) => {
     res.render("home.ejs");
});

app.get("/about", (req, res) => {
    res.render("about", {
        title: "About Us",
        name: "Wanderlust",
        description: "We are a travel company dedicated to providing the best travel experiences."
    });
});




app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
});

// NEW - show form to create a listing
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

// CREATE - save the submitted listing
app.post("/listings", async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
});

// SHOW - view a single listing
app.get("/listings/:id", async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
});

// EDIT - show form to edit a listing
app.get("/listings/:id/edit", async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
});

// UPDATE - save the edited listing
app.put("/listings/:id", async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
});

// DELETE - remove a listing
app.delete("/listings/:id", async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
});

// 404 Handler
app.use((req, res) => {
    res.status(404).send("Page not found");
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong!");
});

// Start Server
app.listen(8080, () => {
    console.log("Server is listening on port 8080");
});
// NEW - show form to create a listing
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

// CREATE - save the submitted listing
app.post("/listings", async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
});