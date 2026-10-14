import { create } from "zustand";
import {
  deleteShoppingListItem,
  fetchAllProducts,
  fetchShoppingList,
  insertShoppingListItem,
  insertProduct,
  updateDbProductAmounts,
  updateDbShelfAmount,
} from "../db/queries";

export interface Product {
  id: string;
  name: string;
  locationId: string; // Нове поле з бази
  isEssential: boolean;
  shelfAmount: number;
  unit: string;
  stride: number;
  minAmount: number;
  stockAmount?: number | null;
  packCapacity?: number | null;
  isUrgent?: boolean;
}

export interface AlertData {
  id: number;
  type: "low_stock" | "restocked" | "prompt-shopping";
  message: string;
  productId?: string;
}

const groupProducts = (products: Product[]) => {
  const grouped: Record<string, Product[]> = {};
  const seen = new Set<string>();

  for (const product of products) {
    if (seen.has(product.id)) continue;
    seen.add(product.id);

    if (product.locationId === "stocks") {
      if (product.isEssential && (product.stockAmount ?? 0) > 0) {
        (grouped.stocks ??= []).push(product);
      }
      continue;
    }

    (grouped[product.locationId] ??= []).push(product);
    if (product.isEssential && (product.stockAmount ?? 0) > 0) {
      (grouped.stocks ??= []).push(product);
    }
  }

  return grouped;
};

interface PantryState {
  pantry: Record<string, Product[]>;
  shoppingList: string[];
  lastAlert: AlertData | null;
  isLoaded: boolean; // Прапорець, що база успішно прочитана

  loadInventory: () => Promise<void>;
  addProduct: (product: Omit<Product, "id">) => Promise<void>;
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

  addToShoppingList: (productId: string) => Promise<void>;
  removeFromShoppingList: (productId: string) => Promise<void>;
  clearAlert: () => void;
}

