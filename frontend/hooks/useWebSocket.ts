import { useEffect, useRef } from "react";
import { useJobStore } from "../store/useJobStore";

import { config } from "../lib/config";

// Use central configuration for WebSocket URL
const WS_URL = config.WS_URL;

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const handleIncomingEvent = useJobStore(state => state.handleIncomingEvent);
  const setConnectionStatus = useJobStore(state => state.setConnectionStatus);

  useEffect(() => {
    let reconnectTimer: NodeJS.Timeout;

    function connect() {
      if (wsRef.current?.readyState === WebSocket.OPEN) return;
      
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus("connected");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleIncomingEvent(data);
        } catch (e) {
          console.error("Failed to parse websocket message", e);
        }
      };

      ws.onclose = () => {
        setConnectionStatus("disconnected");
        // Attempt to reconnect
        setConnectionStatus("reconnecting");
        reconnectTimer = setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        ws.close();
      };
    }

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [handleIncomingEvent, setConnectionStatus]);
}
