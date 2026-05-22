import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../theme/designSystem';

interface MetricMeterProps {
  label: string;
  value: number; // raw value
  progress: number; // 0 to 1
  unit?: string;
  color?: string;
  isSatisfied?: boolean;
}

export const MetricMeter: React.FC<MetricMeterProps> = ({
  label,
  value,
  progress,
  unit = '',
  color = Theme.colors.primary,
  isSatisfied = false
}) => {
  const displayColor = isSatisfied ? Theme.colors.success : color;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.val, { color: displayColor }]}>
          {value.toFixed(2)}
          {unit} {isSatisfied ? '✓' : ''}
        </Text>
      </View>
      <View style={styles.track}>
        <View 
          style={[
            styles.fill, 
            { 
              width: `${Math.min(100, progress * 100)}%`, 
              backgroundColor: displayColor,
              shadowColor: displayColor
            }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    fontWeight: '500',
  },
  val: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: Theme.fonts.mono,
  },
  track: {
    height: 6,
    backgroundColor: '#182236',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  }
});
export default MetricMeter;
