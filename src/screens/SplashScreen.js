import React, { useEffect, useState } from 'react';
import { View, StyleSheet, useWindowDimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import Text from '../components/ui/Text';

// Premium CAPALY logo-reveal splash.
//  1. White background  2. icon fades + scales 0.6→1  3. burgundy glow
//  4. lockup shifts left  5. wordmark slides in  6. metallic black type
//  7. light-sweep shimmer  8. tagline fades in  9. fade to app (~3.8s).
// Plays once on cold start, then calls onFinish().

const ICON = require('../../assets/icon.png');
const BURGUNDY = '#8A1E3C';
const METALLIC = '#0A0A0A';

const ease = Easing.bezier(0.22, 1, 0.36, 1);

export default function SplashScreen({ onFinish }) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;
  const iconSize = isTablet ? 132 : 96;
  const wordWidth = isTablet ? 300 : 230; // approx wordmark box for the sweep + shift

  // Lockup is a centered row [icon · wordmark]. While the wordmark is hidden we
  // push the row right by half its (width+gap) so the lone icon sits dead-center;
  // animating the shift back to 0 slides the icon left as the wordmark appears.
  const shiftStart = (wordWidth + 16) / 2;

  const screen = useSharedValue(1);
  const iconScale = useSharedValue(0.6);
  const iconOpacity = useSharedValue(0);
  const glow = useSharedValue(0);
  const shift = useSharedValue(shiftStart);
  const wordOpacity = useSharedValue(0);
  const wordShift = useSharedValue(18);
  const sweep = useSharedValue(-1);
  const tagOpacity = useSharedValue(0);
  const tagShift = useSharedValue(10);

  const [done, setDone] = useState(false);
  const finish = () => {
    if (!done) {
      setDone(true);
      onFinish?.();
    }
  };

  useEffect(() => {
    // 2–3. icon reveal + glow
    iconOpacity.value = withTiming(1, { duration: 520, easing: ease });
    iconScale.value = withTiming(1, { duration: 620, easing: ease });
    glow.value = withDelay(180, withTiming(1, { duration: 700, easing: ease }));

    // 4–5. shift left + wordmark slide-in
    shift.value = withDelay(900, withTiming(0, { duration: 620, easing: ease }));
    wordOpacity.value = withDelay(1050, withTiming(1, { duration: 520, easing: ease }));
    wordShift.value = withDelay(1050, withTiming(0, { duration: 620, easing: ease }));

    // 7. light sweep across the wordmark
    sweep.value = withDelay(1500, withTiming(1.4, { duration: 900, easing: Easing.inOut(Easing.ease) }));

    // 8. tagline
    tagOpacity.value = withDelay(1900, withTiming(1, { duration: 520, easing: ease }));
    tagShift.value = withDelay(1900, withTiming(0, { duration: 520, easing: ease }));

    // 9. settle + fade to app
    screen.value = withDelay(
      3300,
      withSequence(
        withTiming(1, { duration: 1 }),
        withTiming(0, { duration: 480, easing: ease }, (f) => {
          if (f) runOnJS(finish)();
        })
      )
    );
  }, []);

  const screenStyle = useAnimatedStyle(() => ({ opacity: screen.value }));
  const lockupStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shift.value }] }));
  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ scale: iconScale.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value * 0.55,
    transform: [{ scale: 0.8 + glow.value * 0.4 }],
  }));
  const wordStyle = useAnimatedStyle(() => ({
    opacity: wordOpacity.value,
    transform: [{ translateY: wordShift.value }],
  }));
  const sweepStyle = useAnimatedStyle(() => ({
    opacity: sweep.value > 0 && sweep.value < 1.3 ? 1 : 0,
    transform: [{ translateX: sweep.value * (wordWidth + 60) - 60 }, { skewX: '-18deg' }],
  }));
  const tagStyle = useAnimatedStyle(() => ({
    opacity: tagOpacity.value,
    transform: [{ translateY: tagShift.value }],
  }));

  return (
    <Animated.View style={[styles.fill, styles.white, screenStyle]} pointerEvents="none">
      <View style={styles.centerLockup}>
        {/* Centered icon with no glow/burgundy background */}
        <View style={[styles.iconWrap, { width: iconSize, height: iconSize }]}>
          <Animated.View style={iconStyle}>
            <Image source={ICON} style={{ width: iconSize, height: iconSize }} resizeMode="contain" />
          </Animated.View>
        </View>

        {/* Wordmark below the icon */}
        <Animated.View style={[styles.wordWrap, wordStyle]}>
          <Text style={[styles.word, { fontSize: isTablet ? 52 : 40, color: METALLIC }]}>CAPALY</Text>
          <Animated.View style={[styles.sweep, sweepStyle]} />
        </Animated.View>
      </View>

      <Animated.View style={[styles.tagWrap, tagStyle]}>
        <Text style={[styles.tag, { fontSize: isTablet ? 15 : 12 }]}>
          Safety • Compliance • CAPA • Inspections
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', zIndex: 999 },
  white: { backgroundColor: '#FFFFFF' },
  centerLockup: { alignItems: 'center', justifyContent: 'center' },
  iconWrap: { alignItems: 'center', justifyContent: 'center' },
  wordWrap: { marginTop: 8, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  word: { fontWeight: '900', letterSpacing: 2 },
  sweep: {
    position: 'absolute',
    top: -10,
    bottom: -10,
    width: 46,
    backgroundColor: 'rgba(255,255,255,0.65)',
  },
  tagWrap: { position: 'absolute', bottom: '24%' },
  tag: { color: '#6B7280', fontWeight: '600', letterSpacing: 1, textAlign: 'center' },
});
