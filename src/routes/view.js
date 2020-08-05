const express = require("express");
const cookieParser = require("cookie-parser");
const Task = require("../models/task");
const app = express();
app.use(cookieParser());
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("./../models/user");
const nodemailer = require("nodemailer");
const { getMaxListeners } = require("../models/task");

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.authorization;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded._id });
    if (!user) {
      throw new Error();
    }
    req.user = user;
    req.token = token;
    next();
  } catch (e) {
    res.clearCookie("authorization");
    res.status(400).send(e.message);
  }
};

router.get("/", (req, res) => {
  res.render("index");
});

// router.post("/", (req, res) => {
//   let transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: req.body.email,
//       pass: process.env.PASSWORD,
//     },
//   });

//   const contactEmail = (email, name) => {
//     transporter.sendMail({
//       from: req.body.email,
//       to: "gauravdas014@gmail.com",
//       subject: "New Message from req.body.name ",
//       text: req.body.message,
//     });
//   };

//   contactEmail();
//   res.redirect("/");
// });

router.get("/auth/login", (req, res) => {
  res.render("login");
});
router.get("/auth/signup", (req, res) => {
  res.render("signup");
});

// router.get("/me", auth, (req, res) => {
//   res.render("profile");
// });

module.exports = router;
