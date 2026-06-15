import React, { useState } from 'react';
import { View, Pressable, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useAccent } from '../../theme/accent';
import Text from './Text';
import { formatDate } from '../../utils/format';

// Date picker field. `value` is an ISO string or Date; `onChange` returns an ISO string.
export default function DateField({ label, value, onChange, error, maximumDate, leftIcon }) {
  const { colors, radius } = useTheme();
  const accent = useAccent();
  const [show, setShow] = useState(false);
  const current = value ? new Date(value) : new Date();

  const handle = (event, date) => {
    if (Platform.OS === 'android') setShow(false);
    if (event?.type === 'dismissed') return;
    if (date) onChange(date.toISOString());
  };

  return (
    <View style={styles.wrap}>
      {label ? <Text variant="small" color="textMuted" style={styles.label}>{label}</Text> : null}
      <Pressable
        onPress={() => setShow(true)}
        style={[styles.field, { backgroundColor: colors.inputBg, borderColor: error ? colors.danger : show ? accent : colors.border, borderRadius: radius.md }]}
      >
        <View style={styles.leftIcon}>{leftIcon || <Calendar size={18} color={show ? accent : colors.textMuted} />}</View>
        <Text variant="body" color={value ? 'text' : 'textFaint'} style={{ flex: 1 }}>
          {value ? formatDate(value) : 'Select date'}
        </Text>
      </Pressable>
      {error ? <Text variant="caption" color="danger" style={styles.error}>{error}</Text> : null}
      {show ? (
        <DateTimePicker
          value={current}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={maximumDate}
          onChange={handle}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { marginBottom: 6, marginLeft: 2 },
  field: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, paddingHorizontal: 14, minHeight: 52 },
  leftIcon: { marginRight: 10 },
  error: { marginTop: 5, marginLeft: 2 },
});
