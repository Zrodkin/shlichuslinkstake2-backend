const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["organization", "male", "female"],
    required: true,
  },
  // Organization specific fields
  whatsappNumber: {
    type: String,
    required: function() { return this.role === 'organization'; }
  },
  // Volunteer specific fields
  phoneNumber: {
    type: String,
    required: function() { return this.role === 'male' || this.role === 'female'; }
  },
  referenceName: {
    type: String,
    required: function() { return this.role === 'male' || this.role === 'female'; }
  },
  referencePhone: {
    type: String,
    required: function() { return this.role === 'male' || this.role === 'female'; }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", UserSchema);