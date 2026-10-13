import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { usePantryStore, Product } from '../../store/usePantryStore';
import { globalStyles } from '../../styles/globalStyles';
import { theme } from '../../styles/theme';

export default function PantryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const shelfId = id as string;

    const products = usePantryStore((state) => state.pantry[shelfId]) || [];
  
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
    // Змінюємо flexDirection картки на column, щоб вмістити два ряди
    <View style={[globalStyles.itemCard, styles.itemCardPantry, { flexDirection: 'column', alignItems: 'stretch' }]}>
      
      {/* РЯДОК 1: ПОЛИЦЯ (для всіх продуктів) */}
      <View style={styles.row}>
        <View style={globalStyles.itemInfo}>
          <Text style={globalStyles.itemName}>{item.name}</Text>
          <Text style={globalStyles.itemStock}>
            {item.isEssential ? 'Відкрито: ' : ''}{item.shelfAmount} {item.unit}
          </Text>
        </View>
        
        <View style={styles.controls}>
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
        </View>
      </View>

      {/* РЯДОК 2: СТОК (рендериться ТІЛЬКИ для essential) */}
      {item.isEssential && (
        <View style={styles.stockRow}>
          <View style={globalStyles.itemInfo}>
            <Text style={[globalStyles.itemStock, { fontWeight: '700', color: '#5C4A3D' }]}>
              📦 Запаси: {item.stockAmount || 0} шт
            </Text>
          </View>
          <View style={styles.controls}>
            {/* Кнопка мінус автоматично "відкриє" пачку на полицю завдяки нашій логіці в Zustand */}
            <TouchableOpacity 
              style={[globalStyles.AccentButton, styles.AccentButtonRose]} 
              onPress={() => updateStockAmount(shelfId, item.id, -1)}
            >
              <Text style={globalStyles.accentButtonText}>–</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[globalStyles.AccentButton, styles.AccentButtonRose]} 
              onPress={() => updateStockAmount(shelfId, item.id, 1)}
            >
              <Text style={globalStyles.accentButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderColor: '#E8DCC4', // Легка лінія-розділювач між полицею і стоком
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