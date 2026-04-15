const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    username: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 40,
      unique: true,
      sparse: true,
      lowercase: true,
      match: [/^[a-zA-Z0-9]+$/, "Username must use only letters and numbers (no special characters)"],
    },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    contact: { type: String, trim: true, maxlength: 25, default: "" },
    avatar: { type: String, trim: true, default: "" },
    password: { type: String, required: true, minlength: 8, select: false },
    resetPasswordToken: { type: String, select: false, default: "" },
    resetPasswordExpires: { type: Date, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    subscription: {
      plan: { type: String, enum: ["free", "pro"], default: "free" },
      status: {
        type: String,
        enum: ["inactive", "active", "past_due", "canceled", "trialing"],
        default: "inactive",
      },
      expiresAt: { type: Date },
      offerCode: { type: String, default: "" },
    },
    usage: {
      dailyCount: { type: Number, default: 0 },
      lastReset: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

// hash password only when it was changed
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);