import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { LayoutDashboard, Plus, AlertTriangle, Bell, User } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { tabScreenOptions, tabIcon } from './tabOptions';
import ReportSheet from '../components/domain/ReportSheet';

import DashboardScreen from '../screens/shared/DashboardScreen';
import IncidentsScreen from '../screens/shared/IncidentsScreen';
import IncidentDetailScreen from '../screens/shared/IncidentDetailScreen';
import ReportHubScreen from '../screens/employee/ReportHubScreen';
import ReportIncidentScreen from '../screens/employee/ReportIncidentScreen';
import ReportModuleScreen from '../screens/employee/ReportModuleScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import WorkflowScreen from '../screens/shared/WorkflowScreen';
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
      <Stack.Screen name="ReportIncident" component={ReportIncidentScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}
function ReportStack() {
  return (
    <Stack.Navigator screenOptions={stack}>
      <Stack.Screen name="ReportHub" component={ReportHubScreen} />
      <Stack.Screen name="ReportIncident" component={ReportIncidentScreen} />
      <Stack.Screen name="ReportModule" component={ReportModuleScreen} />
    </Stack.Navigator>
  );
}
function IncidentsStack() {
  return (
    <Stack.Navigator screenOptions={stack}>
      <Stack.Screen name="Incidents" component={IncidentsScreen} />
      <Stack.Screen name="IncidentDetail" component={IncidentDetailScreen} />
      <Stack.Screen name="ReportIncident" component={ReportIncidentScreen} />
    </Stack.Navigator>
  );
}
function NotificationsStack() {
  return (
    <Stack.Navigator screenOptions={stack}>
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="IncidentDetail" component={IncidentDetailScreen} />
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
      <Stack.Screen name="Workflow" component={WorkflowScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}

const REPORT_BTN_COLOR = '#0d419d'; // matches the dashboard top bar
const REPORT_BTN_COLOR_DARK = '#0a3179';

// Raised, highlighted center button for the Report tab.
function RaisedReportButton({ colors, onPress }) {
  return (
    <View style={raised.wrap} pointerEvents="box-none">
      <Pressable onPress={onPress} style={({ pressed }) => [raised.btn, pressed && { transform: [{ scale: 0.92 }] }]}>
        <View style={[raised.ring, { backgroundColor: colors.background }]}>
          <LinearGradient
            colors={[REPORT_BTN_COLOR, REPORT_BTN_COLOR_DARK]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[raised.circle, { shadowColor: REPORT_BTN_COLOR }]}
          >
            <Plus size={28} color="#fff" strokeWidth={2.6} />
          </LinearGradient>
        </View>
      </Pressable>
    </View>
  );
}

export default function EmployeeNavigator() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [sheet, setSheet] = useState({ open: false, navigation: null });

  const openSheet = (navigation) => setSheet({ open: true, navigation });
  const closeSheet = () => setSheet((s) => ({ ...s, open: false }));
  const handleSelect = (item) => {
    sheet.navigation?.navigate('ReportTab', { screen: item.route, params: item.params });
  };

  return (
    <>
      <Tab.Navigator screenOptions={tabScreenOptions(colors, insets, '#0d419d')}>
        <Tab.Screen name="DashboardTab" component={DashboardStack} options={{ title: 'Dashboard', tabBarIcon: tabIcon(LayoutDashboard) }} />
        <Tab.Screen name="IncidentsTab" component={IncidentsStack} options={{ title: 'Incidents', tabBarIcon: tabIcon(AlertTriangle) }} />
        {/* Center raised + button */}
        <Tab.Screen
          name="ReportTab"
          component={ReportStack}
          options={{
            title: 'Report',
            tabBarButton: (props) => (
              <RaisedReportButton colors={colors} onPress={props.onPress} />
            ),
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              openSheet(navigation);
            },
          })}
        />
        <Tab.Screen name="NotificationsTab" component={NotificationsStack} options={{ title: 'Alerts', tabBarIcon: tabIcon(Bell) }} />
        <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ title: 'Profile', tabBarIcon: tabIcon(User) }} />
      </Tab.Navigator>
      <ReportSheet visible={sheet.open} onClose={closeSheet} onSelect={handleSelect} />
    </>
  );
}

const raised = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  btn: { top: -18 },
  ring: {
    padding: 4,
    borderRadius: 35,
  },
  circle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
});
