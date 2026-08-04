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

        const updatedUser = await User.findOneAndUpdate(
            {
                _id: req.user._id,
                pinnedChats: {
                    $not: {
                        $elemMatch: {
                            chatId,
                            chatType,
                        },
                    },
                },
            },
            {
                $push: {
                    pinnedChats: {
                        chatId,
                        chatType,
                    },
                },
            },
            {
                new: true,
            }
        ).select("-password");

        if (!updatedUser) {
            return res.status(409).json({
                message: "Chat is already pinned",
            });
        }

        return res.status(200).json({
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

        const updatedUser = await User.findOneAndUpdate(
            {
                _id: req.user._id,
            },
            {
                $pull: {
                    pinnedChats: {
                        chatId,
                    },
                },
            },
            {
                new: true,
            }
        ).select("-password");

        return res.status(200).json({
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
