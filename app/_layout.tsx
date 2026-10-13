import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { HUDAlert } from '../components/HUDAlert';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Cozy-Regular': require('../assets/fonts/PlaypenSans-Regular.ttf'),
    'Cozy-Medium': require('../assets/fonts/PlaypenSans-Medium.ttf'),
    'Cozy-Bold': require('../assets/fonts/PlaypenSans-Bold.ttf'),
    'Cozy-ExtraBold': require('../assets/fonts/PlaypenSans-ExtraBold.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null; 
  }

  return (
    <>
    <HUDAlert />
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen 
        name="pantry/[id]" 
        options={{ 
          title: 'Інвентар',
          headerShown: false
        }} 
        />
        <Stack.Screen 
        name="shopping-list" 
        options={{ 
          headerShown: false
        }} 
        />
      </Stack>
  </>
  );
}