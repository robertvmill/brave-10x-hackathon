"use client";

import React, { forwardRef, useRef, RefObject, useEffect, useId, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { User, Briefcase } from "lucide-react";

// AnimatedBeam Component
interface AnimatedBeamProps {
  className?: string;
  containerRef: RefObject<HTMLElement>;
  fromRef: RefObject<HTMLElement>;
  toRef: RefObject<HTMLElement>;
  curvature?: number;
  reverse?: boolean;
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  delay?: number;
  duration?: number;
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
}

const AnimatedBeam: React.FC<AnimatedBeamProps> = ({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = 4,
  delay = 0,
  pathColor = "gray",
  pathWidth = 2,
  pathOpacity = 0.2,
  gradientStartColor = "#6366f1",
  gradientStopColor = "#8b5cf6",
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
}) => {
  const id = useId();
  const [pathD, setPathD] = useState("");
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });

  // Calculate the gradient coordinates based on the reverse prop
  const gradientCoordinates = reverse
    ? {
        x1: ["90%", "-10%"],
        x2: ["100%", "0%"],
        y1: ["0%", "0%"],
        y2: ["0%", "0%"],
      }
    : {
        x1: ["10%", "110%"],
        x2: ["0%", "100%"],
        y1: ["0%", "0%"],
        y2: ["0%", "0%"],
      };

  useEffect(() => {
    const updatePath = () => {
      if (containerRef.current && fromRef.current && toRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const rectA = fromRef.current.getBoundingClientRect();
        const rectB = toRef.current.getBoundingClientRect();

        const svgWidth = containerRect.width;
        const svgHeight = containerRect.height;
        setSvgDimensions({ width: svgWidth, height: svgHeight });

        const startX =
          rectA.left - containerRect.left + rectA.width / 2 + startXOffset;
        const startY =
          rectA.top - containerRect.top + rectA.height / 2 + startYOffset;
        const endX =
          rectB.left - containerRect.left + rectB.width / 2 + endXOffset;
        const endY =
          rectB.top - containerRect.top + rectB.height / 2 + endYOffset;

        const controlY = startY - curvature;
        const d = `M ${startX},${startY} Q ${
          (startX + endX) / 2
        },${controlY} ${endX},${endY}`;
        setPathD(d);
      }
    };

    // Initialize ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      updatePath();
    });

    // Observe the container element
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Call the updatePath initially to set the initial path
    updatePath();

    // Clean up the observer on component unmount
    return () => {
      resizeObserver.disconnect();
    };
  }, [
    containerRef,
    fromRef,
    toRef,
    curvature,
    startXOffset,
    startYOffset,
    endXOffset,
    endYOffset,
  ]);

  return (
    <svg
      fill="none"
      width={svgDimensions.width}
      height={svgDimensions.height}
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "pointer-events-none absolute left-0 top-0 transform-gpu stroke-2",
        className,
      )}
      viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
    >
      <path
        d={pathD}
        stroke={pathColor}
        strokeWidth={pathWidth}
        strokeOpacity={pathOpacity}
        strokeLinecap="round"
      />
      <path
        d={pathD}
        strokeWidth={pathWidth}
        stroke={`url(#${id})`}
        strokeOpacity="1"
        strokeLinecap="round"
      />
      <defs>
        <motion.linearGradient
          className="transform-gpu"
          id={id}
          gradientUnits={"userSpaceOnUse"}
          initial={{
            x1: "0%",
            x2: "0%",
            y1: "0%",
            y2: "0%",
          }}
          animate={{
            x1: gradientCoordinates.x1,
            x2: gradientCoordinates.x2,
            y1: gradientCoordinates.y1,
            y2: gradientCoordinates.y2,
          }}
          transition={{
            delay,
            duration,
            ease: [0.16, 1, 0.3, 1],
            repeat: Infinity,
            repeatDelay: 0,
          }}
        >
          <stop stopColor={gradientStartColor} stopOpacity="0"></stop>
          <stop stopColor={gradientStartColor}></stop>
          <stop offset="32.5%" stopColor={gradientStopColor}></stop>
          <stop
            offset="100%"
            stopColor={gradientStopColor}
            stopOpacity="0"
          ></stop>
        </motion.linearGradient>
      </defs>
    </svg>
  );
};

// Node Component
interface NodeProps {
  className?: string;
  children?: React.ReactNode;
}

const Node = forwardRef<HTMLDivElement, NodeProps>(
  ({ className, children }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "z-10 flex size-12 items-center justify-center rounded-full border-2 border-white bg-white p-3 shadow-lg",
          className,
        )}
      >
        {children}
      </div>
    );
  }
);

Node.displayName = "Node";

