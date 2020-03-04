# react-native-compose-animation

`react-native-compose-animation` provides a helper function which abstracts away management of animated values, and lets you compose animations in a more human-readable sequence of steps. It returns a superset of React Native's `Animated.CompositeAnimation`, and can therefore be mixed into other animations composed using the [Animated API](https://reactnative.dev/docs/animated).

## Usage

Bare bones usage is as follows:

```
import composeAnimation from 'react-native-compose-animation'

const animation = composeAnimation({
  steps: [
    {
      opacity: { to: 0.5, duration: 300 },
      scale: { to: 0.5, duration: 300, easing: Easing.bounce },
    },
  ],
})
```

This will produce an animation where both opacity and scale concurrently animate to 0.5, with different easing functions, over 300ms. Elsewhere in your code, wherever you want to use your animation, you can treat the return value of `composeAnimation` as though it were an `Animated.CompositeAnimation`. The styles generated by `composeAnimation` can be accessed on a style property available on the returned animation.

```
animation.start()

...

<Animated.View style={animation.style}>
  <Text>Hello World!</Text>
</Animated.View>
```

You can also specify initial values for your animations. If no initial values are passed it will use the default initial values for each property.

```
const animation = composeAnimation({
  initialValues: {
    opacity: [0],
    scale: [1.5],
  },
  steps: [
    {
      opacity: { to: 0.5, duration: 300 },
      scale: { to: 0.5, duration: 300, easing: Easing.bounce },
    },
  ],
})
```

### Duplicating Animations

You can call `.duplicate()` on your composed animation to create a copy of the animation pointed to new `Animated.Value`s. This can be useful when you want to have a series of identical animations beginning at different junctures using `Animated.stagger` and don't want to write out the same config multiple times.

```
const animation_1 = composeAnimation({
  steps: [
    { rotate: { to: 360, duration: 1000 } },
    { translateX: { to: 100, duration: 300, easing: Easing.sin } },
  ],
})
const animation_2 = animation_1.duplicate()
const animation_3 = animation_1.duplicate()
...

Animated.stagger(250, [animation_1, animation_2, animation_3]).start()

```

### Reusing Previous Values

You can reuse values from previous animation steps if you want to programmatically determine the next value for a style property. Instead of passing a number in a step's `to` property, you can make it a callback function, which takes the previous value and returns a new value.

```
const animation = composeAnimation({
  steps: [
    { rotate: { to: Math.random() * 360, duration: 300 } },
    { rotate: { to: prev => 360 - prev, duration: 300 } },
  ],
})

```

### Mixing In Other Animations

In addition to just passing in object configurations as the steps of your animations, you can also pass in other `Animated.CompositeAnimation`s. This can be useful if you want an animation to partially run, perform another animation, then finish the initial animation. It's also possible for you to extract the steps from an animation built with `composeAnimation` for reuse. For example, given:

```
const someAnimation = composeAnimation({
  steps: [
    { rotateX: { to: 360, duration: 500 } },
    { rotateY: { to: 360, duration: 500 } },
    { scale: { to: 2, duration: 250 } },
    { scale: { to: 1, duration: 250 } },
  ],
})

const otherAnimation = composeAnimation({
  steps: [
    ...someAnimation.steps,
    someAnimation,
    { opacity: { to: 0.7, duration: 1000 } }
  ],
})
```

our `otherAnimation` will run the same steps as `someAnimation`, except mapped to its own styles. It will then run `someAnimation`. Finally, it will animate to 70% opacity over one second.

### Directly Accessing Interpolations

If for some reason you need to directly use the interpolated values generated by `composeAnimation`, you can access them on the `interpolations` property of the returned value for your animation. `interpolations` is an object where the keys are the names of supported style props (see below), and the value is an `Animated.Interpolation`.

```

const animation = composeAnimation({
  steps: [{ rotate: { to: 360, duration: 1000 } }],
})

...

animation.interpolations.rotate

```

## Supported Style Props

Currently, `react-native-compose-animation` only supports some natively animatable style properties. These include the following properties, viewable in `src/constants.ts`:

```

translateX
translateY
rotate
rotateX
rotateY
scale
scaleX
scaleY
opacity

```

Future iterations of this helper function may inlude the ability to animate non-natively-animatable style props, but for now is restricted to this list to enforce the use of `useNativeDriver`. Transform style props are applied in the order listed above. This produces the most predictable results.

```

```
