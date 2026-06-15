// Spacing, radius, typography and shadow tokens — shared across the app.

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 20, // CAPALY default card radius
  xl: 24,
  pill: 999,
};

export const typography = {
  display: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  h1: { fontSize: 24, fontWeight: '800', letterSpacing: -0.4 },
  h2: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  h3: { fontSize: 17, fontWeight: '700' },
  title: { fontSize: 15, fontWeight: '700' },
  body: { fontSize: 14, fontWeight: '500' },
  bodyStrong: { fontSize: 14, fontWeight: '700' },
  small: { fontSize: 12, fontWeight: '600' },
  caption: { fontSize: 11, fontWeight: '600', letterSpacing: 0.2 },
};

// Soft, premium shadow — used by cards. iOS uses shadow*, Android uses elevation.
export const shadow = (color = '#0B1B45') => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.08,
  shadowRadius: 20,
  elevation: 4,
});

export const shadowSoft = (color = '#0B1B45') => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 2,
});
