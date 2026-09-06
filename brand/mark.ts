export const brand = {
  name: 'Politica+',
  tagline: 'Política brasileira com fonte',
  bg: '#0B1B33',
  bgTop: '#123566',
  bgBottom: '#0A1729',
  ink: '#FFFFFF',
  accent: '#F2B33D',
  surface: '#F6F8FB',
}

function glyph(size: number, ink: string, accent: string) {
  const u = size / 24
  const r = 1.6 * u
  const bars = [
    { y: 4.8, w: 14.6 },
    { y: 10.4, w: 10.4 },
    { y: 16, w: 6.2 },
  ]
  const rows = bars
    .map(
      (bar) =>
        `<rect x="${(1.4 * u).toFixed(3)}" y="${((bar.y - 1.6) * u).toFixed(3)}" width="${(bar.w * u).toFixed(3)}" height="${(3.2 * u).toFixed(3)}" rx="${r.toFixed(3)}" fill="${ink}"/>`,
    )
    .join('')
  const cx = 17.1 * u
  const cy = 16 * u
  const arm = 8.2 * u
  const thickness = 2.9 * u
  const plus =
    `<rect x="${(cx - arm / 2).toFixed(3)}" y="${(cy - thickness / 2).toFixed(3)}" width="${arm.toFixed(3)}" height="${thickness.toFixed(3)}" rx="${(thickness / 2).toFixed(3)}" fill="${accent}"/>` +
    `<rect x="${(cx - thickness / 2).toFixed(3)}" y="${(cy - arm / 2).toFixed(3)}" width="${thickness.toFixed(3)}" height="${arm.toFixed(3)}" rx="${(thickness / 2).toFixed(3)}" fill="${accent}"/>`
  return rows + plus
}

function backdrop(size: number, radius: number) {
  return `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${brand.bgTop}"/><stop offset="1" stop-color="${brand.bgBottom}"/></linearGradient></defs><rect width="${size}" height="${size}" rx="${radius}" fill="url(#g)"/>`
}

function centred(size: number, box: number, inner: string) {
  const offset = (size - box) / 2
  return `<g transform="translate(${offset.toFixed(3)} ${offset.toFixed(3)})">${inner}</g>`
}

export function markSvg(size = 512) {
  const box = size * 0.62
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="${brand.name}">${backdrop(size, size * 0.22)}${centred(size, box, glyph(box, brand.ink, brand.accent))}</svg>`
}

export function maskableSvg(size = 512) {
  const box = size * 0.46
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${backdrop(size, 0)}${centred(size, box, glyph(box, brand.ink, brand.accent))}</svg>`
}

export function foregroundSvg(size = 432) {
  const box = size * 0.42
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${centred(size, box, glyph(box, brand.ink, brand.accent))}</svg>`
}

export function monoSvg(size = 512, ink = brand.bg) {
  const box = size * 0.72
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${centred(size, box, glyph(box, ink, ink))}</svg>`
}

export function ogSvg(width = 1200, height = 630) {
  const box = 176
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${brand.bgTop}"/><stop offset="1" stop-color="${brand.bgBottom}"/></linearGradient></defs><rect width="${width}" height="${height}" fill="url(#g)"/><g transform="translate(96 168)">${glyph(box, brand.ink, brand.accent)}</g><text x="96" y="426" font-family="Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-size="76" font-weight="700" fill="${brand.ink}">${brand.name}</text><text x="96" y="490" font-family="Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-size="34" fill="#9DB4D6">${brand.tagline}</text></svg>`
}
