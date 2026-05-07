import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true
    },
    eventName: {
      type: String,
      required: true,
      trim: true
    },
    organizerName: {
      type: String,
      required: true,
      trim: true
    },
    entryType: {
      type: String,
      enum: ["tickets", "registration"],
      required: true
    },
    ticketCategory: {
      type: String,
      enum: ["premium", "regular", "economy", ""],
      default: ""
    },
    price: {
      type: Number,
      min: 0,
      default: 0
    },
    status: {
      type: String,
      enum: ["confirmed"],
      default: "confirmed"
    },
    eventDate: {
      type: Date,
      required: true
    },
    eventTime: {
      type: String,
      required: true,
      trim: true
    },
    venue: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

registrationSchema.index({ participant: 1, event: 1 }, { unique: true });

const Registration = mongoose.model("Registration", registrationSchema);

export default Registration;
