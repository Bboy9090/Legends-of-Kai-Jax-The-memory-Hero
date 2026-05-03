import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bobbyblanco.legendsofkaijax',
  appName: 'Legends of Kai-Jax',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
