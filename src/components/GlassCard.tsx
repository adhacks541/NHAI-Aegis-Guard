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
  // Extract alignment styles to pass them down to the content wrapper
  const contentAlignStyle = style ? {
    alignItems: style.alignItems,
    justifyContent: style.justifyContent
  } : undefined;

  return (
    <View style={[GlobalStyles.glassCard, style]}>
      {title && (
        <View style={styles.headerRow}>
          <Text style={styles.titleText}>{title}</Text>
          {headerRight && <View style={styles.headerRightContainer}>{headerRight}</View>}
        </View>
      )}
      <View style={[styles.content, contentAlignStyle]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 8,
    marginBottom: 12,
  },
  titleText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Theme.colors.textWhite,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    flex: 1,
  },
  headerRightContainer: {
    marginLeft: 8,
  },
  content: {
    width: '100%',
  }
});

export default GlassCard;
