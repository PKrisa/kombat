let socket = null;

export function connectSocket() {
  if (
    !socket ||
    socket.readyState === WebSocket.CLOSED ||
    socket.readyState === WebSocket.CLOSING
  ) {
    socket = new WebSocket("ws://localhost:8080/ws");
  }

  return socket;
}

export function isSocketOpen() {
  return socket && socket.readyState === WebSocket.OPEN;
}