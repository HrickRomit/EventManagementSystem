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
  const selectedAvailable = Number(selectedCategory?.available || 0);
  const normalizeQuantity = (value, available = selectedAvailable) =>
    Math.max(1, Math.min(Number(value || 1), available || 1));

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

    addTicketToCart(ticketSelection.event, selectedCategory, normalizeQuantity(quantity));
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
          <select
            value={ticketType}
            onChange={(event) => {
              const nextCategory = categories.find((category) => category.name === event.target.value);
              setTicketType(event.target.value);
              setQuantity((currentQuantity) =>
                normalizeQuantity(currentQuantity, Number(nextCategory?.available || 1))
              );
            }}
            required
          >
            {categories.map((category) => (
              <option key={category.name} value={category.name} disabled={Number(category.available) <= 0}>
                {category.name} - BDT {category.price} - {category.available} left
              </option>
            ))}
          </select>
        </label>
        <label className="form-group">
          <span>Number of tickets</span>
          <div className="quantity-control">
            <button
              type="button"
              className="quantity-stepper"
              onClick={() => setQuantity((currentQuantity) => normalizeQuantity(Number(currentQuantity || 1) - 1))}
              disabled={Number(quantity || 1) <= 1}
              aria-label="Decrease ticket quantity"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              max={selectedAvailable || 1}
              value={quantity}
              onBlur={() => setQuantity((currentQuantity) => normalizeQuantity(currentQuantity))}
              onChange={(event) => setQuantity(event.target.value)}
              required
            />
            <button
              type="button"
              className="quantity-stepper"
              onClick={() => setQuantity((currentQuantity) => normalizeQuantity(Number(currentQuantity || 1) + 1))}
              disabled={Number(quantity || 1) >= selectedAvailable}
              aria-label="Increase ticket quantity"
            >
              +
            </button>
          </div>
        </label>
        <div className="cart-popup-total">
          Total: BDT {Number(quantity || 0) * Number(selectedCategory?.price || 0)}
        </div>
        <button type="submit" className="nav-button nav-button-primary" disabled={!selectedCategory || selectedAvailable <= 0}>
          Add to Cart
        </button>
      </form>
    </div>
  );
}

export default TicketPurchaseModal;
