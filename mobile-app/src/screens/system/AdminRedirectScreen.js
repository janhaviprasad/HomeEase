import { useEffect } from 'react';
import { Image, StyleSheet, Text } from 'react-native';
import { Card, PrimaryButton, ScreenContainer } from '../../components';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants';
import { useAuth } from '../../context';
import { clearSession } from '../../utils/sessionStorage';

const logo = require('../../../assets/homeease-logo.png');

export default function AdminRedirectScreen() {
  const { signOut } = useAuth();

  useEffect(() => {
    clearSession();
  }, []);

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <Image source={logo} style={styles.logo} resizeMode="contain" />
      <Card style={styles.card}>
        <Text style={styles.title}>Admin Access</Text>
        <Text style={styles.body}>Admin accounts must use the web dashboard.</Text>
        <PrimaryButton title="Return to Login" onPress={signOut} />
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
    textAlign: 'center',
  },
  body: {
    ...TYPOGRAPHY.body,
    color: COLORS.TEXT_MUTED,
    textAlign: 'center',
  },
});
