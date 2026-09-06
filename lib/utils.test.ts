import { describe, expect, it } from 'vitest'
import { formatDate, formatNumber, formatShortDate, groupBy, initials, normalize, slugify } from './utils'

describe('slugify', () => {
  it('remove acento e normaliza separador', () => {
    expect(slugify('Emenda Parlamentar')).toBe('emenda-parlamentar')
    expect(slugify('Medida Provisória')).toBe('medida-provisoria')
  })
})

describe('normalize', () => {
  it('permite comparar nome com e sem acento', () => {
    expect(normalize('Acácio Favacho')).toBe('acacio favacho')
    expect(normalize('JOÃO').includes('joao')).toBe(true)
  })
})

describe('initials', () => {
  it('usa primeiro e último nome relevantes', () => {
    expect(initials('Maria da Silva Souza')).toBe('MS')
  })

  it('funciona com nome único', () => {
    expect(initials('Ana')).toBe('A')
  })
})

describe('formatadores', () => {
  it('formata data curta em pt-BR', () => {
    expect(formatShortDate('2026-10-04')).toBe('04/10/2026')
  })

  it('trata data com horário sem deslocar o dia', () => {
    expect(formatShortDate('2026-10-04T23:30')).toBe('04/10/2026')
  })

  it('devolve a entrada quando a data é inválida', () => {
    expect(formatShortDate('sem data')).toBe('sem data')
  })

  it('formata mês e ano', () => {
    expect(formatDate('2026-01-01', 'month')).toContain('2026')
  })

  it('formata número com unidade', () => {
    expect(formatNumber(4.25, '%')).toBe('4,25 %')
    expect(formatNumber(1234.5)).toBe('1.234,5')
  })
})

describe('groupBy', () => {
  it('agrupa preservando a ordem de entrada', () => {
    const rows = [
      { party: 'PT', name: 'a' },
      { party: 'PL', name: 'b' },
      { party: 'PT', name: 'c' },
    ]
    const grouped = groupBy(rows, (row) => row.party)
    expect([...grouped.keys()]).toEqual(['PT', 'PL'])
    expect(grouped.get('PT')?.map((row) => row.name)).toEqual(['a', 'c'])
  })
})
