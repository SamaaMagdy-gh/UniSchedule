import { Platform } from 'react-native';

export const Colors = {
  light: {
    primary: '#1a2e1a',
    secondary: '#2d6a2d',
    accent: '#f0f7f0',
    background: '#f5f7f5',
    text: '#1a1a1a',
    white: '#ffffff',
    error: '#ff5050',
    tint: '#2d6a2d', 
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#2d6a2d',
  },
  dark: {
    primary: '#2d6a2d',
    secondary: '#1a2e1a',
    accent: '#1a1a1a',
    background: '#151718',
    text: '#ECEDEE',
    white: '#ffffff',
    error: '#ff5050',
    tint: '#fff',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#fff',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif',
    mono: 'monospace',
  },
});