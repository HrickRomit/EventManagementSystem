import { Router } from "express";
import { body } from "express-validator";
import {
  createEvent,
  deleteOrganizerEvent,
  getOrganizerEvents,
  getPublicEvents,
  updateOrganizerEvent
} from "../controllers/event.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";

const router = Router();

const entryTypes = ["tickets", "registration", "none"];
const ticketCategoryOrder = ["premium", "regular", "economy"];

const getSelectedTicketCategories = (ticketTypeCount) => {
  if (Number(ticketTypeCount) === 1) {
    return ["regular"];
  }

  return ticketCategoryOrder.slice(0, Number(ticketTypeCount));
};

const eventValidation = [
  body("name").trim().notEmpty().withMessage("Event name is required."),
  body("eventType").trim().notEmpty().withMessage("Event type is required."),
  body("date").isISO8601().withMessage("Event date is required."),
  body("time").trim().notEmpty().withMessage("Event time is required."),
  body("duration").trim().notEmpty().withMessage("Duration is required."),
  body("venue").trim().notEmpty().withMessage("Venue is required."),
  body("venueEstimate").trim().notEmpty().withMessage("Venue price estimate is required."),
  body("capacity").isInt({ min: 1 }).withMessage("Capacity must be at least 1."),
  body("entryType").isIn(entryTypes).withMessage("Choose tickets, registration, or none."),
  body("ticketTypeCount").custom((value, { req }) => {
    if (req.body.entryType === "tickets" && ![1, 2, 3].includes(Number(value))) {
      throw new Error("Choose the number of ticket types.");
    }

    return true;
  }),
  body("ticketCategories").custom((value, { req }) => {
    if (req.body.entryType !== "tickets") {
      return true;
    }

    const ticketTypeCount = Number(req.body.ticketTypeCount);
    const capacity = Number(req.body.capacity);
    const requiredCategories = getSelectedTicketCategories(ticketTypeCount);
    let totalAvailable = 0;

    for (const category of requiredCategories) {
      const details = value?.[category];

      if (!details || Number(details.price) < 0 || !Number.isInteger(Number(details.available)) || Number(details.available) < 1) {
        throw new Error("Enter price and available tickets for each selected ticket category.");
      }

      totalAvailable += Number(details.available);
    }

    if (totalAvailable > capacity) {
      throw new Error("Total ticket availability cannot exceed event capacity.");
    }

    return true;
  }),
  body("contactNumber").trim().notEmpty().withMessage("Contact number is required."),
  body("contactEmail").trim().isEmail().withMessage("A valid contact email is required.")
];

router.get("/", getPublicEvents);

router.use(requireAuth, requireRole("organizer"));
router.get("/mine", getOrganizerEvents);
router.post("/", eventValidation, validateRequest, createEvent);
router.put("/:id", eventValidation, validateRequest, updateOrganizerEvent);
router.delete(
  "/:id",
  [body("password").notEmpty().withMessage("Password is required.")],
  validateRequest,
  deleteOrganizerEvent
);

export default router;
