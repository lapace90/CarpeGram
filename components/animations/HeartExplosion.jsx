import React, { useRef, useState } from 'react';
import { StyleSheet, Animated, Easing, Pressable } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import Icon from '../../assets/icons';

/**
 * HeartExplosion - Like button with explosion animation
 * Shows particles and scaling effect when liked
 */
const HeartExplosion = ({
  liked,
  onPress,
  size = 28,
  color,
  showParticles = true,
}) => {
  const { theme } = useTheme();
  const heartColor = color || theme.colors.rose;

  const scale = useRef(new Animated.Value(1)).current;
  const particleAnims = useRef(
    Array.from({ length: 6 }, () => ({
      scale: new Animated.Value(0),
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;
  const ringScale = useRef(new Animated.Value(0)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;

  const [showParticleViews, setShowParticleViews] = useState(false);

  const handlePress = () => {
    if (!liked) {
      animateExplosion();
    } else {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
    onPress?.();
  };

  const animateExplosion = () => {
    setShowParticleViews(true);

    const heartBounce = Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.6,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1.2,
        friction: 3,
        tension: 150,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]);

    const ringAnimation = Animated.parallel([
      Animated.timing(ringScale, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(ringOpacity, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(ringOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]);

    const angles = [0, 60, 120, 180, 240, 300];
    const particleAnimations = particleAnims.map((anim, index) => {
      const angle = (angles[index] * Math.PI) / 180;
      const distance = size * 1.5;
      const targetX = Math.cos(angle) * distance;
      const targetY = Math.sin(angle) * distance;

      return Animated.parallel([
        Animated.timing(anim.scale, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(anim.translateX, {
          toValue: targetX,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(anim.translateY, {
          toValue: targetY,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(anim.opacity, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.delay(200),
          Animated.timing(anim.opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]);
    });

    Animated.parallel([
      heartBounce,
      ...(showParticles ? [ringAnimation, ...particleAnimations] : []),
    ]).start(() => {
      particleAnims.forEach((anim) => {
        anim.scale.setValue(0);
        anim.translateX.setValue(0);
        anim.translateY.setValue(0);
        anim.opacity.setValue(0);
      });
      ringScale.setValue(0);
      ringOpacity.setValue(0);
      setShowParticleViews(false);
    });
  };

  const particleColors = [
    heartColor,
    theme.colors.roseLight,
    '#FF9999',
    heartColor,
    theme.colors.roseLight,
    '#FFB366',
  ];

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      {showParticles && showParticleViews && (
        <Animated.View
          style={[
            styles.ring,
            {
              width: size * 3,
              height: size * 3,
              borderRadius: size * 1.5,
              borderColor: heartColor,
              opacity: ringOpacity,
              transform: [{ scale: ringScale }],
            },
          ]}
        />
      )}

      {showParticles && showParticleViews && particleAnims.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              width: size * 0.25,
              height: size * 0.25,
              borderRadius: size * 0.125,
              backgroundColor: particleColors[index],
              opacity: anim.opacity,
              transform: [
                { translateX: anim.translateX },
                { translateY: anim.translateY },
                { scale: anim.scale },
              ],
            },
          ]}
        />
      ))}

      <Animated.View style={{ transform: [{ scale }] }}>
        <Icon
          name="heart"
          size={size}
          fill={liked ? heartColor : 'transparent'}
          color={liked ? heartColor : theme.colors.text}
        />
      </Animated.View>
    </Pressable>
  );
};

export default HeartExplosion;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
  },
  particle: {
    position: 'absolute',
  },
});