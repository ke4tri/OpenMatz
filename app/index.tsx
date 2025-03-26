// app/index.tsx
import { useRootNavigationState, Redirect } from 'expo-router';

export default function Index() {
  const rootNavigationState = useRootNavigationState();

  // Wait until navigation system is fully ready
  if (!rootNavigationState?.key) {
    return null; // or <LoadingScreen /> if you want a placeholder
  }

  console.log('✅ Navigation Ready! Redirecting to /map');
  return <Redirect href="/map" />;
}
