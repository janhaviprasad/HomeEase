import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SIZES, TYPOGRAPHY } from '../constants';
import { SHADOWS } from '../constants/theme';

const ICONS = {
  Home: 'home-outline',
  Bookings: 'calendar-outline',
  Profile: 'person-outline',
  Dashboard: 'grid-outline',
  Jobs: 'list-outline',
};

export default function BottomTabs({ tabs = ['Home', 'Bookings', 'Profile'], active = 'Home' }) {
  return (
    <View style={styles.tabs}>
      {tabs.map((tab) => {
        const selected = tab === active;
        return (
          <View key={tab} style={[styles.item, selected && styles.activeItem]}>
            <Ionicons
              color={selected ? COLORS.ACCENT : COLORS.TEXT_MUTED}
              name={ICONS[tab] || 'ellipse-outline'}
              size={18}
            />
            <Text style={[styles.label, selected && styles.activeLabel]}>{tab}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    alignItems: 'center',
    backgroundColor: COLORS.BG_CARD,
    borderTopColor: COLORS.BORDER_SOFT,
    borderTopWidth: 1,
    flexDirection: 'row',
    minHeight: SIZES.bottomTabsHeight,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...SHADOWS.card,
  },
  item: {
    alignItems: 'center',
    borderRadius: RADIUS.card,
    flex: 1,
    gap: 4,
    justifyContent: 'center',
    paddingVertical: 7,
  },
  activeItem: {
    backgroundColor: COLORS.ACCENT_SOFT,
  },
  label: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
  },
  activeLabel: {
    color: COLORS.ACCENT,
    fontFamily: 'Inter_600SemiBold',
  },
});
