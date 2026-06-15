import React, { useCallback, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useFocusEffect } from '@react-navigation/native';
import { Bell, CheckCheck, AlertTriangle, Info, ShieldAlert } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { notificationApi } from '../../api/data.api';
import { apiError } from '../../api/client';
import { useToast } from '../../components/feedback/ToastProvider';
import Screen from '../../components/ui/Screen';
import AppHeader from '../../components/ui/AppHeader';
import Text from '../../components/ui/Text';
import Card from '../../components/ui/Card';
import { SkeletonList } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { timeAgo, asArray } from '../../utils/format';

const LEVEL = {
  CRITICAL: { color: '#DC2626', icon: ShieldAlert },
  HIGH: { color: '#EA580C', icon: AlertTriangle },
  MEDIUM: { color: '#F59E0B', icon: AlertTriangle },
  LOW: { color: '#2563EB', icon: Info },
  INFO: { color: '#64748B', icon: Info },
};

export default function NotificationsScreen({ navigation }) {
  const { colors, radius } = useTheme();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const res = await notificationApi.list({ limit: 50 });
      setItems(asArray(res));
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(false); }, [load]));

  const onPressItem = async (n) => {
    if (!n.isRead) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
      notificationApi.markRead(n.id).catch(() => {});
    }
    if (n.relatedModule === 'incident' && n.relatedId) {
      navigation.navigate('IncidentDetail', { id: n.relatedId });
    }
  };

  const markAll = async () => {
    try {
      await notificationApi.markAllRead();
      setItems((prev) => prev.map((x) => ({ ...x, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const renderItem = ({ item }) => {
    const lvl = LEVEL[(item.level || 'INFO').toUpperCase()] || LEVEL.INFO;
    const Icon = lvl.icon;
    return (
      <Pressable onPress={() => onPressItem(item)}>
        <Card style={[styles.card, !item.isRead && { borderColor: lvl.color, borderWidth: 1 }]}>
          <View style={styles.row}>
            <View style={[styles.iconWrap, { backgroundColor: `${lvl.color}1A` }]}>
              <Icon size={18} color={lvl.color} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <Text variant="title" numberOfLines={1} style={{ flex: 1 }}>{item.title}</Text>
                {!item.isRead ? <View style={[styles.dot, { backgroundColor: lvl.color }]} /> : null}
              </View>
              <Text variant="small" color="textMuted" style={{ marginTop: 4, lineHeight: 19 }} numberOfLines={3}>{item.message}</Text>
              <Text variant="caption" color="textFaint" style={{ marginTop: 6 }}>{timeAgo(item.createdAt)}</Text>
            </View>
          </View>
        </Card>
      </Pressable>
    );
  };

  const hasUnread = items.some((i) => !i.isRead);

  return (
    <Screen padded={false}>
      <AppHeader
        title="Notifications"
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
        right={
          hasUnread ? (
            <Pressable onPress={markAll} hitSlop={10} style={[styles.markAll, { backgroundColor: colors.surfaceAlt, borderRadius: radius.md }]}>
              <CheckCheck size={18} color={colors.primary} />
            </Pressable>
          ) : null
        }
      />
      {loading && !items.length ? (
        <View style={styles.pad}><SkeletonList count={5} /></View>
      ) : error && !items.length ? (
        <EmptyState title="Couldn't load notifications" message={error} actionTitle="Retry" onAction={() => load(false)} />
      ) : !items.length ? (
        <EmptyState icon={Bell} title="You're all caught up" message="New alerts will show up here." />
      ) : (
        <FlashList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          estimatedItemSize={110}
          contentContainerStyle={styles.list}
          onRefresh={() => load(true)}
          refreshing={refreshing}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 16, paddingTop: 8 },
  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 },
  card: { marginBottom: 10 },
  row: { flexDirection: 'row' },
  iconWrap: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginLeft: 8 },
  markAll: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
});
