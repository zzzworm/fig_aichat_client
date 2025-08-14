import { ThemedText } from '@/components/elements/ThemedText';
import { ThemedView } from '@/components/elements/ThemedView';
import { Link, Stack, usePathname } from 'expo-router';
import { StyleSheet } from 'react-native';

export default function NotFoundScreen() {
const pathname = usePathname();
    console.log('404 Not Found', pathname);
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">This screen does not exist.</ThemedText>
        <Link href="/" style={styles.link}>
          <ThemedText type="link">Go to home screen!</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
