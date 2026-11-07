import { useColorScheme } from 'react-native';

// Cores por tema (o app segue o tema claro/escuro do aparelho).
// Versão simples; será substituída por um tema de verdade depois.
export const palette = {
  light: {
    background: '#ffffff',
    text: '#111111',
    muted: '#666666',
    border: '#cccccc',
    error: '#b00020',
    primary: '#0a7aff',
    onPrimary: '#ffffff',
    input: '#f2f2f7',
  },
  dark: {
    background: '#000000',
    text: '#ffffff',
    muted: '#aaaaaa',
    border: '#333333',
    error: '#ff6b6b',
    primary: '#0a84ff',
    onPrimary: '#ffffff',
    input: '#1c1c1e',
  },
};

export function useColors() {
  return palette[useColorScheme() === 'dark' ? 'dark' : 'light'];
}
