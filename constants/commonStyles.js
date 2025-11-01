import { StyleSheet } from 'react-native';
import { theme } from './theme';
import { hp } from '../helpers/common';

export const commonStyles = StyleSheet.create({
  // ===== CONTAINERS =====
  flexRow: {
    flexDirection: 'row',
  },
  flexRowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ===== SPACING =====
  gap4: { gap: 4 },
  gap6: { gap: 6 },
  gap8: { gap: 8 },
  gap10: { gap: 10 },
  gap12: { gap: 12 },
  gap15: { gap: 15 },
  gap16: { gap: 16 },
  gap20: { gap: 20 },

  paddingH12: { paddingHorizontal: 12 },
  paddingH16: { paddingHorizontal: 16 },
  paddingV10: { paddingVertical: 10 },
  paddingV12: { paddingVertical: 12 },
  paddingV16: { paddingVertical: 16 },

  // ===== TEXT STYLES =====
  textSemiBold: {
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  textMedium: {
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
  },
  textLight: {
    color: theme.colors.textLight,
  },

  // ===== POSITIONS =====
  absoluteFill: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
});