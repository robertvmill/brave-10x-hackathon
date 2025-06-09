"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ConnectionNode {
  id: string;
  label: string;
  icon?: React.ReactNode;
  type: "recruiter" | "candidate";
  position: { x: number; y: number };
}

interface ConnectionLink {
  from: string;
  to: string;
  strength?: number;
  color?: string;
}

interface ParticleFlowProps {
  className?: string;
  nodes: ConnectionNode[];
  links: ConnectionLink[];
  particleColor?: string;
  particleCount?: number;
  particleSpeed?: number;
  backgroundColor?: string;
  title?: string;
  subtitle?: string;
}

const ConnectionParticleFlow = ({
  className,
  nodes,
  links,
  particleColor = "#6366f1",
  particleCount = 30,
  particleSpeed = 1.5,
  backgroundColor = "transparent",
  title = "Connecting Talent",
  subtitle = "Create meaningful connections between recruiters and candidates with our intelligent matching system.",
}: ParticleFlowProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-[400px] overflow-hidden rounded-lg",
        className
      )}
      style={{ backgroundColor }}
    >
      <div className="absolute inset-0">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          className="absolute inset-0"
        >
          {links.map((link, i) => {
            const fromNode = nodes.find((n) => n.id === link.from);
            const toNode = nodes.find((n) => n.id === link.to);

            if (!fromNode || !toNode) return null;

            const startX = fromNode.position.x * dimensions.width;
            const startY = fromNode.position.y * dimensions.height;
            const endX = toNode.position.x * dimensions.width;
            const endY = toNode.position.y * dimensions.height;
            const midX = (startX + endX) / 2;
            const midY = Math.min(startY, endY) - 50;

            const pathId = `path-${i}`;
            const gradientId = `gradient-${i}`;

            return (
              <g key={`link-${i}`}>
                <defs>
                  <linearGradient
                    id={gradientId}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop
                      offset="0%"
                      stopColor={link.color || particleColor}
                      stopOpacity="0"
                    />
                    <stop
                      offset="5%"
                      stopColor={link.color || particleColor}
                      stopOpacity="1"
                    />
                    <stop
                      offset="95%"
                      stopColor={link.color || particleColor}
                      stopOpacity="1"
                    />
                    <stop
                      offset="100%"
                      stopColor={link.color || particleColor}
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>
                <path
                  id={pathId}
                  d={`M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`}
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                />
                <motion.path
                  d={`M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`}
                  fill="none"
                  stroke={`url(#${gradientId})`}
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.2,
                    ease: "easeOut",
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                />
                {Array.from({ length: Math.ceil((link.strength || 1) * 3) }).map(
                  (_, particleIndex) => (
                    <AnimatedParticle
                      key={`particle-${i}-${particleIndex}`}
                      color={link.color || particleColor}
                      speed={particleSpeed}
                      delay={particleIndex * 2 + i}
                      fromNode={fromNode}
                      toNode={toNode}
                    />
                  )
                )}
              </g>
            );
          })}

          {nodes.map((node, i) => (
            <g key={`node-${i}`}>
              <motion.circle
                cx={node.position.x * dimensions.width}
                cy={node.position.y * dimensions.height}
                r="16"
                fill="white"
                className="drop-shadow-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: i * 0.1,
                }}
              />
              <circle
                cx={node.position.x * dimensions.width}
                cy={node.position.y * dimensions.height}
                r="16"
                fill={node.type === "recruiter" ? "#6366f1" : "#10b981"}
                opacity="0.2"
              >
                <animate
                  attributeName="r"
                  from="16"
                  to="24"
                  dur="2s"
                  begin="0s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  from="0.2"
                  to="0"
                  dur="2s"
                  begin="0s"
                  repeatCount="indefinite"
                />
              </circle>
              <foreignObject
                x={node.position.x * dimensions.width - 12}
                y={node.position.y * dimensions.height - 12}
                width="24"
                height="24"
                className="flex items-center justify-center"
              >
                <div className="flex items-center justify-center w-full h-full">
                  {node.icon || (
                    <div
                      className={cn(
                        "w-5 h-5 flex items-center justify-center",
                        node.type === "recruiter" ? "text-indigo-600" : "text-emerald-600"
                      )}
                    >
                      {node.type === "recruiter" ? (
                        <RecruiterIcon />
                      ) : (
                        <CandidateIcon />
                      )}
                    </div>
                  )}
                </div>
              </foreignObject>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

interface AnimatedParticleProps {
  color: string;
  speed: number;
  delay: number;
  fromNode: ConnectionNode;
  toNode: ConnectionNode;
}

const AnimatedParticle: React.FC<AnimatedParticleProps> = ({
  color,
  speed,
  delay,
  fromNode,
  toNode,
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const duration = 3000 / speed; // Convert to milliseconds
    const startTime = Date.now() + delay * 1000;
    
    const updatePosition = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      
      if (elapsed < 0) {
        // Animation hasn't started yet
        requestAnimationFrame(updatePosition);
        return;
      }
      
      const progress = ((elapsed % duration) / duration);
      
      // Calculate bezier curve position
      const startX = fromNode.position.x;
      const startY = fromNode.position.y;
      const endX = toNode.position.x;
      const endY = toNode.position.y;
      const midX = (startX + endX) / 2;
      const midY = Math.min(startY, endY) - 0.125; // Relative curve height
      
      // Quadratic bezier curve calculation
      const t = progress;
      const x = Math.pow(1 - t, 2) * startX + 2 * (1 - t) * t * midX + Math.pow(t, 2) * endX;
      const y = Math.pow(1 - t, 2) * startY + 2 * (1 - t) * t * midY + Math.pow(t, 2) * endY;
      
      setPosition({ x, y });
      
      requestAnimationFrame(updatePosition);
    };
    
    const animationId = requestAnimationFrame(updatePosition);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [fromNode, toNode, speed, delay]);

  return (
    <motion.circle
      r="2"
      fill={color}
      cx={position.x * 100 + "%"}
      cy={position.y * 100 + "%"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        delay: delay,
        duration: 0.2,
      }}
    />
  );
};

const RecruiterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CandidateIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ConnectionDemo = () => {
  const nodes: ConnectionNode[] = [
    {
      id: "recruiter1",
      label: "Recruiter 1",
      type: "recruiter",
      position: { x: 0.15, y: 0.3 },
    },
    {
      id: "recruiter2",
      label: "Recruiter 2",
      type: "recruiter",
      position: { x: 0.85, y: 0.25 },
    },
    {
      id: "recruiter3",
      label: "Recruiter 3",
      type: "recruiter",
      position: { x: 0.75, y: 0.6 },
    },
    {
      id: "candidate1",
      label: "Candidate 1",
      type: "candidate",
      position: { x: 0.3, y: 0.75 },
    },
    {
      id: "candidate2",
      label: "Candidate 2",
      type: "candidate",
      position: { x: 0.5, y: 0.8 },
    },
    {
      id: "candidate3",
      label: "Candidate 3",
      type: "candidate",
      position: { x: 0.7, y: 0.75 },
    },
    {
      id: "candidate4",
      label: "Candidate 4",
      type: "candidate",
      position: { x: 0.2, y: 0.5 },
    },
  ];

  const links: ConnectionLink[] = [
    { from: "recruiter1", to: "candidate1", strength: 0.8, color: "#6366f1" },
    { from: "recruiter1", to: "candidate4", strength: 0.6, color: "#6366f1" },
    { from: "recruiter2", to: "candidate2", strength: 0.7, color: "#8b5cf6" },
    { from: "recruiter2", to: "candidate3", strength: 0.9, color: "#8b5cf6" },
    { from: "recruiter3", to: "candidate3", strength: 0.5, color: "#06b6d4" },
    { from: "recruiter3", to: "candidate2", strength: 0.4, color: "#06b6d4" },
  ];

  return (
    <div className="w-full">
      <ConnectionParticleFlow
        nodes={nodes}
        links={links}
        particleColor="#6366f1"
        particleSpeed={1.2}
        backgroundColor="transparent"
      />
    </div>
  );
};

export default ConnectionDemo;
export { ConnectionParticleFlow }; 