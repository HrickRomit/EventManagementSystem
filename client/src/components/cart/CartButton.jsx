import { useCart } from "../../context/CartContext";

function CartButton({ className = "cart-nav-button" }) {
  const { cartCount, openCart } = useCart();

  return (
    <button type="button" className={className} onClick={openCart} aria-label="Open cart">
      Cart <span>{cartCount}</span>
    </button>
  );
}

export default CartButton;
