"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, getCart, saveCart, getCartTotal, getCartItemCount } from './cart';

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  // 初始化购物车
  useEffect(() => {
    const cartItems = getCart();
    setItems(cartItems);
    setTotal(getCartTotal());
    setItemCount(getCartItemCount());
  }, []);

  // 添加商品到购物车
  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    const updatedItems = [...items];
    const existingItemIndex = updatedItems.findIndex(cartItem => cartItem.id === item.id);

    if (existingItemIndex >= 0) {
      updatedItems[existingItemIndex].quantity += 1;
    } else {
      updatedItems.push({ ...item, quantity: 1 });
    }

    setItems(updatedItems);
    saveCart(updatedItems);
    setTotal(getCartTotal());
    setItemCount(getCartItemCount());
  };

  // 从购物车中移除商品
  const removeItem = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    saveCart(updatedItems);
    setTotal(getCartTotal());
    setItemCount(getCartItemCount());
  };

  // 更新购物车中商品数量
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;

    const updatedItems = [...items];
    const itemIndex = updatedItems.findIndex(item => item.id === id);

    if (itemIndex >= 0) {
      updatedItems[itemIndex].quantity = quantity;
      setItems(updatedItems);
      saveCart(updatedItems);
      setTotal(getCartTotal());
      setItemCount(getCartItemCount());
    }
  };

  // 清空购物车
  const clearCart = () => {
    setItems([]);
    saveCart([]);
    setTotal(0);
    setItemCount(0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 