import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      // Admin username "admin" is lowercase. Usernames will be compared case-insensitively.
      lowercase: true, 
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      required: true,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      default: null,
    },
    settings: {
      theme: {
        type: String,
        default: "system",
      },
      language: {
        type: String,
        default: "en",
      },
      accessibility: {
        textSize: {
          type: String,
          default: "medium",
        },
        fontFamily: {
          type: String,
          default: "default",
        },
        highContrast: {
          type: Boolean,
          default: false,
        },
        reduceMotion: {
          type: Boolean,
          default: false,
        },
        lineSpacing: {
          type: Number,
          default: 1, // multiplier, e.g. 1, 1.25, 1.5
        },
        letterSpacing: {
          type: Number,
          default: 0, // pixels
        },
        sidebarDensity: {
          type: String,
          default: "comfortable", // "compact" or "comfortable"
        },
        roundedCorners: {
          type: Boolean,
          default: true,
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: Hash the user's password using bcrypt before saving
userSchema.pre("save", async function () {
  // Only hash password if it has been modified or is new
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to check password match
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

// Indexes for role-based and recent queries
userSchema.index({ role: 1 });          // filter by admin/member
userSchema.index({ createdAt: -1 });    // sort newest first
userSchema.index({ role: 1, createdAt: -1 }); // members list by join date

const User = mongoose.model("User", userSchema);
export default User;
