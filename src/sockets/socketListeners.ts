
import { getSocket } from "./socketClient";

// Central registration — jab chatStore/friendsStore banega, inke andar store update calls aayenge
export const registerSocketListeners = () => {
  const socket = getSocket();
  if (!socket) return;

  socket.on("receive_message", (message) => {
    // TODO: chatStore mein push karo
  });

  socket.on("new_friend_request", (request) => {
    // TODO: friendsStore mein push karo
  });

  socket.on("chat_list_updated", (data) => {
    // TODO
  });

  socket.on("you_are_blocked", (data) => {
    // TODO
  });
};

export const ROLES = {
  STUDENT: "student",
  TEACHER: "teacher",
  HOD: "hod",
  PRINCIPAL: "principal",
  OWNER: "owner",
} as const;
