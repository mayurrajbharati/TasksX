const express = require("express");
const cookieParser = require("cookie-parser");
const User = require("./../models/user");
const router = new express.Router();
router.use(cookieParser());
const {
  welcomeEmail,
  cancelEmail,
  forgotPass,
} = require("./../emails/account");
const auth = require("./../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const jwt = require("jsonwebtoken");
const generator = require("generate-password");
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please provide an image!"));
    }
    cb(undefined, true);
  },
});

router.post("/signup", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    welcomeEmail(user.email, user.name);
    res.redirect("/auth/login");
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthTokens();
    res
      .cookie("authorization", token, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
      })
      .render("dashboard", { user });
  } catch (e) {
    res.status(400).send(e.message);
  }
});

module.exports = router;
