import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS, TYPOGRAPHY } from '../constants';
import {
  AvailableJobsScreen,
  JobDetailScreen,
  MyJobsScreen,
  ProviderHomeScreen,
  ProviderProfileScreen,
} from '../screens/provider/ProviderScreens';
import {
  ChangePasswordScreen,
  EditProfileScreen,
  NotificationsScreen,
  ProviderEarningsScreen,
} from '../screens/cycle2/Cycle2Screens';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function JobsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AvailableJobs" component={AvailableJobsScreen} />
      <Stack.Screen name="MyJobs" component={MyJobsScreen} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} />
    </Stack.Navigator>
  );
}

function ProviderProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProviderProfile" component={ProviderProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Stack.Navigator>
  );
}

const icons = {
  DashboardTab: 'grid-outline',
  JobsTab: 'list-outline',
  EarningsTab: 'wallet-outline',
  ProviderNotificationsTab: 'notifications-outline',
  ProviderProfileTab: 'person-outline',
};

export default function ProviderTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.ACCENT,
        tabBarInactiveTintColor: COLORS.TEXT_MUTED,
        tabBarLabelStyle: {
          ...TYPOGRAPHY.caption,
          fontSize: 11,
        },
        tabBarStyle: {
          backgroundColor: COLORS.BG_CARD,
          borderTopColor: COLORS.BORDER_SOFT,
          minHeight: 68,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons color={color} name={icons[route.name]} size={size} />
        ),
      })}
    >
      <Tab.Screen name="DashboardTab" component={ProviderHomeScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="JobsTab" component={JobsStack} options={{ title: 'Jobs' }} />
      <Tab.Screen name="EarningsTab" component={ProviderEarningsScreen} options={{ title: 'Earnings' }} />
      <Tab.Screen name="ProviderNotificationsTab" component={NotificationsScreen} options={{ title: 'Alerts' }} />
      <Tab.Screen name="ProviderProfileTab" component={ProviderProfileStack} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
