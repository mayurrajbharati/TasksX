const express = require("express");
const Task = require("./../models/task");
const auth = require("./../middleware/auth");
const router = new express.Router();

router.get("/", auth, (req, res) => {
  res.render("dashboard");
});

router.get("/tasks", auth, async (req, res) => {
  const tasks = await Task.find({ author: req.user._id });

  res.render("tasks", { tasks });
});

router.post("/tasks", auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    author: req.user._id,
  });
  try {
    await task.save();
    res.status(201).redirect("/dashboard/tasks");
  } catch (e) {
    res.send(e.message);
  }
});

// router.get("/tasks", auth, async (req, res) => {
//   const match = {};
//   const sort = {};
//   if (req.query.completed) {
//     match.completed = req.query.completed === "true";
//   }
//   if (req.query.sortBy) {
//     const parts = req.query.sortBy.split("_");
//     sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
//   }
//   try {
//     await req.user
//       .populate({
//         path: "tasks",
//         match,
//         options: {
//           limit: parseInt(req.query.limit),
//           skip: parseInt(req.query.skip),
//           sort,
//         },
//       })
//       .execPopulate();
//     if (!req.user.tasks) {
//       res.status(400).send();
//     }
//     res.status(200).send(req.user.tasks);
//   } catch (e) {
//     res.status(500).send(e);
//   }
// });

router.get("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      author: req.user._id,
    });
    if (!task) {
      return res.status(404).send("No such task found");
    }
    res.status(200).render("task", {
      task,
    });
  } catch (e) {
    res.status(500).send(e);
  }
});

// const tour = await Tour.findByIdAndUpdate(req.params.id, req.body);

router.post("/tasks/update/:id", auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.redirect("/dashboard/tasks");
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.get("/tasks/delete/:id", auth, async (req, res) => {
  try {
    await Task.findOneAndDelete({ _id: req.params.id });
    res.redirect("/dashboard");
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
