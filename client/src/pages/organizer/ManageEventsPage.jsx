import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { bangladeshVenues, eventTypes } from "../../data/bangladeshVenues";
import { deleteEvent, getOrganizerEvents, updateEvent } from "../../services/events";

const ticketCategories = ["premium", "regular", "economy"];

const getSelectedTicketCategories = (ticketTypeCount) => {
  if (Number(ticketTypeCount) === 1) {
    return ["regular"];
  }

  return ticketCategories.slice(0, Number(ticketTypeCount));
};

const toInputDate = (dateValue) => new Date(dateValue).toISOString().slice(0, 10);

const getTicketAvailability = (form) =>
  getSelectedTicketCategories(form.ticketTypeCount)
    .reduce((total, category) => total + Number(form.ticketCategories[category].available || 0), 0);

const toTicketCategoryState = (ticket) =>
  ticketCategories.reduce((categories, category) => {
    const savedCategory = ticket?.categories?.find((item) => item.name === category);
    const singleSavedCategory = Number(ticket?.typeCount) === 1 ? ticket?.categories?.[0] : null;

    return {
      ...categories,
      [category]: {
        price:
          savedCategory?.price ??
          (category === "regular" ? singleSavedCategory?.price ?? ticket?.price ?? "" : ""),
        available:
          savedCategory?.available ??
          (category === "regular" ? singleSavedCategory?.available ?? ticket?.available ?? "" : "")
      }
    };
  }, {});

const toFormState = (event) => ({
  name: event.name,
  eventType: event.eventType || "",
  eventImage: event.eventImage || "",
  date: toInputDate(event.date),
  time: event.time,
  duration: event.duration,
  venue: event.venue,
  venueEstimate: event.venueEstimate,
  capacity: event.capacity,
  entryType: event.entryType,
  ticketTypeCount: String(event.ticket?.typeCount || event.ticket?.categories?.length || 1),
  ticketCategories: toTicketCategoryState(event.ticket),
  contactNumber: event.contactNumber,
  contactEmail: event.contactEmail
});

