const express = require("express");
const app = express();
const mongoose = require("mongoose");
app.set("view engine", "ejs");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.get("/", (req, res) => {
  res.send("Hi, I am root");
});


app.get("/about",(req,res)=>{
  res.render("about",{title:"About Us", name:"Wanderlust" , description:"We are a travel company dedicated to providing the best travel experiences."});
});


app.listen(8080, () => {
  console.log("server is listening to port 8080");
});