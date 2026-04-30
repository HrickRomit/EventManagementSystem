import User from "../models/user.model.js";
import { generateToken } from "../utils/generateToken.js";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "123";
const HARDCODED_ADMIN_USER = {
  _id: "hardcoded-admin",
  id: "hardcoded-admin",
  name: "Admin",
  username: ADMIN_USERNAME,
  email: "",
  role: "admin",
  organizationName: ""
};

export const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Invalid admin username or password." });
  }

  return res.json({
    token: generateToken(HARDCODED_ADMIN_USER),
    user: HARDCODED_ADMIN_USER
  });
};

export const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query; // filter by role
    
    const filter = {};
    if (role && ["participant", "organizer", "admin"].includes(role)) {
      filter.role = role;
    }

    const users = await User.find(filter)
      .select("-password") // Don't send passwords
      .sort({ createdAt: -1 })
      .lean();

    res.json({ users, total: users.length });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, organizationName } = req.body;

    const updateData = { name, email, role };
    if (role === "organizer") {
      updateData.organizationName = organizationName;
    }

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user, message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting the last admin
    const adminCount = await User.countDocuments({ role: "admin" });
    const userToDelete = await User.findById(id);

    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (userToDelete.role === "admin" && adminCount === 1) {
      return res.status(403).json({ message: "Cannot delete the last admin" });
    }

    await User.findByIdAndDelete(id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
};
