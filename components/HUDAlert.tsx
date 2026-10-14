import React, { useEffect, useState } from 'react';
import { Animated, Pressable, Text, StyleSheet, View } from 'react-native';
import { usePantryStore } from '../store/usePantryStore';
import { theme } from '../styles/theme';
import { globalStyles } from '../styles/globalStyles';

export const HUDAlert = () => {
  const lastAlert = usePantryStore((state) => state.lastAlert);
  const clearAlert = usePantryStore((state) => state.clearAlert);
  const addToShoppingList = usePantryStore((state) => state.addToShoppingList);
  
  const [translateY] = useState(() => new Animated.Value(150));
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (lastAlert) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 40,
          friction: 5,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 150,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          })
        ]).start(() => clearAlert());
      }, lastAlert.type === 'prompt-shopping' ? 5000 : 3000);

      return () => clearTimeout(timer);
    }
  }, [lastAlert, clearAlert, opacity, translateY]);

  if (!lastAlert) return null;

  const isRestock = lastAlert.type === 'restocked';
  const textColor = isRestock ? '#3D5C4A' : '#87364c'; 

  return (
    <Animated.View style={[
      globalStyles.itemCard, styles.container, 
      { 
        opacity,
        transform: [{ translateY }] 
      }
    ]}>
      <View style={styles.content}>
        <Text style={[globalStyles.itemStock, { color: textColor, fontFamily: theme.fonts.bold }]}>
          {lastAlert.message}
        </Text>
        {lastAlert.type === 'prompt-shopping' && lastAlert.productId && (
          <Pressable
            accessibilityRole="button"
            style={styles.confirmButton}
            onPress={() => void addToShoppingList(lastAlert.productId!)}
          >
            <Text style={styles.confirmButtonText}>Додати</Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    zIndex: 999,
    paddingVertical: 20,
    paddingHorizontal: 14,
    minWidth: 130,
  },
  content: {
    alignItems: 'center',
    gap: 12,
  },
  confirmButton: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: theme.colors.mintDark,
    borderRadius: 10,
    backgroundColor: theme.colors.mint,
  },
  confirmButtonText: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.textGreen,
  },
    text: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    textAlign: 'center',
  }
});