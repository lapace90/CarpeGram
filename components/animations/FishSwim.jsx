import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';

/**
 * FishSwim - Animated fish for empty states
 * A cute fish that swims across the screen with bubbles
 */
const FishSwim = ({ 
  size = 60, 
  color = theme.colors.primary,
  showBubbles = true,
  speed = 3000, // ms for one cycle
}) => {
  const swimX = useRef(new Animated.Value(0)).current;
  const swimY = useRef(new Animated.Value(0)).current;
  const tailWag = useRef(new Animated.Value(0)).current;
  const bubble1 = useRef(new Animated.Value(0)).current;
  const bubble2 = useRef(new Animated.Value(0)).current;
  const bubble3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Swimming motion - side to side
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

    // Up and down bobbing
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

    // Tail wagging
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

    // Bubbles
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
        // Flip fish when swimming back
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

  const createBubbleStyle = (bubbleAnim, offsetX) => ({
    position: 'absolute',
    width: size * 0.12,
    height: size * 0.12,
    borderRadius: size * 0.06,
    backgroundColor: color,
    opacity: bubbleAnim.interpolate({
      inputRange: [0, 0.3, 1],
      outputRange: [0, 0.5, 0],
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
          inputRange: [0, 1],
          outputRange: [offsetX, offsetX + size * 0.1],
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
      {/* Bubbles */}
      {showBubbles && (
        <>
          <Animated.View style={[styles.bubble, createBubbleStyle(bubble1, size * 0.6)]} />
          <Animated.View style={[styles.bubble, createBubbleStyle(bubble2, size * 0.7)]} />
          <Animated.View style={[styles.bubble, createBubbleStyle(bubble3, size * 0.5)]} />
        </>
      )}

      {/* Fish */}
      <Animated.View style={[styles.fishContainer, fishTransform]}>
        {/* Body */}
        <View 
          style={[
            styles.body, 
            { 
              width: size, 
              height: size * 0.6,
              backgroundColor: color,
              borderRadius: size * 0.3,
            }
          ]} 
        >
          {/* Eye */}
          <View style={[styles.eye, { width: size * 0.15, height: size * 0.15, left: size * 0.15, top: size * 0.15 }]}>
            <View style={[styles.pupil, { width: size * 0.08, height: size * 0.08 }]} />
          </View>
          
          {/* Mouth */}
          <View 
            style={[
              styles.mouth, 
              { 
                width: size * 0.08, 
                height: size * 0.04, 
                left: size * 0.05, 
                top: size * 0.3,
              }
            ]} 
          />
        </View>

        {/* Tail */}
        <Animated.View 
          style={[
            styles.tail,
            tailTransform,
            {
              right: -size * 0.15,
              borderLeftWidth: size * 0.25,
              borderLeftColor: color,
              borderTopWidth: size * 0.2,
              borderBottomWidth: size * 0.2,
            }
          ]} 
        />

        {/* Dorsal fin */}
        <View 
          style={[
            styles.dorsalFin,
            {
              top: -size * 0.12,
              left: size * 0.35,
              borderBottomWidth: size * 0.15,
              borderBottomColor: color,
              borderLeftWidth: size * 0.1,
              borderRightWidth: size * 0.1,
            }
          ]} 
        />
      </Animated.View>
    </View>
  );
};

export default FishSwim;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fishContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  body: {
    position: 'relative',
  },
  eye: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pupil: {
    backgroundColor: '#1a1a2e',
    borderRadius: 100,
  },
  mouth: {
    position: 'absolute',
    backgroundColor: '#1a1a2e',
    borderRadius: 100,
  },
  tail: {
    position: 'absolute',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderStyle: 'solid',
  },
  dorsalFin: {
    position: 'absolute',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderStyle: 'solid',
  },
  bubble: {
    position: 'absolute',
    bottom: '40%',
  },
});