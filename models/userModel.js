const mongoose = require("mongoose");
const crypto = require("crypto");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please Enter an Username"],
    unique: true,
    lowercase: true,
  },
  email: {
    type: String,
    required: [true, "Please Enter you email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please Enter password"],
    minlength: [8, "password should be grater than 8 character"],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "Please Enter confirmPassword"],
    validate: {
      validator: function (val) {
        return val == this.password;
      },
      message: "password and confirm password does not matching",
    },
  },
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
});

userSchema.methods.comparePasswordInDb = async function (pswd, pswdDB) {
  return await bcrypt.compare(pswd, pswdDB);
};

userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;

  console.log(resetToken, this.passwordResetToken);

  return resetToken;
};

const user = mongoose.model("user", userSchema);

module.exports = user;
