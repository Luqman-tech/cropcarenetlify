// Colors
export const COLORS = {
  // Primary colors
  primary: '#2E7D32', // Green for agriculture theme
  primaryLight: '#4CAF50',
  primaryDark: '#1B5E20',
  
  // Secondary colors
  secondary: '#FF9800', // Orange for warnings/alerts
  secondaryLight: '#FFB74D',
  secondaryDark: '#F57C00',
  
  // Status colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Grayscale
  white: '#FFFFFF',
  lightGray: '#F5F5F5',
  gray: '#9E9E9E',
  darkGray: '#424242',
  black: '#000000',
  
  // Background colors
  background: '#FAFAFA',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  
  // Text colors
  textPrimary: '#212121',
  textSecondary: '#757575',
  textDisabled: '#BDBDBD',
  
  // Border colors
  border: '#E0E0E0',
  divider: '#EEEEEE',
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.1)',
  
  // Disease severity colors
  severityHigh: '#F44336',
  severityMedium: '#FF9800',
  severityLow: '#FFC107',
  severityNone: '#4CAF50',
  
  // Crop type colors
  cropApple: '#E53935',
  cropTomato: '#F44336',
  cropCorn: '#FFC107',
  cropPotato: '#8D6E63',
  cropGrape: '#9C27B0',
  cropPeach: '#FF9800',
  cropCherry: '#E91E63',
  cropPepper: '#FF5722',
  cropStrawberry: '#E91E63',
};

// Fonts
export const FONTS = {
  // Font families
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System',
  
  // Font weights
  weight: {
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
};

// Sizes
export const SIZES = {
  // Base sizes
  base: 8,
  small: 12,
  font: 14,
  medium: 16,
  large: 18,
  extraLarge: 24,
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Border radius
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 50,
  },
  
  // Shadows
  shadow: {
    small: {
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  
  // Screen dimensions
  screen: {
    width: 375, // Default iPhone width
    height: 812, // Default iPhone height
  },
};

// Typography
export const TYPOGRAPHY = {
  // Headings
  h1: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    lineHeight: 40,
    color: COLORS.textPrimary,
  },
  h2: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    lineHeight: 36,
    color: COLORS.textPrimary,
  },
  h3: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    lineHeight: 32,
    color: COLORS.textPrimary,
  },
  h4: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    lineHeight: 28,
    color: COLORS.textPrimary,
  },
  h5: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    lineHeight: 24,
    color: COLORS.textPrimary,
  },
  h6: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    lineHeight: 22,
    color: COLORS.textPrimary,
  },
  
  // Body text
  body1: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    lineHeight: 24,
    color: COLORS.textPrimary,
  },
  body2: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  
  // Caption
  caption: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    lineHeight: 16,
    color: COLORS.textSecondary,
  },
  
  // Button text
  button: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    lineHeight: 24,
    color: COLORS.white,
  },
};

// Layout
export const LAYOUT = {
  // Container padding
  container: {
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.md,
  },
  
  // Card styles
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.md,
    ...SIZES.shadow.small,
  },
  
  // Button styles
  button: {
    primary: {
      backgroundColor: COLORS.primary,
      borderRadius: SIZES.radius.md,
      paddingVertical: SIZES.spacing.md,
      paddingHorizontal: SIZES.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondary: {
      backgroundColor: COLORS.secondary,
      borderRadius: SIZES.radius.md,
      paddingVertical: SIZES.spacing.md,
      paddingHorizontal: SIZES.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: COLORS.primary,
      borderRadius: SIZES.radius.md,
      paddingVertical: SIZES.spacing.md,
      paddingHorizontal: SIZES.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
  },
  
  // Input styles
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius.md,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    fontSize: SIZES.font,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
  },
};

// Animation
export const ANIMATION = {
  // Duration
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  
  // Easing
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// Icons
export const ICONS = {
  // Sizes
  size: {
    xs: 12,
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
  },
  
  // Colors
  color: {
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    success: COLORS.success,
    warning: COLORS.warning,
    error: COLORS.error,
    info: COLORS.info,
    gray: COLORS.gray,
    white: COLORS.white,
  },
};

// Disease severity
export const SEVERITY = {
  high: {
    color: COLORS.severityHigh,
    backgroundColor: '#FFEBEE',
    borderColor: COLORS.severityHigh,
  },
  medium: {
    color: COLORS.severityMedium,
    backgroundColor: '#FFF3E0',
    borderColor: COLORS.severityMedium,
  },
  low: {
    color: COLORS.severityLow,
    backgroundColor: '#FFFDE7',
    borderColor: COLORS.severityLow,
  },
  none: {
    color: COLORS.severityNone,
    backgroundColor: '#E8F5E8',
    borderColor: COLORS.severityNone,
  },
};

// Crop types
export const CROPS = {
  apple: {
    name: 'Apple',
    icon: '🍎',
    color: COLORS.cropApple,
  },
  tomato: {
    name: 'Tomato',
    icon: '🍅',
    color: COLORS.cropTomato,
  },
  corn: {
    name: 'Corn',
    icon: '🌽',
    color: COLORS.cropCorn,
  },
  potato: {
    name: 'Potato',
    icon: '🥔',
    color: COLORS.cropPotato,
  },
  grape: {
    name: 'Grape',
    icon: '🍇',
    color: COLORS.cropGrape,
  },
  peach: {
    name: 'Peach',
    icon: '🍑',
    color: COLORS.cropPeach,
  },
  cherry: {
    name: 'Cherry',
    icon: '🍒',
    color: COLORS.cropCherry,
  },
  pepper: {
    name: 'Pepper',
    icon: '🌶️',
    color: COLORS.cropPepper,
  },
  strawberry: {
    name: 'Strawberry',
    icon: '🍓',
    color: COLORS.cropStrawberry,
  },
};

// Disease types
export const DISEASE_TYPES = {
  fungal: {
    name: 'Fungal',
    icon: '🍄',
    color: '#8D6E63',
  },
  bacterial: {
    name: 'Bacterial',
    icon: '🦠',
    color: '#E91E63',
  },
  viral: {
    name: 'Viral',
    icon: '🦠',
    color: '#9C27B0',
  },
  pest: {
    name: 'Pest',
    icon: '🐛',
    color: '#795548',
  },
  healthy: {
    name: 'Healthy',
    icon: '✅',
    color: COLORS.success,
  },
};

export default {
  COLORS,
  FONTS,
  SIZES,
  TYPOGRAPHY,
  LAYOUT,
  ANIMATION,
  ICONS,
  SEVERITY,
  CROPS,
  DISEASE_TYPES,
}; 