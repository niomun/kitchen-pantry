import { create } from "zustand";
import { pantryMock } from "../mockData";

export interface Product {
  id: string;
  name: string;
  isEssential: boolean;

  shelfAmount: number;
  unit: string;
  stride: number;
  minAmount: number;

  stockAmount?: number;
  packCapacity?: number;

  isUrgent?: boolean;
}

export interface AlertData {
  id: number;
  type: "low_stock" | "restocked" | "prompt-shopping";
  message: string;
  productId?: string;
}

interface PantryState {
  pantry: Record<string, Product[]>;
  shoppingList: string[];
  lastAlert: AlertData | null;

  updateShelfAmount: (
    locationId: string,
    productId: string,
    change: number,
  ) => void;

  updateStockAmount: (
    locationId: string,
    productId: string,
    change: number,
  ) => void;

  addToShoppingList: (productId: string) => void;
  removeFromShoppingList: (productId: string) => void;
  clearAlert: () => void;
}

export const usePantryStore = create<PantryState>((set) => ({
  pantry: {},
  shoppingList: [],
  lastAlert: null,

  updateShelfAmount: (locationId, productId, change) =>
    set((state) => {
      const locationProducts = state.pantry[locationId];
      if (!locationProducts) return state;

      let newAlert = null;
      const newShoppingList = [...state.shoppingList];

      const updatedProducts = locationProducts.map((product) => {
        if (product.id === productId) {
          const newAmount = Math.max(0, product.shelfAmount + change);

          if (
            change < 0 &&
            newAmount === 0 &&
            !product.isEssential &&
            !newShoppingList.includes(product.id)
          ) {
            newAlert = {
              id: Date.now(),
              type: "prompt_shopping",
              message: `🛒 ${product.name} закінчився. Додати у список?`,
              productId: product.id,
            };
          }

          return { ...product, shelfAmount: newAmount };
        }
        return product;
      });

      return {
        pantry: { ...state.pantry, [locationId]: updatedProducts },
        shoppingList: newShoppingList,
        ...(newAlert ? { lastAlert: newAlert } : {}),
      };
    }),

  updateStockAmount: (locationId, productId, change) =>
    set((state) => {
      const locationProducts = state.pantry[locationId];
      if (!locationProducts) return state;

      let newAlert = null;
      let newShoppingList = [...state.shoppingList];

      const updatedProducts = locationProducts.map((product) => {
        if (product.id === productId && product.isEssential) {
          const currentStock = product.stockAmount || 0;
          const newStock = Math.max(0, currentStock + change);
          let newShelf = product.shelfAmount;

          // ЛОГІКА МІНУСА (Відкриваємо пачку: пересипаємо в шафу)
          if (change < 0 && currentStock > 0) {
            const packSize = product.packCapacity || 0;
            newShelf += packSize;

            // Якщо відкрили останню пачку -> у список покупок
            if (newStock === 0 && !newShoppingList.includes(product.id)) {
              newShoppingList.push(product.id);
              newAlert = {
                id: Date.now(),
                type: "low_stock",
                message: `⚠️ Останню пачку ${product.name} відкрито! Додано до списку.`,
              };
            } else {
              newAlert = {
                id: Date.now(),
                type: "restocked",
                message: `📦 Відкрито пачку ${product.name}: +${packSize}${product.unit} на полицю`,
              };
            }
          }

          // ЛОГІКА ПЛЮСА (Купили нові пачки)
          else if (change > 0) {
            // Якщо ми поповнили запаси, логічно прибрати товар зі списку покупок
            newShoppingList = newShoppingList.filter((id) => id !== product.id);
            newAlert = {
              id: Date.now(),
              type: "restocked",
              message: `🛒 Запаси ${product.name} поповнено!`,
            };
          }

          return {
            ...product,
            stockAmount: newStock,
            shelfAmount: newShelf,
          };
        }
        return product;
      });

      return {
        pantry: { ...state.pantry, [locationId]: updatedProducts },
        shoppingList: newShoppingList,
        ...(newAlert ? { lastAlert: newAlert } : {}),
      };
    }),

  addToShoppingList: (productId) =>
    set((state) => ({
      shoppingList: state.shoppingList.includes(productId)
        ? state.shoppingList
        : [...state.shoppingList, productId],
      lastAlert: null,
    })),

  removeFromShoppingList: (productId) =>
    set((state) => ({
      shoppingList: state.shoppingList.filter((id) => id !== productId),
    })),

  clearAlert: () => set({ lastAlert: null }),
}));