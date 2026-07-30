const db = require("./db");

if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");

const initializePassport = require("./passport-config");


initializePassport(
  passport,

  // Get user by email for login
  (email) => {
    return new Promise((resolve, reject) => {

      db.query(
        "SELECT * FROM users WHERE email=?",
        [email],
        (err, results) => {

          if (err) {
            reject(err);
          } else {
            resolve(results[0]);
          }

        }
      );

    });
  },


  // Get user by id for session
  (id) => {
    return new Promise((resolve, reject) => {

      db.query(
        "SELECT * FROM users WHERE id=?",
        [id],
        (err, results) => {

          if (err) {
            reject(err);
          } else {
            resolve(results[0]);
          }

        }
      );

    });
  }
);



app.set("view-engine", "ejs");

app.use(express.urlencoded({ extended: false }));

app.use(flash());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);


app.use(passport.initialize());
app.use(passport.session());



// Home page
app.get("/", checkAuthenticated, (req, res) => {

  res.render("index.ejs", {
    name: req.user.username
  });

});



// Login page
app.get("/login", (req, res) => {

  res.render("login.ejs");

});



// Login authentication
app.post(
  "/login",

  passport.authenticate("local", {

    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true

  })

);



// Register page
app.get("/register", (req, res) => {

  res.render("register.ejs");

});



// Register user
app.post("/register", async (req, res) => {

  try {

    const hashedPassword = await bcrypt.hash(
      req.body.password,
      10
    );


    const id = Date.now().toString();


    db.query(

      "INSERT INTO users (id, username, email, password) VALUES (?,?,?,?)",

      [
        id,
        req.body.name,
        req.body.email,
        hashedPassword
      ],


      (err) => {

        if (err) {

          console.log(err);
          return res.redirect("/register");

        }


        return res.redirect("/login");

      }

    );


  } catch (error) {

    console.log(error);
    return res.redirect("/register");

  }

});



// Authentication check
function checkAuthenticated(req, res, next) {

  if (req.isAuthenticated()) {

    return next();

  }

  res.redirect("/login");

}



app.listen(3000, () => {

  console.log("Server running on port 3000");

});
