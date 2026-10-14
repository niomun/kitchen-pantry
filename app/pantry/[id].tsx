import { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { usePantryStore, Product } from '../../store/usePantryStore';
import { globalStyles } from '../../styles/globalStyles';
import { theme } from '../../styles/theme';

const EMPTY_PRODUCTS: Product[] = [];

export default function PantryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const shelfId = id as string;

    const shelfProducts = usePantryStore((state) => state.pantry[shelfId]);
    const products = useMemo(
      () => (shelfProducts ?? EMPTY_PRODUCTS).filter((product) =>
        shelfId === 'stocks'
          ? (product.stockAmount ?? 0) > 0
          : product.shelfAmount > 0,
      ),
      [shelfProducts, shelfId],
    );
  
  // Дістаємо обидві функції зі стору
  const updateShelfAmount = usePantryStore((state) => state.updateShelfAmount);
  const updateStockAmount = usePantryStore((state) => state.updateStockAmount);

  const getShelfTitle = (currentId: string) => {
    switch (currentId) {
      case 'stocks': return 'Запаси';
      case 'fridge': return 'Холодильник';
      case 'freezer': return 'Морозильник';
      case 'drinks': return 'Напої';
      case 'bakery': return 'Випічка';
      case 'grains': return 'Крупи';
      default: return 'Інше';
    }
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={[globalStyles.itemCard, styles.itemCardPantry]}>
      <View style={globalStyles.itemInfo}>
        <Text style={globalStyles.itemName}>{item.name}</Text>
        <Text style={globalStyles.itemStock}>
          {shelfId === 'stocks'
            ? `Запас: ${item.stockAmount ?? 0} упаковок`
            : `${item.shelfAmount} ${item.unit}`}
        </Text>
      </View>
      <View style={styles.controls}>
        {shelfId === 'stocks' ? (
          <>
            <TouchableOpacity
              style={[globalStyles.AccentButton, styles.AccentButtonRose]}
              onPress={() => updateStockAmount(shelfId, item.id, -1)}
              disabled={(item.stockAmount ?? 0) === 0}
            >
              <Text style={globalStyles.accentButtonText}>–</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[globalStyles.AccentButton, styles.AccentButtonRose]}
              onPress={() => updateStockAmount(shelfId, item.id, 1)}
            >
              <Text style={globalStyles.accentButtonText}>+</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[globalStyles.AccentButton, styles.AccentButtonRose]}
              onPress={() => updateShelfAmount(shelfId, item.id, -item.stride)}
            >
              <Text style={globalStyles.accentButtonText}>–</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[globalStyles.AccentButton, styles.AccentButtonRose]}
              onPress={() => updateShelfAmount(shelfId, item.id, item.stride)}
            >
              <Text style={globalStyles.accentButtonText}>+</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  return (
      <View style={globalStyles.screenContainer}>
            <View style={globalStyles.headerRow}>
              <TouchableOpacity 
                style={[    globalStyles.backButton, styles.backButtonGreen]} 
                onPress={() => router.back()} // Викликаємо повернення
                activeOpacity={0.7}
              >
                  <Text style={globalStyles.buttonText}>{'<'}</Text>
                          </TouchableOpacity>
                  <Text style={globalStyles.screenTitle}>{getShelfTitle(shelfId)}</Text>
                  </View>
      
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        contentContainerStyle={globalStyles.listContainer}
        ListEmptyComponent={<Text style={globalStyles.emptyText}>Тут поки порожньо</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
    row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
    controls: {
        flexDirection: 'row',
        gap: 8,
    },

    AccentButtonRose: {
        backgroundColor: theme.colors.rose,
        borderColor: theme.colors.roseDark,
    },
  
    itemCardPantry: {
        backgroundColor: theme.colors.bgCardPantry,
    },

    backButtonGreen: {
        backgroundColor: theme.colors.bgCardPantry,
    }
});