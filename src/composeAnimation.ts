import { Animated, TransformsStyle } from 'react-native'
import {
  AnimationSteps,
  NativelyAnimatableProperty,
  InitialValuesMap,
  AnimatablePropertyMap,
  AnimationStep,
} from './types'
import {
  TRANSFORM_PROPERTIES,
  NATIVELY_ANIMATABLE_STYLE_PROPERTIES,
} from './constants'
import {
  createDefaultOutputMap,
  createInitialAnimatedValuesMap,
  createValuesMap,
} from './utils'

export default function composeAnimation({
  steps,
  initialValues = {},
}: {
  steps: AnimationSteps
  initialValues?: InitialValuesMap
}) {
  const animatedValueMap = createInitialAnimatedValuesMap()
  const outputs = {
    ...createDefaultOutputMap(),
    ...initialValues,
  } as AnimatablePropertyMap<number[]>

  const processStep = (step: AnimationStep) => {
    // check if the step is already a composite animation
    if ('start' in step) {
      return step
    }
    // build the parallel animations for each style property
    return Animated.parallel(
      NATIVELY_ANIMATABLE_STYLE_PROPERTIES.map(property => {
        const output = outputs[property]
        const currentValue = output[output.length - 1]
        const { duration = 300, easing = n => n, to = currentValue } =
          step[property] || {}

        // keep property output array up to date
        const nextOutput = typeof to === 'function' ? to(currentValue) : to
        outputs[property].push(nextOutput)

        return Animated.timing(animatedValueMap[property], {
          toValue: outputs[property].length - 1,
          duration,
          easing,
          useNativeDriver: true,
        })
      })
    )
  }

  // convert all configs to Animated.CompositeAnimations
  const processedSteps = steps.map(processStep)
  // sequence resulting composites
  const finalComposite = Animated.sequence(processedSteps)

  const compositeTransform = TRANSFORM_PROPERTIES.map(property => {
    const outputRange = outputs[property]
    const inputRange = outputRange.map((_, i) => i)
    const interpolation = animatedValueMap[property].interpolate({
      inputRange,
      outputRange: /rotate/.test(property)
        ? outputRange.map(v => `${v}deg`)
        : outputRange,
    })
    return { [property]: interpolation }
  })

  const opacity = animatedValueMap.opacity.interpolate({
    inputRange: outputs.opacity.map((_, i) => i),
    outputRange: outputs.opacity,
  })

  const patchedReset = () => {
    for (const key in animatedValueMap) {
      animatedValueMap[key as NativelyAnimatableProperty].setValue(0)
    }
    ;(finalComposite as Animated.CompositeAnimation & {
      reset(): void
    }).reset()
  }

  const style = {
    transform: (compositeTransform as unknown) as TransformsStyle['transform'],
    opacity,
  }

  return {
    ...finalComposite,
    reset: patchedReset,
    style,
    steps,
    interpolations: createValuesMap(prop =>
      prop === 'opacity'
        ? opacity
        : compositeTransform.find(t => !!t[prop])[prop]
    ),
    duplicate: () => composeAnimation({ steps, initialValues }),
  }
}
