import { Slot } from 'expo-router';
import { View, Text } from 'react-native';
import { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    console.log('✅ RootLayout is Rendering!');
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: 'green' }}>
      <Text style={{ color: 'white', textAlign: 'center' }}>✅ RootLayout Loaded</Text>
      <Slot />
    </View>
  );
}
