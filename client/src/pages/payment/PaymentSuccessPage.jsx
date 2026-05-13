import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { fulfillCheckoutSession } from "../../services/payments";

function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const hasFulfilled = useRef(false);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Confirming your payment...");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (hasFulfilled.current) {
      return;
    }

    if (!sessionId) {
      setStatus("error");
      setMessage("Stripe did not return a checkout session.");
      return;
    }

    hasFulfilled.current = true;
    fulfillCheckoutSession(sessionId)
      .then(({ data }) => {
        clearCart();
        setStatus("success");
        setMessage(data.message || "Payment confirmed and tickets generated.");
      })
      .catch((error) => {
        setStatus("error");
        setMessage(error.response?.data?.message || "Could not confirm your payment.");
      });
  }, [clearCart, searchParams]);

  return (
    <main className="home-page">
      <section className="payment-result-panel">
        <p className="hero-kicker">{status === "success" ? "Payment complete" : "Stripe checkout"}</p>
        <h1>{status === "success" ? "Your ticket is ready." : "Finalizing payment."}</h1>
        <p className={status === "error" ? "alert alert-error" : "hero-copy"}>{message}</p>
        <div className="event-modal-actions">
          <Link className="nav-button nav-button-primary" to="/participant/registrations">
            View My Registrations
          </Link>
          <Link className="nav-button nav-button-secondary" to="/events">
            Browse Events
          </Link>
        </div>
      </section>
    </main>
  );
}

export default PaymentSuccessPage;
