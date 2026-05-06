import Event from "../models/event.model.js";
import User from "../models/user.model.js";

const ticketCategoryOrder = ["premium", "regular", "economy"];

const getSelectedTicketCategories = (ticketTypeCount) => {
  if (Number(ticketTypeCount) === 1) {
    return ["regular"];
  }

  return ticketCategoryOrder.slice(0, Number(ticketTypeCount));
};

const pickEventPayload = (body) => {
  const ticketTypeCount = Number(body.ticketTypeCount || 1);
  const ticket =
    body.entryType === "tickets"
      ? {
          typeCount: ticketTypeCount,
          categories: getSelectedTicketCategories(ticketTypeCount).map((name) => ({
            name,
            price: Number(body.ticketCategories?.[name]?.price),
            available: Number(body.ticketCategories?.[name]?.available)
          }))
        }
      : null;

  return {
    name: body.name,
    eventType: body.eventType,
    eventImage: body.eventImage || "",
    date: body.date,
    time: body.time,
    duration: body.duration,
    venue: body.venue,
    venueEstimate: body.venueEstimate,
    capacity: Number(body.capacity),
    entryType: body.entryType,
    ticket,
    contactNumber: body.contactNumber,
    contactEmail: body.contactEmail
  };
};

export const createEvent = async (req, res, next) => {
  try {
    const organizationName = req.user.organizationName || req.user.name;
    const event = await Event.create({
      ...pickEventPayload(req.body),
      organizer: req.user._id,
      organizerName: organizationName
    });

    res.status(201).json({ event });
  } catch (error) {
    next(error);
  }
};

export const getOrganizerEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ organizer: req.user._id }).sort({ createdAt: -1 });
    res.json({ events });
  } catch (error) {
    next(error);
  }
};

export const updateOrganizerEvent = async (req, res, next) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, organizer: req.user._id },
      pickEventPayload(req.body),
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    return res.json({ event });
  } catch (error) {
    return next(error);
  }
};

export const deleteOrganizerEvent = async (req, res, next) => {
  try {
    const { password } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Password confirmation failed." });
    }

    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      organizer: req.user._id
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    return res.json({ message: "Event deleted successfully." });
  } catch (error) {
    return next(error);
  }
};

export const getPublicEvents = async (_req, res, next) => {
  try {
    const events = await Event.find({ status: "published" })
      .sort({ date: 1, time: 1 })
      .select("-__v");

    res.json({ events });
  } catch (error) {
    next(error);
  }
};
