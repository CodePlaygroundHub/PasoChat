import mongoose from "mongoose";
import User from "../models/user.model.js";

export const pinChat = async (req, res) => {
    try {
        const { chatId, chatType } = req.body;

        if (!chatId || !chatType) {
            return res.status(400).json({
                message: "chatId and chatType are required",
            });
        }

        if (!["user", "group"].includes(chatType)) {
            return res.status(400).json({
                message: "Invalid chat type",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({
                message: "Invalid chat id",
            });
        }

        const user = await User.findById(req.user._id);

        const alreadyPinned = user.pinnedChats.some(
            (chat) =>
                chat.chatId.toString() === chatId &&
                chat.chatType === chatType
        );

        if (alreadyPinned) {
            return res.status(409).json({
                message: "Chat is already pinned",
            });
        }

        user.pinnedChats.push({
            chatId,
            chatType,
        });

        await user.save();

        const updatedUser = await User.findById(req.user._id).select("-password");

        res.status(200).json({
            message: "Chat pinned successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Pin Chat Error:", error);

        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

export const unpinChat = async (req, res) => {
    try {
        const { chatId } = req.params;

        const user = await User.findById(req.user._id);

        user.pinnedChats = user.pinnedChats.filter(
            (chat) => chat.chatId.toString() !== chatId
        );

        await user.save();

        const updatedUser = await User.findById(req.user._id).select("-password");

        res.status(200).json({
            message: "Chat unpinned successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Unpin Chat Error:", error);

        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
