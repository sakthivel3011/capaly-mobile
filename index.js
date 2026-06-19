import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import App from './App';

// Silence noisy console output in production/release builds. __DEV__ is true only
// under the Expo dev server, so logs stay available while developing and are
// stripped from Play Store builds. console.error is kept for crash diagnostics.
if (!__DEV__) {
  const noop = () => {};
  console.log = noop;
  console.info = noop;
  console.debug = noop;
  console.warn = noop;
}

registerRootComponent(App);
