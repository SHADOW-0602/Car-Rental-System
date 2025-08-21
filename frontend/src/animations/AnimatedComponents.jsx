import { motion } from 'framer-motion';
import { buttonHover, buttonTap, cardHover } from './variants';

// Animated Button Component
export const AnimatedButton = ({ children, onClick, style, disabled, ...props }) => (
  <motion.button
    whileHover={!disabled ? buttonHover : {}}
    whileTap={!disabled ? buttonTap : {}}
    onClick={onClick}
    style={style}
    disabled={disabled}
    {...props}
  >
    {children}
  </motion.button>
);

// Animated Card Component
export const AnimatedCard = ({ children, style, ...props }) => (
  <motion.div
    whileHover={cardHover}
    style={style}
    {...props}
  >
    {children}
  </motion.div>
);

// Animated Container
export const AnimatedContainer = ({ children, variants, initial = "hidden", animate = "visible", ...props }) => (
  <motion.div
    variants={variants}
    initial={initial}
    animate={animate}
    {...props}
  >
    {children}
  </motion.div>
);

// Animated Input
export const AnimatedInput = ({ style, ...props }) => (
  <motion.input
    whileFocus={{ scale: 1.02, borderColor: '#667eea' }}
    style={style}
    {...props}
  />
);