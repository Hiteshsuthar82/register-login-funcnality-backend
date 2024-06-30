const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/authRouter");
const customError = require("./utils/customError");
const globalErrorHandler = require("./controller/errorController");

let app = express();
app.use(cookieParser());

const corsOptions = {
  origin: "http://127.0.0.1:5500",
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
};
app.use(cors(corsOptions));

app.use(express.json());

// app.use((req, res, next) => {
//   req.requestedAt = new Date().toISOString();
// });

app.use("/api/v1/auth", authRouter);

app.all("*", (req, res, next) => {
  const error = new customError(
    `can't find ${req.originalUrl} on the server`,
    404
  );
  next(error);
});

app.use(globalErrorHandler);

module.exports = app;
