import mongoose from "mongoose";

const ticketCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: ["premium", "regular", "economy"],
      required: true
    },
    price: {
      type: Number,
      min: 0,
      default: 0
    },
    available: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  { _id: false }
);

const ticketSchema = new mongoose.Schema(
  {
    typeCount: {
      type: Number,
      enum: [1, 2, 3],
      default: 1
    },
    categories: {
      type: [ticketCategorySchema],
      default: []
    }
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    organizerName: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    eventType: {
      type: String,
      required: true,
      trim: true
    },
    eventImage: {
      type: String,
      default: ""
    },
    date: {
      type: Date,
      required: true
    },
    time: {
      type: String,
      required: true,
      trim: true
    },
    duration: {
      type: String,
      required: true,
      trim: true
    },
    venue: {
      type: String,
      required: true,
      trim: true
    },
    venueEstimate: {
      type: String,
      required: true,
      trim: true
    },
    capacity: {
      type: Number,
      required: true,
      min: 1
    },
    entryType: {
      type: String,
      enum: ["tickets", "registration", "none"],
      required: true
    },
    ticket: {
      type: ticketSchema,
      default: null
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true
    },
    contactEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    status: {
      type: String,
      enum: ["published"],
      default: "published"
    }
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;
