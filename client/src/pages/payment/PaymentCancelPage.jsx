import { Link } from "react-router-dom";

function PaymentCancelPage() {
  return (
    <main className="home-page">
      <section className="payment-result-panel">
        <p className="hero-kicker">Payment canceled</p>
        <h1>Your cart is still waiting.</h1>
        <p className="hero-copy">
          Stripe checkout was canceled before payment. You can return to events and try again.
        </p>
        <div className="event-modal-actions">
          <Link className="nav-button nav-button-primary" to="/events">
            Back to Events
          </Link>
        </div>
      </section>
    </main>
  );
}

export default PaymentCancelPage;
