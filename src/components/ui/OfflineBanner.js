import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import NetInfo from '@react-native-community/netinfo';
import { WifiOff } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import Text from './Text';

// App-wide offline indicator. Subscribes to NetInfo and shows a bottom banner
// while disconnected, so cached screens make the offline state explicit.
export default function OfflineBanner() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setOffline(!(state.isConnected && state.isInternetReachable !== false));
    });
    return unsub;
  }, []);

  if (!offline) return null;

  return (
    <Animated.View
      entering={SlideInDown}
      exiting={SlideOutDown}
      style={[styles.banner, { backgroundColor: colors.navy, paddingBottom: insets.bottom + 10 }]}
    >
      <WifiOff size={16} color="#fff" />
      <Text variant="small" color="#FFFFFF" style={styles.text}>
        You're offline — showing saved data
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    zIndex: 999,
  },
  text: { marginLeft: 8 },
});
