import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema defining the structure of a user in the database.
 */
export const userSchema = new mongoose.Schema(
  {
    /**
     * Full name of the user.
     * Must be between 2 and 50 characters.
     */
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minLength: [2, 'Name must be at least 2 characters long'],
      maxLength: [50, 'Name cannot exceed 50 characters'],
    },
    /**
     * Email address of the user.
     * Must be unique and in a valid email format.
     */
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Email must be a valid email address',
      ],
    },
    /**
     * Hashed password of the user.
     * Minimum length of 6 characters before hashing.
     */
    password: {
      type: String,
      required: [true, 'Password is required'],
      minLength: [6, 'Password must be at least 6 characters long'],
    },
    /**
     * Role of the user in the system.
     * Can be either 'admin' or 'user'.
     */
    role: {
      type: String,
      enum: {
        values: ['admin', 'user'],
        message: '{VALUE} is not a valid role',
      },
      default: 'user',
    },
    /**
     * Flag indicating if the user account is active.
     */
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to hash password before saving.
// NOTE: In Mongoose v7+, async pre-hooks do NOT receive `next` as a parameter.
// Errors are propagated by throwing — never by calling next(error).
userSchema.pre('save', async function () {
  // Only re-hash when the password field has actually changed
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Override toJSON to remove password field from output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;
