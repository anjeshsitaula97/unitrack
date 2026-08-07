import React from "react";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import ChatContent from "./components/ChatContent";

export const metadata = {
  title: "Chat | UniTrack",
  description: "Internal and support chats",
};

export default function ChatPage() {
  return (
    <AppLayoutWrapper>
      <ChatContent />
    </AppLayoutWrapper>
  );
}
