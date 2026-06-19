import React, { useMemo, useState } from 'react';
import { View, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Building2, ChevronRight, ChevronLeft, X } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { authApi } from '../../api/auth.api';
import { useAsync } from '../../hooks/useAsync';
import { resolveImageUrl } from '../../utils/format';
import Text from '../../components/ui/Text';
import { TextField } from '../../components/ui/Input';
import { SkeletonList } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';

const PORTAL_META = {
  department: { label: 'Department Portal', color: '#008062', image: require('../../../assets/10.png') },
  employee: { label: 'Employee Portal', color: '#0d419d', image: require('../../../assets/11.png') },
};

export default function CompanySelectScreen({ navigation, route }) {
  const { colors, radius, shadowSoft } = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const portal = route.params?.portal || 'employee';
  const meta = PORTAL_META[portal] || PORTAL_META.employee;
  const imageHeight = Math.round(height * 0.34);

  const [query, setQuery] = useState('');

  const { data, loading, error, refresh, refreshing } = useAsync(() => authApi.loginCompanies(), [], {
    cacheKey: 'login-companies',
  });

  const companies = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      const exactCode = list.filter((c) => c.companyCode?.toLowerCase() === trimmed.toLowerCase());
      return exactCode.length > 0 ? exactCode : [];
    }
    const q = trimmed.toLowerCase();
    return list.filter((c) => c.name?.toLowerCase().includes(q) || c.companyCode?.toLowerCase().includes(q));
  }, [data, query]);

  const renderItem = ({ item }) => {
    const logo = resolveImageUrl(item.logoUrl);
    return (
      <Pressable
        onPress={() => navigation.navigate('PortalLogin', { portal, company: item })}
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.lg },
          shadowSoft(),
          pressed && { opacity: 0.9 },
        ]}
      >
        {logo ? (
          <Image source={{ uri: logo }} style={styles.logo} contentFit="contain" />
        ) : (
          <View style={[styles.logo, styles.logoFallback, { backgroundColor: `${meta.color}14` }]}>
            <Building2 size={26} color={meta.color} />
          </View>
        )}
        <View style={styles.cardBody}>
          <Text variant="title" numberOfLines={1}>{item.name}</Text>
          {item.companyCode ? <Text variant="caption" color="textMuted" numberOfLines={1} style={{ marginTop: 2 }}>{item.companyCode}</Text> : null}
        </View>
        <ChevronRight size={20} color={colors.textFaint} />
      </Pressable>
    );
  };

  return (
    <View style={[styles.flex, { backgroundColor: '#FFFFFF' }]}>
      {/* Portal hero image */}
      <Image source={meta.image} style={[styles.heroImg, { height: imageHeight }]} contentFit="cover" />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.45)']}
        style={[styles.heroOverlay, { height: imageHeight }]}
      />

      {/* Top bar over the image */}
      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.iconBtn}>
          <ChevronLeft size={22} color="#fff" />
        </Pressable>
        
      </View>

      {/* Title over the image bottom */}
      <View style={[styles.heroText, { top: imageHeight - 78 }]}>
        <Text style={styles.heroTitle}>{meta.label}</Text>
        <Text style={styles.heroSub}>Select your company to continue</Text>
      </View>

      {/* White sheet with search + list */}
      <View style={[styles.sheet, { marginTop: imageHeight - 42 }]}>
        <View style={styles.searchWrap}>
          <TextField
            placeholder="Type at least 3 letters to search…"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            leftIcon={<Search size={18} color={colors.textMuted} />}
            rightIcon={
              query.length > 0 ? (
                <Pressable onPress={() => setQuery('')} hitSlop={10}>
                  <X size={18} color={colors.textMuted} />
                </Pressable>
              ) : null
            }
            style={{ marginBottom: 0 }}
            focusBorderColor={meta.color}
            returnKeyType="search"
            onSubmitEditing={() => {
              if (companies.length > 0) navigation.navigate('PortalLogin', { portal, company: companies[0] });
            }}
          />
          {query.trim().length > 0 && query.trim().length < 3 && (
            <Text variant="caption" color="textMuted" style={{ marginTop: 6, marginLeft: 4 }}>
              Type at least 3 characters to search...
            </Text>
          )}
        </View>

        {loading ? (
          <View style={styles.listPad}><SkeletonList count={6} /></View>
        ) : error ? (
          <EmptyState title="Couldn't load companies" message={error} actionTitle="Retry" onAction={refresh} />
        ) : query.trim().length < 3 && companies.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="Search your company"
            message="Type your company code or at least 3 letters to search."
            style={{ paddingTop: 8 }}
          />
        ) : !companies.length ? (
          <EmptyState icon={Building2} title="No companies found" message="Try a different search." />
        ) : (
          <FlashList
            data={companies}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            estimatedItemSize={92}
            contentContainerStyle={styles.list}
            onRefresh={refresh}
            refreshing={refreshing}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  heroImg: { position: 'absolute', top: 0, left: 0, right: 0 },
  heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingBottom: 8 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  appIcon: { width: 34, height: 34, borderRadius: 9 },
  heroText: { position: 'absolute', left: 22, right: 22 },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 3 },
  sheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 12,
  },
  searchWrap: { paddingHorizontal: 16, paddingBottom: 12 },
  listPad: { paddingHorizontal: 16 },
  list: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 32 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 12, borderWidth: StyleSheet.hairlineWidth },
  logo: { width: 52, height: 52, borderRadius: 14 },
  logoFallback: { alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, marginLeft: 14 },
});
