import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../constants';

export default function ScreenContainer({
  children,
  scroll = true,
  contentContainerStyle,
  style,
  ...scrollProps
}) {
  const Container = scroll ? ScrollView : View;

  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <Container
          keyboardShouldPersistTaps={scroll ? 'handled' : undefined}
          showsVerticalScrollIndicator={false}
          style={styles.container}
          contentContainerStyle={scroll ? [styles.content, contentContainerStyle] : undefined}
          {...scrollProps}
        >
          {children}
        </Container>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BG_CANVAS,
  },
  keyboard: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: SPACING.screen,
  },
});
