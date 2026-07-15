const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    res.send("Hi, I am root");
});

app.get("/about", (req, res) => {
    res.render("about", {
        title: "About Us",
        name: "Wanderlust",
        description: "We are a travel company dedicated to providing the best travel experiences."
    });
});

app.get("/test", async (req, res) => {
    try {
        let sample = new Listing({
            title: "Test Listing",
            description: "This is a test listing",
            price: 1200,
            location: "New York",
            country: "USA",
        });
        await sample.save();
        res.send(sample);
        console.log("Sample was saved successfully");
    } catch (err) {
        console.error("Error saving listing:", err);
        res.status(500).send("Error saving listing");
    }
});

app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
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