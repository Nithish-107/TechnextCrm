import { useState, useEffect } from "react";

const MAX_ITEMS = 10;
const STORAGE_KEY = "technext_recently_viewed";

export default function useRecentlyViewed() {
  const [recentItems, setRecentItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addRecentItem = (page, label, icon) => {
    setRecentItems((prev) => {
      const filtered = prev.filter((item) => item.page !== page);
      const updated = [
        { page, label, icon, time: new Date().toISOString() },
        ...filtered,
      ].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecent = () => {
    setRecentItems([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { recentItems, addRecentItem, clearRecent };
}
