import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const getButtonStyle = () => {
    const base = styles.base;
    const variantStyle = styles[variant];
    const sizeStyle = styles[`${size}Button`];
    const disabledStyle = disabled || loading ? styles.disabled : {};

    return [base, variantStyle, sizeStyle, disabledStyle, style];
  };

  const getTextStyle = () => {
    const variantTextStyle = styles[`${variant}Text`];
    const sizeTextStyle = styles[`${size}Text`];

    return [styles.text, variantTextStyle, sizeTextStyle, textStyle];
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#fff' : '#0284c7'}
          size="small"
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },

  // Variants
  primary: {
    backgroundColor: '#0284c7',
  },
  secondary: {
    backgroundColor: '#f3f4f6',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  ghost: {
    backgroundColor: 'transparent',
  },

  // Variant text
  primaryText: {
    color: '#fff',
  },
  secondaryText: {
    color: '#111827',
  },
  outlineText: {
    color: '#374151',
  },
  ghostText: {
    color: '#374151',
  },

  // Sizes
  smButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  mdButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  lgButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },

  // Size text
  smText: {
    fontSize: 12,
  },
  mdText: {
    fontSize: 14,
  },
  lgText: {
    fontSize: 16,
  },

  // Disabled
  disabled: {
    opacity: 0.5,
  },
});

export default Button;
