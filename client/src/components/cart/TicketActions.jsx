import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { bookEvent } from "../../services/events";

function TicketActions({ event }) {
  const { openTicketSelector } = useCart();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  if (event.entryType === "registration") {
    const canRegister = Number(event.capacity) > 0;

    const handleRegister = async () => {
      if (!user || user.role !== "participant") {
        setMessage("Log in as a participant to register.");
        return;
      }

      try {
        setIsRegistering(true);
        setMessage("");
        await bookEvent(event._id);
        setMessage("Registered.");
      } catch (requestError) {
        setMessage(requestError.response?.data?.message || "Could not register for this event.");
      } finally {
        setIsRegistering(false);
      }
    };

    return (
      <div className="ticket-action-stack">
        <button
          type="button"
          className="ticket-buy-button"
          onClick={handleRegister}
          disabled={!canRegister || isRegistering}
        >
          {isRegistering ? "Registering..." : canRegister ? "Register" : "Full"}
        </button>
        {message ? <span className="ticket-action-message">{message}</span> : null}
      </div>
    );
  }

  if (event.entryType !== "tickets" || !event.ticket?.categories?.length) {
    return null;
  }

  const hasAvailableTicket = event.ticket.categories.some((category) => Number(category.available) > 0);
  const isOrganizer = user?.role === "organizer";

  return (
    <button
      type="button"
      className="ticket-buy-button"
      onClick={() => openTicketSelector(event)}
      disabled={!hasAvailableTicket || isOrganizer}
    >
      {isOrganizer ? "Participants Only" : hasAvailableTicket ? "Buy Ticket" : "Sold Out"}
    </button>
  );
}

export default TicketActions;
