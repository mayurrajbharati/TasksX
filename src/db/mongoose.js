const mongoose = require("mongoose");

mongoose
  .connect(process.env.DATABASE_URI, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then((con) => {
    console.log("DB connection successful");
  });
