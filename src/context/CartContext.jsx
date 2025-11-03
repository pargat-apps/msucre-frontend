import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    setCart(prevCart => {
      // Check if item already exists
      // For products: check productId and selectedSize
      // For combos: check comboId
      const existingIndex = prevCart.findIndex(cartItem => {
        if (item.isCombo) {
          return cartItem.comboId === item.comboId;
        } else {
          return cartItem.productId === item.productId && cartItem.selectedSize === item.selectedSize;
        }
      });

      if (existingIndex > -1) {
        // Update quantity
        const newCart = [...prevCart];
        newCart[existingIndex].quantity += item.quantity || 1;
        return newCart;
      } else {
        // Add new item
        return [...prevCart, { ...item, quantity: item.quantity || 1 }];
      }
    });
  };

  const removeFromCart = (index) => {
    setCart(prevCart => prevCart.filter((_, i) => i !== index));
  };

  const updateQuantity = (index, quantity) => {
    if (quantity < 1) {
      removeFromCart(index);
      return;
    }
    
    setCart(prevCart => {
      const newCart = [...prevCart];
      newCart[index].quantity = quantity;
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      return total + (item.unitPrice * item.quantity);
    }, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

