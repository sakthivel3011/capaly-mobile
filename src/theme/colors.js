// CAPALY Design System — shared brand tokens + light/dark palettes.
// Two curated palettes:
//   LIGHT  — deep red primary (#861211) + teal secondary (#2B7574) on a warm
//            neutral canvas (#E2E2E0); clean, minimal, enterprise.
//   DARK   — true-black canvas (#000000) with navy depth cards (#14213D) and a
//            signature gold accent (#FCA311).
// Severity colors stay constant across themes for instant recognition.

export const BRAND = {
  primary: '#861211',
  accent: '#2B7574',
  navy: '#0E2931',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#DC2626',
  info: '#2B7574',
};

// Severity / priority colors used for incidents, notifications and badges.
export const SEVERITY = {
  Critical: '#DC2626',
  High: '#EA580C',
  Medium: '#F59E0B',
  Low: '#16A34A',
  Info: '#64748B',
};

// LIGHT MODE palette — #E2E2E0 / #861211 / #2B7574 / #12484C / #0E2931.
// Cards use clean white for readability ("clean, minimal, not colorful");
// the dark teal (#12484C / navy #0E2931) is used for deep accents/heroes.
export const lightColors = {
  ...BRAND,
  mode: 'light',
  background: '#E2E2E0',
  surface: '#FFFFFF',
  surfaceAlt: '#EDEDEA',
  card: '#FFFFFF',
  deep: '#12484C',
  border: '#D4D4D0',
  borderStrong: '#BCBCB6',
  text: '#0E2931',
  textMuted: '#4B5C5F',
  textFaint: '#8A9699',
  icon: '#0E2931',
  inputBg: '#FFFFFF',
  overlay: 'rgba(14, 41, 49, 0.45)',
  shadow: '#0E2931',
  successBg: '#DCFCE7',
  warningBg: '#FEF3C7',
  dangerBg: '#FBE3E0',
  primaryBg: '#F4E3E2',
  accentBg: '#E0EFEE',
};

// DARK MODE palette — true-black theme.
// Pure-black canvas, near-black elevated cards, pure-white text + light icons,
// with a BLUE primary and a YELLOW accent for highlighted icons/actions.
export const darkColors = {
  ...BRAND,
  mode: 'dark',
  primary: '#3B82F6',  // blue — primary actions / active state
  accent: '#FACC15',   // yellow — highlighted icons / accents
  navy: '#0A0A0A',
  background: '#000000',   // all black
  surface: '#101012',      // elevated panels
  surfaceAlt: '#1C1C20',   // chips / secondary buttons
  card: '#101012',         // cards just above the black canvas
  deep: '#0A0A0A',
  border: '#26262B',
  borderStrong: '#3A3A42',
  text: '#FFFFFF',         // white text
  textMuted: '#CBCBD4',    // light grey
  textFaint: '#8A8A93',
  icon: '#FFFFFF',         // light icons
  inputBg: '#141417',
  overlay: 'rgba(0, 0, 0, 0.78)',
  shadow: '#000000',
  successBg: '#0F2A1B',
  warningBg: '#2A2210',
  dangerBg: '#2A1414',
  primaryBg: '#10233F',
  accentBg: '#2C2810',
};
