const express = require("express");
require("./src/db/mongoose.js");
const cookieParser = require("cookie-parser");
//const cors = require('cors');
const router = express.Router();
const userRouter = require("./src/routes/user");
const taskRouter = require("./src/routes/task");
const viewRouter = require("./src/routes/view");
const authRouter = require("./src/routes/auth");

const app = express();
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(express.json());

app.use("/", viewRouter);
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/dashboard", taskRouter);

const port = process.env.PORT;

app.listen(port, () => {
  console.log("Server is up on port: " + port);
});