export const usePantryStore = create<PantryState>((set, get) => ({
  pantry: {}, // 👈 Більше ніяких моків, починаємо з порожнього стану
  shoppingList: [],
  lastAlert: null,
  isLoaded: false,

  // Зчитуємо плоский список з SQLite і групуємо по шафах
  loadInventory: async () => {
    try {
      const [data, savedShoppingList] = await Promise.all([
        fetchAllProducts(),
        fetchShoppingList(),
      ]);

      const normalizedProducts = data.map(
        (item) =>
          ({
            ...item,
            isEssential: Boolean(item.isEssential),
            isUrgent: Boolean(item.isUrgent),
          }) as Product,
      );

      set({
        pantry: groupProducts(normalizedProducts),
        shoppingList: savedShoppingList,
        isLoaded: true,
      });
    } catch (error) {
      console.error("Помилка завантаження бази:", error);
    }
  },

  addProduct: async (product) => {
    const newProduct: Product = {
      ...product,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      stockAmount: product.isEssential ? (product.stockAmount ?? 0) : null,
    };

    await insertProduct(newProduct);
    set((state) => ({
      pantry: groupProducts(
        Object.values(state.pantry)
          .flat()
          .filter((existing) => existing.id !== newProduct.id)
          .concat(newProduct),
      ),
      isLoaded: true,
    }));
  },

  updateShelfAmount: async (locationId, productId, change) => {
    // 1. Оновлюємо UI миттєво (Optimistic UI)
    set((state) => {
      const locationProducts = state.pantry[locationId];
      if (!locationProducts) return state;

      let newAlert: AlertData | null = null;
      const newShoppingList = [...state.shoppingList];

      const currentProduct = locationProducts.find(
        (product) => product.id === productId,
      );
      if (!currentProduct) return state;
      const newAmount = Math.max(0, currentProduct.shelfAmount + change);

      if (
        change < 0 &&
        currentProduct.shelfAmount > 0 &&
        newAmount === 0 &&
        (currentProduct.stockAmount ?? 0) <= 0 &&
        !newShoppingList.includes(productId)
      ) {
        newAlert = {
          id: Date.now(),
          type: "prompt-shopping",
          message: `🛒 ${currentProduct.name} закінчився. Додати у список?`,
          productId,
        };
      }

      const updatedProducts = Object.values(state.pantry)
        .flat()
        .map((product) =>
          product.id === productId
            ? { ...product, shelfAmount: newAmount }
            : product,
        );

      return {
        pantry: groupProducts(updatedProducts),
        shoppingList: newShoppingList,
        ...(newAlert ? { lastAlert: newAlert } : {}),
      };
    });

    const updatedProduct = get().pantry[locationId]?.find(
      (p) => p.id === productId,
    );
    if (updatedProduct) {
      await updateDbShelfAmount(productId, updatedProduct.shelfAmount);
    }
  },

  updateStockAmount: async (locationId, productId, change) => {
    const previousShoppingList = get().shoppingList;
    let updatedProduct: Product | undefined;
    set((state) => {
      const locationProducts = state.pantry[locationId];
      if (!locationProducts) return state;

      const currentProduct = locationProducts.find(
        (product) => product.id === productId,
      );
      if (!currentProduct?.isEssential) return state;

      const currentStock = currentProduct.stockAmount ?? 0;
      const newStock = Math.max(0, currentStock + change);
      const opensPack = change === -1 && currentStock > 0;
      const newShelf =
        currentProduct.shelfAmount +
        (opensPack ? (currentProduct.packCapacity ?? 0) : 0);
      updatedProduct = {
        ...currentProduct,
        stockAmount: newStock,
        shelfAmount: newShelf,
      };

      let newShoppingList = [...state.shoppingList];
      let newAlert: AlertData | null = null;

      if (
        opensPack &&
        newStock < currentProduct.minAmount &&
        !newShoppingList.includes(productId)
      ) {
        newShoppingList.push(productId);
        newAlert = {
          id: Date.now(),
          type: "low_stock",
          message: `${currentProduct.name} додано до списку покупок.`,
        };
      } else if (change > 0) {
        newShoppingList = newShoppingList.filter((id) => id !== productId);
        newAlert = {
          id: Date.now(),
          type: "restocked",
          message: `Запаси ${currentProduct.name} поповнено!`,
        };
      }

      const updatedPantry = Object.fromEntries(
        Object.entries(state.pantry).map(([shelfId, products]) => [
          shelfId,
          products.map((product) =>
            product.id === productId ? updatedProduct! : product,
          ),
        ]),
      );
      const flattenedProducts = Object.values(updatedPantry)
        .flat()
        .filter(
          (product, index, all) =>
            all.findIndex((candidate) => candidate.id === product.id) === index,
        );

      return {
        pantry: groupProducts(flattenedProducts),
        shoppingList: newShoppingList,
        ...(newAlert ? { lastAlert: newAlert } : {}),
      };
    });

    if (updatedProduct) {
      await updateDbProductAmounts(productId, {
        shelfAmount: updatedProduct.shelfAmount,
        stockAmount: updatedProduct.stockAmount,
      });
    }

    const currentShoppingList = get().shoppingList;
    await Promise.all([
      ...currentShoppingList
        .filter((id) => !previousShoppingList.includes(id))
        .map(insertShoppingListItem),
      ...previousShoppingList
        .filter((id) => !currentShoppingList.includes(id))
        .map(deleteShoppingListItem),
    ]);
  },

  addToShoppingList: async (productId) => {
    if (get().shoppingList.includes(productId)) return;

    set((state) => ({
      shoppingList: [...state.shoppingList, productId],
      lastAlert: null,
    }));
    await insertShoppingListItem(productId);
  },

  removeFromShoppingList: async (productId) => {
    set((state) => ({
      shoppingList: state.shoppingList.filter((id) => id !== productId),
    }));
    await deleteShoppingListItem(productId);
  },

  clearAlert: () => set({ lastAlert: null }),
}));
