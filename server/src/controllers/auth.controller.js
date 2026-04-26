import User from "../models/user.model.js";
import { generateToken } from "../utils/generateToken.js";

const formatAuthResponse = (user) => ({
  token: generateToken(user),
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    organizationName: user.organizationName || ""
  }
});

export const registerUser = async (req, res) => {
  const { name, email, password, role, organizationName } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    organizationName: role === "organizer" ? organizationName : ""
  });

  return res.status(201).json(formatAuthResponse(user));
};

export const loginUser = async (req, res) => {
  const { email, password, role } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const passwordMatches = await user.comparePassword(password);

  if (!passwordMatches) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  if (role && user.role !== role) {
    return res.status(403).json({
      message: `This account is registered as a ${user.role}, not a ${role}.`
    });
  }

  return res.json(formatAuthResponse(user));
};

export const getCurrentUser = async (req, res) => {
  return res.json({ user: req.user });
};
