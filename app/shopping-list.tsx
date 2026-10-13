import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { usePantryStore, Product } from '../store/usePantryStore';
import { globalStyles } from '../styles/globalStyles';
import { theme } from '../styles/theme';


export default function ShoppingListScreen() {
  const router = useRouter();
  const { pantry, shoppingList, removeFromShoppingList } = usePantryStore();

  const itemsToBuy = useMemo(() => {
    const allProducts = Object.values(pantry).flat();
    return shoppingList.map(id => allProducts.find(p => p.id === id)).filter(Boolean) as Product[];
  }, [pantry, shoppingList]);

  const renderItem = ({ item }: { item: Product }) => (
    <View style={globalStyles.itemCardLayout}>
      <View style={globalStyles.itemInfo}>
        <Text style={globalStyles.itemName}>{item.name}</Text>
        <Text style={globalStyles.itemStock}>
          {item.isEssential 
            ? `Запаси: ${item.stockAmount || 0} шт | На полиці: ${item.shelfAmount} ${item.unit}` 
            : `Залишилось: ${item.shelfAmount} ${item.unit}`}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={globalStyles.AccentButton}
        onPress={() => removeFromShoppingList(item.id)}
        activeOpacity={0.7}
      >
        <Text style={globalStyles.accentButtonText}>✓</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[  globalStyles.screenContainer, styles.screenContainerBeige]}>
      <View style={globalStyles.headerRow}>
        <TouchableOpacity 
          style={globalStyles.backButton} 
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={globalStyles.buttonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={[globalStyles.screenTitle, styles.screenTitleBrown]}> Список покупок</Text>
        </View>

      {itemsToBuy.length === 0 ? (
        <View style={globalStyles.emptyState}>
          <Text style={globalStyles.emptyText}>Усе в наявності! Полиці повні ✨</Text>
        </View>
      ) : (
        <FlatList
          data={itemsToBuy}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={globalStyles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
      
    </View>
  );
}

const styles = StyleSheet.create({
  screenTitleBrown: {
    color:theme.colors.textBrown
  },

  screenContainerBeige: {
    backgroundColor: theme.colors.bgMain,
  },
});