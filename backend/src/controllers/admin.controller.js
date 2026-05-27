import User from "../models/user.model.js";
import Group from "../models/group.model.js";
import Message from "../models/message.model.js";
import Report from "../models/report.model.js";
import mongoose from "mongoose";

export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    const search = req.query.search || "";
    const role = req.query.role || "";

    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Role filter
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select("-password")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });

  } catch (error) {
    console.error("Get users error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const toggleBanUser = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isBanned = !user.isBanned;
    await user.save();

    res.status(200).json({
      message: user.isBanned ? "User banned" : "User unbanned",
    });
  } catch (error) {
    console.error("Ban user error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Admin dashbord stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalGroups = await Group.countDocuments();
    const totalMessages = await Message.countDocuments();
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: "pending" });

    // Monthly Users Growth
    const monthlyUsers = await User.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          users: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Monthly Messages Growth
    const monthlyMessages = await Message.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          messages: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      totalUsers,
      totalGroups,
      totalMessages,
      totalReports,
      pendingReports,
      monthlyUsers,
      monthlyMessages,
    });

  } catch (error) {
    console.error("Dashboard stats error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
