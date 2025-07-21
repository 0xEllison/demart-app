import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CartProvider, useCart } from '@/lib/cart-context';
import { CartItem } from '@/lib/cart';
import { act } from 'react-dom/test-utils';

// 模拟localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// 测试组件
function TestComponent() {
  const { items, addItem, removeItem, updateQuantity, clearCart, total, itemCount } = useCart();
  
  const addTestItem = () => {
    addItem({
      id: '1',
      title: '测试商品',
      price: 100,
      currency: 'USDC',
      imageUrl: '/test.jpg',
      sellerId: 'seller1',
      sellerName: '测试卖家',
    });
  };
  
  const addAnotherItem = () => {
    addItem({
      id: '2',
      title: '测试商品2',
      price: 200,
      currency: 'USDC',
      imageUrl: '/test2.jpg',
      sellerId: 'seller2',
      sellerName: '测试卖家2',
    });
  };
  
  return (
    <div>
      <div data-testid="item-count">{itemCount}</div>
      <div data-testid="total">{total}</div>
      <ul>
        {items.map((item) => (
          <li key={item.id} data-testid={`item-${item.id}`}>
            {item.title} - {item.price} x {item.quantity}
            <button 
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              data-testid={`increase-${item.id}`}
            >
              +
            </button>
            <button 
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              data-testid={`decrease-${item.id}`}
            >
              -
            </button>
            <button 
              onClick={() => removeItem(item.id)}
              data-testid={`remove-${item.id}`}
            >
              删除
            </button>
          </li>
        ))}
      </ul>
      <button onClick={addTestItem} data-testid="add-item">添加商品</button>
      <button onClick={addAnotherItem} data-testid="add-another-item">添加另一个商品</button>
      <button onClick={clearCart} data-testid="clear-cart">清空购物车</button>
    </div>
  );
}

describe('购物车功能测试', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });
  
  test('初始状态下购物车为空', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    
    expect(screen.getByTestId('item-count').textContent).toBe('0');
    expect(screen.getByTestId('total').textContent).toBe('0');
  });
  
  test('可以添加商品到购物车', async () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    
    fireEvent.click(screen.getByTestId('add-item'));
    
    await waitFor(() => {
      expect(screen.getByTestId('item-count').textContent).toBe('1');
      expect(screen.getByTestId('total').textContent).toBe('100');
      expect(screen.getByTestId('item-1')).toBeInTheDocument();
    });
  });
  
  test('可以增加商品数量', async () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    
    fireEvent.click(screen.getByTestId('add-item'));
    
    await waitFor(() => {
      expect(screen.getByTestId('item-1')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('increase-1'));
    
    await waitFor(() => {
      expect(screen.getByTestId('item-count').textContent).toBe('2');
      expect(screen.getByTestId('total').textContent).toBe('200');
    });
  });
  
  test('可以减少商品数量', async () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    
    fireEvent.click(screen.getByTestId('add-item'));
    
    await waitFor(() => {
      expect(screen.getByTestId('item-1')).toBeInTheDocument();
    });
    
    // 先增加到2
    fireEvent.click(screen.getByTestId('increase-1'));
    
    await waitFor(() => {
      expect(screen.getByTestId('item-count').textContent).toBe('2');
    });
    
    // 再减少到1
    fireEvent.click(screen.getByTestId('decrease-1'));
    
    await waitFor(() => {
      expect(screen.getByTestId('item-count').textContent).toBe('1');
      expect(screen.getByTestId('total').textContent).toBe('100');
    });
  });
  
  test('可以移除商品', async () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    
    fireEvent.click(screen.getByTestId('add-item'));
    
    await waitFor(() => {
      expect(screen.getByTestId('item-1')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('remove-1'));
    
    await waitFor(() => {
      expect(screen.getByTestId('item-count').textContent).toBe('0');
      expect(screen.getByTestId('total').textContent).toBe('0');
      expect(screen.queryByTestId('item-1')).not.toBeInTheDocument();
    });
  });
  
  test('可以清空购物车', async () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    
    fireEvent.click(screen.getByTestId('add-item'));
    fireEvent.click(screen.getByTestId('add-another-item'));
    
    await waitFor(() => {
      expect(screen.getByTestId('item-count').textContent).toBe('2');
      expect(screen.getByTestId('item-1')).toBeInTheDocument();
      expect(screen.getByTestId('item-2')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('clear-cart'));
    
    await waitFor(() => {
      expect(screen.getByTestId('item-count').textContent).toBe('0');
      expect(screen.getByTestId('total').textContent).toBe('0');
      expect(screen.queryByTestId('item-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('item-2')).not.toBeInTheDocument();
    });
  });
  
  test('添加相同商品时数量会增加', async () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    
    fireEvent.click(screen.getByTestId('add-item'));
    fireEvent.click(screen.getByTestId('add-item'));
    
    await waitFor(() => {
      expect(screen.getByTestId('item-count').textContent).toBe('2');
      expect(screen.getByTestId('total').textContent).toBe('200');
      // 确保只有一个商品项，但数量为2
      expect(screen.getAllByTestId(/item-\d+/).length).toBe(1);
    });
  });
}); 