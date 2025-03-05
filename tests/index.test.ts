import type { Rule } from 'postcss'
import type { BetterUnitsPluginOptions } from '../src'
import postcss from 'postcss'
import { describe, expect, it } from 'vitest'
import postcssPlugin from '../src'

const file = 'style.css'
const processOptions = { from: file, to: file }

function run(input: string, options?: BetterUnitsPluginOptions) {
  return postcss([postcssPlugin(options)]).process(input, processOptions)
}

describe('postcss', () => {
  it('unit to unit transform', async () => {
    const { css } = await run(
      'div { width: 10px; }',
      [{ fromUnit: 'px', toUnit: 'rpx' }],
    )

    expect(css).toEqual(
      'div { width: 10rpx; }',
    )
  })

  it('unit to css var transform', async () => {
    const { css } = await run(
      'div { width: 10rpx; }',
      [{ fromUnit: 'rpx', toCssVar: '--rpx' }],
    )

    expect(css).toEqual(
      'div { width: calc(10 * var(--rpx)); }',
    )
  })

  it('unit to custom transform', async () => {
    const { css } = await run(
      'div { width: 16px; }',
      [{ fromUnit: 'px', transform: value => `${value / 16}rem` }],
    )

    expect(css).toEqual(
      'div { width: 1rem; }',
    )
  })

  it('negative value', async () => {
    const { css } = await run(
      'div { margin-left: -10px; }',
      [{ fromUnit: 'px', toUnit: 'rpx' }],
    )

    expect(css).toEqual(
      'div { margin-left: -10rpx; }',
    )
  })

  it('decimal value', async () => {
    const { css } = await run(
      'div { margin: 1.01rpx .01rem auto; }',
      [
        { fromUnit: 'rpx', toCssVar: '--rpx' },
        { fromUnit: 'rem', transform: value => `${value * 16}px` },
      ],
    )

    expect(css).toEqual(
      'div { margin: calc(1.01 * var(--rpx)) 0.16px auto; }',
    )
  })

  it('multiple units', async () => {
    const { css } = await run(
      'div { width: 1rem; margin-left: -16rpx; }',
      [
        { fromUnit: 'rpx', toCssVar: '--rpx' },
        { fromUnit: 'rem', transform: value => `${value * 16}px` },
      ],
    )

    expect(css).toEqual(
      'div { width: 16px; margin-left: calc(-16 * var(--rpx)); }',
    )
  })

  it('preserve', async () => {
    const { css } = await run(
      'div { min-height: 100dvh; }',
      [{ fromUnit: 'dvh', toUnit: 'vh', preserve: true }],
    )

    expect(css).toEqual(
      'div { min-height: 100vh; min-height: 100dvh; }',
    )
  })

  it('preserve before', async () => {
    const { css } = await run(
      'div { min-height: 100vh; }',
      [{ fromUnit: 'vh', toUnit: 'dvh', preserve: 'before' }],
    )

    expect(css).toEqual(
      'div { min-height: 100vh; min-height: 100dvh; }',
    )
  })

  // https://github.com/w3c/csswg-drafts/issues/7379
  it('variable units', async () => {
    const { css } = await run(
      'div { width: 10--rpx; }',
      [{ fromUnit: '--rpx', toCssVar: '--rpx' }],
    )

    expect(css).toEqual(
      'div { width: calc(10 * var(--rpx)); }',
    )
  })

  it('exclude regexp', async () => {
    const { css } = await run(
      ':root { --rpx: 1px; } div { width: 16px; }',
      [{ fromUnit: 'px', toUnit: 'rpx', exclude: /--rpx/ }],
    )

    expect(css).toEqual(
      ':root { --rpx: 1px; } div { width: 16rpx; }',
    )
  })

  it('exclude custom', async () => {
    const { css } = await run(
      ':root { --rpx: 1px; } div { width: 16px; }',
      [{
        fromUnit: 'px',
        toUnit: 'rpx',
        exclude: (_, { parent }) => (parent as Rule)?.selector === ':root',
      }],
    )

    expect(css).toEqual(
      ':root { --rpx: 1px; } div { width: 16rpx; }',
    )
  })
})
