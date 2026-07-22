import { io, Socket } from "socket.io-client";
import ENV from "../config/env";

let socket: Socket | null = null;

export const connectSocket = (userId: string, collegeId?: string) => {
  if (socket?.connected) return socket;
  socket = io(ENV.SOCKET_URL, { transports: ["websocket"] });
  socket.on("connect", () => socket?.emit("identify", { userId, collegeId }));
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};

