import { useCart } from "../../context/CartContext";

function TicketActions({ event }) {
  const { openTicketSelector } = useCart();

  if (event.entryType !== "tickets" || !event.ticket?.categories?.length) {
    return null;
  }

  const hasAvailableTicket = event.ticket.categories.some((category) => Number(category.available) > 0);

  return (
    <button
      type="button"
      className="ticket-buy-button"
      onClick={() => openTicketSelector(event)}
      disabled={!hasAvailableTicket}
    >
      {hasAvailableTicket ? "Buy Ticket" : "Sold Out"}
    </button>
  );
}

export default TicketActions;
