import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const BubblesLoader = ({ size = 60, color = '#0088c2' }) => {
  const bubble1 = useRef(new Animated.Value(0)).current;
  const bubble2 = useRef(new Animated.Value(0)).current;
  const bubble3 = useRef(new Animated.Value(0)).current;
  const bubble4 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createBubbleAnimation = (animValue, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(animValue, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(animValue, {
                toValue: 0.5,
                duration: 1000,
                useNativeDriver: true,
              }),
              Animated.timing(animValue, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
              }),
            ]),
          ]),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const anim1 = createBubbleAnimation(bubble1, 0);
    const anim2 = createBubbleAnimation(bubble2, 300);
    const anim3 = createBubbleAnimation(bubble3, 600);
    const anim4 = createBubbleAnimation(bubble4, 900);

    anim1.start();
    anim2.start();
    anim3.start();
    anim4.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
      anim4.stop();
    };
  }, []);

  const createBubbleStyle = (animValue, left) => ({
    position: 'absolute',
    bottom: 0,
    left: left,
    width: size * 0.3,
    height: size * 0.3,
    borderRadius: (size * 0.3) / 2,
    backgroundColor: color,
    opacity: animValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.3, 0.7, 0],
    }),
    transform: [
      {
        translateY: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -size],
        }),
      },
      {
        scale: animValue.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.5, 1, 1.2],
        }),
      },
    ],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={createBubbleStyle(bubble1, '10%')} />
      <Animated.View style={createBubbleStyle(bubble2, '35%')} />
      <Animated.View style={createBubbleStyle(bubble3, '60%')} />
      <Animated.View style={createBubbleStyle(bubble4, '85%')} />
    </View>
  );
};

export default BubblesLoader;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
});