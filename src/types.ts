import { EasingFunction, Animated } from 'react-native'
import { NATIVELY_ANIMATABLE_STYLE_PROPERTIES } from './constants'

export type NativelyAnimatableProperty = typeof NATIVELY_ANIMATABLE_STYLE_PROPERTIES[number]

export type AnimatablePropertyMap<T extends any> = {
  [key in NativelyAnimatableProperty]: T
}

export type InitialValuesMap = Partial<AnimatablePropertyMap<[number]>>

type NextValue = number | ((previous: number) => number)

type SingleTransformConfiguration = {
  to: NextValue
  duration?: number
  easing?: EasingFunction
}

export type AnimationStep =
  | Partial<AnimatablePropertyMap<SingleTransformConfiguration>>
  | Animated.CompositeAnimation

export type AnimationSteps = AnimationStep[]
