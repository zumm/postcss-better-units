# PostCSS Better Units
[![NPM latest version](https://img.shields.io/npm/v/postcss-better-units/latest.svg)](https://www.npmjs.com/package/postcss-better-units)

A [PostCSS](https://postcss.org/) plugin to define, transform, and manage custom or existing CSS units with ease.

## Getting started
Install package:
```sh
pnpm add -D postcss-better-units
```
Note: You also need the `postcss` package installed.

Configure `PostCSS` to use plugin. For example with `postcss.congig.ts` file:
```ts
import type { Config } from 'postcss-load-config'
import betterUnits from 'postcss-better-units'

export default {
  plugins: [
    betterUnits([{
      fromUnit: 'rpx',
      transform: value => `${value / 16}rem`,
    }]),
  ],
} satisfies Config
```

That's it! The configuration above will transform `rpx` units to `rem` in a 1/16 ratio:
```css
div {
  width: 16rpx;
  height: 5rpx;
}
/* becomes */
div {
  width: 1rem;
  height: 0.3125rpx;
}
```

## Configuration
The plugin accepts an array of objects. Each object describes a unit transformation:
| Property | Type | Description |
| :- | :- | :- |
| `fromUnit`* | `string` | Unit to transform from. |
| `transform`* | `(number) => string` | Transformer function. |
| `toUnit` | `string`  | Unit to transform into. This optional shorthand may be used instead of `transform`. |
| `toCssVar` | `--${string}` | CSS variable to transform into. This optional shorthand may be used instead of `transform` |
| `preserve` | `boolean`, `'before'`, `'after'` | Whether the original value should be preserved.  `true` means `'after'`. |
| `exclude` | `RegExp`, `(string, Declaration) => boolean` | `RegExp` or function to exclude declarations from transfomation. |

Note: One (and only one) of `transform`, `toUnit` or `toCssVar` should be defined.
```ts
{ toUnit: '<TO_UNIT>' }
// equivalent:
{ transform: value => `${value}<TO_UNIT>` }
```

```ts
{ toCssVar: '<TO_CSS_VAR>' }
// equivalent:
{ transform: value => `calc(${value} * var(<TO_CSS_VAR>))` }
```

## Examples
Here are some simple examples to board you in. You also may check our tests to find more insights.

### Unit to unit
Imagine you want to use these new [awesome units](https://caniuse.com/mdn-css_types_length_viewport_percentage_units_dynamic) like `dvh`. But browser support is still limited. In such cases, fallback to less awesome units like `vh` may be needed:

```ts
betterUnits([{
  fromUnit: 'dvh',
  toUnit: 'vh',
  preserve: 'after',
}])
```

```css
main {
  min-height: 100dvh;
}
/* becomes */
main {
  min-height: 100vh;
  min-height: 100dvh;
}
```

### Unit to CSS variable
Let's take the example above further. In some cases, a fallback isn't sufficient, and you might use a JavaScript polyfill to make these `dvh` units work everywhere. Typically, polyfills set a CSS variable that can be used as the desired unit:

```ts
betterUnits([{
  fromUnit: 'dvh',
  toCssVar: '--dvh',
  preserve: 'after',
}])
```

```css
main {
  min-height: 100dvh;
}
/* becomes */
main {
  min-height: calc(100 * var(--dvh));
  min-height: 100dvh;
}
```

If you are interested in such polyfill, check out this [project](https://github.com/Faisal-Manzer/postcss-viewport-height-correction) for inspiration.

### Variable units
There is [CSS draft](https://drafts.csswg.org/css-variables-2/#variable-units) for a syntax sugar called `variable units`. You can use it right now:

```ts
betterUnits([{
  fromUnit: '--fem',
  toCssVar: '--fem',
}])
```

```css
.fluid-type {
  font-size: 1.2--fem;
}
/* becomes */
.fluid-type {
  min-height: calc(1.2 * var(--fem));
}
```

## Feedback
Feel free to request features or report bugs, even if project seems abandoned. Feedback is always appreciated.
