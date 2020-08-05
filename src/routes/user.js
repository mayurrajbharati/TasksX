const express = require("express");
const User = require("./../models/user");
const bcrypt = require("bcryptjs");
const router = new express.Router();
const {
  welcomeEmail,
  cancelEmail,
  forgotPass,
} = require("./../emails/account");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const sharp = require("sharp");
const jwt = require("jsonwebtoken");
const generator = require("generate-password");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
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

router.use(cookieParser());

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

router.post(
  "/me/avatars",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const token = req.cookies.authorization;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded._id });
    req.user.avatar = req.file.buffer;
    req.user.imgname = req.file.originalname;
    await req.user.save();
    res.render("profile", { user });
  },
  (error, req, res, next) => {
    res.status(400).send({
      error: error.message,
    });
  }
);

router.get("/me", auth, async (req, res) => {
  const token = req.cookies.authorization;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findOne({ _id: decoded._id });
  res.render("profile", {
    user,
  });
});

router.post("/logout", async (req, res) => {
  try {
    res.clearCookie("authorization").redirect("/");
  } catch (e) {
    res.status(500).send(e);
  }
});

router.post("/me/update", auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.redirect("/users/me");
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.get("/me/delete", auth, async (req, res) => {
  try {
    await User.findOneAndDelete({ _id: req.user.id });
    // await user.remove();
    cancelEmail(req.user.email, req.user.name);
    res.clearCookie("authorization").redirect("/");
  } catch (e) {
    res.status(500).send(e);
  }
});

router.delete("/users/me/avatars", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.post("/forgot", async (req, res) => {
  try {
    const user = await User.findbyEmail(req.body.email);
    const password = generator.generate({
      length: 10,
      numbers: true,
    });
    user.password = password;
    forgotPass(user.email, user.name, password);
    await user.save();
    res.send("Your password has been reset. Please check your mail!");
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/password/update", auth, async (req, res) => {
  const token = req.cookies.authorization;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findOne({ _id: decoded._id });
  const currentPassword = req.body.currentPassword;
  if (!(await bcrypt.compare(currentPassword, req.user.password))) {
    res.send("Entered password is incorrect");
  } else {
    newPassword = req.body.newPassword;
    confirmPassword = req.body.confirmPassword;
    if (newPassword !== confirmPassword) {
      res.send("Entered passwords are not same!");
    } else {
      user.password = newPassword;
      await user.save();
      res.redirect("/users/me");
    }
  }
});

module.exports = router;
