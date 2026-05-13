import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CART_KEY = "eventsphere-cart";

const CartContext = createContext(null);

const readStoredCart = () => {
  const raw = window.localStorage.getItem(CART_KEY);

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw);
  } catch (_error) {
    window.localStorage.removeItem(CART_KEY);
    return [];
  }
};

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(readStoredCart);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [ticketSelection, setTicketSelection] = useState(null);
  const [message, setMessageState] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (!isCartOpen && !ticketSelection) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsCartOpen(false);
        setTicketSelection(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCartOpen, ticketSelection]);

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );

  const cartTotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity * item.price, 0),
    [cartItems]
  );

  const openTicketSelector = (event, categoryName = "") => {
    if (event.entryType !== "tickets" || !event.ticket?.categories?.length) {
      return;
    }

    const firstAvailable = event.ticket.categories.find((category) => Number(category.available) > 0);
    const selectedCategory = event.ticket.categories.find((category) => category.name === categoryName) || firstAvailable;

    if (!selectedCategory) {
      return;
    }

    setMessageState("");
    setMessageType("");
    setTicketSelection({ event, categoryName: selectedCategory.name });
  };

  const closeTicketSelector = () => {
    setTicketSelection(null);
  };

  const addTicketToCart = (event, category, quantity) => {
    const safeQuantity = Math.max(1, Math.min(Number(quantity), Number(category.available), 1));
    const cartKey = `${event._id}-${category.name}`;

    setCartItems((items) => {
      const existingItem = items.find((item) => item.cartKey === cartKey);

      if (existingItem) {
        return items.map((item) =>
          item.cartKey === cartKey
            ? { ...item, quantity: Math.min(item.quantity + safeQuantity, Number(category.available)) }
            : item
        );
      }

      return [
        ...items,
        {
          cartKey,
          eventId: event._id,
          eventName: event.name,
          eventDate: event.date,
          eventTime: event.time,
          ticketCategory: category.name,
          price: Number(category.price),
          quantity: safeQuantity
        }
      ];
    });

    setTicketSelection(null);
    setIsCartOpen(true);
    setMessageState("Ticket added to cart.");
    setMessageType("success");
  };

  const removeCartItem = (cartKey) => {
    setCartItems((items) => items.filter((item) => item.cartKey !== cartKey));
    setMessageState("");
    setMessageType("");
  };

  const clearCart = () => {
    setCartItems([]);
    setMessageState("");
    setMessageType("");
  };

  const setMessage = (payload) => {
    if (!payload) {
      setMessageState("");
      setMessageType("");
      return;
    }

    if (typeof payload === "string") {
      setMessageState(payload);
      setMessageType("success");
      return;
    }

    if (typeof payload === "object" && payload !== null) {
      setMessageState(payload.text || "");
      setMessageType(payload.type || "");
      return;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        isCartOpen,
        ticketSelection,
        message: message,
        messageType: messageType,
        setMessage,
        addTicketToCart,
        clearCart,
        closeCart: () => setIsCartOpen(false),
        closeTicketSelector,
        openCart: () => setIsCartOpen(true),
        openTicketSelector,
        removeCartItem
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider.");
  }

  return context;
};
