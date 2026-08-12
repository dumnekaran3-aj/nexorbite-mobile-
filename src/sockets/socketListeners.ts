import { getSocket } from "./socketClient";
import { useToastStore } from "../store/toastStore";
import { useFriendsStore } from "../store/friendsStore";
import { useChatStore } from "../store/chatStore";

export const registerSocketListeners = () => {
  const socket = getSocket();
  if (!socket) return;

  socket.off("receive_message");
  socket.off("new_friend_request");
  socket.off("chat_list_updated");
  socket.off("you_are_blocked");

  socket.on("receive_message", (message: any) => {
    useChatStore.getState().handleIncomingMessage(message);
  });

  socket.on("new_friend_request", (request: any) => {
    useFriendsStore.getState().increment();
    useToastStore.getState().show(`${request.from?.username || "Someone"} sent you a friend request`);
  });

  socket.on("chat_list_updated", () => {
    useChatStore.getState().loadChats();
  });

  socket.on("you_are_blocked", () => {
    useToastStore.getState().show("You've been blocked by this user.");
  });
};
