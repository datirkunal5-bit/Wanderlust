const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        type: String,
        default: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200",
        set: (v) => v === "" ? "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200" : v,
    },
    price: Number,
    location: String,
    country: String,
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;