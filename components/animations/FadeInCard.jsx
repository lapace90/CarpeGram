import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

/**
 * FadeInCard - Wrapper component that animates children on mount
 * Use to wrap cards, list items, or any component for entrance animation
 * 
 * @param {number} delay - Delay before animation starts (ms)
 * @param {number} duration - Animation duration (ms)
 * @param {string} direction - 'up', 'down', 'left', 'right', 'none'
 * @param {number} distance - How far to translate (pixels)
 * @param {boolean} fade - Whether to fade in
 * @param {object} style - Additional styles
 */
const FadeInCard = ({
  children,
  delay = 0,
  duration = 400,
  direction = 'up',
  distance = 30,
  fade = true,
  style,
  index = 0, // For staggered lists
  staggerDelay = 100, // Delay between items in list
}) => {
  const opacity = useRef(new Animated.Value(fade ? 0 : 1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(direction === 'scale' ? 0.9 : 1)).current;

  useEffect(() => {
    // Set initial position based on direction
    switch (direction) {
      case 'up':
        translateY.setValue(distance);
        break;
      case 'down':
        translateY.setValue(-distance);
        break;
      case 'left':
        translateX.setValue(distance);
        break;
      case 'right':
        translateX.setValue(-distance);
        break;
      case 'scale':
        scale.setValue(0.9);
        break;
      default:
        break;
    }

    const totalDelay = delay + (index * staggerDelay);

    const animations = [];

    if (fade) {
      animations.push(
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          delay: totalDelay,
          useNativeDriver: true,
        })
      );
    }

    if (direction === 'up' || direction === 'down') {
      animations.push(
        Animated.timing(translateY, {
          toValue: 0,
          duration,
          delay: totalDelay,
          useNativeDriver: true,
        })
      );
    }

    if (direction === 'left' || direction === 'right') {
      animations.push(
        Animated.timing(translateX, {
          toValue: 0,
          duration,
          delay: totalDelay,
          useNativeDriver: true,
        })
      );
    }

    if (direction === 'scale') {
      animations.push(
        Animated.spring(scale, {
          toValue: 1,
          delay: totalDelay,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        })
      );
    }

    Animated.parallel(animations).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [
            { translateX },
            { translateY },
            { scale },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

/**
 * AnimatedFlatList helper - Use with FlatList for staggered animations
 * 
 * Example:
 * <FlatList
 *   data={items}
 *   renderItem={({ item, index }) => (
 *     <FadeInCard index={index}>
 *       <YourCard item={item} />
 *     </FadeInCard>
 *   )}
 * />
 */

/**
 * Preset animations for common use cases
 */
export const FadeInPresets = {
  // Slide up (default)
  slideUp: { direction: 'up', distance: 30, duration: 400 },
  
  // Slide down (for modals, dropdowns)
  slideDown: { direction: 'down', distance: 30, duration: 400 },
  
  // Slide from right (for navigation)
  slideRight: { direction: 'right', distance: 50, duration: 300 },
  
  // Slide from left
  slideLeft: { direction: 'left', distance: 50, duration: 300 },
  
  // Scale up (for buttons, cards)
  scaleUp: { direction: 'scale', duration: 300 },
  
  // Quick fade (for simple elements)
  quickFade: { direction: 'none', duration: 200, fade: true },
  
  // Slow fade (for backgrounds, overlays)
  slowFade: { direction: 'none', duration: 600, fade: true },
  
  // Bounce up (playful)
  bounceUp: { direction: 'up', distance: 40, duration: 500 },
  
  // List item (staggered)
  listItem: { direction: 'up', distance: 20, duration: 300, staggerDelay: 50 },
};

export default FadeInCard;