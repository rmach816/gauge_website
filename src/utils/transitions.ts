import { TransitionSpec, CardStyleInterpolator } from '@react-navigation/stack';

/**
 * Screen Transition Configurations
 * Provides smooth, polished transitions between screens
 */

/**
 * Fade transition - smooth fade in/out
 */
export const fadeTransition: TransitionSpec = {
  animation: 'timing',
  config: {
    duration: 300,
  },
};

export const fadeCardStyleInterpolator: CardStyleInterpolator = ({ current }) => ({
  cardStyle: {
    opacity: current.progress,
  },
});

/**
 * Slide transition - slide from right (default iOS)
 */
export const slideTransition: TransitionSpec = {
  animation: 'timing',
  config: {
    duration: 300,
  },
};

/**
 * Modal transition - slide up from bottom
 */
export const modalTransition: TransitionSpec = {
  animation: 'timing',
  config: {
    duration: 350,
  },
};

export const modalCardStyleInterpolator: CardStyleInterpolator = ({ current }) => ({
  cardStyle: {
    opacity: current.progress,
    transform: [
      {
        translateY: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
        }),
      },
    ],
  },
});

/**
 * Scale transition - scale in/out
 */
export const scaleTransition: TransitionSpec = {
  animation: 'spring',
  config: {
    damping: 15,
    stiffness: 150,
  },
};

export const scaleCardStyleInterpolator: CardStyleInterpolator = ({ current }) => ({
  cardStyle: {
    opacity: current.progress,
    transform: [
      {
        scale: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.9, 1],
        }),
      },
    ],
  },
});

