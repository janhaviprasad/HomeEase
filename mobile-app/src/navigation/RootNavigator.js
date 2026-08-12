import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useState } from 'react';
import { View } from 'react-native';
import PreviewGallery, { previewScreens } from '../screens/preview/Cycle1PreviewScreens';
import AdminRedirectScreen from '../screens/system/AdminRedirectScreen';
import RestoreErrorScreen from '../screens/system/RestoreErrorScreen';
import StartupLoadingScreen from '../screens/system/StartupLoadingScreen';
import { ServiceCatalogProvider, useAuth } from '../context';
import { isAdminRole } from '../utils/authSession';
import AuthStack from './AuthStack';
import CustomerTabs from './CustomerTabs';
import { navigationTheme } from './navigationTheme';
import ProviderTabs from './ProviderTabs';

const RootStack = createNativeStackNavigator();

function RoleNavigator() {
  const { loading, restoreError, user, isAuthenticated } = useAuth();

  if (loading) {
    return <StartupLoadingScreen />;
  }

  if (restoreError) {
    return <RestoreErrorScreen />;
  }

  if (!isAuthenticated || !user) {
    return <AuthStack />;
  }

  if (user.role === 'CUSTOMER') {
    return (
      <ServiceCatalogProvider>
        <CustomerTabs />
      </ServiceCatalogProvider>
    );
  }

  if (user.role === 'PROVIDER') {
    return <ProviderTabs />;
  }

  if (isAdminRole(user.role)) {
    return <AdminRedirectScreen />;
  }

  return <AuthStack />;
}

function DevGalleryScreen() {
  const [currentIndex, setCurrentIndex] = useState(null);

  if (!__DEV__) {
    return <View />;
  }

  return (
    <PreviewGallery
      currentIndex={currentIndex}
      onBack={() => setCurrentIndex(null)}
      onSelect={setCurrentIndex}
      screens={previewScreens}
    />
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Main" component={RoleNavigator} />
        {__DEV__ ? <RootStack.Screen name="DevGallery" component={DevGalleryScreen} /> : null}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
