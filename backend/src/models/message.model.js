import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Personal chat
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    // Group chat
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
      index: true,
    },

    text: {
      type: String,
      trim: true,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    audio: {
      type: String,
      default: "",
    },

    sticker: {
      type: String,
      default: "",
    },

    // Reply to message
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
      index: true,
    },

    file: {
      url: { type: String, default: "" },
      name: { type: String, default: "" },
      type: { type: String, default: "" },
      size: { type: Number, default: 0 },
    },

    // Message delivery status
    deliveryStatus: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
      index: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },

    //for me
    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true,
      },
    ],

    //for everyone
    deletedForEveryone: {
      type: Boolean,
      default: false,
      index: true,
    },

    statusReply: {
      statusId: { type: mongoose.Schema.Types.ObjectId, ref: "Status" },
      mediaUrl: String,
      text: String,
    },

    // AI Moderation
    toxic: {
      type: Boolean,
      default: false,
      index: true,
    },

    spam: {
      type: Boolean,
      default: false,
      index: true,
    },

    toxicScore: {
      type: Number,
      default: 0,
    },

    spamScore: {
      type: Number,
      default: 0,
    },

    reactions: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        emoji: String,
      },
    ],
    isForwarded: {
      type: Boolean,
      default: false,
    },
    originalMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
      index: true,
    },
  },
  { timestamps: true },
);

//Safety checks
messageSchema.pre("validate", function (next) {
  // must be personal OR group
  if (!this.receiverId && !this.groupId) {
    return next(new Error("Message must have receiverId or groupId"));
  }

  // cannot be both
  if (this.receiverId && this.groupId) {
    return next(new Error("Message cannot have both receiverId and groupId"));
  }

  next();
});

const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);

export default Message;
