import Event from "../models/event.model.js";
import Registration from "../models/registration.model.js";
import User from "../models/user.model.js";
import {
  buildTicketPayload,
  generateQRCodeDataUrl,
  generateTicketId,
  generateTicketSecret
} from "../utils/ticket.js";

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
  const price = selectedCategory?.price || 0;

  return {
    participant: participantId,
    event: event._id,
    eventName: event.name,
    organizerName: event.organizerName,
    entryType: event.entryType,
    ticketCategory,
    price,
    paymentStatus: price > 0 ? "unpaid" : "not_required",
    eventDate: event.date,
    eventTime: event.time,
    venue: event.venue
  };
};

const issueRegistrationTicket = async (registrationPayload) => {
  const registration = new Registration(registrationPayload);
  const ticketSecret = generateTicketSecret();

  registration.ticketId = generateTicketId();
  registration.ticketSecret = ticketSecret;
  registration.ticketIssuedAt = new Date();

  const ticketPayload = buildTicketPayload(registration, ticketSecret);
  registration.qrPayload = JSON.stringify(ticketPayload);
  registration.qrCodeDataUrl = await generateQRCodeDataUrl(ticketPayload);

  await registration.save();

  return registration;
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

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const bookEventForParticipant = async (
  participantId,
  eventId,
  ticketCategoryInput = "",
  { allowDuplicateTickets = false } = {}
) => {
  const event = await Event.findOne({ _id: eventId, status: "published" });

  if (!event) {
    throw createHttpError(404, "Event not found.");
  }

  if (event.entryType === "none") {
    throw createHttpError(400, "This event does not require booking.");
  }

  const shouldCheckExistingRegistration = event.entryType !== "tickets" || !allowDuplicateTickets;

  if (shouldCheckExistingRegistration) {
    const existingRegistration = await Registration.findOne({
      participant: participantId,
      event: event._id
    });

    if (existingRegistration) {
      throw createHttpError(409, "You already booked this event.");
    }
  }

  const ticketCategory = event.entryType === "tickets" ? ticketCategoryInput : "";
  const matchingTicketCategory =
    event.entryType === "tickets"
      ? event.ticket?.categories?.find((category) => category.name === ticketCategory)
      : null;

  if (event.entryType === "tickets" && !matchingTicketCategory) {
    throw createHttpError(400, "Choose an available ticket category.");
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
    throw createHttpError(409, "No seats are available for this event.");
  }

  try {
    const registration = await issueRegistrationTicket(
      buildRegistrationPayload(participantId, event, ticketCategory)
    );

    return { registration, event: updatedEvent };
  } catch (error) {
    await restoreBookedSeat(event._id, event.entryType, ticketCategory);

    if (error.code === 11000) {
      throw createHttpError(409, "You already booked this event.");
    }

    throw error;
  }
};

export const bookEvent = async (req, res, next) => {
  try {
    const result = await bookEventForParticipant(req.user._id, req.params.id, req.body.ticketCategory);

    return res.status(201).json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }

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

export const getOrganizerEventRegistrations = async (req, res, next) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      organizer: req.user._id
    }).select("name date time venue capacity entryType ticket");

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    const registrations = await Registration.find({ event: event._id })
      .sort({ createdAt: -1 })
      .populate("participant", "name email phoneNumber")
      .select("-__v");

    const stats = {
      totalTickets: registrations.length,
      checkedInTickets: registrations.filter((registration) => registration.attendanceStatus === "checked_in").length,
      paidTickets: registrations.filter((registration) => registration.paymentStatus === "paid").length
    };

    return res.json({ event, registrations, stats });
  } catch (error) {
    return next(error);
  }
};

export const verifyTicket = async (req, res, next) => {
  try {
    let ticketPayload;

    try {
      ticketPayload = typeof req.body.qrPayload === "string" ? JSON.parse(req.body.qrPayload) : req.body.qrPayload;
    } catch (_error) {
      return res.status(400).json({ message: "Invalid QR ticket payload." });
    }

    const { registrationId, eventId, ticketId, token } = ticketPayload || {};

    if (!registrationId || !eventId || !ticketId || !token) {
      return res.status(400).json({ message: "QR ticket payload is incomplete." });
    }

    const event = await Event.findOne({
      _id: eventId,
      organizer: req.user._id
    });

    if (!event) {
      return res.status(403).json({ message: "This ticket does not belong to one of your events." });
    }

    const registration = await Registration.findOne({
      _id: registrationId,
      event: eventId,
      ticketId
    })
      .select("+ticketSecret")
      .populate("participant", "name email phoneNumber");

    if (!registration || registration.ticketSecret !== token) {
      return res.status(404).json({ message: "Ticket is invalid." });
    }

    if (registration.attendanceStatus === "checked_in") {
      return res.status(409).json({
        message: "Ticket was already checked in.",
        registration: {
          ...registration.toObject(),
          ticketSecret: undefined
        }
      });
    }

    registration.attendanceStatus = "checked_in";
    registration.checkedInAt = new Date();
    await registration.save();

    return res.json({
      message: "Ticket verified successfully.",
      registration: {
        ...registration.toObject(),
        ticketSecret: undefined
      }
    });
  } catch (error) {
    return next(error);
  }
};
