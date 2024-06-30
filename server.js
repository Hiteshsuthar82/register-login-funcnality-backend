const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("Uncaught Exception occured! shuting down...");

  process.exit(1);
});

const app = require("./app");

// DATABASE CONNECTION
mongoose
  .connect(process.env.CON_STR, { useNewUrlParser: true })
  .then((con) => {
    console.log(`DB Connection Successfull`);
  });

const port = process.env.PORT || 3000;
// LISTINING SERVER ON PORT 3000
const server = app.listen(port, () => {
  console.log(`server has been started on port : ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, " : ", err.message);
  console.log("unhandled Rejection occured! shuting down...");

  // CLOSE SERVER
  server.close(() => {
    process.exit();
  });
});
