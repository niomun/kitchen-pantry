import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { db } from '../db/db';
import migrations from '../drizzle/migrations';
import { HUDAlert } from '../components/HUDAlert'; 

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Cozy-Regular': require('../assets/fonts/PlaypenSans-Regular.ttf'),
    'Cozy-Medium': require('../assets/fonts/PlaypenSans-Medium.ttf'),
    'Cozy-Bold': require('../assets/fonts/PlaypenSans-Bold.ttf'),
    'Cozy-ExtraBold': require('../assets/fonts/PlaypenSans-ExtraBold.ttf'),
  });

  const { success: migrationsSuccess, error: migrationsError } = useMigrations(db, migrations);

  useEffect(() => {
    if ((fontsLoaded || fontError) && (migrationsSuccess || migrationsError)) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, migrationsSuccess, migrationsError]);

  if (!fontsLoaded || !migrationsSuccess) {
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