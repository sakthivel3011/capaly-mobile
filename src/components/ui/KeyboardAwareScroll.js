import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Keyboard } from 'react-native';

// Shared scroll container that lifts form fields above the on-screen keyboard.
// iOS uses `padding` behaviour; on Android (window already resizes) we add bottom
// padding equal to the keyboard height so the content can scroll the focused
// field into view instead of leaving it hidden behind the keyboard.
export default function KeyboardAwareScroll({
  children,
  style,
  contentContainerStyle,
  scrollRef,
  keyboardVerticalOffset = 0,
  ...props
}) {
  const innerRef = useRef(null);
  const ref = scrollRef || innerRef;
  const [kbPad, setKbPad] = useState(0);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (e) => setKbPad(e.endCoordinates?.height || 0));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKbPad(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      style={[{ flex: 1 }, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <ScrollView
        ref={ref}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          contentContainerStyle,
          Platform.OS === 'android' && kbPad ? { paddingBottom: kbPad + 24 } : null,
        ]}
        {...props}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Convenience: scroll a freshly-focused input into view. Pass as the field's
// `onFocus` together with a shared scrollRef.
export const scrollFocusedIntoView = (ref) => () => {
  setTimeout(() => ref?.current?.scrollToEnd?.({ animated: true }), 120);
};
