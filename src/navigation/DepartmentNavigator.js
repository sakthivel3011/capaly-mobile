import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LayoutDashboard, AlertTriangle, ClipboardList, FileBarChart, User } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { tabScreenOptions, tabIcon } from './tabOptions';

import DashboardScreen from '../screens/shared/DashboardScreen';
import IncidentsScreen from '../screens/shared/IncidentsScreen';
import IncidentDetailScreen from '../screens/shared/IncidentDetailScreen';
import ActionPlanScreen from '../screens/department/ActionPlanScreen';
import ActionPlanDetailScreen from '../screens/department/ActionPlanDetailScreen';
import CreateActionPlanScreen from '../screens/department/CreateActionPlanScreen';
import ReportsScreen from '../screens/shared/ReportsScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import SettingsScreen from '../screens/shared/SettingsScreen';
import ChangePasswordScreen from '../screens/shared/ChangePasswordScreen';
import CompanyAboutScreen from '../screens/shared/CompanyAboutScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const stack = { headerShown: false, animation: 'slide_from_right' };

function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={stack}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="IncidentDetail" component={IncidentDetailScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}
function IncidentsStack() {
  return (
    <Stack.Navigator screenOptions={stack}>
      <Stack.Screen name="Incidents" component={IncidentsScreen} />
      <Stack.Screen name="IncidentDetail" component={IncidentDetailScreen} />
    </Stack.Navigator>
  );
}
function ActionPlanStack() {
  return (
    <Stack.Navigator screenOptions={stack}>
      <Stack.Screen name="ActionPlan" component={ActionPlanScreen} />
      <Stack.Screen name="ActionPlanDetail" component={ActionPlanDetailScreen} />
      <Stack.Screen name="CreateActionPlan" component={CreateActionPlanScreen} />
    </Stack.Navigator>
  );
}
function ReportsStack() {
  return (
    <Stack.Navigator screenOptions={stack}>
      <Stack.Screen name="Reports" component={ReportsScreen} />
    </Stack.Navigator>
  );
}
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={stack}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="CompanyAbout" component={CompanyAboutScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}

export default function DepartmentNavigator() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator screenOptions={tabScreenOptions(colors, insets, '#008062')}>
      <Tab.Screen name="DashboardTab" component={DashboardStack} options={{ title: 'Dashboard', tabBarIcon: tabIcon(LayoutDashboard) }} />
      <Tab.Screen name="IncidentsTab" component={IncidentsStack} options={{ title: 'Incidents', tabBarIcon: tabIcon(AlertTriangle) }} />
      <Tab.Screen name="ActionPlanTab" component={ActionPlanStack} options={{ title: 'Action Plan', tabBarIcon: tabIcon(ClipboardList) }} />
      <Tab.Screen name="ReportsTab" component={ReportsStack} options={{ title: 'Reports', tabBarIcon: tabIcon(FileBarChart) }} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ title: 'Profile', tabBarIcon: tabIcon(User) }} />
    </Tab.Navigator>
  );
}
