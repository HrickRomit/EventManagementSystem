import { useCart } from "../../context/CartContext";

function CartModal() {
  const { cartItems, cartTotal, clearCart, closeCart, isCartOpen, message, removeCartItem, setMessage } = useCart();

  if (!isCartOpen) {
    return null;
  }

  return (
    <div className="event-modal-backdrop cart-layer" onClick={closeCart} role="presentation">
      <section className="cart-popup cart-view" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="cart-popup-close" onClick={closeCart} aria-label="Close cart">
          x
        </button>
        <p className="dashboard-card-kicker">Cart</p>
        <h2>Your Tickets</h2>
        {message ? <p className="booking-message booking-message-success">{message}</p> : null}
        {cartItems.length === 0 ? (
          <p className="overview-empty">Your cart is empty.</p>
        ) : (
          <>
            <div className="cart-item-list">
              {cartItems.map((item) => (
                <article key={item.cartKey} className="cart-item">
                  <div>
                    <h3>{item.eventName}</h3>
                    <p>{new Date(item.eventDate).toLocaleDateString()} at {item.eventTime}</p>
                    <p>{item.ticketCategory} x {item.quantity}</p>
                  </div>
                  <div className="cart-item-actions">
                    <strong>BDT {item.price * item.quantity}</strong>
                    <button type="button" onClick={() => removeCartItem(item.cartKey)}>
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <div className="cart-popup-total">Cart total: BDT {cartTotal}</div>
            <div className="event-modal-actions">
              <button type="button" className="nav-button nav-button-primary" onClick={() => setMessage("Checkout flow is ready to connect to payment.")}>
                Proceed to Checkout
              </button>
              <button type="button" className="nav-button nav-button-secondary" onClick={clearCart}>
                Clear Cart
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default CartModal;
