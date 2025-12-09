import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  Text,
  Dimensions,
  PanResponder,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImageManipulator from 'expo-image-manipulator';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import Icon from '../../assets/icons/Icon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ASPECT_RATIOS = {
  '1:1': { width: 1, height: 1, label: '1:1' },
  '4:5': { width: 4, height: 5, label: '4:5' },
  '16:9': { width: 16, height: 9, label: '16:9' },
};

const ImageCropper = ({ 
  visible, 
  imageUri, 
  onCrop, 
  onCancel,
  cropShape = 'square', // 'circle' or 'square'
  initialAspectRatio = '1:1',
  showAspectRatioSelector = false,
  outputSize = 1080,
}) => {
  const [aspectRatio, setAspectRatio] = useState(initialAspectRatio);
  const [imageLayout, setImageLayout] = useState({ width: 0, height: 0 });
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 });
  const [loading, setLoading] = useState(false);
  
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  
  const lastScale = useRef(1);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);
  const initialPinchDistance = useRef(0);
  const initialPinchScale = useRef(1);

  // Calculate crop dimensions based on aspect ratio
  const getCropDimensions = () => {
    const ratio = ASPECT_RATIOS[aspectRatio] || ASPECT_RATIOS['1:1'];
    const maxWidth = SCREEN_WIDTH * 0.85;
    const maxHeight = maxWidth * 1.25; // Max height constraint
    
    let width, height;
    if (ratio.width >= ratio.height) {
      width = maxWidth;
      height = maxWidth * (ratio.height / ratio.width);
    } else {
      height = Math.min(maxWidth * (ratio.height / ratio.width), maxHeight);
      width = height * (ratio.width / ratio.height);
    }
    
    return { width, height };
  };

  const cropDimensions = getCropDimensions();

  useEffect(() => {
    if (visible && imageUri) {
      resetPosition();
    }
  }, [visible, imageUri, aspectRatio]);

  const getDistance = (touches) => {
    const [t1, t2] = touches;
    return Math.sqrt(
      Math.pow(t2.pageX - t1.pageX, 2) + Math.pow(t2.pageY - t1.pageY, 2)
    );
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      onPanResponderGrant: (evt) => {
        lastTranslateX.current = translateX._value;
        lastTranslateY.current = translateY._value;
        
        if (evt.nativeEvent.touches.length === 2) {
          initialPinchDistance.current = getDistance(evt.nativeEvent.touches);
          initialPinchScale.current = scale._value;
        }
      },
      
      onPanResponderMove: (evt, gestureState) => {
        if (evt.nativeEvent.touches.length === 2) {
          const currentDistance = getDistance(evt.nativeEvent.touches);
          if (initialPinchDistance.current > 0) {
            const newScale = initialPinchScale.current * (currentDistance / initialPinchDistance.current);
            scale.setValue(Math.min(Math.max(newScale, 1), 5));
          }
        } else if (evt.nativeEvent.touches.length === 1) {
          translateX.setValue(lastTranslateX.current + gestureState.dx);
          translateY.setValue(lastTranslateY.current + gestureState.dy);
        }
      },
      
      onPanResponderRelease: () => {
        lastScale.current = scale._value;
        lastTranslateX.current = translateX._value;
        lastTranslateY.current = translateY._value;
        constrainPosition();
      },
    })
  ).current;

  const constrainPosition = () => {
    const currentScale = scale._value;
    const maxOffsetX = Math.max(0, (imageLayout.width * currentScale - cropDimensions.width) / 2);
    const maxOffsetY = Math.max(0, (imageLayout.height * currentScale - cropDimensions.height) / 2);
    
    let newX = Math.min(maxOffsetX, Math.max(-maxOffsetX, translateX._value));
    let newY = Math.min(maxOffsetY, Math.max(-maxOffsetY, translateY._value));
    
    Animated.parallel([
      Animated.spring(translateX, { toValue: newX, useNativeDriver: true, friction: 8 }),
      Animated.spring(translateY, { toValue: newY, useNativeDriver: true, friction: 8 }),
    ]).start();
    
    lastTranslateX.current = newX;
    lastTranslateY.current = newY;
  };

  const handleImageLoad = (event) => {
    const { width, height } = event.source;
    setOriginalSize({ width, height });
    
    const imageAspect = width / height;
    const cropAspect = cropDimensions.width / cropDimensions.height;
    
    let displayWidth, displayHeight;
    
    // Image should cover the crop area
    if (imageAspect > cropAspect) {
      displayHeight = cropDimensions.height;
      displayWidth = cropDimensions.height * imageAspect;
    } else {
      displayWidth = cropDimensions.width;
      displayHeight = cropDimensions.width / imageAspect;
    }
    
    setImageLayout({ width: displayWidth, height: displayHeight });
  };

  const handleCrop = async () => {
    if (!imageUri || !originalSize.width) return;
    
    setLoading(true);
    
    try {
      const currentScale = scale._value;
      const currentTranslateX = translateX._value;
      const currentTranslateY = translateY._value;
      
      const scaleToOriginal = originalSize.width / imageLayout.width;
      
      const cropCenterX = (imageLayout.width * currentScale) / 2 - currentTranslateX;
      const cropCenterY = (imageLayout.height * currentScale) / 2 - currentTranslateY;
      
      const displayCropWidth = cropDimensions.width / currentScale;
      const displayCropHeight = cropDimensions.height / currentScale;
      
      const displayOriginX = (cropCenterX / currentScale) - (displayCropWidth / 2);
      const displayOriginY = (cropCenterY / currentScale) - (displayCropHeight / 2);
      
      const originX = Math.max(0, Math.round(displayOriginX * scaleToOriginal));
      const originY = Math.max(0, Math.round(displayOriginY * scaleToOriginal));
      const cropWidth = Math.round(displayCropWidth * scaleToOriginal);
      const cropHeight = Math.round(displayCropHeight * scaleToOriginal);
      
      const ratio = ASPECT_RATIOS[aspectRatio] || ASPECT_RATIOS['1:1'];
      const outputWidth = outputSize;
      const outputHeight = Math.round(outputSize * (ratio.height / ratio.width));
      
      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          {
            crop: {
              originX,
              originY,
              width: Math.min(cropWidth, originalSize.width - originX),
              height: Math.min(cropHeight, originalSize.height - originY),
            },
          },
          { resize: { width: outputWidth, height: outputHeight } },
        ],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      onCrop(result.uri);
    } catch (error) {
      console.error('Crop error:', error);
      try {
        const result = await ImageManipulator.manipulateAsync(
          imageUri,
          [{ resize: { width: outputSize } }],
          { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
        );
        onCrop(result.uri);
      } catch (e) {
        onCrop(imageUri);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetPosition = () => {
    scale.setValue(1);
    translateX.setValue(0);
    translateY.setValue(0);
    lastScale.current = 1;
    lastTranslateX.current = 0;
    lastTranslateY.current = 0;
  };

  const animatedReset = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
    ]).start();
    lastScale.current = 1;
    lastTranslateX.current = 0;
    lastTranslateY.current = 0;
  };

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onCancel} style={styles.headerButton}>
            <Icon name="x" size={24} color="white" />
          </Pressable>
          <Text style={styles.headerTitle}>Ritaglia</Text>
          <Pressable onPress={animatedReset} style={styles.headerButton}>
            <Icon name="refresh" size={20} color="white" />
          </Pressable>
        </View>

        {/* Aspect Ratio Selector */}
        {showAspectRatioSelector && (
          <View style={styles.ratioSelector}>
            {Object.entries(ASPECT_RATIOS).map(([key, value]) => (
              <Pressable
                key={key}
                style={[
                  styles.ratioButton,
                  aspectRatio === key && styles.ratioButtonActive
                ]}
                onPress={() => setAspectRatio(key)}
              >
                <View style={[
                  styles.ratioPreview,
                  { 
                    aspectRatio: value.width / value.height,
                    width: key === '16:9' ? 32 : 20,
                  }
                ]} />
                <Text style={[
                  styles.ratioLabel,
                  aspectRatio === key && styles.ratioLabelActive
                ]}>
                  {value.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.cropArea}>
          <View 
            style={[
              styles.imageWrapper, 
              { width: cropDimensions.width, height: cropDimensions.height }
            ]} 
            {...panResponder.panHandlers}
          >
            <Animated.View
              style={{
                width: imageLayout.width || cropDimensions.width,
                height: imageLayout.height || cropDimensions.height,
                transform: [
                  { scale },
                  { translateX },
                  { translateY },
                ],
              }}
            >
              {imageUri && (
                <Image
                  source={{ uri: imageUri }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="contain"
                  onLoad={handleImageLoad}
                />
              )}
            </Animated.View>
          </View>
          
          {/* Crop mask */}
          <View style={styles.maskOverlay} pointerEvents="none">
            <View style={[
              styles.cropFrame,
              { width: cropDimensions.width, height: cropDimensions.height },
              cropShape === 'circle' && { borderRadius: cropDimensions.width / 2 }
            ]}>
              {/* Grid lines */}
              {cropShape === 'square' && (
                <>
                  <View style={[styles.gridLine, styles.gridLineH1]} />
                  <View style={[styles.gridLine, styles.gridLineH2]} />
                  <View style={[styles.gridLine, styles.gridLineV1]} />
                  <View style={[styles.gridLine, styles.gridLineV2]} />
                </>
              )}
            </View>
          </View>
        </View>

        <Text style={styles.hint}>Trascina e pizzica per regolare</Text>

        <View style={styles.actions}>
          <Pressable style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelText}>Annulla</Text>
          </Pressable>
          <Pressable 
            style={[styles.confirmBtn, loading && styles.btnDisabled]} 
            onPress={handleCrop}
            disabled={loading}
          >
            <Icon name="check" size={20} color="white" />
            <Text style={styles.confirmText}>
              {loading ? 'Attendi...' : 'Avanti'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default ImageCropper;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingTop: hp(6),
    paddingBottom: hp(2),
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: hp(2),
    fontWeight: '600',
    color: 'white',
  },
  ratioSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: wp(6),
    paddingVertical: hp(1.5),
  },
  ratioButton: {
    alignItems: 'center',
    gap: hp(0.5),
    opacity: 0.5,
  },
  ratioButtonActive: {
    opacity: 1,
  },
  ratioPreview: {
    height: 24,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 3,
  },
  ratioLabel: {
    color: 'white',
    fontSize: hp(1.3),
  },
  ratioLabelActive: {
    fontWeight: '600',
  },
  cropArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  maskOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cropFrame: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    backgroundColor: 'transparent',
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  gridLineH1: {
    left: 0,
    right: 0,
    top: '33.33%',
    height: 1,
  },
  gridLineH2: {
    left: 0,
    right: 0,
    top: '66.66%',
    height: 1,
  },
  gridLineV1: {
    top: 0,
    bottom: 0,
    left: '33.33%',
    width: 1,
  },
  gridLineV2: {
    top: 0,
    bottom: 0,
    left: '66.66%',
    width: 1,
  },
  hint: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.5)',
    fontSize: hp(1.4),
    marginVertical: hp(2),
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: wp(5),
    paddingBottom: hp(5),
    gap: wp(3),
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: hp(1.8),
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
  },
  cancelText: {
    color: 'white',
    fontSize: hp(1.8),
    fontWeight: '500',
  },
  confirmBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: hp(1.8),
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(2),
  },
  confirmText: {
    color: 'white',
    fontSize: hp(1.8),
    fontWeight: '600',
  },
  btnDisabled: {
    opacity: 0.6,
  },
});