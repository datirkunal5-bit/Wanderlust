# 🧭 Wanderlust · Vacation Rentals & Stays

Wanderlust is a full-stack travel marketplace and vacation rental web application inspired by Airbnb, built using **Node.js**, **Express.js**, **MongoDB**, and **EJS**.

---

## ✨ Features

- **Explore & Filter**:
  - Browse stays with an interactive category filter bar (*Trending, Beach, Mountains, Iconic Cities, Castles, Amazing Pools, Camping, Farms, Arctic, Luxury, Rooms, Boats*).
  - Search by destination, city, country, or villa keywords.
  - Interactive tax toggle switch (*display total after 18% GST*).
  - Wishlist heart animation on listing cards.
- **Detailed Property Pages**:
  - High-definition hero photos, host profile, verified superhost highlights, and comprehensive amenities checklist.
  - Sticky reservation calculation summary with mock date & guest pickers.
- **Full CRUD for Listings**:
  - Authenticated users can host properties with category selection, live image preview, pricing, and locations.
  - Owners can edit listing details or delete properties.
- **Reviews & Rating System**:
  - Interactive 5-star rating selector and comment system.
  - Review author authorization: only review authors can delete their reviews.
  - Cascade deletion: deleting a listing automatically cleans up all associated reviews.
- **Authentication & Security**:
  - User registration and login powered by Passport.js and passport-local-mongoose.
  - Authorization middleware (`isLoggedIn`, `isOwner`, `isReviewAuthor`, `saveRedirectUrl`).
  - Server-side payload validation with Joi schemas and client-side form validation.
  - Flash messages for success and error notifications.
- **Responsive & Modern Design**:
  - Glassmorphic sticky header, clean typography (Outfit & Plus Jakarta Sans), and mobile-responsive layout.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js (v5)
- **Database**: MongoDB with Mongoose ODM
- **Templating**: EJS with `ejs-mate` layout engine
- **Authentication**: Passport.js, Passport-Local, Passport-Local-Mongoose
- **Validation**: Joi
- **Styling**: Vanilla CSS with modern tokens, responsive grid/flexbox, Font Awesome 6 icons

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) installed locally or a free MongoDB Atlas URI

### 2. Installation
Navigate into the `Wanderlust` folder:
```bash
cd Wanderlust
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default `.env` configuration:
```env
ATLASDB_URL=mongodb://127.0.0.1:27017/wanderlust
SECRET=wanderlustsupersecretkey2026
PORT=8080
```

### 4. Seed Sample Database
Populate the database with 16+ curated destinations from around the world:
```bash
npm run seed
```

### 5. Run the Server
For development with auto-reload:
```bash
npm run dev
```
Or start directly:
```bash
npm start
```
Visit `http://localhost:8080` in your browser.

---

## 📁 Project Structure

```
Wanderlust/
├── init/                  # Database seed script and sample listings data
│   ├── data.js
│   └── index.js
├── models/                # Mongoose models
│   ├── listing.js
│   ├── review.js
│   └── user.js
├── public/                # Static assets
│   ├── css/
│   │   └── style.css      # Core design system & modern styling
│   └── js/
│       └── validation.js  # Validation, dropdowns, tax toggle & wishlist
├── routes/                # Express Routers
│   ├── listing.js
│   ├── review.js
│   └── user.js
├── utils/                 # Error handling utilities
│   ├── ExpressError.js
│   └── wrapAsync.js
├── views/                 # EJS templates
│   ├── includes/          # Navbar, Footer
│   ├── layouts/           # Boilerplate layout
│   ├── listings/          # Index, Show, New, Edit
│   ├── users/             # Login, Signup
│   ├── about.ejs
│   ├── error.ejs
│   └── home.ejs
├── app.js                 # Express application entrypoint
├── middleware.js          # Auth, ownership & Joi validation middlewares
├── schema.js              # Joi validation schemas
├── package.json
└── README.md
```

---

## 📄 License
ISC
