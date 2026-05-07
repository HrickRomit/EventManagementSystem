import Event from "../models/event.model.js";
import Registration from "../models/registration.model.js";
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

const buildRegistrationPayload = (participantId, event, ticketCategory = "") => {
  const selectedCategory = event.ticket?.categories?.find((category) => category.name === ticketCategory);

  return {
    participant: participantId,
    event: event._id,
    eventName: event.name,
    organizerName: event.organizerName,
    entryType: event.entryType,
    ticketCategory,
    price: selectedCategory?.price || 0,
    eventDate: event.date,
    eventTime: event.time,
    venue: event.venue
  };
};

const restoreBookedSeat = async (eventId, entryType, ticketCategory) => {
  const update = { $inc: { capacity: 1 } };

  if (entryType === "tickets" && ticketCategory) {
    update.$inc["ticket.categories.$[category].available"] = 1;
  }

  await Event.updateOne(
    { _id: eventId },
    update,
    entryType === "tickets" && ticketCategory
      ? { arrayFilters: [{ "category.name": ticketCategory }] }
      : undefined
  );
};

export const bookEvent = async (req, res, next) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, status: "published" });

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    if (event.entryType === "none") {
      return res.status(400).json({ message: "This event does not require booking." });
    }

    const existingRegistration = await Registration.findOne({
      participant: req.user._id,
      event: event._id
    });

    if (existingRegistration) {
      return res.status(409).json({ message: "You already booked this event." });
    }

    const ticketCategory = event.entryType === "tickets" ? req.body.ticketCategory : "";
    const matchingTicketCategory =
      event.entryType === "tickets"
        ? event.ticket?.categories?.find((category) => category.name === ticketCategory)
        : null;

    if (event.entryType === "tickets" && !matchingTicketCategory) {
      return res.status(400).json({ message: "Choose an available ticket category." });
    }

    const eventQuery = { _id: event._id, capacity: { $gt: 0 } };
    const update = { $inc: { capacity: -1 } };
    const options = { new: true, runValidators: true };

    if (event.entryType === "tickets") {
      eventQuery["ticket.categories"] = {
        $elemMatch: { name: ticketCategory, available: { $gt: 0 } }
      };
      update.$inc["ticket.categories.$[category].available"] = -1;
      options.arrayFilters = [{ "category.name": ticketCategory, "category.available": { $gt: 0 } }];
    }

    const updatedEvent = await Event.findOneAndUpdate(eventQuery, update, options);

    if (!updatedEvent) {
      return res.status(409).json({ message: "No seats are available for this event." });
    }

    try {
      const registration = await Registration.create(
        buildRegistrationPayload(req.user._id, event, ticketCategory)
      );

      return res.status(201).json({ registration, event: updatedEvent });
    } catch (error) {
      await restoreBookedSeat(event._id, event.entryType, ticketCategory);

      if (error.code === 11000) {
        return res.status(409).json({ message: "You already booked this event." });
      }

      throw error;
    }
  } catch (error) {
    return next(error);
  }
};

export const getParticipantRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({ participant: req.user._id })
      .sort({ createdAt: -1 })
      .select("-__v");

    return res.json({ registrations });
  } catch (error) {
    return next(error);
  }
};
