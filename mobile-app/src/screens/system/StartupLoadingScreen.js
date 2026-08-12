import { Image, StyleSheet, Text } from 'react-native';
import { Card, LoadingState, ScreenContainer } from '../../components';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants';

const logo = require('../../../assets/homeease-logo.png');

export default function StartupLoadingScreen() {
  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <Image source={logo} style={styles.logo} resizeMode="contain" />
      <Card style={styles.card}>
        <Text style={styles.title}>HomeEase</Text>
        <LoadingState message="Preparing your workspace..." />
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  logo: {
    alignSelf: 'center',
    height: 46,
    marginBottom: SPACING.stackLg,
    width: 176,
  },
  card: {
    gap: SPACING.stackMd,
  },
  title: {
    ...TYPOGRAPHY.heading,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
});
