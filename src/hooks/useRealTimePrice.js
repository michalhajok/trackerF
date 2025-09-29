/**
 * useRealTimePrice.js - Dedicated hook for real-time price updates
 * Handles WebSocket connections and live price streaming
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiEndpoints } from "../lib/api";

const WEBSOCKET_URL =
  process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:5000/ws";
const RECONNECT_INTERVAL = 5000;
const MAX_RECONNECT_ATTEMPTS = 5;

export const useRealTimePrice = (symbols = [], options = {}) => {
  const {
    autoConnect = true,
    updateInterval = 1000,
    onPriceUpdate,
    onConnectionChange,
    enableLogging = false,
  } = options;

  const [connection, setConnection] = useState({
    status: "disconnected", // disconnected, connecting, connected, error
    lastUpdate: null,
    reconnectAttempts: 0,
    error: null,
  });

  const [priceData, setPriceData] = useState({});
  const [subscriptions, setSubscriptions] = useState(new Set());

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const heartbeatRef = useRef(null);
  const queryClient = useQueryClient();

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    setConnection((prev) => ({ ...prev, status: "connecting" }));

    try {
      // For now, simulate WebSocket with polling
      // TODO: Replace with actual WebSocket implementation
      console.log("🔌 Connecting to price feed...");

      // Simulate connection success
      setTimeout(() => {
        setConnection((prev) => ({
          ...prev,
          status: "connected",
          reconnectAttempts: 0,
          error: null,
        }));

        onConnectionChange?.("connected");

        // Start price simulation
        startPriceSimulation();
      }, 1000);
    } catch (error) {
      console.error("WebSocket connection failed:", error);
      setConnection((prev) => ({
        ...prev,
        status: "error",
        error: error.message,
      }));

      // Attempt reconnection
      scheduleReconnection();
    }
  }, [onConnectionChange]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
    }

    setConnection((prev) => ({
      ...prev,
      status: "disconnected",
      error: null,
    }));

    onConnectionChange?.("disconnected");
    console.log("🔌 Disconnected from price feed");
  }, [onConnectionChange]);

  // Schedule reconnection
  const scheduleReconnection = useCallback(() => {
    if (connection.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error("Max reconnection attempts reached");
      return;
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      setConnection((prev) => ({
        ...prev,
        reconnectAttempts: prev.reconnectAttempts + 1,
      }));
      connect();
    }, RECONNECT_INTERVAL);
  }, [connection.reconnectAttempts, connect]);

  // Subscribe to symbols
  const subscribe = useCallback(
    (symbolsToSubscribe) => {
      if (!Array.isArray(symbolsToSubscribe)) {
        symbolsToSubscribe = [symbolsToSubscribe];
      }

      setSubscriptions((prev) => {
        const newSubscriptions = new Set(prev);
        symbolsToSubscribe.forEach((symbol) => {
          if (symbol) {
            newSubscriptions.add(symbol.toUpperCase());
          }
        });
        return newSubscriptions;
      });

      if (enableLogging) {
        console.log("📊 Subscribed to symbols:", symbolsToSubscribe);
      }
    },
    [enableLogging]
  );

  // Unsubscribe from symbols
  const unsubscribe = useCallback(
    (symbolsToUnsubscribe) => {
      if (!Array.isArray(symbolsToUnsubscribe)) {
        symbolsToUnsubscribe = [symbolsToUnsubscribe];
      }

      setSubscriptions((prev) => {
        const newSubscriptions = new Set(prev);
        symbolsToUnsubscribe.forEach((symbol) => {
          if (symbol) {
            newSubscriptions.delete(symbol.toUpperCase());
          }
        });
        return newSubscriptions;
      });

      if (enableLogging) {
        console.log("📊 Unsubscribed from symbols:", symbolsToUnsubscribe);
      }
    },
    [enableLogging]
  );

  // Start price simulation (replace with actual WebSocket data handling)
  const startPriceSimulation = useCallback(() => {
    const interval = setInterval(() => {
      if (subscriptions.size === 0) return;

      const updates = {};
      const timestamp = new Date().toISOString();

      // Generate mock price updates for subscribed symbols
      Array.from(subscriptions).forEach((symbol) => {
        const currentPrice =
          priceData[symbol]?.price || Math.random() * 1000 + 100;
        const change = (Math.random() - 0.5) * currentPrice * 0.02; // ±2% change
        const newPrice = Math.max(0.01, currentPrice + change);

        updates[symbol] = {
          symbol,
          price: newPrice,
          change: change,
          changePercent: (change / currentPrice) * 100,
          volume: Math.floor(Math.random() * 1000000),
          timestamp,
          bid: newPrice - 0.01,
          ask: newPrice + 0.01,
        };
      });

      if (Object.keys(updates).length > 0) {
        setPriceData((prev) => ({ ...prev, ...updates }));
        setConnection((prev) => ({ ...prev, lastUpdate: timestamp }));

        // Call update callback
        onPriceUpdate?.(updates);

        // Update React Query cache
        Object.entries(updates).forEach(([symbol, data]) => {
          queryClient.setQueryData(
            ["market-data-symbol", symbol],
            (oldData) => ({
              ...oldData,
              data: {
                ...oldData?.data,
                currentPrice: data.price,
                change: data.change,
                changePercent: data.changePercent,
                volume: data.volume,
                lastUpdated: data.timestamp,
                bid: data.bid,
                ask: data.ask,
              },
            })
          );
        });

        if (enableLogging) {
          console.log("📊 Price updates:", Object.keys(updates));
        }
      }
    }, updateInterval);

    heartbeatRef.current = interval;
    return () => clearInterval(interval);
  }, [
    subscriptions,
    priceData,
    updateInterval,
    onPriceUpdate,
    queryClient,
    enableLogging,
  ]);

  // Auto-connect and subscribe
  useEffect(() => {
    if (autoConnect && symbols.length > 0) {
      connect();
      subscribe(symbols);
    }

    return () => {
      if (!autoConnect) {
        disconnect();
      }
    };
  }, [autoConnect, symbols, connect, disconnect, subscribe]);

  // Subscribe to new symbols
  useEffect(() => {
    if (connection.status === "connected" && symbols.length > 0) {
      subscribe(symbols);
    }
  }, [symbols, connection.status, subscribe]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Get price for specific symbol
  const getPrice = useCallback(
    (symbol) => {
      return priceData[symbol?.toUpperCase()] || null;
    },
    [priceData]
  );

  // Get prices for multiple symbols
  const getPrices = useCallback(
    (symbolList) => {
      return symbolList.map((symbol) => ({
        symbol,
        data: priceData[symbol?.toUpperCase()] || null,
      }));
    },
    [priceData]
  );

  // Force refresh all subscribed symbols
  const refresh = useCallback(() => {
    if (subscriptions.size > 0) {
      // In real implementation, would send refresh message to WebSocket
      console.log("🔄 Refreshing price data for:", Array.from(subscriptions));

      // For simulation, just trigger updates
      Array.from(subscriptions).forEach((symbol) => {
        // This would normally come from WebSocket
      });
    }
  }, [subscriptions]);

  return {
    // Connection state
    isConnected: connection.status === "connected",
    isConnecting: connection.status === "connecting",
    connectionError: connection.error,
    lastUpdate: connection.lastUpdate,
    reconnectAttempts: connection.reconnectAttempts,

    // Data
    priceData,
    subscriptions: Array.from(subscriptions),

    // Actions
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    getPrice,
    getPrices,
    refresh,

    // Utilities
    subscribedCount: subscriptions.size,
    connectionStatus: connection.status,
  };
};

export const useRealTimePriceProvider = () => {
  const [subscribers, setSubscribers] = useState(new Map());
  const [globalPriceData, setGlobalPriceData] = useState({});

  // Register a component for price updates
  const register = useCallback((componentId, symbols, callback) => {
    setSubscribers((prev) => {
      const newMap = new Map(prev);
      newMap.set(componentId, { symbols, callback });
      return newMap;
    });
  }, []);

  // Unregister a component
  const unregister = useCallback((componentId) => {
    setSubscribers((prev) => {
      const newMap = new Map(prev);
      newMap.delete(componentId);
      return newMap;
    });
  }, []);

  // Get all unique symbols from subscribers
  const allSubscribedSymbols = useMemo(() => {
    const symbolSet = new Set();
    subscribers.forEach(({ symbols }) => {
      symbols.forEach((symbol) => symbolSet.add(symbol));
    });
    return Array.from(symbolSet);
  }, [subscribers]);

  // Use real-time price hook for all symbols
  const { isConnected, priceData, connect, disconnect } = useRealTimePrice(
    allSubscribedSymbols,
    {
      autoConnect: true,
      onPriceUpdate: (updates) => {
        setGlobalPriceData((prev) => ({ ...prev, ...updates }));

        // Notify all subscribers
        subscribers.forEach(({ symbols, callback }) => {
          const relevantUpdates = {};
          symbols.forEach((symbol) => {
            if (updates[symbol]) {
              relevantUpdates[symbol] = updates[symbol];
            }
          });

          if (Object.keys(relevantUpdates).length > 0) {
            callback(relevantUpdates);
          }
        });
      },
    }
  );

  return {
    register,
    unregister,
    isConnected,
    globalPriceData,
    subscribedSymbols: allSubscribedSymbols,
    subscriberCount: subscribers.size,
  };
};

export const useSymbolPriceSubscription = (symbol, callback) => {
  const { register, unregister } = useRealTimePriceProvider();
  const componentId = useRef(`symbol-${Math.random()}`);

  useEffect(() => {
    if (symbol) {
      register(componentId.current, [symbol], callback);
    }

    return () => {
      unregister(componentId.current);
    };
  }, [symbol, callback, register, unregister]);

  return componentId.current;
};

export default useRealTimePrice;
