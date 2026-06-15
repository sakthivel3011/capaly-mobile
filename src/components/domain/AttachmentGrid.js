import React from 'react';
import { View, Pressable, Linking, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { FileText } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import Text from '../ui/Text';
import { resolveImageUrl } from '../../utils/format';

const isImage = (a) => {
  const t = (a.mimeType || a.fileType || a.type || '').toLowerCase();
  const name = (a.fileName || a.name || a.url || '').toLowerCase();
  return t.startsWith('image') || /\.(png|jpe?g|webp|gif)$/.test(name);
};

// Image thumbnails + document chips for incident/CAPA/inspection attachments.
export default function AttachmentGrid({ attachments = [] }) {
  const { colors, radius } = useTheme();
  const images = attachments.filter(isImage);
  const docs = attachments.filter((a) => !isImage(a));

  const open = (a) => {
    const url = resolveImageUrl(a);
    if (url) Linking.openURL(url).catch(() => {});
  };

  return (
    <View>
      {images.length ? (
        <View style={styles.grid}>
          {images.map((a, i) => (
            <Pressable key={i} onPress={() => open(a)} style={[styles.thumbWrap, { borderColor: colors.border, borderRadius: radius.md }]}>
              <Image source={{ uri: resolveImageUrl(a) }} style={styles.thumb} contentFit="cover" transition={150} />
            </Pressable>
          ))}
        </View>
      ) : null}
      {docs.map((a, i) => (
        <Pressable key={i} onPress={() => open(a)} style={[styles.doc, { backgroundColor: colors.surfaceAlt, borderRadius: radius.md }]}>
          <FileText size={18} color={colors.primary} />
          <Text variant="small" color="text" numberOfLines={1} style={styles.docName}>
            {a.fileName || a.name || 'Document'}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  thumbWrap: { width: 84, height: 84, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth },
  thumb: { width: '100%', height: '100%' },
  doc: { flexDirection: 'row', alignItems: 'center', padding: 12, marginTop: 8 },
  docName: { flex: 1, marginLeft: 10 },
});
