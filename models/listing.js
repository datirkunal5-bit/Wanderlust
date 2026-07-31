const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    type: String,
    default: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200",
    set: (v) => (v === "" ? "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200" : v),
  },
  price: {
    type: Number,
    min: 0,
  },
  location: String,
  country: String,
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});