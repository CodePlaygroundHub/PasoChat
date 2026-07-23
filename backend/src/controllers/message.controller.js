import mongoose from "mongoose";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import Group from "../models/group.model.js";
import cloudinary from "../lib/cloudinary.js";
import { emitToUser, io } from "../lib/socket.js";
import analyzeMessage from "../lib/mlService.js";

export const updateChatWallpaper = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId, image } = req.body;

    if (!chatId || !image) {
      return res.status(400).json({ message: "Missing data" });
    }

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid chatId" });
    }

    // Upload to Cloudinary
    const upload = await cloudinary.uploader.upload(image, {
      folder: "chat-wallpapers",
    });

    // Save URL
    await User.findByIdAndUpdate(userId, {
      $set: {
        [`chatWallpapers.${chatId}`]: upload.secure_url,
      },
    });

    res.status(200).json({
      chatId,
      wallpaper: upload.secure_url,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update wallpaper" });
  }
};

export const removeChatWallpaper = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid chatId" });
    }

    await User.findByIdAndUpdate(userId, {
      $unset: {
        [`chatWallpapers.${chatId}`]: "",
      },
    });

    res.sendStatus(200);
  } catch {
    res.status(500).json({ message: "Failed to remove wallpaper" });
  }
};

export const getUsersForSidebar = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select(
      "_id fullName email profilePic isAI isOnline lastSeen",
    );

    res.status(200).json(users);
  } catch {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const myId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: id },
        { senderId: id, receiverId: myId },
      ],
      deletedForEveryone: false,
      deletedFor: { $ne: myId },
    })
      .populate("replyTo", "text image senderId")
      .sort({ createdAt: 1 });

    await Message.updateMany(
      { senderId: id, receiverId: myId, status: { $ne: "seen" } },
      { status: "seen" },
    );

    const seenMessages = await Message.find({
      senderId: id,
      receiverId: myId,
      status: "seen",
    }).select("_id");

    emitToUser(id, "messageStatusUpdateBulk", {
      messageIds: seenMessages.map((m) => m._id),
      status: "seen",
    });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, audio, file, replyTo } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (replyTo && !mongoose.Types.ObjectId.isValid(replyTo)) {
      return res.status(400).json({ message: "Invalid reply message id" });
    }

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: "Invalid receiver id" });
    }

    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({
        message: "Receiver not found",
      });
    }

    if (!text && !image && !audio && !file) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    let imageUrl = "";
    let audioUrl = "";
    let fileData = null;

    if (image) {
      const upload = await cloudinary.uploader.upload(image, {
        resource_type: "auto",
      });
      imageUrl = upload.secure_url;
    }

    if (audio) {
      const upload = await cloudinary.uploader.upload(audio, {
        resource_type: "video",
      });
      audioUrl = upload.secure_url;
    }

    if (file?.base64) {
      const upload = await cloudinary.uploader.upload(file.base64, {
        resource_type: "raw",
      });
      fileData = {
        url: upload.secure_url,
        name: file.name,
        type: file.type,
        size: file.size,
      };
    }

    // AI ANALYSIS (only if text exists)
    let analysis = {
      toxic_score: 0,
      spam_score: 0,
      smart_replies: [],
    };

    if (text?.trim()) {
      analysis = await analyzeMessage(text.trim());
    }

    let message = await Message.create({
      senderId,
      receiverId,
      text: text?.trim() || "",
      image: imageUrl,
      audio: audioUrl,
      file: fileData,
      replyTo: replyTo || null,
      status: "sent",

      // AI fields
      toxic: analysis.toxic_score > 0.8,
      spam: analysis.spam_score > 0.5,
      toxicScore: analysis.toxic_score,
      spamScore: analysis.spam_score,
    });

    message = await message.populate({
      path: "replyTo",
      select: "text image senderId",
      populate: {
        path: "senderId",
        select: "fullName profilePic",
      },
    });

    emitToUser(receiverId, "newMessage", {
      ...message.toObject(),
      smartReplies: analysis.smart_replies,
    });
    emitToUser(senderId, "messageStatusUpdate", {
      messageId: message._id,
      status: "delivered",
    });

    res.status(201).json({
      message,
      smartReplies: analysis.smart_replies,
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "Invalid group id" });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const isMember = group.members.some(
      (m) => m.userId.toString() === userId.toString(),
    );
    if (!isMember) return res.status(403).json({ message: "Access denied" });

    const messages = await Message.find({
      groupId,
      deletedForEveryone: false,
      deletedFor: { $ne: userId },
    })
      .populate("senderId", "fullName profilePic")
      .populate("replyTo", "text image senderId")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const senderId = req.user._id;
    const { text, image, audio, file, replyTo } = req.body;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "Invalid group id" });
    }

    if (replyTo && !mongoose.Types.ObjectId.isValid(replyTo)) {
      return res.status(400).json({ message: "Invalid reply message id" });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const isMember = group.members.some(
      (m) => m.userId.toString() === senderId.toString(),
    );
    if (!isMember)
      return res.status(403).json({ message: "Not a group member" });

    let imageUrl = "";
    let audioUrl = "";
    let fileData = null;

    if (image) {
      const upload = await cloudinary.uploader.upload(image, {
        resource_type: "auto",
      });
      imageUrl = upload.secure_url;
    }

    if (audio) {
      const upload = await cloudinary.uploader.upload(audio, {
        resource_type: "video",
      });
      audioUrl = upload.secure_url;
    }

    if (file?.base64) {
      const upload = await cloudinary.uploader.upload(file.base64, {
        resource_type: "raw",
      });
      fileData = {
        url: upload.secure_url,
        name: file.name,
        type: file.type,
        size: file.size,
      };
    }

    // AI ANALYSIS
    let analysis = {
      toxic_score: 0,
      spam_score: 0,
      smart_replies: [],
    };

    if (text?.trim()) {
      analysis = await analyzeMessage(text.trim());
    }

    const message = await Message.create({
      senderId,
      groupId,
      text: text?.trim() || "",
      image: imageUrl,
      audio: audioUrl,
      file: fileData,
      replyTo: replyTo || null,
      status: "sent",

      toxic: analysis.toxic_score > 0.8,
      spam: analysis.spam_score > 0.5,
      toxicScore: analysis.toxic_score,
      spamScore: analysis.spam_score,
    });

    const populatedMessage = await message.populate({
      path: "replyTo",
      select: "text image senderId",
      populate: {
        path: "senderId",
        select: "fullName profilePic",
      },
    });

    io.to(groupId.toString()).emit("newGroupMessage", populatedMessage);

    res.status(201).json({
      message,
      smartReplies: analysis.smart_replies,
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const forwardMessage = async (req, res) => {
  try {
    // FIX 1: correctly destructure destinations from req.body
    const { messageId, destinations } = req.body;
    const senderId = req.user._id;

    const originalMessage = await Message.findById(messageId);

    if (!originalMessage) {
      return res.status(404).json({
        message: "Original message not found",
      });
    }

    const forwardedMessages = [];

    // FIX 2: loop through destinations (not destination)
    for (const dest of destinations) {
      const { receiverId, groupId } = dest;

      // Create a safe file object
      const safeFile =
        originalMessage.file && typeof originalMessage.file === "object"
          ? {
            url: originalMessage.file.url || "",
            name: originalMessage.file.name || "",
            type: originalMessage.file.type || "",
            size: originalMessage.file.size || 0,
          }
          : {
            url: "",
            name: "",
            type: "",
            size: 0,
          };

      const newMessage = await Message.create({
        senderId,
        receiverId: receiverId || null,
        groupId: groupId || null,
        text: originalMessage.text,
        image: originalMessage.image,
        audio: originalMessage.audio,
        file: safeFile,
        isForwarded: true,
        originalMessageId: originalMessage._id,
      });

      // FIX 3: use the correct variable names for Socket.IO
      if (receiverId) {
        emitToUser(receiverId.toString(), "newMessage", newMessage);

        emitToUser(senderId.toString(), "messageStatusUpdate", {
          messageId: newMessage._id,
          status: "delivered",
        });
      } else if (groupId) {
        io.to(groupId.toString()).emit("newGroupMessage", newMessage);
      }

      forwardedMessages.push(newMessage);
    }

    res.status(201).json({
      message: "Message forwarded successfully",
      messages: forwardedMessages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const deleteMessageForMe = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    await Message.findByIdAndUpdate(messageId, {
      $addToSet: { deletedFor: userId },
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteMessageForEveryone = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message || !message.senderId.equals(userId)) {
      return res.status(403).json({ message: "Action not allowed" });
    }

    message.deletedForEveryone = true;
    await message.save();

    if (message.groupId) {
      io.to(message.groupId.toString()).emit("messageDeletedEveryone", {
        messageId,
      });
    } else {
      [message.senderId, message.receiverId].forEach((id) => {
        if (id)
          io.to(id.toString()).emit("messageDeletedEveryone", { messageId });
      });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// PUT /messages/mark-seen/:userId
export const markMessagesSeen = async (req, res) => {
  const myId = req.user._id;
  const otherUserId = req.params.userId;

  await Message.updateMany(
    {
      senderId: otherUserId,
      receiverId: myId,
      status: { $ne: "seen" },
    },
    { status: "seen" },
  );

  const messages = await Message.find({
    senderId: otherUserId,
    receiverId: myId,
    status: "seen",
  }).select("_id");

  emitToUser(otherUserId, "messageStatusUpdateBulk", {
    messageIds: messages.map((m) => m._id),
    status: "seen",
  });

  res.sendStatus(200);
};

// GET /messages/search/:userId?query=hello
export const searchMessages = async (req, res) => {
  try {
    const myId = req.user._id;
    const otherUserId = req.params.userId;
    const { query } = req.query;

    if (!query?.trim()) {
      return res.status(200).json([]);
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: myId },
      ],
      text: { $regex: query, $options: "i" },
      deletedForEveryone: false,
      deletedFor: { $ne: myId },
    })
      .select("_id text createdAt")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch {
    res.status(500).json({ message: "Search failed" });
  }
};

// GET /groups/messages/search/:groupId?query=hello
export const searchGroupMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { groupId } = req.params;
    const { query } = req.query;

    if (!query?.trim()) return res.status(200).json([]);

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const isMember = group.members.some(
      (m) => m.userId.toString() === userId.toString(),
    );
    if (!isMember) return res.status(403).json({ message: "Access denied" });

    const messages = await Message.find({
      groupId,
      text: { $regex: query, $options: "i" },
      deletedForEveryone: false,
      deletedFor: { $ne: userId },
    })
      .select("_id text senderId createdAt")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch {
    res.status(500).json({ message: "Search failed" });
  }
};

export const reactToMessage = async (req, res) => {
  const { messageId } = req.params;
  const { emoji } = req.body;
  const userId = req.user._id;

  const message = await Message.findById(messageId);
  if (!message) return res.status(404).json({ message: "Not found" });

  // Remove previous reaction from this user
  message.reactions = message.reactions.filter(
    (r) => r.userId.toString() !== userId.toString(),
  );

  // Add new reaction
  message.reactions.push({ userId, emoji });

  await message.save();

  // Emit to both users
  if (message.groupId) {
    io.to(message.groupId.toString()).emit("reactionUpdated", {
      messageId,
      reactions: message.reactions,
    });
  } else {
    emitToUser(message.senderId.toString(), "reactionUpdated", {
      messageId,
      reactions: message.reactions,
    });

    emitToUser(message.receiverId.toString(), "reactionUpdated", {
      messageId,
      reactions: message.reactions,
    });
  }

  res.sendStatus(200);
};
