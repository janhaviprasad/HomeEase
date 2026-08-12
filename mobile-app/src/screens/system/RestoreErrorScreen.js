import { Image, StyleSheet } from 'react-native';
import { ErrorState, ScreenContainer, SecondaryButton } from '../../components';
import { SPACING } from '../../constants';
import { useAuth } from '../../context';

const logo = require('../../../assets/homeease-logo.png');

export default function RestoreErrorScreen() {
  const { retryRestore, signOut } = useAuth();

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <Image source={logo} style={styles.logo} resizeMode="contain" />
      <ErrorState
        message="We could not verify your session. Check your connection and try again."
        onRetry={retryRestore}
      />
      <SecondaryButton title="Clear Session and Go to Login" onPress={signOut} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.stackLg,
    justifyContent: 'center',
  },
  logo: {
    alignSelf: 'center',
    height: 46,
    width: 176,
  },
});
