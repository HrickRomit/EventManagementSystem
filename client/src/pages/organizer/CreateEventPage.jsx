import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createEvent } from "../../services/events";
import { bangladeshVenues, eventTypes } from "../../data/bangladeshVenues";

const ticketCategories = ["premium", "regular", "economy"];

const getSelectedTicketCategories = (ticketTypeCount) => {
  if (Number(ticketTypeCount) === 1) {
    return ["regular"];
  }

  return ticketCategories.slice(0, Number(ticketTypeCount));
};

const getTicketAvailability = (form) =>
  getSelectedTicketCategories(form.ticketTypeCount)
    .reduce((total, category) => total + Number(form.ticketCategories[category].available || 0), 0);

const initialForm = {
  name: "",
  eventType: "",
  eventImage: "",
  date: "",
  time: "",
  duration: "",
  venue: "",
  venueEstimate: "",
  capacity: "",
  entryType: "registration",
  ticketTypeCount: "1",
  ticketCategories: {
    premium: { price: "", available: "" },
    regular: { price: "", available: "" },
    economy: { price: "", available: "" }
  },
  contactNumber: "",
  contactEmail: ""
};

function CreateEventPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [ticketCapacityError, setTicketCapacityError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ticketAvailability = getTicketAvailability(form);
  const hasTicketCapacityError =
    form.entryType === "tickets" && Number(form.capacity || 0) > 0 && ticketAvailability > Number(form.capacity);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateTicketCategory = (category, field, value) => {
    setForm((current) => ({
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
    setForm((current) => ({
      ...current,
      venue: value,
      venueEstimate: venue?.estimate || ""
    }));
  };

  const handleImageChange = (file) => {
    if (!file) {
      updateField("eventImage", "");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => updateField("eventImage", reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setTicketCapacityError("");

    if (hasTicketCapacityError) {
      setTicketCapacityError("Total ticket availability cannot exceed event capacity.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createEvent(form);
      navigate("/organizer/events", {
        state: { message: "Event created and published successfully." }
      });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not create the event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="event-workspace">
      <div className="event-workspace-header">
        <div>
          <p className="dashboard-card-kicker">Organizer Studio</p>
          <h2>Create Event</h2>
          <p className="manage-users-copy">
            Publish a new event for participants and keep it editable from Manage Events.
          </p>
        </div>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <form className="event-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="form-group">
            <span>Event name</span>
            <input value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
          </label>

          <label className="form-group">
            <span>Event type</span>
            <select value={form.eventType} onChange={(event) => updateField("eventType", event.target.value)} required>
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
            <input type="file" accept="image/*" onChange={(event) => handleImageChange(event.target.files?.[0])} required />
          </label>

          {form.eventImage ? (
            <div className="event-image-preview form-group-wide">
              <img src={form.eventImage} alt="Event preview" />
            </div>
          ) : null}

          <label className="form-group">
            <span>Event date</span>
            <input type="date" value={form.date} onChange={(event) => updateField("date", event.target.value)} required />
          </label>

          <label className="form-group">
            <span>Time</span>
            <input type="time" value={form.time} onChange={(event) => updateField("time", event.target.value)} required />
          </label>

          <label className="form-group">
            <span>Duration</span>
            <input placeholder="Example: 3 hours" value={form.duration} onChange={(event) => updateField("duration", event.target.value)} required />
          </label>

          <label className="form-group">
            <span>Venue location</span>
            <select value={form.venue} onChange={(event) => handleVenueChange(event.target.value)} required>
              <option value="">Select a Bangladesh location</option>
              {bangladeshVenues.map((venue) => (
                <option key={venue.location} value={venue.location}>
                  {venue.location} - {venue.estimate}
                </option>
              ))}
            </select>
          </label>

          <label className="form-group">
            <span>Rough venue price</span>
            <input value={form.venueEstimate} readOnly />
          </label>

          <label className={hasTicketCapacityError ? "form-group form-group-error" : "form-group"}>
            <span>Participants / capacity</span>
            <input type="number" min="1" value={form.capacity} onChange={(event) => updateField("capacity", event.target.value)} required />
          </label>

          <div className="form-group form-group-wide">
            <span>Event access</span>
            <div className="choice-row">
              {[
                ["tickets", "Tickets"],
                ["registration", "Registration"],
                ["none", "None"]
              ].map(([value, label]) => (
                <label key={value} className={form.entryType === value ? "choice-pill choice-pill-active" : "choice-pill"}>
                  <input type="radio" name="entryType" value={value} checked={form.entryType === value} onChange={(event) => updateField("entryType", event.target.value)} />
                  <span>{label}</span>
                </label>
              ))}
            </div>

            {form.entryType === "tickets" ? (
              <div className={hasTicketCapacityError ? "ticket-panel ticket-panel-error" : "ticket-panel"}>
              {hasTicketCapacityError ? (
                <p className="ticket-error-message">
                  {ticketCapacityError || "Total ticket availability cannot exceed event capacity."}
                </p>
              ) : null}
              <label className="form-group">
                <span>Number of ticket types</span>
                <select value={form.ticketTypeCount} onChange={(event) => updateField("ticketTypeCount", event.target.value)} required>
                  <option value="1">1 type</option>
                  <option value="2">2 types</option>
                  <option value="3">3 types</option>
                </select>
              </label>

              <div className="ticket-category-grid">
                {getSelectedTicketCategories(form.ticketTypeCount).map((category) => (
                  <div className={hasTicketCapacityError ? "ticket-category-card ticket-category-card-error" : "ticket-category-card"} key={category}>
                    <h3>{category}</h3>
                    <label className="form-group">
                      <span>Price</span>
                      <input type="number" min="0" value={form.ticketCategories[category].price} onChange={(event) => updateTicketCategory(category, "price", event.target.value)} required />
                    </label>
                    <label className="form-group">
                      <span>Available tickets</span>
                      <input type="number" min="1" value={form.ticketCategories[category].available} onChange={(event) => updateTicketCategory(category, "available", event.target.value)} required />
                    </label>
                  </div>
                ))}
              </div>
              </div>
            ) : null}
          </div>

          <label className="form-group">
            <span>Contact number</span>
            <input value={form.contactNumber} onChange={(event) => updateField("contactNumber", event.target.value)} required />
          </label>

          <label className="form-group">
            <span>Contact email</span>
            <input type="email" value={form.contactEmail} onChange={(event) => updateField("contactEmail", event.target.value)} required />
          </label>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate("/organizer")}>
            Back
          </button>
          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Event"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateEventPage;
