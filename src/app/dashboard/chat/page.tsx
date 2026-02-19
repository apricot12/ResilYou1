"use client";

import { useState } from "react";
import { ConversationSidebar } from "@/components/chat/conversation-sidebar";
import { Bot, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChatPage() {
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
        <ConversationSidebar onConversationSelect={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col items-center justify-center text-center p-4">
        {/* Mobile sidebar toggle */}
        <Button
          variant="outline"
          size="icon"
          className="absolute top-3 left-3 md:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <PanelLeftOpen className="h-5 w-5" />
        </Button>

        <Bot className="mb-4 h-16 w-16 text-muted-foreground" />
        <h2 className="mb-2 text-2xl font-bold">Welcome to AI Chat</h2>
        <p className="text-muted-foreground max-w-sm">
          Select a conversation or create a new one to get started
        </p>
      </div>
    </div>
  );
}
