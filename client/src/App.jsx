import { BrowserRouter } from "react-router-dom";
import CartButton from "./components/cart/CartButton";
import CartModal from "./components/cart/CartModal";
import TicketPurchaseModal from "./components/cart/TicketPurchaseModal";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import AppRouter from "./routes/AppRouter";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppRouter />
          <CartButton className="cart-floating-button" />
          <TicketPurchaseModal />
          <CartModal />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
