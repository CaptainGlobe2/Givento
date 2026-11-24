"use client";

import * as React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ButtonProps } from "@/components/ui/button";

export interface ParticleButtonProps extends ButtonProps {
  onSuccess?: () => void;
  successDuration?: number;
}

const PARTICLE_COLORS = ["#7A1C3B", "#D4AF37", "#E07A5F", "#81B29A", "#F4A261", "#B56576"];

function SuccessParticles({
  buttonRef,
}: {
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const rect = buttonRef.current?.getBoundingClientRect();
  if (!rect) return null;

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  return (
    <AnimatePresence>
      {[...Array(12)].map((_, i) => {
        const color = PARTICLE_COLORS[i % PARTICLE_COLORS.length];
        const angle = (i / 12) * Math.PI * 2;
        const distance = 40 + (i % 3) * 20;
        const targetX = Math.cos(angle) * distance;
        const targetY = Math.sin(angle) * distance;

        return (
          <motion.div
            key={i}
            className="fixed w-2 h-2 rounded-full pointer-events-none z-[9999] shadow-xs"
            style={{ left: centerX, top: centerY, backgroundColor: color }}
            initial={{
              scale: 0,
              x: 0,
              y: 0,
              opacity: 1,
            }}
            animate={{
              scale: [0, 1.4, 0],
              x: [0, targetX],
              y: [0, targetY],
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: 0.7,
              delay: (i % 4) * 0.04,
              ease: "easeOut",
            }}
          />
        );
      })}
    </AnimatePresence>
  );
}

const ParticleButton = React.forwardRef<HTMLButtonElement, ParticleButtonProps>(
  (
    {
      children,
      onClick,
      onSuccess,
      successDuration = 1000,
      className,
      ...props
    },
    forwardedRef
  ) => {
    const [showParticles, setShowParticles] = useState(false);
    const innerRef = useRef<HTMLButtonElement>(null);
    const resolvedRef = (forwardedRef as React.RefObject<HTMLButtonElement | null>) || innerRef;

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      setShowParticles(true);
      if (onClick) {
        onClick(e);
      }
      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        setShowParticles(false);
      }, successDuration);
    };

    return (
      <>
        {showParticles && <SuccessParticles buttonRef={resolvedRef} />}
        <Button
          ref={resolvedRef}
          onClick={handleClick}
          className={cn(
            "relative select-none",
            showParticles && "scale-[0.98]",
            "transition-transform duration-150",
            className
          )}
          {...props}
        >
          {children}
        </Button>
      </>
    );
  }
);
ParticleButton.displayName = "ParticleButton";

export { ParticleButton };
