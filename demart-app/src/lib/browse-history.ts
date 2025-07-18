/**
 * 浏览历史记录服务
 * 使用localStorage存储用户浏览过的商品信息
 */

// 浏览记录项的类型定义
export interface BrowseHistoryItem {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
  timestamp: number; // 浏览时间戳
}

// 存储在localStorage中的键名
const BROWSE_HISTORY_KEY = 'demart_browse_history';

// 最大记录数量
const MAX_HISTORY_ITEMS = 50;

/**
 * 获取所有浏览记录
 * @returns 浏览记录数组，按时间倒序排列
 */
export function getBrowseHistory(): BrowseHistoryItem[] {
  if (typeof window === 'undefined') {
    return []; // 服务端渲染时返回空数组
  }
  
  try {
    const history = localStorage.getItem(BROWSE_HISTORY_KEY);
    if (!history) return [];
    
    const items = JSON.parse(history) as BrowseHistoryItem[];
    return items.sort((a, b) => b.timestamp - a.timestamp); // 按时间倒序排列
  } catch (error) {
    console.error('Failed to parse browse history:', error);
    return [];
  }
}

/**
 * 添加商品到浏览记录
 * @param item 商品信息
 */
export function addToBrowseHistory(item: Omit<BrowseHistoryItem, 'timestamp'>): void {
  if (typeof window === 'undefined') return;
  
  try {
    const history = getBrowseHistory();
    
    // 检查是否已存在相同商品
    const existingIndex = history.findIndex(i => i.id === item.id);
    
    if (existingIndex !== -1) {
      // 如果已存在，删除旧记录
      history.splice(existingIndex, 1);
    }
    
    // 添加新记录到开头
    const newItem: BrowseHistoryItem = {
      ...item,
      timestamp: Date.now()
    };
    
    history.unshift(newItem);
    
    // 如果超过最大数量，删除最旧的记录
    if (history.length > MAX_HISTORY_ITEMS) {
      history.splice(MAX_HISTORY_ITEMS);
    }
    
    localStorage.setItem(BROWSE_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to add item to browse history:', error);
  }
}

/**
 * 删除单个浏览记录
 * @param id 要删除的商品ID
 */
export function removeFromBrowseHistory(id: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const history = getBrowseHistory();
    const filteredHistory = history.filter(item => item.id !== id);
    localStorage.setItem(BROWSE_HISTORY_KEY, JSON.stringify(filteredHistory));
  } catch (error) {
    console.error('Failed to remove item from browse history:', error);
  }
}

/**
 * 清空所有浏览记录
 */
export function clearBrowseHistory(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(BROWSE_HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear browse history:', error);
  }
}

/**
 * 获取新增的浏览记录数量
 * @param lastViewedTimestamp 上次查看浏览记录的时间戳
 * @returns 新增的记录数量
 */
export function getNewBrowseHistoryCount(lastViewedTimestamp: number): number {
  const history = getBrowseHistory();
  return history.filter(item => item.timestamp > lastViewedTimestamp).length;
}

/**
 * 更新最后查看浏览记录的时间戳
 */
export function updateLastViewedTimestamp(): number {
  if (typeof window === 'undefined') return 0;
  
  const timestamp = Date.now();
  try {
    localStorage.setItem('demart_browse_history_last_viewed', timestamp.toString());
  } catch (error) {
    console.error('Failed to update last viewed timestamp:', error);
  }
  return timestamp;
}

/**
 * 获取最后查看浏览记录的时间戳
 */
export function getLastViewedTimestamp(): number {
  if (typeof window === 'undefined') return 0;
  
  try {
    const timestamp = localStorage.getItem('demart_browse_history_last_viewed');
    return timestamp ? parseInt(timestamp, 10) : 0;
  } catch (error) {
    console.error('Failed to get last viewed timestamp:', error);
    return 0;
  }
} 