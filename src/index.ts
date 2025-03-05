import type { Declaration, PluginCreator } from 'postcss'
import valueParser from 'postcss-value-parser'

type Exclude = RegExp | ((value: string, declaration: Declaration) => boolean)

interface SharedOptions {
  preserve?: boolean | 'before' | 'after'
  exclude?: Exclude
}

export type UnitTransformer = SharedOptions & {
  fromUnit: string
} & ({
  toUnit: string
} | {
  toCssVar: `--${string}`
} | {
  transform: (value: number) => string
})

export type BetterUnitsPluginOptions = (SharedOptions & {
  units: UnitTransformer[]
}) | UnitTransformer[]

const checkExclude = (
  exclude: Exclude | undefined,
  value: string,
  declaration: Declaration,
): boolean => !!exclude && (
  typeof exclude === 'function' ? exclude(value, declaration) : exclude.test(value)
)

const betterUnits: PluginCreator<BetterUnitsPluginOptions> = (options = []) => {
  const {
    units,
    preserve: globalPreserve = false,
    exclude: globalExclude,
  } = Array.isArray(options) ? { units: options } : options

  const HAS_UNITS_RE = new RegExp(`(${units.map(unit => unit.fromUnit).join('|')})\\b`, 'i')

  return {
    postcssPlugin: 'better-units',
    Declaration(declaration) {
      if (!HAS_UNITS_RE.test(declaration.value)) {
        return
      }

      const declarationString = String(declaration)
      if (checkExclude(globalExclude, declarationString, declaration)) {
        return
      }

      const applicableUnits = units.filter(unit => !checkExclude(unit.exclude, declarationString, declaration))
      if (!applicableUnits.length) {
        return
      }

      let preserve = globalPreserve

      const parsedValue = valueParser(declaration.value)

      parsedValue.walk((node) => {
        if (node.type !== 'word') {
          return
        }

        const dimension = valueParser.unit(node.value)
        if (!dimension) {
          return
        }

        const normalizedUnit = dimension.unit.toLowerCase()
        for (const unit of applicableUnits) {
          if (unit.fromUnit === normalizedUnit) {
            if ('toCssVar' in unit) {
              // @ts-expect-error docs say it's legal
              node.type = 'string'
              node.value = `calc(${dimension.number} * var(${unit.toCssVar}))`
            }
            else if ('toUnit' in unit) {
              node.value = `${dimension.number}${unit.toUnit}`
            }
            else if ('transform' in unit) {
              // @ts-expect-error docs say it's legal
              node.type = 'string'
              node.value = unit.transform(Number.parseFloat(dimension.number))
            }

            preserve = unit.preserve ?? preserve
            break
          }
        }
      })

      const modifiedValue = String(parsedValue)

      if (modifiedValue === declaration.value) {
        return
      }

      declaration[preserve === 'before' ? 'cloneAfter' : 'cloneBefore']({ value: modifiedValue })

      if (!preserve) {
        declaration.remove()
      }
    },
  }
}

betterUnits.postcss = true

export default betterUnits
