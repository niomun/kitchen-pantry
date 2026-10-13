import { View, Text, Pressable, Image, ImageBackground, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import kitchenBg from '../assets/images/kitchen-background.jpg';
import noteImg from '../assets/images/note.png';
import { usePantryStore } from '../store/usePantryStore';
import { theme } from '../styles/theme';
import { globalStyles } from '../styles/globalStyles';

export default function KitchenScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Беремо pantry та shoppingList зі стору
  const inventory = usePantryStore((state) => state.pantry);
  const shoppingList = usePantryStore((state) => state.shoppingList);

  const allProducts = Object.values(inventory).flat();

  // 1. Прогрес-бар (рахуємо ТІЛЬКИ по стоку essential-товарів)
  const essentialProducts = allProducts.filter(p => p.isEssential);
  // Вважаємо, що з запасом все добре, якщо є хоча б 1 невідкрита пачка
  const goodStockCount = essentialProducts.filter(p => (p.stockAmount || 0) > 0).length;
  
  const essentialProgress = essentialProducts.length > 0 
    ? Math.round((goodStockCount / essentialProducts.length) * 100) 
    : 0;

  // 2. Список покупок
  const toBuy = shoppingList.length; // Більше ніяких складних фільтрів!
  
  // Знаходимо об'єкти продуктів зі списку, щоб перевірити isUrgent
  const itemsToBuyObjects = shoppingList
    .map(id => allProducts.find(p => p.id === id))
    .filter(Boolean);
    
  const urgent = itemsToBuyObjects.filter(p => p?.isUrgent).length;

  return (
    <View style={styles.container}>
      <ImageBackground source={kitchenBg} style={styles.imageCanvas} resizeMode="cover">
        <View 
          style={[styles.hudContainer, { paddingTop: insets.top + 100 }]} 
          pointerEvents="box-none">
          <View style={[ globalStyles.itemCard, styles.widgetCard]}>
            <Text style={styles.widgetText}>
              Купити: {String(toBuy)}
            </Text>
            <Text style={{ ...styles.widgetText, ...styles.urgentText }}>
              Терміново: {String(urgent)}
            </Text>
          </View>
          <View style={[ globalStyles.itemCard,styles.widgetCard]}>
            <Text style={styles.widgetTitle}>ЗАПАСИ</Text>
            <View style={styles.progressBarBg}>
              <View 
                style={[
                  styles.progressBarFill, { 
                    width: `${essentialProgress}%`,
                    borderRightWidth: essentialProgress === 100 ? 0 : 2
                  }
                ]}
              />
            </View>
          </View>
        </View>

        <Pressable 
          style={[styles.interactionZone, { top: '26%', left: '7%', width: '29%', height: '12%' }]} 
          onPress={() => router.push('/pantry/stocks')}
        />

        <Pressable 
          style={[styles.interactionZone, { top: '38%', left: '7%', width: '29%', height: '20%' }]} 
          onPress={() => router.push('/pantry/fridge')}
        />

        <Pressable 
          style={[styles.interactionZone, { top: '59%', left: '7%', width: '29%', height: '14%' }]} 
          onPress={() => router.push('/pantry/freezer')}
        />
          
        <Pressable 
          style={[styles.interactionZone, { top: '59%', left: '36%', width: '24%', height: '7%' }]} 
          onPress={() => router.push('/pantry/drinks')}
        />

        <Pressable 
          style={[styles.interactionZone, { top: '66%', left: '36%', width: '24%', height: '7%' }]} 
          onPress={() => router.push('/pantry/bakery')}
        />

        <Pressable 
          style={[styles.interactionZone, { top: '59%', left: '67%', width: '29%', height: '7%' }]} 
          onPress={() => router.push('/pantry/grains')}
        />

        <Pressable 
          style={[styles.interactionZone, { top: '66%', left: '67%', width: '29%', height: '7%' }]} 
          onPress={() => router.push('/pantry/other')}
        />
        
        <Pressable 
          style={[
            styles.interactionZone, 
              { top: '39%', left: '70%', width: '12%', height: '10%', transform: [{ rotate: '-8deg' }] }
          ]} 
          onPress={() => router.push('/shopping-list')}
        >
          <Image 
            source={noteImg} 
            style={styles.noteImage} 
            resizeMode="contain" 
          />
        </Pressable>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
imageCanvas: {
    width: '100%',
    aspectRatio: 0.4059405941, 
    position: 'relative',
  },
  interactionZone: {
    position: 'absolute',
  },
  noteImage: {
    width: '100%',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
hudContainer: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  widgetCard: {
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingVertical: 10,
    paddingHorizontal: 14,
    minWidth: 160,
  },
  widgetTitle: {
    fontFamily: theme.fonts.extraBold,
    fontSize: 16,
    color: theme.colors.textBrown,
    marginBottom: 8,
    letterSpacing: 1,
    alignSelf: 'center',
  },
  progressBarBg: {
    height: 16,
    backgroundColor: '#E8DCC4',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#8C7A6B',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#BBDFD5',
    borderColor: '#8C7A6B',
  },
  widgetText: {
    fontFamily: theme.fonts.bold,
    fontSize: 15,
    color: theme.colors.textBrown,
    marginBottom: 4,
  },
  urgentText: {
    color: theme.colors.urgent,
  }
});