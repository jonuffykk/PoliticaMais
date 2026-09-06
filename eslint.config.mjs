import coreWebVitals from 'eslint-config-next/core-web-vitals'
import typescript from 'eslint-config-next/typescript'

const config = [
  { ignores: ['.next/**', 'out/**', 'android/**', 'node_modules/**', 'public/api/**'] },
  ...coreWebVitals,
  ...typescript,
]

export default config
