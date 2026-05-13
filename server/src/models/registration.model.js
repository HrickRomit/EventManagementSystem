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
    paymentStatus: {
      type: String,
      enum: ["not_required", "unpaid", "pending", "paid", "failed", "refunded"],
      default: "not_required"
    },
    stripeCheckoutSessionId: {
      type: String,
      trim: true,
      default: ""
    },
    stripePaymentIntentId: {
      type: String,
      trim: true,
      default: ""
    },
    status: {
      type: String,
      enum: ["confirmed"],
      default: "confirmed"
    },
    ticketId: {
      type: String,
      required: true,
      trim: true
    },
    ticketSecret: {
      type: String,
      required: true,
      select: false
    },
    ticketIssuedAt: {
      type: Date,
      default: Date.now
    },
    qrPayload: {
      type: String,
      required: true
    },
    qrCodeDataUrl: {
      type: String,
      required: true
    },
    attendanceStatus: {
      type: String,
      enum: ["not_checked_in", "checked_in"],
      default: "not_checked_in"
    },
    checkedInAt: {
      type: Date,
      default: null
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
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.ticketSecret;
        return ret;
      }
    },
    toObject: {
      transform(_doc, ret) {
        delete ret.ticketSecret;
        return ret;
      }
    }
  }
);

registrationSchema.index({ participant: 1, event: 1 }, { unique: true });
registrationSchema.index({ ticketId: 1 }, { unique: true, sparse: true });

const Registration = mongoose.model("Registration", registrationSchema);

export default Registration;
