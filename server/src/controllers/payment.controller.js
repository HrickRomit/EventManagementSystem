import Stripe from "stripe";
import Event from "../models/event.model.js";
import Registration from "../models/registration.model.js";
import { bookEventForParticipant } from "./event.controller.js";

let stripeClient = null;

const getStripeClient = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  return stripeClient;
};

const getCurrency = () => (process.env.STRIPE_CURRENCY || "bdt").toLowerCase();

const configuredClientUrls = () =>
  (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);

const isLocalDevClientUrl = (url) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(url);

const getClientUrl = (requestedClientOrigin = "") => {
  const allowedClientUrls = configuredClientUrls();
  const fallbackClientUrl = allowedClientUrls[0] || "http://localhost:5173";
  const normalizedRequestedOrigin = requestedClientOrigin.trim().replace(/\/$/, "");

  if (
    normalizedRequestedOrigin &&
    (allowedClientUrls.includes(normalizedRequestedOrigin) ||
      (process.env.NODE_ENV !== "production" && isLocalDevClientUrl(normalizedRequestedOrigin)))
  ) {
    return normalizedRequestedOrigin;
  }

  return fallbackClientUrl;
};

const normalizeCartItems = (items = []) =>
  items.map((item) => ({
    eventId: item.eventId,
    ticketCategory: item.ticketCategory,
    quantity: Number(item.quantity || 1)
  }));

const getPaymentIntentId = (session) =>
  typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id || "";

const markRegistrationPaid = async (registration, session) => {
  registration.paymentStatus = "paid";
  registration.stripeCheckoutSessionId = session.id;
  registration.stripePaymentIntentId = getPaymentIntentId(session);
  await registration.save();

  return registration;
};

export const createCheckoutSession = async (req, res, next) => {
  try {
    const stripe = getStripeClient();

    if (!stripe) {
      return res.status(500).json({ message: "Stripe is not configured on the server." });
    }

    const cartItems = normalizeCartItems(req.body.items);

    if (!cartItems.length) {
      return res.status(400).json({ message: "Your cart is empty." });
    }

    if (cartItems.some((item) => item.quantity !== 1)) {
      return res.status(400).json({
        message: "Checkout currently supports one ticket per event. Please set ticket quantity to 1."
      });
    }

    const eventIds = cartItems.map((item) => item.eventId);
    const existingRegistration = await Registration.findOne({
      participant: req.user._id,
      event: { $in: eventIds }
    });

    if (existingRegistration) {
      return res.status(409).json({ message: "You already booked one of the events in your cart." });
    }

    const events = await Event.find({
      _id: { $in: eventIds },
      status: "published",
      entryType: "tickets"
    });

    const lineItems = cartItems.map((item) => {
      const event = events.find((currentEvent) => currentEvent._id.toString() === item.eventId);
      const category = event?.ticket?.categories?.find(
        (ticketCategory) => ticketCategory.name === item.ticketCategory
      );

      if (!event || !category || Number(category.available) < 1 || Number(event.capacity) < 1) {
        throw new Error("One or more tickets in your cart are no longer available.");
      }

      if (Number(category.price) <= 0) {
        throw new Error("Free tickets do not need Stripe checkout.");
      }

      return {
        quantity: 1,
        price_data: {
          currency: getCurrency(),
          unit_amount: Math.round(Number(category.price) * 100),
          product_data: {
            name: event.name,
            description: `${category.name} ticket - ${event.venue}`
          }
        }
      };
    });

    const clientUrl = getClientUrl(req.body.clientOrigin);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: `${clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/payment/cancel`,
      payment_intent_data: {
        metadata: {
          app: "EventManagementSystem",
          userId: req.user._id.toString(),
          eventIds: eventIds.join(",")
        }
      },
      metadata: {
        userId: req.user._id.toString(),
        cartItems: JSON.stringify(cartItems)
      }
    });

    return res.status(201).json({ url: session.url });
  } catch (error) {
    if (error.message?.includes("no longer available")) {
      return res.status(409).json({ message: error.message });
    }

    if (error.message?.includes("Free tickets")) {
      return res.status(400).json({ message: error.message });
    }

    return next(error);
  }
};

export const fulfillCheckoutSession = async (req, res, next) => {
  try {
    const stripe = getStripeClient();

    if (!stripe) {
      return res.status(500).json({ message: "Stripe is not configured on the server." });
    }

    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);

    if (session.metadata?.userId !== req.user._id.toString()) {
      return res.status(403).json({ message: "This payment session does not belong to your account." });
    }

    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment has not been completed yet." });
    }

    const cartItems = JSON.parse(session.metadata.cartItems || "[]");
    const registrations = [];

    for (const item of cartItems) {
      try {
        const result = await bookEventForParticipant(req.user._id, item.eventId, item.ticketCategory);
        const paidRegistration = await markRegistrationPaid(result.registration, session);
        registrations.push(paidRegistration);
      } catch (error) {
        if (error.statusCode !== 409) {
          throw error;
        }

        const existingRegistration = await Registration.findOne({
          participant: req.user._id,
          event: item.eventId
        });

        if (existingRegistration) {
          const paidRegistration = await markRegistrationPaid(existingRegistration, session);
          registrations.push(paidRegistration);
        }
      }
    }

    return res.json({
      message: "Payment confirmed and tickets generated.",
      registrations
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return next(error);
  }
};
