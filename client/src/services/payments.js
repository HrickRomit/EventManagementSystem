import api from "./api";

export const createCheckoutSession = (items) =>
  api.post("/payments/checkout-session", {
    items,
    clientOrigin: window.location.origin
  });

export const fulfillCheckoutSession = (sessionId) =>
  api.post(`/payments/checkout-session/${sessionId}/fulfill`);
