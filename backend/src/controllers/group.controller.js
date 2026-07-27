import Group from "../models/group.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import mongoose from "mongoose";

// GET MY GROUPS
export const getMyGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await Group.find({
      "members.userId": userId,
    })
      .select("_id name avatar members createdBy createdAt")
      .sort({ updatedAt: -1 });

    res.status(200).json(groups);
  } catch (error) {
    console.error("Get my groups error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// CREATE GROUP
export const createGroup = async (req, res) => {
  try {
    const { name, members = [], avatar = "" } = req.body;
    const userId = req.user._id;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Group name is required",
      });
    }

    const filteredMembers = members.filter((id) =>
      mongoose.Types.ObjectId.isValid(id),
    );

    // remove AI users from members list
    const validUsers = await User.find({
      _id: { $in: filteredMembers },
      isAI: { $ne: true },
    }).select("_id");

    const validMemberIds = validUsers.map((u) => u._id.toString());

    // ensure creator is always included
    const uniqueMembers = new Set([...validMemberIds, userId.toString()]);

    const groupMembers = Array.from(uniqueMembers).map((id) => ({
      userId: id,
      role: id === userId.toString() ? "admin" : "member",
    }));
    // upload avatar to cloudinary
    let avatarUrl = "";
    if (avatar) {
      // Basic validation for base64 image
      if (!avatar.startsWith("data:image/")) {
        return res.status(400).json({
          message: "Only image files are allowed",
        });
      }

      const uploadResponse = await cloudinary.uploader.upload(avatar, {
        folder: "groups",
      });

      avatarUrl = uploadResponse.secure_url;
    }
    const group = await Group.create({
      name,
      avatar: avatarUrl,
      members: groupMembers,
      createdBy: userId,
    });

    res.status(201).json(group);
  } catch (error) {
    console.error("Create group error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET GROUP INFO
export const getGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid group ID" });
    }

    const group = await Group.findById(id)
      .populate("members.userId", "fullName profilePic email")
      .populate("createdBy", "fullName profilePic");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isMember = group.members.some(
      (m) => m.userId && m.userId._id.toString() === userId.toString(),
    );

    if (!isMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(group);
  } catch (error) {
    console.error("Get group error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ADD USER (ADMIN ONLY)
export const addUserToGroup = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  const group = await Group.findById(id);
  if (!group) {
    return res.status(404).json({ message: "Group not found" });
  }

  // admin check
  const isAdmin = group.members.some(
    (m) =>
      m.userId.toString() === req.user._id.toString() && m.role === "admin",
  );

  if (!isAdmin) {
    return res.status(403).json({ message: "Admins only" });
  }

  // prevent duplicate
  const alreadyMember = group.members.some(
    (m) => m.userId.toString() === userId,
  );

  if (alreadyMember) {
    return res.status(400).json({ message: "User already in group" });
  }

  group.members.push({ userId, role: "member" });
  await group.save();

  // THIS IS THE KEY
  const populatedGroup = await Group.findById(group._id).populate(
    "members.userId",
    "fullName profilePic",
  );

  res.json(populatedGroup);
};

// REMOVE USER (ADMIN ONLY)
export const removeUserFromGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const adminId = req.user._id;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const admin = group.members.find(
      (m) => m.userId.toString() === adminId.toString() && m.role === "admin",
    );

    if (!admin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    group.members = group.members.filter((m) => m.userId.toString() !== userId);

    await group.save();
    res.status(200).json(group);
  } catch (error) {
    console.error("Remove user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// LEAVE GROUP
export const leaveGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    group.members = group.members.filter(
      (m) => m.userId.toString() !== userId.toString(),
    );

    await group.save();
    res.status(200).json({ message: "Left group successfully" });
  } catch (error) {
    console.error("Leave group error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE GROUP INFO (ADMIN ONLY)
export const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, avatar } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const admin = group.members.find(
      (m) => m.userId.toString() === userId.toString() && m.role === "admin",
    );

    if (!admin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    if (name) group.name = name;
    if (avatar !== undefined) {
      if (avatar) {
        const uploadResponse = await cloudinary.uploader.upload(avatar, {
          folder: "groups",
        });
        group.avatar = uploadResponse.secure_url;
      } else {
        group.avatar = "";
      }
    }

    await group.save();

    const updatedGroup = await Group.findById(group._id)
      .populate("members.userId", "fullName profilePic email")
      .populate("createdBy", "_id");

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error("Update group error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Only creator can delete
    if (group.createdBy.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await group.deleteOne();

    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("DELETE GROUP ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//adding photo during group creation == FUTURE IMPLEMENTATION
