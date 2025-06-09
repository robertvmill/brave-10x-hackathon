"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Node {
  id: string;
  x: number;
  y: number;
  radius: number;
  label?: string;
  color?: string;
}

interface Connection {
  source: string;
  target: string;
  strength?: number;
  color?: string;
}

interface MagneticFieldProps {
  nodes: Node[];
  connections: Connection[];
  width?: number;
  height?: number;
  className?: string;
  backgroundColor?: string;
  nodeColor?: string;
  connectionColor?: string;
  pulseColor?: string;
  orbitColor?: string;
  particleCount?: number;
  particleSize?: number;
  particleSpeed?: number;
  particleColor?: string;
  showMagneticField?: boolean;
  showOrbitalParticles?: boolean;
  showFlowingDots?: boolean;
}

const MagneticField: React.FC<MagneticFieldProps> = ({
  nodes,
  connections,
  width = 600,
  height = 400,
  className,
  backgroundColor = "transparent",
  nodeColor = "#6366f1",
  connectionColor = "rgba(99, 102, 241, 0.3)",
  pulseColor = "#6366f1",
  orbitColor = "rgba(99, 102, 241, 0.6)",
  particleCount = 30,
  particleSize = 2,
  particleSpeed = 1,
  particleColor = "#6366f1",
  showMagneticField = true,
  showOrbitalParticles = true,
  showFlowingDots = true,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    progress: number;
    connectionIndex: number;
  }>>([]);

  // Only run animations after component mounts on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Create node map for easier lookup
  const nodeMap = nodes.reduce((acc, node) => {
    acc[node.id] = node;
    return acc;
  }, {} as Record<string, Node>);

  // Generate flowing particles along connections - only after mounting
  useEffect(() => {
    if (!showFlowingDots || !isMounted) return;

    const newParticles = [];
    for (let i = 0; i < particleCount; i++) {
      const connectionIndex = i % connections.length; // Use modulo instead of random
      const connection = connections[connectionIndex];
      const source = nodeMap[connection.source];
      const target = nodeMap[connection.target];
      
      if (!source || !target) continue;
      
      const progress = (i / particleCount); // Deterministic spacing
      const x = source.x + (target.x - source.x) * progress;
      const y = source.y + (target.y - source.y) * progress;
      
      newParticles.push({
        id: i,
        x,
        y,
        vx: (target.x - source.x) * 0.01 * particleSpeed,
        vy: (target.y - source.y) * 0.01 * particleSpeed,
        size: particleSize * (0.8 + (i % 3) * 0.2), // Deterministic size variation
        color: particleColor,
        progress,
        connectionIndex,
      });
    }
    
    setParticles(newParticles);
    
    const interval = setInterval(() => {
      setParticles(prevParticles => 
        prevParticles.map(particle => {
          const connection = connections[particle.connectionIndex];
          const source = nodeMap[connection.source];
          const target = nodeMap[connection.target];
          
          if (!source || !target) return particle;
          
          let newProgress = particle.progress + 0.008 * particleSpeed;
          if (newProgress > 1) newProgress = 0;
          
          return {
            ...particle,
            x: source.x + (target.x - source.x) * newProgress,
            y: source.y + (target.y - source.y) * newProgress,
            progress: newProgress,
          };
        })
      );
    }, 50);
    
    return () => clearInterval(interval);
  }, [connections, nodeMap, particleCount, particleSize, particleSpeed, particleColor, showFlowingDots, isMounted]);

  // Calculate curved path between nodes
  const createCurvedPath = (source: Node, target: Node) => {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    
    // Calculate control point for the curve
    const midX = (source.x + target.x) / 2;
    const midY = (source.y + target.y) / 2;
    
    // Add some curvature
    const controlX = midX - dy * 0.2;
    const controlY = midY + dx * 0.2;
    
    return `M ${source.x} ${source.y} Q ${controlX} ${controlY} ${target.x} ${target.y}`;
  };

  // Create deterministic durations based on connection index
  const getAnimationDuration = (index: number, base: number = 4) => {
    return base + (index % 3); // Creates durations of 4s, 5s, 6s
  };

  const getNodeDelay = (index: number) => {
    return index * 0.5; // Deterministic delays
  };

  if (!isMounted) {
    // Render static version during SSR
    return (
      <div className={cn("relative overflow-hidden", className)} style={{ width, height }}>
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="absolute inset-0"
        >
          {/* Static connections */}
          {connections.map((connection, i) => {
            const source = nodeMap[connection.source];
            const target = nodeMap[connection.target];
            
            if (!source || !target) return null;
            
            return (
              <path
                key={`connection-${i}`}
                d={createCurvedPath(source, target)}
                fill="none"
                stroke={connection.color || connectionColor}
                strokeWidth={1.5}
                strokeOpacity={0.4}
              />
            );
          })}
          
          {/* Static nodes */}
          {nodes.map((node, i) => (
            <circle
              key={`node-${i}`}
              cx={node.x}
              cy={node.y}
              r={node.radius}
              fill={node.color || nodeColor}
              stroke="white"
              strokeWidth={2}
            />
          ))}
        </svg>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)} style={{ width, height }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="absolute inset-0"
      >
        {/* Magnetic field effect */}
        {showMagneticField && (
          <defs>
            <radialGradient id="magneticField" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor={orbitColor} stopOpacity="0.1" />
              <stop offset="50%" stopColor={orbitColor} stopOpacity="0.05" />
              <stop offset="100%" stopColor={orbitColor} stopOpacity="0" />
            </radialGradient>
          </defs>
        )}
        
        {/* Connections */}
        {connections.map((connection, i) => {
          const source = nodeMap[connection.source];
          const target = nodeMap[connection.target];
          
          if (!source || !target) return null;
          
          const pathId = `path-${i}`;
          const duration = getAnimationDuration(i);
          
          return (
            <g key={`connection-${i}`}>
              {/* Base connection line */}
              <path
                id={pathId}
                d={createCurvedPath(source, target)}
                fill="none"
                stroke={connection.color || connectionColor}
                strokeWidth={1.5}
                strokeOpacity={0.6}
              />
              
              {/* Animated pulse effect */}
              <motion.circle
                r={3}
                fill={pulseColor}
                opacity={0.8}
                initial={{ opacity: 0.8 }}
                animate={{
                  opacity: [0.8, 0.2, 0.8],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3,
                }}
              >
                <animateMotion
                  dur={`${duration}s`}
                  repeatCount="indefinite"
                  path={createCurvedPath(source, target)}
                />
              </motion.circle>
            </g>
          );
        })}
        
        {/* Flowing particles */}
        {showFlowingDots && particles.map(particle => (
          <motion.circle
            key={`particle-${particle.id}`}
            cx={particle.x}
            cy={particle.y}
            r={particle.size}
            fill={particle.color}
            opacity={0.7}
            initial={{ opacity: 0.7 }}
            animate={{
              opacity: [0.7, 0.3, 0.7],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
        
        {/* Nodes */}
        {nodes.map((node, nodeIndex) => (
          <g key={`node-${node.id}`}>
            {/* Magnetic field around node */}
            {showMagneticField && (
              <circle
                cx={node.x}
                cy={node.y}
                r={node.radius * 3}
                fill="url(#magneticField)"
              />
            )}
            
            {/* Orbital particles */}
            {showOrbitalParticles && Array.from({ length: 2 }).map((_, i) => (
              <motion.circle
                key={`orbit-${node.id}-${i}`}
                cx={0}
                cy={0}
                r={1.5}
                fill={orbitColor}
                opacity={0.6}
                initial={{ opacity: 0.6 }}
                animate={{
                  opacity: [0.6, 0.2, 0.6],
                }}
                transition={{
                  duration: 2 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.5,
                }}
              >
                <animateMotion
                  dur={`${6 - i * 2}s`}
                  repeatCount="indefinite"
                  path={`M 0,0 m -${node.radius * 1.8},0 a ${node.radius * 1.8},${node.radius * 1.8} 0 1,0 ${
                    node.radius * 3.6
                  },0 a ${node.radius * 1.8},${node.radius * 1.8} 0 1,0 -${node.radius * 3.6},0`}
                >
                </animateMotion>
              </motion.circle>
            ))}
            
            {/* Node circle */}
            <circle
              cx={node.x}
              cy={node.y}
              r={node.radius}
              fill={node.color || nodeColor}
              stroke="white"
              strokeWidth={2}
            />
            
            {/* Pulse effect */}
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={node.radius}
              stroke={pulseColor}
              strokeWidth={2}
              fill="none"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.8, 0, 0.8],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: getNodeDelay(nodeIndex),
              }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
};

// Demo component for HireHub
const NetworkConnectionDemo = () => {
  // Define nodes representing hiring connections
  const nodes: Node[] = [
    { id: "company1", x: 120, y: 120, radius: 14, color: "#6366f1" },
    { id: "company2", x: 480, y: 100, radius: 16, color: "#8b5cf6" },
    { id: "candidate1", x: 300, y: 280, radius: 12, color: "#10b981" },
    { id: "candidate2", x: 150, y: 300, radius: 12, color: "#10b981" },
    { id: "candidate3", x: 450, y: 320, radius: 12, color: "#10b981" },
    { id: "recruiter", x: 300, y: 80, radius: 13, color: "#f97316" },
  ];

  // Define connections between nodes
  const connections: Connection[] = [
    { source: "recruiter", target: "company1", color: "rgba(249, 115, 22, 0.5)" },
    { source: "recruiter", target: "company2", color: "rgba(249, 115, 22, 0.5)" },
    { source: "company1", target: "candidate1", color: "rgba(99, 102, 241, 0.5)" },
    { source: "company1", target: "candidate2", color: "rgba(99, 102, 241, 0.5)" },
    { source: "company2", target: "candidate1", color: "rgba(139, 92, 246, 0.5)" },
    { source: "company2", target: "candidate3", color: "rgba(139, 92, 246, 0.5)" },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      <MagneticField 
        nodes={nodes} 
        connections={connections} 
        width={600} 
        height={400}
        className="w-full h-full"
        showMagneticField={true}
        showOrbitalParticles={true}
        showFlowingDots={true}
        particleCount={25}
        particleSpeed={1.5}
      />
    </div>
  );
};

export default NetworkConnectionDemo; 