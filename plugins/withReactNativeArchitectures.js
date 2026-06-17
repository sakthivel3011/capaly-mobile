// Local Expo config plugin: restrict the native ABIs the Android build compiles.
//
// A default EAS "universal" APK ships native libraries for FOUR ABIs
// (armeabi-v7a, arm64-v8a, x86, x86_64). The x86/x86_64 variants only matter for
// emulators, and 32-bit armeabi-v7a is effectively dead on modern phones — yet
// together they roughly double the APK size. Building for arm64-v8a only is the
// single biggest size reduction for a directly-downloaded beta APK.
//
// This is set via the `reactNativeArchitectures` Gradle property, which React
// Native uses to decide which ABIs to build for. Override the abis arg in
// app.json if you ever need to add armeabi-v7a back for old 32-bit devices.
const { withGradleProperties } = require('@expo/config-plugins');

module.exports = function withReactNativeArchitectures(config, { abis = 'arm64-v8a' } = {}) {
  return withGradleProperties(config, (cfg) => {
    const key = 'reactNativeArchitectures';
    const props = cfg.modResults.filter(
      (item) => !(item.type === 'property' && item.key === key)
    );
    props.push({ type: 'property', key, value: abis });
    cfg.modResults = props;
    return cfg;
  });
};
