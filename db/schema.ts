import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  locationId: text("location_id").notNull(),

  isEssential: integer("is_essential", { mode: "boolean" }).notNull(),
  isUrgent: integer("is_urgent", { mode: "boolean" }).default(false),

  shelfAmount: integer("shelf_amount").notNull(),
  minAmount: integer("min_amount").notNull(),
  unit: text("unit").notNull(),
  stride: integer("stride").notNull(),

  stockAmount: integer("stock_amount"),
  packCapacity: integer("pack_capacity"),
});

export const shoppingList = sqliteTable("shopping_list", {
  id: text("id").primaryKey(),

  // Якщо це товар з бази, записуємо його ID. Якщо кастомний — це поле буде null.
  productId: text("product_id"),

  // Назва для кастомного товару (наприклад, "Форма для випічки")
  customName: text("custom_name"),

  isBought: integer("is_bought", { mode: "boolean" }).notNull().default(false),
});