function ManageEventsPage() {
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(location.state?.message || "");
  const [ticketCapacityError, setTicketCapacityError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!success) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setSuccess(""), 3000);
    return () => window.clearTimeout(timeout);
  }, [success]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await getOrganizerEvents();
      setEvents(data.events);
    } catch (_requestError) {
      setError("Could not load your events.");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (event) => {
    setEditingEvent(event);
    setEditForm(toFormState(event));
    setTicketCapacityError("");
  };

  const updateField = (field, value) => {
    setEditForm((current) => ({ ...current, [field]: value }));
  };

  const updateTicketCategory = (category, field, value) => {
    setEditForm((current) => ({
      ...current,
      ticketCategories: {
        ...current.ticketCategories,
        [category]: {
          ...current.ticketCategories[category],
          [field]: value
        }
      }
    }));
  };

  const handleVenueChange = (value) => {
    const venue = bangladeshVenues.find((item) => item.location === value);
    setEditForm((current) => ({
      ...current,
      venue: value,
      venueEstimate: venue?.estimate || ""
    }));
  };

  const handleImageChange = (file) => {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => updateField("eventImage", reader.result);
    reader.readAsDataURL(file);
  };

  const handleUpdate = async (submitEvent) => {
    submitEvent.preventDefault();
    setTicketCapacityError("");

    const hasTicketCapacityError =
      editForm.entryType === "tickets" &&
      Number(editForm.capacity || 0) > 0 &&
      getTicketAvailability(editForm) > Number(editForm.capacity);

    if (hasTicketCapacityError) {
      setTicketCapacityError("Total ticket availability cannot exceed event capacity.");
      return;
    }

    try {
      setError("");
      await updateEvent(editingEvent._id, editForm);
      setSuccess("Event updated successfully.");
      setEditingEvent(null);
      setEditForm(null);
      fetchEvents();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not update the event.");
    }
  };

  const closeDeleteFlow = () => {
    setDeleteTarget(null);
    setShowPasswordPrompt(false);
    setDeletePassword("");
    setIsDeleting(false);
  };

  const handleDelete = async (submitEvent) => {
    submitEvent.preventDefault();
    setIsDeleting(true);

    try {
      setError("");
      await deleteEvent(deleteTarget._id, deletePassword);
      setSuccess("Event deleted successfully.");
      closeDeleteFlow();
      fetchEvents();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not delete the event.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="event-workspace">
      <div className="event-workspace-header">
        <div>
          <p className="dashboard-card-kicker">Organizer Studio</p>
          <h2>Manage Events</h2>
          <p className="manage-users-copy">
            Created events are published publicly and remain editable here.
          </p>
        </div>
        <Link className="nav-button nav-button-primary" to="/organizer/events/new">
          Create Event
        </Link>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      {loading ? (
        <p className="loading-message">Loading events...</p>
      ) : events.length === 0 ? (
        <p className="no-users-message">No events created yet.</p>
      ) : (
        <div className="table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Type</th>
                <th>Date</th>
                <th>Venue</th>
                <th>Access</th>
                <th>Capacity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event._id}>
                  <td>{event.name}</td>
                  <td>{event.eventType || "-"}</td>
                  <td>{new Date(event.date).toLocaleDateString()} at {event.time}</td>
                  <td>{event.venue}</td>
                  <td>
                    {event.entryType === "tickets"
                      ? `${event.ticket?.typeCount || event.ticket?.categories?.length || 1} ticket type(s)`
                      : event.entryType}
                  </td>
                  <td>{event.capacity}</td>
                  <td className="action-buttons">
                    <button className="btn-edit" type="button" onClick={() => startEdit(event)}>
                      Edit
                    </button>
                    <button className="btn-delete" type="button" onClick={() => setDeleteTarget(event)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingEvent && editForm ? (
        <div className="modal-overlay">
          <form className="modal-content event-edit-modal" onSubmit={handleUpdate}>
            <h3>Edit Event</h3>

            <div className="form-grid">
              <label className="form-group">
                <span>Event name</span>
                <input value={editForm.name} onChange={(event) => updateField("name", event.target.value)} required />
              </label>
              <label className="form-group">
                <span>Event type</span>
                <select value={editForm.eventType} onChange={(event) => updateField("eventType", event.target.value)} required>
                  <option value="">Select event type</option>
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-group form-group-wide">
                <span>Event picture</span>
                <input type="file" accept="image/*" onChange={(event) => handleImageChange(event.target.files?.[0])} />
              </label>
              {editForm.eventImage ? (
                <div className="event-image-preview form-group-wide">
                  <img src={editForm.eventImage} alt="Event preview" />
                </div>
              ) : null}
              <label className="form-group">
                <span>Event date</span>
                <input type="date" value={editForm.date} onChange={(event) => updateField("date", event.target.value)} required />
              </label>
              <label className="form-group">
                <span>Time</span>
                <input type="time" value={editForm.time} onChange={(event) => updateField("time", event.target.value)} required />
              </label>
              <label className="form-group">
                <span>Duration</span>
                <input value={editForm.duration} onChange={(event) => updateField("duration", event.target.value)} required />
              </label>
              <label className="form-group">
                <span>Venue location</span>
                <select value={editForm.venue} onChange={(event) => handleVenueChange(event.target.value)} required>
                  {bangladeshVenues.map((venue) => (
                    <option key={venue.location} value={venue.location}>
                      {venue.location} - {venue.estimate}
                    </option>
                  ))}
                </select>
              </label>
              <label
                className={
                  editForm.entryType === "tickets" &&
                  Number(editForm.capacity || 0) > 0 &&
                  getTicketAvailability(editForm) > Number(editForm.capacity)
                    ? "form-group form-group-error"
                    : "form-group"
                }
              >
                <span>Capacity</span>
                <input type="number" min="1" value={editForm.capacity} onChange={(event) => updateField("capacity", event.target.value)} required />
              </label>
              <div className="form-group form-group-wide">
                <span>Event access</span>
                <div className="choice-row">
                  {[
                    ["tickets", "Tickets"],
                    ["registration", "Registration"],
                    ["none", "None"]
                  ].map(([value, label]) => (
                    <label key={value} className={editForm.entryType === value ? "choice-pill choice-pill-active" : "choice-pill"}>
                      <input type="radio" name="editEntryType" value={value} checked={editForm.entryType === value} onChange={(event) => updateField("entryType", event.target.value)} />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
                {editForm.entryType === "tickets" ? (
                  <div
                    className={
                      Number(editForm.capacity || 0) > 0 &&
                      getTicketAvailability(editForm) > Number(editForm.capacity)
                        ? "ticket-panel ticket-panel-error"
                        : "ticket-panel"
                    }
                  >
                    {Number(editForm.capacity || 0) > 0 &&
                    getTicketAvailability(editForm) > Number(editForm.capacity) ? (
                      <p className="ticket-error-message">
                        {ticketCapacityError || "Total ticket availability cannot exceed event capacity."}
                      </p>
                    ) : null}
                    <label className="form-group">
                      <span>Number of ticket types</span>
                      <select value={editForm.ticketTypeCount} onChange={(event) => updateField("ticketTypeCount", event.target.value)} required>
                        <option value="1">1 type</option>
                        <option value="2">2 types</option>
                        <option value="3">3 types</option>
                      </select>
                    </label>

                    <div className="ticket-category-grid">
                      {getSelectedTicketCategories(editForm.ticketTypeCount).map((category) => (
                        <div
                          className={
                            Number(editForm.capacity || 0) > 0 &&
                            getTicketAvailability(editForm) > Number(editForm.capacity)
                              ? "ticket-category-card ticket-category-card-error"
                              : "ticket-category-card"
                          }
                          key={category}
                        >
                          <h3>{category}</h3>
                          <label className="form-group">
                            <span>Price</span>
                            <input type="number" min="0" value={editForm.ticketCategories[category].price} onChange={(event) => updateTicketCategory(category, "price", event.target.value)} required />
                          </label>
                          <label className="form-group">
                            <span>Available tickets</span>
                            <input type="number" min="1" value={editForm.ticketCategories[category].available} onChange={(event) => updateTicketCategory(category, "available", event.target.value)} required />
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
              <label className="form-group">
                <span>Contact number</span>
                <input value={editForm.contactNumber} onChange={(event) => updateField("contactNumber", event.target.value)} required />
              </label>
              <label className="form-group">
                <span>Contact email</span>
                <input type="email" value={editForm.contactEmail} onChange={(event) => updateField("contactEmail", event.target.value)} required />
              </label>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => setEditingEvent(null)}>
                Back
              </button>
              <button type="submit" className="btn-submit">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="modal-overlay">
          {!showPasswordPrompt ? (
            <div className="modal-content delete-confirm-modal">
              <h3>Delete Event?</h3>
              <p>
                Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
              </p>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={closeDeleteFlow}>
                  No
                </button>
                <button type="button" className="btn-delete" onClick={() => setShowPasswordPrompt(true)}>
                  Yes
                </button>
              </div>
            </div>
          ) : (
            <form className="modal-content delete-confirm-modal" onSubmit={handleDelete}>
              <h3>Confirm Password</h3>
              <p>Enter your account password to permanently delete this event.</p>
              <label className="form-group">
                <span>Account password</span>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(event) => setDeletePassword(event.target.value)}
                  required
                  autoFocus
                />
              </label>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={closeDeleteFlow}>
                  Back
                </button>
                <button type="submit" className="btn-delete" disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete Event"}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default ManageEventsPage;