// Main Component - Simplified for HireHub
interface ConnectionNetworkProps {
  className?: string;
}

const ConnectionNetwork: React.FC<ConnectionNetworkProps> = ({ className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const recruiter1Ref = useRef<HTMLDivElement>(null);
  const recruiter2Ref = useRef<HTMLDivElement>(null);
  const centralNodeRef = useRef<HTMLDivElement>(null);
  const candidate1Ref = useRef<HTMLDivElement>(null);
  const candidate2Ref = useRef<HTMLDivElement>(null);
  const candidate3Ref = useRef<HTMLDivElement>(null);

  return (
    <div
      className={cn(
        "relative flex h-[400px] w-full items-center justify-center overflow-hidden rounded-lg p-8",
        className
      )}
      ref={containerRef}
    >
      {/* Horizontally mirrored layout: left/right positions swapped */}
      <div className="flex size-full max-h-[280px] max-w-md flex-col items-stretch justify-between gap-8">
        {/* Top Row - Recruiters (horizontally mirrored) */}
        <div className="flex flex-row items-center justify-between">
          <Node ref={recruiter2Ref} className="bg-orange-50 text-orange-600 shadow-orange-200">
            <Briefcase size={20} />
          </Node>
          <Node ref={recruiter1Ref} className="bg-blue-50 text-blue-600 shadow-blue-200">
            <Briefcase size={20} />
          </Node>
        </div>
        
        {/* Middle Row - Central Hub */}
        <div className="flex flex-row items-center justify-center">
          <Node ref={centralNodeRef} className="size-16 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-indigo-300">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.09 8.26L19 7L14.74 12L19 17L13.09 15.74L12 22L10.91 15.74L5 17L9.26 12L5 7L10.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Node>
        </div>

        {/* Bottom Row - Candidates (horizontally mirrored) */}
        <div className="flex flex-row items-center justify-between">
          <Node ref={candidate3Ref} className="bg-emerald-50 text-emerald-600 shadow-emerald-200">
            <User size={20} />
          </Node>
          <Node ref={candidate2Ref} className="bg-emerald-50 text-emerald-600 shadow-emerald-200">
            <User size={20} />
          </Node>
          <Node ref={candidate1Ref} className="bg-emerald-50 text-emerald-600 shadow-emerald-200">
            <User size={20} />
          </Node>
        </div>
      </div>

      {/* Animated Beams from Recruiters to Central Hub (adjusted for mirrored positions) */}
      <AnimatedBeam
        containerRef={containerRef as React.RefObject<HTMLElement>}
        fromRef={recruiter2Ref as React.RefObject<HTMLElement>}
        toRef={centralNodeRef as React.RefObject<HTMLElement>}
        curvature={-60}
        duration={4}
        delay={0}
        gradientStartColor="#f97316"
        gradientStopColor="#8b5cf6"
      />
      <AnimatedBeam
        containerRef={containerRef as React.RefObject<HTMLElement>}
        fromRef={recruiter1Ref as React.RefObject<HTMLElement>}
        toRef={centralNodeRef as React.RefObject<HTMLElement>}
        curvature={-40}
        duration={4.5}
        delay={0.5}
        gradientStartColor="#3b82f6"
        gradientStopColor="#6366f1"
      />

      {/* Animated Beams from Central Hub to Candidates (adjusted for mirrored positions) */}
      <AnimatedBeam
        containerRef={containerRef as React.RefObject<HTMLElement>}
        fromRef={centralNodeRef as React.RefObject<HTMLElement>}
        toRef={candidate3Ref as React.RefObject<HTMLElement>}
        curvature={60}
        duration={3.5}
        delay={1}
        reverse
        gradientStartColor="#6366f1"
        gradientStopColor="#10b981"
      />
      <AnimatedBeam
        containerRef={containerRef as React.RefObject<HTMLElement>}
        fromRef={centralNodeRef as React.RefObject<HTMLElement>}
        toRef={candidate2Ref as React.RefObject<HTMLElement>}
        curvature={20}
        duration={4}
        delay={1.5}
        reverse
        gradientStartColor="#8b5cf6"
        gradientStopColor="#10b981"
      />
      <AnimatedBeam
        containerRef={containerRef as React.RefObject<HTMLElement>}
        fromRef={centralNodeRef as React.RefObject<HTMLElement>}
        toRef={candidate1Ref as React.RefObject<HTMLElement>}
        curvature={-60}
        duration={4.2}
        delay={2}
        reverse
        gradientStartColor="#6366f1"
        gradientStopColor="#10b981"
      />
    </div>
  );
};

// Main Export
export default function HiringNetworkDemo() {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <ConnectionNetwork />
    </div>
  );
} 