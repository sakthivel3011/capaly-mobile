import { useState } from 'react';
import { Alert } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { useToast } from '../components/feedback/ToastProvider';
import { profileApi } from '../api/data.api';

// The latest app version target.
// Current app.json contains version "1.0.6" (build 7).
const LATEST_APP_VERSION = '1.0.7';
const LATEST_VERSION_CODE = 8;

export function useAppUpdate() {
  const toast = useToast();
  const [checking, setChecking] = useState(false);

  const checkAndInstallUpdate = async () => {
    if (checking) return;
    setChecking(true);

    // 1. Simulate checking for updates with a loading toast
    toast.info('Checking for updates...', 1500);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setChecking(false);

    // Read current version configuration from expoConfig
    const currentVersion = Constants.expoConfig?.version || '1.0.0';
    const currentVersionCode = Constants.expoConfig?.android?.versionCode || 1;

    // Check if the current version is older than the target latest version
    const isOldVersion = currentVersionCode < LATEST_VERSION_CODE;

    if (!isOldVersion) {
      // If the user has already updated/is on the latest version, show "Up to Date" alert.
      Alert.alert(
        "App is up to date",
        `CAPALY Mobile is already on the latest version (v${currentVersion}).`,
        [{ text: "OK" }]
      );
      return;
    }

    // 2. If it is an old version, show that a new update is coming
    Alert.alert(
      "Update Available",
      `A new version (v${LATEST_APP_VERSION}) is available. Would you like to download and install it now?`,
      [
        {
          text: "Later",
          style: "cancel"
        },
        {
          text: "Update Now",
          onPress: async () => {
            setChecking(true);
            toast.info('Downloading update...', 1500);
            await new Promise((resolve) => setTimeout(resolve, 1500));
            setChecking(false);

            // Show exactly the Google Play style error alert from the screenshot
            Alert.alert(
              "Can't install in.capaly.app (unreviewed)",
              "Try again, and if it still doesn't work, see common ways to fix the problem",
              [
                {
                  text: "Understood",
                  style: "cancel"
                },
                {
                  text: "Send feedback",
                  onPress: async () => {
                    setChecking(true);
                    toast.info('Sending feedback...', 1500);

                    // Gather device details using expo-device
                    const deviceDetails = {
                      brand: Device.brand || 'Unknown',
                      modelName: Device.modelName || 'Unknown',
                      osName: Device.osName || 'Unknown',
                      osVersion: Device.osVersion || 'Unknown',
                      isDevice: Device.isDevice || false,
                    };

                    try {
                      // Send error feedback to backend
                      await profileApi.submitFeedback({
                        message: "App update failed: User phone not installing.",
                        details: {
                          appId: "in.capaly.app",
                          error: "Play Store installation error: Can't install app (unreviewed).",
                          device: deviceDetails,
                        }
                      });

                      setChecking(false);
                      Alert.alert(
                        "Feedback Sent",
                        "Thank you for reporting this issue. We've notified our support team.",
                        [{ text: "OK" }]
                      );
                    } catch (err) {
                      setChecking(false);
                      toast.error("Failed to send error report");
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  return { checking, checkAndInstallUpdate };
}
