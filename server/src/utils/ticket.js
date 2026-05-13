import crypto from "node:crypto";
import QRCode from "qrcode";

const TICKET_PREFIX = "SEM";

export const generateTicketId = () => {
  const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `${TICKET_PREFIX}-${randomPart}`;
};

export const generateTicketSecret = () => crypto.randomBytes(24).toString("hex");

export const buildTicketPayload = (registration, ticketSecret) => ({
  ticketId: registration.ticketId,
  registrationId: registration._id.toString(),
  eventId: registration.event.toString(),
  issuedAt: registration.ticketIssuedAt.toISOString(),
  token: ticketSecret
});

export const generateQRCodeDataUrl = (payload) =>
  QRCode.toDataURL(JSON.stringify(payload), {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 320
  });
