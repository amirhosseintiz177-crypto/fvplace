const crypto = require('crypto');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address.'],
    },
    passwordHash: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, passwordHash) {
  const [salt, storedHash] = passwordHash.split(':');
  const candidateHash = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(Buffer.from(storedHash, 'hex'), candidateHash);
}

userSchema.methods.verifyPassword = function verifyUserPassword(password) {
  return verifyPassword(password, this.passwordHash);
};

userSchema.statics.createWithPassword = async function createWithPassword({ name, email, password }) {
  return this.create({ name, email, passwordHash: hashPassword(password) });
};

module.exports = mongoose.model('User', userSchema);
