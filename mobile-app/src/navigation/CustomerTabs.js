import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS, TYPOGRAPHY } from '../constants';
import {
  BookingDetailScreen,
  BookingFormScreen,
  CustomerProfileScreen,
  HomeScreen,
  MyBookingsScreen,
  PaymentScreen,
  ReviewScreen,
  ServiceDetailScreen,
} from '../screens/customer/CustomerScreens';
import {
  AddressFormScreen,
  ChangePasswordScreen,
  EditProfileScreen,
  NotificationsScreen,
  SavedAddressesScreen,
} from '../screens/cycle2/Cycle2Screens';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
      <Stack.Screen name="BookingForm" component={BookingFormScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
    </Stack.Navigator>
  );
}

function BookingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
      <Stack.Screen name="Review" component={ReviewScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomerProfile" component={CustomerProfileScreen} />
      <Stack.Screen name="SavedAddresses" component={SavedAddressesScreen} />
      <Stack.Screen name="AddressForm" component={AddressFormScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Stack.Navigator>
  );
}

const icons = {
  HomeTab: 'home-outline',
  BookingsTab: 'calendar-outline',
  NotificationsTab: 'notifications-outline',
  ProfileTab: 'person-outline',
};

export default function CustomerTabs() {
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
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Home' }} />
      <Tab.Screen name="BookingsTab" component={BookingsStack} options={{ title: 'Bookings' }} />
      <Tab.Screen name="NotificationsTab" component={NotificationsScreen} options={{ title: 'Alerts' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
