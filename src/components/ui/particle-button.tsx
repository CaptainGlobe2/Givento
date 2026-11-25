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

interface ParticleCoords {
  x: number;
  y: number;
}

function SuccessParticles({ coords }: { coords: ParticleCoords | null }) {
  if (!coords) return null;

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
            style={{ left: coords.x, top: coords.y, backgroundColor: color }}
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
    const [particleCoords, setParticleCoords] = useState<ParticleCoords | null>(null);
    const innerRef = useRef<HTMLButtonElement>(null);

    const setRefs = React.useCallback(
      (node: HTMLButtonElement | null) => {
        innerRef.current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          (forwardedRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        }
      },
      [forwardedRef]
    );

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setParticleCoords({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
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
        {showParticles && <SuccessParticles coords={particleCoords} />}
        <Button
          ref={setRefs}
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
