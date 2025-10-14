// src/hooks/useWebSocket.js - CRITICAL MISSING
export function useWebSocket(url, options = {}) {
  const [socket, setSocket] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("Connecting");

  useEffect(() => {
    if (!url) return;

    const ws = new WebSocket(url);
    let reconnectTimer = null;

    ws.onopen = () => {
      console.log("WebSocket connected");
      setConnectionStatus("Connected");
      setSocket(ws);
      options.onOpen?.();
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setLastMessage(message);
        options.onMessage?.(message);
      } catch (error) {
        console.error("WebSocket message parse error:", error);
      }
    };

    ws.onclose = (event) => {
      console.log("WebSocket disconnected:", event.reason);
      setConnectionStatus("Disconnected");
      setSocket(null);

      // Auto-reconnect logic
      if (!event.wasClean && options.autoReconnect !== false) {
        reconnectTimer = setTimeout(() => {
          console.log("Attempting to reconnect...");
          setConnectionStatus("Reconnecting");
        }, 3000);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnectionStatus("Error");
      options.onError?.(error);
    };

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [url]);

  const sendMessage = useCallback(
    (message) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
      } else {
        console.warn("WebSocket not connected");
      }
    },
    [socket]
  );

  return { socket, lastMessage, connectionStatus, sendMessage };
}
