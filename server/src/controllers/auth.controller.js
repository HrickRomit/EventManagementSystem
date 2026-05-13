import User from "../models/user.model.js";
import getFirebaseAdmin from "../config/firebaseAdmin.js";
import { generateToken } from "../utils/generateToken.js";

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email || "",
  phoneNumber: user.phoneNumber || "",
  role: user.role,
  organizationName: user.organizationName || ""
});

const formatAuthResponse = (user) => ({
  token: generateToken(user),
  user: formatUser(user)
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

export const phoneAuthUser = async (req, res) => {
  const { idToken, mode = "login", name, role, organizationName } = req.body;

  try {
    const firebaseAdmin = getFirebaseAdmin();
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    const phoneNumber = decodedToken.phone_number;

    if (!phoneNumber) {
      return res.status(400).json({ message: "Verified phone number was not found." });
    }

    const existingUser = await User.findOne({ phoneNumber });

    if (mode === "login") {
      if (!existingUser) {
        return res.status(404).json({ message: "No account exists for this phone number." });
      }

      if (role && existingUser.role !== role) {
        return res.status(403).json({
          message: `This account is registered as a ${existingUser.role}, not a ${role}.`
        });
      }

      return res.json(formatAuthResponse(existingUser));
    }

    if (existingUser) {
      return res.status(409).json({ message: "An account with this phone number already exists." });
    }

    const user = await User.create({
      name,
      phoneNumber,
      role,
      organizationName: role === "organizer" ? organizationName : ""
    });

    return res.status(201).json(formatAuthResponse(user));
  } catch (error) {
    return res.status(401).json({
      message: "Phone verification failed. Please request a new OTP and try again."
    });
  }
};

export const googleAuthUser = async (req, res) => {
  const { idToken, mode = "login", name, role, organizationName } = req.body;

  try {
    const firebaseAdmin = getFirebaseAdmin();
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    const email = decodedToken.email?.toLowerCase();

    if (!email) {
      return res.status(400).json({ message: "Verified Google email was not found." });
    }

    const existingUser = await User.findOne({ email });

    if (mode === "login") {
      if (!existingUser) {
        return res.status(404).json({ message: "No account exists for this Google email." });
      }

      if (role && existingUser.role !== role) {
        return res.status(403).json({
          message: `This account is registered as a ${existingUser.role}, not a ${role}.`
        });
      }

      return res.json(formatAuthResponse(existingUser));
    }

    if (existingUser) {
      return res.status(409).json({ message: "An account with this Google email already exists." });
    }

    const user = await User.create({
      name: name || decodedToken.name || email.split("@")[0],
      email,
      role,
      organizationName: role === "organizer" ? organizationName : ""
    });

    return res.status(201).json(formatAuthResponse(user));
  } catch (_error) {
    return res.status(401).json({
      message: "Google verification failed. Please try again."
    });
  }
};

export const getCurrentUser = async (req, res) => {
  return res.json({ user: formatUser(req.user) });
};

export const updateCurrentUser = async (req, res, next) => {
  try {
    const updates = {
      name: req.body.name,
      phoneNumber: req.body.phoneNumber || ""
    };

    if (req.user.role === "organizer") {
      updates.organizationName = req.body.organizationName || "";
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true
    }).select("-password");

    return res.json({ user: formatUser(user) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "That phone number is already linked to another account." });
    }

    return next(error);
  }
};
