const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
      index: true,
    },
    password: {
      type: String,
      minlength: 6,
      select: false,
    },
    googleId: {
      type: String,
      sparse: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    profile: {
      age: { type: Number, min: 13, max: 120 },
      gender: { type: String, enum: ['male', 'female', 'other', ''] },
      height: { type: Number, min: 50, max: 300 },
      targetWeight: { type: Number, min: 20, max: 500 },
      activityLevel: {
        type: String,
        enum: ['sedentary', 'light', 'moderate', 'active', ''],
        default: '',
      },
    },
    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastLogDate: { type: Date },
    },
    level: {
      current: { type: Number, default: 1 },
      xp: { type: Number, default: 0 },
    },
    notificationPrefs: {
      water: { type: Boolean, default: true },
      exercise: { type: Boolean, default: true },
      sleep: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

// Note: email index created by unique:true in field definition
// Note: googleId index created by sparse:true in field definition

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
