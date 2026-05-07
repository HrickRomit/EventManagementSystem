import { useEffect, useMemo, useState } from "react";
import { useCart } from "../../context/CartContext";

function TicketPurchaseModal() {
  const { addTicketToCart, closeTicketSelector, ticketSelection } = useCart();
  const [ticketType, setTicketType] = useState("");
  const [quantity, setQuantity] = useState(1);

  const categories = useMemo(
    () => ticketSelection?.event.ticket?.categories || [],
    [ticketSelection]
  );

  const selectedCategory = categories.find((category) => category.name === ticketType);

  useEffect(() => {
    if (!ticketSelection) {
      return;
    }

    setTicketType(ticketSelection.categoryName);
    setQuantity(1);
  }, [ticketSelection]);

  if (!ticketSelection) {
    return null;
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!selectedCategory) {
      return;
    }

    addTicketToCart(ticketSelection.event, selectedCategory, quantity);
  };

  return (
    <div className="event-modal-backdrop cart-layer" onClick={closeTicketSelector} role="presentation">
      <form className="cart-popup" onSubmit={handleSubmit} onClick={(event) => event.stopPropagation()}>
        <button type="button" className="cart-popup-close" onClick={closeTicketSelector} aria-label="Cancel ticket selection">
          x
        </button>
        <p className="dashboard-card-kicker">Buy ticket</p>
        <h2>{ticketSelection.event.name}</h2>
        <label className="form-group">
          <span>Ticket type</span>
          <select value={ticketType} onChange={(event) => setTicketType(event.target.value)} required>
            {categories.map((category) => (
              <option key={category.name} value={category.name} disabled={Number(category.available) <= 0}>
                {category.name} - BDT {category.price} - {category.available} left
              </option>
            ))}
          </select>
        </label>
        <label className="form-group">
          <span>Number of tickets</span>
          <input
            type="number"
            min="1"
            max={selectedCategory?.available || 1}
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            required
          />
        </label>
        <div className="cart-popup-total">
          Total: BDT {Number(quantity || 0) * Number(selectedCategory?.price || 0)}
        </div>
        <button type="submit" className="nav-button nav-button-primary" disabled={!selectedCategory || Number(selectedCategory.available) <= 0}>
          Add to Cart
        </button>
      </form>
    </div>
  );
}

export default TicketPurchaseModal;
