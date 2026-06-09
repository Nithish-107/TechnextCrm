import { useState } from "react";

const STORAGE_KEY = "technext_favourites";

export default function useFavourites() {
  const [favourites, setFavourites] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved
        ? JSON.parse(saved)
        : [
            { page: "leads", label: "Leads", icon: "👤" },
            { page: "candidates", label: "Candidates", icon: "🪪" },
            { page: "placements", label: "Placements", icon: "🏆" },
          ];
    } catch {
      return [];
    }
  });

  const toggleFavourite = (page, label, icon) => {
    setFavourites((prev) => {
      const exists = prev.find((f) => f.page === page);
      const updated = exists
        ? prev.filter((f) => f.page !== page)
        : [...prev, { page, label, icon }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const isFavourite = (page) => favourites.some((f) => f.page === page);

  return { favourites, toggleFavourite, isFavourite };
}
