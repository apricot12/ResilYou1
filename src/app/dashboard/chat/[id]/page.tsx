"use client";

import { useState, use } from "react";
import { ConversationSidebar } from "@/components/chat/conversation-sidebar";
import { ChatInterface } from "@/components/chat/chat-interface";
import { Button } from "@/components/ui/button";
import { PanelLeftOpen } from "lucide-react";

export default function ChatConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative flex h-[calc(100vh-7rem)]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r bg-background transition-transform duration-300 md:relative md:inset-auto md:z-auto md:w-64 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <ConversationSidebar
          currentConversationId={id}
          onConversationSelect={() => setSidebarOpen(false)}
        />
      </div>

      {/* Chat area */}
      <div className="flex-1 relative">
        {/* Mobile sidebar toggle */}
        <Button
          variant="outline"
          size="icon"
          className="absolute top-3 left-3 z-10 md:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <PanelLeftOpen className="h-5 w-5" />
        </Button>

        <ChatInterface conversationId={id} />
      </div>
    </div>
  );
}
