import { Router } from "express";
import { body } from "express-validator";
import {
  getCurrentUser,
  googleAuthUser,
  loginUser,
  phoneAuthUser,
  registerUser
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";

const router = Router();

const publicRegistrationRoles = ["participant", "organizer"];
const loginRoles = ["participant", "organizer"];

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required."),
    body("email").trim().isEmail().withMessage("A valid email is required."),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long."),
    body("role")
      .isIn(publicRegistrationRoles)
      .withMessage("Role must be participant or organizer."),
    body("organizationName")
      .optional({ values: "falsy" })
      .trim()
      .isLength({ min: 2 })
      .withMessage("Organization name must be at least 2 characters long."),
    body("organizationName").custom((value, { req }) => {
      if (req.body.role === "organizer" && !value?.trim()) {
        throw new Error("Organization name is required for organizers.");
      }

      return true;
    })
  ],
  validateRequest,
  registerUser
);

router.post(
  "/login",
  [
    body("email").trim().isEmail().withMessage("A valid email is required."),
    body("password").notEmpty().withMessage("Password is required."),
    body("role")
      .optional()
      .isIn(loginRoles)
      .withMessage("Role must be participant or organizer.")
  ],
  validateRequest,
  loginUser
);

router.post(
  "/phone",
  [
    body("idToken").notEmpty().withMessage("Phone verification token is required."),
    body("mode")
      .optional()
      .isIn(["login", "register"])
      .withMessage("Mode must be login or register."),
    body("role")
      .if(body("mode").equals("register"))
      .notEmpty()
      .withMessage("Role is required.")
      .bail()
      .isIn(loginRoles)
      .withMessage("Role must be participant or organizer."),
    body("name").if(body("mode").equals("register")).trim().notEmpty().withMessage("Name is required."),
    body("organizationName")
      .optional({ values: "falsy" })
      .trim()
      .isLength({ min: 2 })
      .withMessage("Organization name must be at least 2 characters long."),
    body("organizationName").custom((value, { req }) => {
      if (req.body.mode === "register" && req.body.role === "organizer" && !value?.trim()) {
        throw new Error("Organization name is required for organizers.");
      }

      return true;
    })
  ],
  validateRequest,
  phoneAuthUser
);

router.post(
  "/google",
  [
    body("idToken").notEmpty().withMessage("Google verification token is required."),
    body("mode")
      .optional()
      .isIn(["login", "register"])
      .withMessage("Mode must be login or register."),
    body("role")
      .if(body("mode").equals("register"))
      .notEmpty()
      .withMessage("Role is required.")
      .bail()
      .isIn(loginRoles)
      .withMessage("Role must be participant or organizer."),
    body("role")
      .optional()
      .isIn(loginRoles)
      .withMessage("Role must be participant or organizer."),
    body("name").optional({ values: "falsy" }).trim(),
    body("organizationName")
      .optional({ values: "falsy" })
      .trim()
      .isLength({ min: 2 })
      .withMessage("Organization name must be at least 2 characters long."),
    body("organizationName").custom((value, { req }) => {
      if (req.body.mode === "register" && req.body.role === "organizer" && !value?.trim()) {
        throw new Error("Organization name is required for organizers.");
      }

      return true;
    })
  ],
  validateRequest,
  googleAuthUser
);

router.get("/me", requireAuth, getCurrentUser);

export default router;
