import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { usePantryStore } from '../store/usePantryStore';
import { theme } from '../styles/theme';
import { globalStyles } from '../styles/globalStyles';

export const HUDAlert = () => {
  const { lastAlert, clearAlert } = usePantryStore();
  
  const translateY = useRef(new Animated.Value(150)).current;
  const opacity = useRef(new Animated.Value(0)).current;

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
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [lastAlert]);

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
      <Text style={[globalStyles.itemStock, { color: textColor, fontFamily: theme.fonts.bold }]}>
        {lastAlert.message}
      </Text>
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
    text: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    textAlign: 'center',
  }
});