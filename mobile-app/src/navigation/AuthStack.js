import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  CustomerRegisterScreen,
  ForgotPasswordScreen,
  LoginScreen,
  ProviderRegisterScreen,
  VerifyOtpScreen,
  WelcomeScreen,
} from '../screens/auth/AuthScreens';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="CustomerRegister" component={CustomerRegisterScreen} />
      <Stack.Screen name="ProviderRegister" component={ProviderRegisterScreen} />
      <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
    </Stack.Navigator>
  );
}
