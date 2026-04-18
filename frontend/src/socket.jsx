let socket = null;

const WS_URL = import.meta.env.VITE_WS_URL;

export function connectSocket() {
  if (
    !socket ||
    socket.readyState === WebSocket.CLOSED ||
    socket.readyState === WebSocket.CLOSING
  ) {
    socket = new WebSocket(WS_URL);
  }

  return socket;
}

export function isSocketOpen() {
  return socket && socket.readyState === WebSocket.OPEN;
}