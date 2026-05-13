import { Router } from "express";
import { body, param } from "express-validator";
import {
  createCheckoutSession,
  fulfillCheckoutSession
} from "../controllers/payment.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";

const router = Router();

router.use(requireAuth, requireRole("participant"));

router.post(
  "/checkout-session",
  [
    body("items").isArray({ min: 1 }).withMessage("Add at least one ticket to checkout."),
    body("items.*.eventId").notEmpty().withMessage("Event ID is required."),
    body("items.*.ticketCategory").isIn(["premium", "regular", "economy"]).withMessage("Choose a valid ticket category."),
    body("items.*.quantity").isInt({ min: 1, max: 100 }).withMessage("Choose between 1 and 100 tickets.")
  ],
  validateRequest,
  createCheckoutSession
);

router.post(
  "/checkout-session/:sessionId/fulfill",
  [param("sessionId").notEmpty().withMessage("Stripe session ID is required.")],
  validateRequest,
  fulfillCheckoutSession
);

export default router;
