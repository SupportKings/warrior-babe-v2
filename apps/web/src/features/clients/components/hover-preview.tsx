"use client";

import type * as React from "react";
import { useRef, useState } from "react";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "motion/react";

interface HoverPreviewProps {
  children: React.ReactNode;
  preview: any;
}

const HoverPreview: React.FC<HoverPreviewProps> = ({ children, preview }) => {
  const [showPreview, setShowPreview] = useState(false);
  const prevX = useRef<number | null>(null);

  // Motion values for smooth animation
  const motionTop = useMotionValue(0);
  const motionLeft = useMotionValue(0);
  const motionRotate = useMotionValue(0);

  // Springs for natural movement
  const springTop = useSpring(motionTop, { stiffness: 300, damping: 30 });
  const springLeft = useSpring(motionLeft, { stiffness: 300, damping: 30 });
  const springRotate = useSpring(motionRotate, { stiffness: 300, damping: 20 });

  // Handlers
  const handleMouseEnter = () => {
    setShowPreview(true);
    prevX.current = null;
  };

  const handleMouseLeave = () => {
    setShowPreview(false);
    prevX.current = null;
    motionRotate.set(0);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const PREVIEW_WIDTH = 192;
    const PREVIEW_HEIGHT = 112;
    const OFFSET_Y = 40;

    // Position the preview
    motionTop.set(e.clientY - PREVIEW_HEIGHT - OFFSET_Y);
    motionLeft.set(e.clientX - PREVIEW_WIDTH / 2);

    // Calculate tilt based on horizontal movement
    if (prevX.current !== null) {
      const deltaX = e.clientX - prevX.current;
      const newRotate = Math.max(-15, Math.min(15, deltaX * 1.2));
      motionRotate.set(newRotate);
    }
    prevX.current = e.clientX;
  };

  return (
    <>
      <div
        className="m-0 p-0"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseOver={(e: React.MouseEvent<HTMLDivElement>) =>
          handleMouseMove(e)
        }
      >
        {children}
      </div>

      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10, rotate: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10, rotate: 0 }}
            style={{
              position: "fixed",
              top: springTop,
              left: springLeft,
              rotate: springRotate,
              zIndex: 50,
              pointerEvents: "none",
            }}
          >
            {preview}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export { HoverPreview };
