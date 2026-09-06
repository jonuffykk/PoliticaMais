export function Logo({ size = 24 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} role="img" aria-label="Politica+">
      <rect x="1.4" y="3.2" width="14.6" height="3.2" rx="1.6" fill="currentColor" />
      <rect x="1.4" y="8.8" width="10.4" height="3.2" rx="1.6" fill="currentColor" />
      <rect x="1.4" y="14.4" width="6.2" height="3.2" rx="1.6" fill="currentColor" />
      <rect x="13" y="14.55" width="8.2" height="2.9" rx="1.45" fill="var(--warning)" />
      <rect x="15.65" y="11.9" width="2.9" height="8.2" rx="1.45" fill="var(--warning)" />
    </svg>
  )
}
