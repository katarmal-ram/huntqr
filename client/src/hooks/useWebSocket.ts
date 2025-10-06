import { useEffect, useRef } from "react";
import { queryClient } from "@/lib/queryClient";

interface WebSocketMessage {
  sessionId: string;
  type: string;
  [key: string]: any;
}

export function useWebSocket(sessionId: string | undefined) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!sessionId) return;

    let ws: WebSocket;
    
    const connect = () => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const host = window.location.host;
        const wsUrl = `${protocol}//${host}/ws`;
        
        console.log("Connecting to WebSocket:", wsUrl);
        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log("WebSocket connected successfully");
        };

        ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            
            if (message.sessionId !== sessionId) return;

            console.log("WebSocket message received:", message.type);

            switch (message.type) {
              case "session_created":
              case "session_started":
              case "session_ended":
                queryClient.invalidateQueries({ queryKey: ["/api/session"] });
                queryClient.invalidateQueries({ queryKey: ["/api/admin/session"] });
                break;
                
              case "player_joined":
                queryClient.invalidateQueries({ queryKey: ["/api/admin/teams"] });
                queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
                break;
                
              case "scan_completed":
                queryClient.invalidateQueries({ queryKey: ["/api/admin/teams"] });
                queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
                queryClient.invalidateQueries({ queryKey: ["/api/admin/scans"] });
                queryClient.invalidateQueries({ queryKey: ["/api/admin/codes"] });
                break;
            }
          } catch (error) {
            console.error("WebSocket message error:", error);
          }
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
        };

        ws.onclose = () => {
          console.log("WebSocket disconnected, will retry in 3s");
          reconnectTimeoutRef.current = setTimeout(connect, 3000);
        };
      } catch (error) {
        console.error("WebSocket connection failed:", error);
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [sessionId]);

  return wsRef.current;
}
