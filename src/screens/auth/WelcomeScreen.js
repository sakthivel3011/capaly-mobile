import React, { useState } from 'react';
import { View, Pressable, StyleSheet, Linking, useWindowDimensions, ActivityIndicator } from 'react-native';
import { Building2, User, ArrowRight, Sparkles } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuthStore } from '../../store/authStore';
import Text from '../../components/ui/Text';

// Mobile app is for field users only — Department and Employee portals.
// Each portal carries its own brand accent.
const PORTALS = [
  { key: 'department', title: 'Department Portal', subtitle: 'Safety, Maintenance & Auditors', icon: Building2, route: 'CompanySelect', color: '#008062', colorDark: '#00674e' },
  { key: 'employee', title: 'Employee Portal', subtitle: 'Report & track incidents', icon: User, route: 'CompanySelect', color: '#0d419d', colorDark: '#0a3179' },
];

export default function WelcomeScreen({ navigation }) {
  const { colors, radius, shadow } = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const imageHeight = Math.round(height * 0.56); // image takes more than half
  const startDemo = useAuthStore((s) => s.startDemo);
  const [demoLoading, setDemoLoading] = useState(null); // 'employee' | 'department'

  const tryDemo = async (portal) => {
    setDemoLoading(portal);
    try {
      await startDemo(portal === 'department' ? 'DEPARTMENT' : 'EMPLOYEE');
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <View style={[styles.flex, { backgroundColor: '#FFFFFF' }]}>
      {/* Full-bleed hero image */}
      <Image
        source={require('../../../assets/2.png')}
        style={[styles.heroImg, { height: imageHeight }]}
        contentFit="cover"
      />
      {/* fade the bottom of the image into the white sheet */}
      <LinearGradient
        pointerEvents="none"
        colors={['transparent', 'rgba(255,255,255,0.7)', '#FFFFFF']}
        style={[styles.fade, { top: imageHeight - 90 }]}
      />

      {/* Overlapping white sheet with the portal chooser */}
      <View style={[styles.sheet, { marginTop: imageHeight - 36 }]}>
        <Text style={[styles.choose, { color: colors.text }]}>Choose your portal</Text>
        <Text style={[styles.chooseSub, { color: colors.textMuted }]}>
          Sign in to the workspace built for your role
        </Text>

        {PORTALS.map((p, i) => {
          const Icon = p.icon;
          return (
            <Animated.View key={p.key} entering={FadeInDown.delay(120 + i * 110).springify().damping(15)}>
              <Pressable
                onPress={() => navigation.navigate(p.route, { portal: p.key })}
                style={({ pressed }) => [
                  styles.card,
                  { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.lg },
                  shadow(),
                  pressed && { transform: [{ scale: 0.98 }], opacity: 0.97 },
                ]}
              >
                <View style={[styles.iconTile, { backgroundColor: `${p.color}14` }]}>
                  <Icon size={26} color={p.color} />
                </View>
                <View style={styles.cardBody}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{p.title}</Text>
                  <Text style={[styles.cardSub, { color: colors.textMuted }]}>{p.subtitle}</Text>
                </View>
                <LinearGradient
                  colors={[p.color, p.colorDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.go}
                >
                  <ArrowRight size={18} color="#fff" />
                </LinearGradient>
              </Pressable>
            </Animated.View>
          );
        })}

        {/* Demo / beta — explore with no login or backend */}
        <View style={[styles.demoDivider, { backgroundColor: colors.border }]} />
        <Pressable
          onPress={() => tryDemo('employee')}
          disabled={!!demoLoading}
          style={({ pressed }) => [
            styles.demoBtn,
            { borderColor: '#0d419d', borderRadius: radius.lg },
            pressed && { opacity: 0.85 },
            demoLoading && { opacity: 0.6 },
          ]}
        >
          {demoLoading === 'employee' ? (
            <ActivityIndicator color="#0d419d" />
          ) : (
            <>
              <Sparkles size={18} color="#0d419d" />
              <Text style={[styles.demoBtnText, { color: '#0d419d' }]}>Explore the demo — no login needed</Text>
            </>
          )}
        </Pressable>
        <Pressable onPress={() => tryDemo('department')} disabled={!!demoLoading} hitSlop={8} style={styles.demoDeptLink}>
          <Text style={[styles.demoDeptText, { color: colors.textMuted }]}>
            {demoLoading === 'department' ? 'Loading…' : 'or preview the Department portal'}
          </Text>
        </Pressable>

        <View style={styles.spacer} />

        {/* Footer */}
        <View style={[styles.footerContainer, { marginBottom: insets.bottom + 8 }]}>
          <View style={styles.madeIn}>
            <Text style={styles.madeInText}>Made in India</Text>
            <Text style={styles.flag}>🇮🇳</Text>
          </View>
          <Text style={[styles.footer, { color: colors.textFaint }]}>
            Secured with encrypted sessions · CAPALY © {new Date().getFullYear()}
          </Text>
          <View style={styles.legalLinks}>
            <Text
              style={[styles.legalLink, { color: '#0d419d' }]}
              onPress={() => Linking.openURL('https://capaly.com/terms').catch((err) => console.error(err))}
            >
              Terms & Conditions
            </Text>
            <Text style={[styles.separator, { color: colors.textFaint }]}>•</Text>
            <Text
              style={[styles.legalLink, { color: '#0d419d' }]}
              onPress={() => Linking.openURL('https://capaly.com/privacy').catch((err) => console.error(err))}
            >
              Privacy Policy
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  heroImg: { position: 'absolute', top: 0, left: 0, right: 0 },
  fade: { position: 'absolute', left: 0, right: 0, height: 130 },
  sheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 26,
  },
  choose: { fontSize: 23, fontWeight: '700', marginLeft: 4 },
  chooseSub: { fontSize: 13, fontWeight: '400', marginLeft: 4, marginTop: 4, marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  iconTile: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, marginLeft: 16 },
  cardTitle: { fontSize: 16.5, fontWeight: '700' },
  cardSub: { fontSize: 12.5, marginTop: 3 },
  go: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  demoDivider: { height: StyleSheet.hairlineWidth, marginTop: 4, marginBottom: 14, marginHorizontal: 4 },
  demoBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 13, borderWidth: 1.5, borderStyle: 'dashed',
  },
  demoBtnText: { fontSize: 14, fontWeight: '700' },
  demoDeptLink: { alignItems: 'center', paddingVertical: 10 },
  demoDeptText: { fontSize: 12.5, fontWeight: '600', textDecorationLine: 'underline' },
  spacer: { flex: 1, minHeight: 8 },
  footerContainer: { alignItems: 'center', justifyContent: 'center' },
  madeIn: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  madeInText: { fontSize: 12.5, fontWeight: '700', color: '#0d419d', letterSpacing: 0.5 },
  flag: { fontSize: 14 },
  footer: { textAlign: 'center', fontSize: 11 },
  legalLinks: { flexDirection: 'row', justifyContent: 'center', marginTop: 6, alignItems: 'center' },
  legalLink: { textDecorationLine: 'underline', fontSize: 11 },
  separator: { marginHorizontal: 6, fontSize: 11 },
});
