const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: "this is my secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ============db here==============
mongoose.connect(
  "mongodb+srv://admin-Abhinav:admin-Abhinav@cluster0-fz1t0.mongodb.net/zilaDb",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  function (err) {
    console.log("connected to the database.");
  }
);
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  products: [],
});
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("Users", userSchema);
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// =================================Body here===================================

app.get("/", function (req, res) {
  res.render("index");
});
app.post("/getRegister", function (req, res) {
  res.render("register");
});
app.post("/getLogin", function (req, res) {
  res.render("index");
});
app.get("/dashboard", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("dashboard");
  } else {
    res.redirect("/");
  }
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", function (req, res) {
  User.register({ username: req.body.email, active: false }, req.body.pass, function (err, user) {

    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/dashboard")
      });
    }
  });
});

app.post("/login", function (req, res) {
  const user = new User({
    username: req.body.email,
    password: req.body.pass
  });

  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local").then(function (req, res) {
        res.redirect("/dashboard")
      });

    };
  });
});


app.listen("4000", function (req, res) {
  console.log("The serevr has started on the port 4000");
});
