const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const publicProfileSchema = new mongoose.Schema(
  {
    username: { type: String, lowercase: true, trim: true, sparse: true, unique: true },
    bio: { type: String, maxlength: 240, default: '' },
    avatarUrl: { type: String, default: '' },
    isPublic: { type: Boolean, default: false },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    storageQuotaBytes: { type: Number, default: 15 * 1024 * 1024 * 1024 },
    tokenVersion: { type: Number, default: 0 },
    oauthProviders: [{ provider: String, providerId: String }],
    publicProfile: { type: publicProfileSchema, default: () => ({}) },
  },
  { timestamps: true }
);

userSchema.methods.verifyPassword = function verifyPassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.statics.createWithPassword = async function createWithPassword({ name, email, password }) {
  const passwordHash = await bcrypt.hash(password, 12);
  return this.create({ name, email, passwordHash });
};

module.exports = mongoose.model('User', userSchema);
