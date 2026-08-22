import mongoose from "mongoose";

const pollOptionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    votes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { _id: true },
);

const pollSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
      index: true,
    },

    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    question: {
      type: String,
      required: true,
      trim: true,
    },

    options: {
      type: [pollOptionSchema],
      validate: {
        validator: (opts) => opts.length >= 2 && opts.length <= 10,
        message: "A poll must have between 2 and 10 options",
      },
    },

    // Optional expiry — null means no expiry
    expiresAt: {
      type: Date,
      default: null,
    },

    isClosed: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
);

// Virtual: is this poll currently active?
pollSchema.virtual("isActive").get(function () {
  if (this.isClosed) return false;
  if (this.expiresAt && new Date() > this.expiresAt) return false;
  return true;
});

pollSchema.set("toObject", { virtuals: true });
pollSchema.set("toJSON", { virtuals: true });

const Poll = mongoose.models.Poll || mongoose.model("Poll", pollSchema);

export default Poll;
