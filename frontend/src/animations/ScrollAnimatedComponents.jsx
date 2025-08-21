import { motion } from 'framer-motion';
import { useScrollAnimation, scrollFadeIn, scrollSlideLeft, scrollSlideRight, scrollScale } from './scrollAnimations';

// Scroll-triggered animated container
export const ScrollFadeIn = ({ children, className, style, threshold = 0.1 }) => {
  const { ref, isInView } = useScrollAnimation(threshold);
  
  return (
    <motion.div
      ref={ref}
      variants={scrollFadeIn}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};

// Scroll-triggered slide from left
export const ScrollSlideLeft = ({ children, className, style, threshold = 0.1 }) => {
  const { ref, isInView } = useScrollAnimation(threshold);
  
  return (
    <motion.div
      ref={ref}
      variants={scrollSlideLeft}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};

// Scroll-triggered slide from right
export const ScrollSlideRight = ({ children, className, style, threshold = 0.1 }) => {
  const { ref, isInView } = useScrollAnimation(threshold);
  
  return (
    <motion.div
      ref={ref}
      variants={scrollSlideRight}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};

// Scroll-triggered scale animation
export const ScrollScale = ({ children, className, style, threshold = 0.1 }) => {
  const { ref, isInView } = useScrollAnimation(threshold);
  
  return (
    <motion.div
      ref={ref}
      variants={scrollScale}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};