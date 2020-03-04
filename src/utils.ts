import { Animated } from 'react-native'
import { NATIVELY_ANIMATABLE_STYLE_PROPERTIES } from './constants'
import {
  AnimationSteps,
  AnimationConfiguration,
  AnimatablePropertyMap,
  NativelyAnimatableProperty,
} from './types'

export const unpackSteps = (
  stepsToUnpack: AnimationSteps
): (AnimationConfiguration | Animated.CompositeAnimation)[] =>
  stepsToUnpack.reduce(
    (acc, step) =>
      // if the step is the return value of composeAnimation, we extract its raw steps
      'steps' in step
        ? acc.concat(...unpackSteps(step.steps))
        : acc.concat(step),
    []
  )

export const createValuesMap = <
  D extends (k?: NativelyAnimatableProperty) => any,
  R extends ReturnType<D>
>(
  value: D
) =>
  NATIVELY_ANIMATABLE_STYLE_PROPERTIES.reduce((acc, key) => {
    acc[key] = value(key)
    return acc
  }, ({} as unknown) as AnimatablePropertyMap<R>)

export const createDefaultOutputMap = () =>
  createValuesMap(prop =>
    /scale/.test(prop) || prop === 'opacity' ? [1] : [0]
  )

export const createInitialAnimatedValuesMap = () =>
  createValuesMap(() => new Animated.Value(0))
