import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { theme } from '../../constants/theme';
import { wp } from '../../helpers/common';

const WaveRefresh = ({ progress }) => {
  const wave1 = React.useRef(new Animated.Value(0)).current;
  const wave2 = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(wave1, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(wave1, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(750),
          Animated.timing(wave2, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(wave2, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  const createWaveStyle = (animValue) => ({
    position: 'absolute',
    width: wp(100),
    height: 100,
    backgroundColor: theme.colors.primary,
    opacity: animValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.3, 0.5, 0],
    }),
    transform: [
      {
        translateY: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 100],
        }),
      },
      {
        scaleX: animValue.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 1.5, 2],
        }),
      },
    ],
    borderRadius: 1000,
  });

  return (
    <View style={styles.container}>
      <Animated.View style={createWaveStyle(wave1)} />
      <Animated.View style={createWaveStyle(wave2)} />
    </View>
  );
};

export default WaveRefresh;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -100,
    left: 0,
    right: 0,
    height: 100,
    overflow: 'hidden',
    alignItems: 'center',
  },
});