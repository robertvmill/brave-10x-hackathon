'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Room, RoomEvent, ConnectionState } from 'livekit-client';

interface LiveKitContextType {
  room: Room | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: (token: string, url: string) => Promise<void>;
  disconnect: () => Promise<void>;
}

const LiveKitContext = createContext<LiveKitContextType | undefined>(undefined);

interface LiveKitProviderProps {
  children: ReactNode;
}

export function LiveKitProvider({ children }: LiveKitProviderProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = async (token: string, url: string) => {
    try {
      setIsConnecting(true);
      setError(null);

      const newRoom = new Room();
      
      // Set up event listeners
      newRoom.on(RoomEvent.Connected, () => {
        console.log('Connected to LiveKit room');
        setIsConnected(true);
        setIsConnecting(false);
      });

      newRoom.on(RoomEvent.Disconnected, () => {
        console.log('Disconnected from LiveKit room');
        setIsConnected(false);
        setIsConnecting(false);
      });

      newRoom.on(RoomEvent.ConnectionStateChanged, (state) => {
        console.log('Connection state changed:', state);
        if (state === ConnectionState.Failed) {
          setError('Connection failed');
          setIsConnecting(false);
        }
      });

      newRoom.on(RoomEvent.RoomMetadataChanged, (metadata) => {
        console.log('Room metadata changed:', metadata);
      });

      await newRoom.connect(url, token);
      setRoom(newRoom);
      
    } catch (err) {
      console.error('Failed to connect to room:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    if (room) {
      await room.disconnect();
      setRoom(null);
      setIsConnected(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [room]);

  const value: LiveKitContextType = {
    room,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect
  };

  return (
    <LiveKitContext.Provider value={value}>
      {children}
    </LiveKitContext.Provider>
  );
}

export function useLiveKit() {
  const context = useContext(LiveKitContext);
  if (context === undefined) {
    throw new Error('useLiveKit must be used within a LiveKitProvider');
  }
  return context;
} 