"use client";

import * as React from "react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { AssistantChatTransport } from "@assistant-ui/react-ai-sdk";

/**
 * Wires the assistant runtime for the basic Q&A chat (Plan 014, "Ask
 * Louie").
 *
 * There are no browser-executed tools and no generative UI to mount here —
 * Plan 014 removed navigation, evidence cards, and the context panel it
 * drove. Retrieval still runs server-side against the evidence index; the
 * client only streams the resulting text.
 *
 * The transport posts to our own `/api/chat`, which is where the API key and
 * the evidence index live. Nothing about the provider reaches the client.
 */
function AiLouieRuntime({ children }: { children: React.ReactNode }) {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({ api: "/api/chat" }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}

export { AiLouieRuntime };
