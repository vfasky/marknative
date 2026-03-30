import { describe, expect, test } from 'bun:test'
import { validateRenderOptions } from '../../src/pipeline/render-one'

describe('validateRenderOptions', () => {
  test('defaults to canvas backend and png format', () => {
    expect(validateRenderOptions({})).toEqual({
      backend: 'canvas',
      format: 'png',
    })
  })

  test('allows canvas with png format', () => {
    expect(
      validateRenderOptions({ renderer: 'canvas', format: 'png' }),
    ).toEqual({
      backend: 'canvas',
      format: 'png',
    })
  })

  test('rejects canvas with svg and html formats', () => {
    expect(() =>
      validateRenderOptions({ renderer: 'canvas', format: 'svg' }),
    ).toThrow("Cannot use renderer 'canvas' with vector format 'svg'")
    expect(() =>
      validateRenderOptions({ renderer: 'canvas', format: 'html' }),
    ).toThrow("Cannot use renderer 'canvas' with vector format 'html'")
  })

  test('allows svg renderer only with native format or no format', () => {
    expect(validateRenderOptions({ renderer: 'svg' })).toEqual({
      backend: 'svg',
      format: 'svg',
    })
    expect(
      validateRenderOptions({ renderer: 'svg', format: 'svg' }),
    ).toEqual({
      backend: 'svg',
      format: 'svg',
    })
  })

  test('rejects svg renderer with non-native formats', () => {
    expect(() =>
      validateRenderOptions({ renderer: 'svg', format: 'png' }),
    ).toThrow("Cannot use renderer 'svg' with format 'png'")
    expect(() =>
      validateRenderOptions({ renderer: 'svg', format: 'html' }),
    ).toThrow("Cannot use renderer 'svg' with format 'html'")
  })

  test('allows html renderer only with native format or no format', () => {
    expect(validateRenderOptions({ renderer: 'html' })).toEqual({
      backend: 'html',
      format: 'html',
    })
    expect(
      validateRenderOptions({ renderer: 'html', format: 'html' }),
    ).toEqual({
      backend: 'html',
      format: 'html',
    })
  })

  test('rejects html renderer with non-native formats', () => {
    expect(() =>
      validateRenderOptions({ renderer: 'html', format: 'png' }),
    ).toThrow("Cannot use renderer 'html' with format 'png'")
    expect(() =>
      validateRenderOptions({ renderer: 'html', format: 'svg' }),
    ).toThrow("Cannot use renderer 'html' with format 'svg'")
  })
})
