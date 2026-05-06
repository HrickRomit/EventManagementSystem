import api from "./api";

export const getPublicEvents = () => api.get("/events");

export const getOrganizerEvents = () => api.get("/events/mine");

export const createEvent = (eventData) => api.post("/events", eventData);

export const updateEvent = (eventId, eventData) => api.put(`/events/${eventId}`, eventData);

export const deleteEvent = (eventId, password) => api.delete(`/events/${eventId}`, { data: { password } });
