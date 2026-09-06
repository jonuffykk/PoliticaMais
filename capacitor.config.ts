import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.politicamais.app',
  appName: 'Politica+',
  webDir: 'out',
  android: {
    allowMixedContent: false,
    backgroundColor: '#0B1B33',
  },
  server: {
    androidScheme: 'https',
    cleartext: false,
    allowNavigation: [],
  },
}

export default config
