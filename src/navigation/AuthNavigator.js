import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import CompanySelectScreen from '../screens/auth/CompanySelectScreen';
import PortalLoginScreen from '../screens/auth/PortalLoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: 'transparent' } }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      {/* Department + Employee share the company-select -> portal-login flow. */}
      <Stack.Screen name="CompanySelect" component={CompanySelectScreen} />
      <Stack.Screen name="PortalLogin" component={PortalLoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}
