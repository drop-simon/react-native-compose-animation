export const TRANSFORM_PROPERTIES = [
  'translateX',
  'translateY',
  'rotate',
  'rotateX',
  'rotateY',
  'scale',
  'scaleX',
  'scaleY',
] as const

export const OTHER_PROPERTIES = ['opacity'] as const

export const NATIVELY_ANIMATABLE_STYLE_PROPERTIES = [
  ...TRANSFORM_PROPERTIES,
  ...OTHER_PROPERTIES,
]
