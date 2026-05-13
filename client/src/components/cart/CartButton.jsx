import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

function CartButton({ className = "cart-nav-button" }) {
  const { cartCount, openCart } = useCart();
  const { user } = useAuth();

  if (user?.role === "organizer" || user?.role === "admin") {
    return null;
  }

  return (
    <button type="button" className={className} onClick={openCart} aria-label="Open cart">
      Cart <span>{cartCount}</span>
    </button>
  );
}

export default CartButton;
