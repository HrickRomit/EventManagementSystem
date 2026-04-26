import jwt from "jsonwebtoken";

export const generateToken = (user) =>
  jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role
    },
    process.env.JWT_SECRET || "development-secret",
    {
      expiresIn: "7d"
    }
  );
