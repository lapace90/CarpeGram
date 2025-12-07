import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { hp, wp } from '../../helpers/common';

/**
 * FishSwim - Animated fish for empty states
 * A cute fish that swims across the screen with bubbles
 */
const FishSwim = ({ 
  size = 60, 
  color,
  showBubbles = true,
  speed = 3000,
}) => {
  const { theme } = useTheme();
  const fishColor = color || theme.colors.primary;

  const swimX = useRef(new Animated.Value(0)).current;
  const swimY = useRef(new Animated.Value(0)).current;
  const tailWag = useRef(new Animated.Value(0)).current;
  const bubble1 = useRef(new Animated.Value(0)).current;
  const bubble2 = useRef(new Animated.Value(0)).current;
  const bubble3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const swimAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(swimX, {
          toValue: 1,
          duration: speed,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(swimX, {
          toValue: 0,
          duration: speed,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const bobAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(swimY, {
          toValue: 1,
          duration: speed / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(swimY, {
          toValue: 0,
          duration: speed / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const tailAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(tailWag, {
          toValue: 1,
          duration: 200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(tailWag, {
          toValue: -1,
          duration: 200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(tailWag, {
          toValue: 0,
          duration: 200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const createBubbleAnimation = (bubbleAnim, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(bubbleAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(bubbleAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    };

    swimAnimation.start();
    bobAnimation.start();
    tailAnimation.start();
    
    if (showBubbles) {
      createBubbleAnimation(bubble1, 0).start();
      createBubbleAnimation(bubble2, 500).start();
      createBubbleAnimation(bubble3, 1000).start();
    }

    return () => {
      swimAnimation.stop();
      bobAnimation.stop();
      tailAnimation.stop();
    };
  }, [speed, showBubbles]);

  const fishTransform = {
    transform: [
      {
        translateX: swimX.interpolate({
          inputRange: [0, 1],
          outputRange: [-size * 0.3, size * 0.3],
        }),
      },
      {
        translateY: swimY.interpolate({
          inputRange: [0, 1],
          outputRange: [-size * 0.1, size * 0.1],
        }),
      },
      {
        scaleX: swimX.interpolate({
          inputRange: [0, 0.5, 0.5, 1],
          outputRange: [1, 1, -1, -1],
        }),
      },
    ],
  };

  const tailTransform = {
    transform: [
      {
        rotate: tailWag.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: ['-15deg', '0deg', '15deg'],
        }),
      },
    ],
  };

  const createBubbleStyle = (bubbleAnim, startX, startY) => ({
    opacity: bubbleAnim.interpolate({
      inputRange: [0, 0.2, 0.8, 1],
      outputRange: [0, 1, 1, 0],
    }),
    transform: [
      {
        translateY: bubbleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -size * 0.8],
        }),
      },
      {
        translateX: bubbleAnim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [startX, startX + 5, startX - 3],
        }),
      },
      {
        scale: bubbleAnim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.5, 1, 0.3],
        }),
      },
    ],
  });

  return (
    <View style={[styles.container, { width: size * 2, height: size * 1.5 }]}>
      <Animated.View style={[styles.fishContainer, fishTransform]}>
        {/* Fish body */}
        <View style={[styles.body, { 
          width: size * 0.6, 
          height: size * 0.4, 
          backgroundColor: fishColor,
          borderRadius: size * 0.2,
        }]}>
          {/* Eye */}
          <View style={[styles.eye, { 
            width: size * 0.1, 
            height: size * 0.1, 
            backgroundColor: theme.colors.card,
            left: size * 0.35,
          }]}>
            <View style={[styles.pupil, { 
              width: size * 0.05, 
              height: size * 0.05,
              backgroundColor: theme.colors.dark,
            }]} />
          </View>
        </View>

        {/* Tail */}
        <Animated.View style={[
          styles.tail,
          tailTransform,
          {
            borderLeftWidth: size * 0.15,
            borderTopWidth: size * 0.12,
            borderBottomWidth: size * 0.12,
            borderLeftColor: fishColor,
            left: -size * 0.1,
          }
        ]} />

        {/* Fin */}
        <View style={[styles.fin, {
          borderLeftWidth: size * 0.08,
          borderTopWidth: size * 0.08,
          borderLeftColor: fishColor + 'CC',
          top: -size * 0.08,
          left: size * 0.2,
        }]} />
      </Animated.View>

      {/* Bubbles */}
      {showBubbles && (
        <>
          <Animated.View style={[
            styles.bubble,
            { backgroundColor: theme.colors.primary + '40' },
            createBubbleStyle(bubble1, size * 0.7, 0),
            { width: size * 0.08, height: size * 0.08 }
          ]} />
          <Animated.View style={[
            styles.bubble,
            { backgroundColor: theme.colors.primary + '40' },
            createBubbleStyle(bubble2, size * 0.8, 0),
            { width: size * 0.06, height: size * 0.06 }
          ]} />
          <Animated.View style={[
            styles.bubble,
            { backgroundColor: theme.colors.primary + '40' },
            createBubbleStyle(bubble3, size * 0.75, 0),
            { width: size * 0.05, height: size * 0.05 }
          ]} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fishContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  body: {
    justifyContent: 'center',
  },
  eye: {
    position: 'absolute',
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pupil: {
    borderRadius: 999,
  },
  tail: {
    position: 'absolute',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  fin: {
    position: 'absolute',
    borderTopColor: 'transparent',
    transform: [{ rotate: '45deg' }],
  },
  bubble: {
    position: 'absolute',
    borderRadius: 999,
    right: 0,
    bottom: '50%',
  },
});

export default FishSwim;