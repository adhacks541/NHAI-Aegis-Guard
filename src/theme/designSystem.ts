// Aegis Guard Cyberpunk Design System
import { StyleSheet, Dimensions, Platform } from 'react-native';

export const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');

export const Theme = {
  colors: {
    background: '#070A13',      // Deep void black-blue
    cardBg: 'rgba(20, 27, 45, 0.7)', // Semi-transparent card
    cardBorder: 'rgba(0, 212, 255, 0.2)', // Thin cyber cyan border
    
    // Accents
    primary: '#00D4FF',         // Electric Cyan
    secondary: '#7928CA',       // Neon Violet
    success: '#00FF9D',         // Cyber Emerald
    warning: '#FFB800',         // Neon Amber
    danger: '#FF007A',          // Cyber Hot Pink
    
    // Text
    textWhite: '#F0F4F8',       // Crisp off-white
    textMuted: '#8E9BB0',       // Darker steel gray
    textPrimary: '#00D4FF',
    
    // Borders & Overlays
    gridLine: '#131A30',
  },
  fonts: {
    mono: 'Courier New',
    sans: 'System',
  }
};

export const GlobalStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    height: Platform.OS === 'web' ? WINDOW_HEIGHT : '100%',
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.textWhite,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  categoryTracker: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Theme.colors.primary,
    letterSpacing: 2,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  // Glassmorphic containers
  glassCard: {
    backgroundColor: Theme.colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
    padding: 16,
    marginBottom: 16,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  glassCardHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.colors.textWhite,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    paddingBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // Button Styles
  buttonPrimary: {
    backgroundColor: Theme.colors.primary, // Solid Electric Cyan for maximum legibility!
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonPrimaryText: {
    color: '#070A13', // High-contrast deep dark blue for excellent readability!
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  buttonSuccess: {
    backgroundColor: Theme.colors.success, // Solid Cyber Emerald for ultimate positive feedback visibility!
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Theme.colors.success,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Theme.colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonSuccessText: {
    color: '#070A13', // High-contrast deep dark blue for excellent readability!
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
