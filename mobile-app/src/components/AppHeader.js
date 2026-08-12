import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants';

export default function AppHeader({
  title = 'HomeEase',
  subtitle,
  showBack = false,
  showMenu = false,
  avatar,
  onBack,
}) {
  return (
    <View style={styles.header}>
      <View style={styles.leading}>
        {showBack ? (
          <Pressable accessibilityRole="button" hitSlop={8} onPress={onBack} style={styles.iconButton}>
            <Ionicons color={COLORS.ACCENT} name="arrow-back" size={20} />
          </Pressable>
        ) : null}
        {showMenu ? (
          <Pressable accessibilityRole="button" hitSlop={8} style={styles.iconButton}>
            <Ionicons color={COLORS.TEXT_MUTED} name="menu" size={20} />
          </Pressable>
        ) : null}
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {avatar ? <Image source={avatar} style={styles.avatar} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.stackLg,
  },
  leading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  title: {
    ...TYPOGRAPHY.subheading,
    color: COLORS.ACCENT,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
  },
  avatar: {
    borderRadius: 16,
    height: 32,
    width: 32,
  },
});
