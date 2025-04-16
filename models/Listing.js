const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({
  organizationName: { type: String, required: true },
  jobTitle: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  volunteerGender: { type: String, enum: ["male", "female"], required: true },
  imageUrl: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Listing", listingSchema);
