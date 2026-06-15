import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeProvider';
import { useAccent } from '../../theme/accent';
import Text from '../ui/Text';

const CHART_HEIGHT = 160;
const PAD_TOP = 18;
const PAD_BOTTOM = 10;

// Build a smooth (Catmull-Rom -> cubic Bezier) path through the points.
function smoothPath(points) {
  if (points.length < 2) return '';
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`;
  }
  return d;
}

// Monthly incident trend — smooth area line graph. `data` is [{ label, count }].
export default function TrendChart({ data = [], title = 'Monthly trend' }) {
  const { colors } = useTheme();
  const LINE_COLOR = useAccent();
  const [width, setWidth] = useState(0);

  const values = data.map((d) => Number(d.count) || 0);
  const max = Math.max(1, ...values);
  const hasData = values.some((v) => v > 0);
  const total = values.reduce((a, b) => a + b, 0);

  const header = (
    <View style={styles.header}>
      <Text variant="title" style={styles.title}>{title}</Text>
      {hasData ? (
        <View style={[styles.totalPill, { backgroundColor: `${LINE_COLOR}1A` }]}>
          <Text variant="caption" style={{ color: LINE_COLOR, fontWeight: '700' }}>{total} total</Text>
        </View>
      ) : null}
    </View>
  );

  if (!hasData) {
    return (
      <View>
        {header}
        <View style={[styles.empty, { backgroundColor: colors.surfaceAlt }]}>
          <Text variant="small" color="textMuted">No trend data yet</Text>
        </View>
      </View>
    );
  }

  const innerH = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM;
  // Place each point in the centre of an equal-width column so the SVG points
  // line up exactly with the flex labels below.
  const col = data.length ? width / data.length : width;
  const points = values.map((v, i) => ({
    x: col * (i + 0.5),
    y: PAD_TOP + innerH - (v / max) * innerH,
  }));

  const linePath = points.length ? smoothPath(points) : '';
  const areaPath = points.length
    ? `${linePath} L ${points[points.length - 1].x},${CHART_HEIGHT - PAD_BOTTOM} L ${points[0].x},${CHART_HEIGHT - PAD_BOTTOM} Z`
    : '';

  return (
    <View>
      {header}

      <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 ? (
          <Svg width={width} height={CHART_HEIGHT}>
            <Defs>
              <SvgGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={LINE_COLOR} stopOpacity="0.28" />
                <Stop offset="1" stopColor={LINE_COLOR} stopOpacity="0.02" />
              </SvgGradient>
            </Defs>

            {/* horizontal grid lines */}
            {[0, 0.5, 1].map((t) => (
              <Line
                key={t}
                x1={0}
                x2={width}
                y1={PAD_TOP + innerH * t}
                y2={PAD_TOP + innerH * t}
                stroke={colors.border}
                strokeWidth={1}
                strokeDasharray="4 6"
              />
            ))}

            {points.length > 1 ? <Path d={areaPath} fill="url(#areaFill)" /> : null}
            {points.length > 1 ? (
              <Path d={linePath} stroke={LINE_COLOR} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            ) : null}

            {points.map((p, i) => (
              <Circle key={i} cx={p.x} cy={p.y} r={values[i] === max ? 5 : 3.5} fill="#fff" stroke={LINE_COLOR} strokeWidth={2.5} />
            ))}
          </Svg>
        ) : (
          <View style={{ height: CHART_HEIGHT }} />
        )}
      </View>

      <View style={styles.labels}>
        {data.map((d, i) => (
          <Text key={d.label ?? i} variant="caption" color="textFaint" numberOfLines={1} style={styles.labelText}>
            {d.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { marginBottom: 0 },
  totalPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  labels: { flexDirection: 'row', marginTop: 8 },
  labelText: { flex: 1, textAlign: 'center', fontSize: 11 },
  empty: { height: 140, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
