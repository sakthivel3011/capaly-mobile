import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Camera, ImageIcon, FileUp, X, FileText } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useToast } from '../feedback/ToastProvider';
import Text from '../ui/Text';

// Multi-source attachment picker (camera / gallery / files) with previews.
// Images + documents only — video is not offered (PLAN.md upload rules).
// `value` is an array of { uri, name, mimeType, isImage }; `onChange` replaces it.
export default function AttachmentPicker({ value = [], onChange, max = 6 }) {
  const { colors, radius } = useTheme();
  const toast = useToast();

  const add = (file) => {
    if (value.length >= max) {
      toast.warning(`You can attach up to ${max} files.`);
      return;
    }
    onChange([...value, file]);
  };

  const remove = (idx) => onChange(value.filter((_, i) => i !== idx));

  const pickCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return toast.warning('Camera permission is required.');
    const res = await ImagePicker.launchCameraAsync({ quality: 0.6, mediaTypes: ['images'] });
    if (!res.canceled) {
      const a = res.assets[0];
      add({ uri: a.uri, name: a.fileName || `photo_${Date.now()}.jpg`, mimeType: a.mimeType || 'image/jpeg', isImage: true });
    }
  };

  const pickGallery = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.6, mediaTypes: ['images'] });
    if (!res.canceled) {
      const a = res.assets[0];
      add({ uri: a.uri, name: a.fileName || `image_${Date.now()}.jpg`, mimeType: a.mimeType || 'image/jpeg', isImage: true });
    }
  };

  const pickDoc = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      copyToCacheDirectory: true,
    });
    if (!res.canceled) {
      const a = res.assets[0];
      add({ uri: a.uri, name: a.name || `doc_${Date.now()}`, mimeType: a.mimeType || 'application/pdf', isImage: false });
    }
  };

  const SourceBtn = ({ icon: Icon, label, onPress }) => (
    <Pressable onPress={onPress} style={[styles.source, { backgroundColor: colors.surfaceAlt, borderRadius: radius.md }]}>
      <Icon size={20} color={colors.primary} />
      <Text variant="caption" color="textMuted" style={{ marginTop: 6 }}>{label}</Text>
    </Pressable>
  );

  return (
    <View>
      <View style={styles.sources}>
        <SourceBtn icon={Camera} label="Camera" onPress={pickCamera} />
        <SourceBtn icon={ImageIcon} label="Gallery" onPress={pickGallery} />
        <SourceBtn icon={FileUp} label="Files" onPress={pickDoc} />
      </View>

      {value.length ? (
        <View style={styles.previews}>
          {value.map((f, i) => (
            <View key={i} style={[styles.preview, { borderColor: colors.border, borderRadius: radius.md }]}>
              {f.isImage ? (
                <Image source={{ uri: f.uri }} style={styles.previewImg} contentFit="cover" />
              ) : (
                <View style={[styles.docPreview, { backgroundColor: colors.surfaceAlt }]}>
                  <FileText size={22} color={colors.primary} />
                  <Text variant="caption" color="textMuted" numberOfLines={2} style={styles.docName}>{f.name}</Text>
                </View>
              )}
              <Pressable onPress={() => remove(i)} style={[styles.removeBtn, { backgroundColor: colors.danger }]}>
                <X size={12} color="#fff" />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sources: { flexDirection: 'row', gap: 10 },
  source: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  previews: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  preview: { width: 84, height: 84, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  previewImg: { width: '100%', height: '100%' },
  docPreview: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', padding: 4 },
  docName: { textAlign: 'center', marginTop: 4 },
  removeBtn: { position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
