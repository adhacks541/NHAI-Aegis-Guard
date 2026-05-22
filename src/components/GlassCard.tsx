import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Theme, GlobalStyles } from '../theme/designSystem';

interface GlassCardProps {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  headerRight?: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({ title, children, style, headerRight }) => {
  return (
    <View style={[GlobalStyles.glassCard, style]}>
      {title && (
        <View style={styles.headerRow}>
          <Text style={GlobalStyles.glassCardHeader}>{title}</Text>
          {headerRight && <View>{headerRight}</View>}
        </View>
      )}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  content: {
    width: '100%',
  }
});
export default GlassCard;
