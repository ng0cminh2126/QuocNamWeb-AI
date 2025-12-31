// SignalR Provider - Manages SignalR connection lifecycle
// Automatically connects when user is authenticated

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { chatHub, type SignalRConnectionState } from '@/lib/signalr';
import { useAuthStore } from '@/stores/authStore';

interface SignalRContextValue {
  connectionState: SignalRConnectionState;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const SignalRContext = createContext<SignalRContextValue | null>(null);

interface SignalRProviderProps {
  children: React.ReactNode;
}

export function SignalRProvider({ children }: SignalRProviderProps) {
  const [connectionState, setConnectionState] = useState<SignalRConnectionState>('Disconnected');
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const connectionAttemptRef = useRef(false);
  const shouldConnectRef = useRef(false);
  const mountedRef = useRef(true);

  // Connect to SignalR
  const connect = useCallback(async () => {
    if (connectionAttemptRef.current) {
      console.log('SignalR: Connection already in progress, skipping');
      return;
    }
    
    if (!shouldConnectRef.current) {
      console.log('SignalR: Should not connect (auth state changed), skipping');
      return;
    }

    connectionAttemptRef.current = true;

    try {
      setConnectionState('Connecting');
      console.log('SignalR: Starting connection...');
      await chatHub.start(accessToken || undefined);
      
      if (mountedRef.current && shouldConnectRef.current) {
        setConnectionState('Connected');
        console.log('SignalR: Connected successfully');
      }
    } catch (error) {
      if (mountedRef.current) {
        console.error('SignalR: Connection failed', error);
        setConnectionState('Disconnected');
      }
    } finally {
      connectionAttemptRef.current = false;
    }
  }, [accessToken]);

  // Disconnect from SignalR
  const disconnect = useCallback(async () => {
    try {
      await chatHub.stop();
      if (mountedRef.current) {
        setConnectionState('Disconnected');
      }
    } catch (error) {
      console.error('SignalR: Disconnect failed', error);
    }
  }, []);

  // Track mount state
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Auto-connect when authenticated
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      shouldConnectRef.current = true;
      // Small delay to ensure auth state is stable
      const timer = setTimeout(() => {
        if (shouldConnectRef.current) {
          connect();
        }
      }, 100);
      return () => clearTimeout(timer);
    } else {
      shouldConnectRef.current = false;
      disconnect();
    }
  }, [isAuthenticated, accessToken, connect, disconnect]);

  // Cleanup on unmount - only stop if not connecting
  useEffect(() => {
    return () => {
      shouldConnectRef.current = false;
      // Don't call stop() during unmount if connection is in progress
      // The connection will be stopped when component re-mounts with new state
      if (!connectionAttemptRef.current) {
        chatHub.stop();
      }
    };
  }, []);

  // Poll connection state
  useEffect(() => {
    const interval = setInterval(() => {
      const state = chatHub.state;
      if (state !== connectionState) {
        setConnectionState(state);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [connectionState]);

  const value: SignalRContextValue = {
    connectionState,
    isConnected: connectionState === 'Connected',
    connect,
    disconnect,
  };

  return (
    <SignalRContext.Provider value={value}>
      {children}
    </SignalRContext.Provider>
  );
}

export function useSignalRConnection() {
  const context = useContext(SignalRContext);
  if (!context) {
    throw new Error('useSignalRConnection must be used within SignalRProvider');
  }
  return context;
}
