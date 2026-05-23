import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../theme/designSystem';

export type StatusType = 'primary' | 'success' | 'warning' | 'danger' | 'muted';

interface StatusPillProps {
  label: string;
  type?: StatusType;
}

export const StatusPill: React.FC<StatusPillProps> = ({ label, type = 'primary' }) => {
  const getColors = () => {
    switch (type) {
      case 'success':
        return { text: Theme.colors.success, bg: 'rgba(0, 255, 157, 0.12)', border: 'rgba(0, 255, 157, 0.3)' };
      case 'warning':
        return { text: Theme.colors.warning, bg: 'rgba(255, 184, 0, 0.12)', border: 'rgba(255, 184, 0, 0.3)' };
      case 'danger':
        return { text: Theme.colors.danger, bg: 'rgba(255, 0, 122, 0.12)', border: 'rgba(255, 0, 122, 0.3)' };
      case 'muted':
        return { text: Theme.colors.textMuted, bg: 'rgba(142, 155, 176, 0.12)', border: 'rgba(142, 155, 176, 0.3)' };
      case 'primary':
      default:
        return { text: Theme.colors.primary, bg: 'rgba(0, 212, 255, 0.12)', border: 'rgba(0, 212, 255, 0.3)' };
    }
  };

  const colors = getColors();

  return (
    <View style={[styles.pill, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <Text style={[styles.text, { color: colors.text }]}>{label.toUpperCase()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  text: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: Theme.fonts.mono,
    letterSpacing: 1,
  }
});
export default StatusPill;
