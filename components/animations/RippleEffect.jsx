import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { theme } from '../../constants/theme';

const RippleEffect = ({ color = theme.colors.rose, size = 100, onComplete }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onComplete) onComplete();
    });
  }, []);

  return (
    <Animated.View
      style={[
        styles.ripple,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: color,
          opacity: opacity,
          transform: [{ scale: scale }],
        },
      ]}
    />
  );
};

const RippleContainer = ({ children, onPress, color, size = 100 }) => {
  const [ripples, setRipples] = React.useState([]);

  const handlePress = () => {
    const rippleId = Date.now();
    setRipples([...ripples, rippleId]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((id) => id !== rippleId));
    }, 800);

    if (onPress) onPress();
  };

  return (
    <View style={styles.container}>
      {children({ onPress: handlePress })}
      {ripples.map((id) => (
        <RippleEffect key={id} color={color} size={size} />
      ))}
    </View>
  );
};

export default RippleContainer;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ripple: {
    position: 'absolute',
    borderWidth: 3,
  },
});