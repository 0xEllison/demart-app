// 购物车商品类型
export interface CartItem {
  id: string;
  title: string;
  price: number;
  currency: string;
  imageUrl: string;
  sellerId: string;
  sellerName: string | null;
  quantity: number;
}

// 本地存储键
const CART_STORAGE_KEY = 'demart_cart';

// 获取购物车
export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    return cartData ? JSON.parse(cartData) : [];
  } catch (error) {
    console.error('Failed to parse cart data:', error);
    return [];
  }
}

// 保存购物车
export function saveCart(cart: CartItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

// 添加商品到购物车
export function addToCart(item: Omit<CartItem, 'quantity'>): void {
  const cart = getCart();
  
  // 检查商品是否已在购物车中
  const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
  
  if (existingItemIndex >= 0) {
    // 如果商品已存在，增加数量
    cart[existingItemIndex].quantity += 1;
  } else {
    // 如果商品不存在，添加新商品
    cart.push({ ...item, quantity: 1 });
  }
  
  saveCart(cart);
}

// 从购物车中移除商品
export function removeFromCart(id: string): void {
  const cart = getCart();
  const updatedCart = cart.filter(item => item.id !== id);
  saveCart(updatedCart);
}

// 更新购物车中商品数量
export function updateCartItemQuantity(id: string, quantity: number): void {
  if (quantity < 1) return;
  
  const cart = getCart();
  const itemIndex = cart.findIndex(item => item.id === id);
  
  if (itemIndex >= 0) {
    cart[itemIndex].quantity = quantity;
    saveCart(cart);
  }
}

// 清空购物车
export function clearCart(): void {
  saveCart([]);
}

// 计算购物车总价
export function getCartTotal(): number {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// 获取购物车商品总数
export function getCartItemCount(): number {
  const cart = getCart();
  return cart.reduce((count, item) => count + item.quantity, 0);
} 