import { StyleSheet } from "react-native";
import { theme } from "./theme";

export const globalStyles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: theme.colors.bgPantry,
    paddingTop: 60,
    paddingHorizontal: 20,
  },

  listContainer: {
    paddingBottom: 40,
    gap: 16,
  },

  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.bgCardMain,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: theme.colors.borderMain,
    shadowColor: theme.colors.shadowMain,
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
    padding: 16,
    marginHorizontal: 4,
  },

  itemInfo: {
    flex: 1,
  },

  itemName: {
    fontFamily: theme.fonts.medium,
    fontSize: 18,
    color: theme.colors.textBrown,
  },

  itemStock: {
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: theme.colors.textMuted,
    marginTop: 4,
  },

  AccentButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 16,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    backgroundColor: theme.colors.mint,
    borderColor: theme.colors.mintDark,
    shadowColor: theme.colors.shadowMain,
  },

  buttonText: {
    fontSize: 18,
    fontFamily: theme.fonts.extraBold,
    color: theme.colors.textBrown,
  },

  accentButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textGreen,
  },

  emptyState: {
    flex: 1,
    alignItems: "center",
  },

  emptyText: {
    fontFamily: theme.fonts.medium,
    fontSize: 18,
    color: theme.colors.textMuted,
    textAlign: "center",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 40,
  },

  screenTitle: {
    fontFamily: theme.fonts.extraBold,
    fontSize: 32,
    flex: 1,
    color: theme.colors.textGreen,
  },

  backButton: {
    width: 44,
    height: 44,
    backgroundColor: theme.colors.bgCardMain,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: theme.colors.borderMain,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    shadowColor: theme.colors.shadowMain,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },

  itemCardLayout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    marginBottom: 16,
  },
});
