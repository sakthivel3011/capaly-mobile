import React, { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { Controller } from 'react-hook-form';
import { useTheme } from '../../theme/ThemeProvider';
import { useAccent } from '../../theme/accent';
import Text from './Text';

// Standalone themed text field. `leftIcon` is a lucide element; `secure` adds a
// show/hide toggle. `error` renders an inline message below the field.
export function TextField({
  label,
  value,
  onChangeText,
  onBlur,
  onFocus,
  placeholder,
  leftIcon,
  rightIcon,
  secure = false,
  error,
  multiline = false,
  keyboardType,
  autoCapitalize = 'sentences',
  autoCorrect,
  autoComplete,
  textContentType,
  importantForAutofill,
  returnKeyType,
  editable = true,
  style,
  focusBorderColor,
}) {
  const { colors, radius } = useTheme();
  const accent = useAccent();
  const [hidden, setHidden] = useState(secure);
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrap, style]}>
      {label ? (
        <Text variant="small" color="textMuted" style={styles.label}>
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.field,
          {
            backgroundColor: colors.inputBg,
            borderColor: error ? colors.danger : focused ? (focusBorderColor || accent) : colors.border,
            borderRadius: radius.md,
            minHeight: multiline ? 96 : 52,
            alignItems: multiline ? 'flex-start' : 'center',
          },
        ]}
      >
        {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => { setFocused(true); onFocus && onFocus(); }}
          onBlur={() => { setFocused(false); onBlur && onBlur(); }}
          placeholder={placeholder}
          placeholderTextColor={colors.textFaint}
          secureTextEntry={hidden}
          multiline={multiline}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          autoComplete={autoComplete}
          textContentType={textContentType}
          importantForAutofill={importantForAutofill}
          returnKeyType={returnKeyType}
          editable={editable}
          pointerEvents="auto"
          style={[
            styles.input,
            {
              color: colors.text,
              paddingTop: multiline ? 14 : 0,
              paddingBottom: multiline ? 14 : 3,
            },
          ]}
        />
        {secure ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10} style={styles.rightIcon}>
            {hidden ? <EyeOff size={18} color={colors.textMuted} /> : <Eye size={18} color={colors.textMuted} />}
          </Pressable>
        ) : rightIcon ? (
          <View style={styles.rightIcon}>{rightIcon}</View>
        ) : null}
      </View>
      {error ? (
        <Text variant="caption" color="danger" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

// react-hook-form bound field.
export function ControlledField({ control, name, rules, ...props }) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
        <TextField
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
          {...props}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { marginBottom: 6, marginLeft: 2 },
  field: { flexDirection: 'row', borderWidth: 1.5, paddingHorizontal: 14 },
  leftIcon: { marginRight: 10, alignSelf: 'center' },
  rightIcon: { marginLeft: 10, alignSelf: 'center' },
  input: { flex: 1, fontSize: 15, fontWeight: '500', paddingVertical: 0 },
  error: { marginTop: 5, marginLeft: 2 },
});
