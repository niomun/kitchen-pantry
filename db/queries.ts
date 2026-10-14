import { db } from "./db";
import { products, shoppingList as shoppingListTable } from "./schema";
import { and, eq, isNotNull } from "drizzle-orm";

export const fetchAllProducts = async () => {
  return await db.select().from(products);
};

export const insertProduct = async (product: typeof products.$inferInsert) => {
  await db.insert(products).values(product);
};

export const fetchShoppingList = async () => {
  const rows = await db
    .select({ productId: shoppingListTable.productId })
    .from(shoppingListTable)
    .where(
      and(
        eq(shoppingListTable.isBought, false),
        isNotNull(shoppingListTable.productId),
      ),
    );

  return rows.flatMap(({ productId }) => (productId ? [productId] : []));
};

export const insertShoppingListItem = async (productId: string) => {
  await db
    .insert(shoppingListTable)
    .values({ id: productId, productId, isBought: false })
    .onConflictDoNothing();
};

export const deleteShoppingListItem = async (productId: string) => {
  await db
    .delete(shoppingListTable)
    .where(eq(shoppingListTable.productId, productId));
};

export const updateDbShelfAmount = async (id: string, newAmount: number) => {
  await db
    .update(products)
    .set({ shelfAmount: newAmount })
    .where(eq(products.id, id));
};

export const updateDbProductAmounts = async (
  id: string,
  amounts: Pick<typeof products.$inferInsert, "shelfAmount" | "stockAmount">,
) => {
  await db.update(products).set(amounts).where(eq(products.id, id));
};
