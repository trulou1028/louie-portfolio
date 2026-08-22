"use client";

import * as React from "react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { AssistantChatTransport } from "@assistant-ui/react-ai-sdk";

import { ClientTools } from "@/components/ai/client-tools";
import { ContextPanelProvider } from "@/components/ai/context-panel-store";
import {
  NavigatePortfolioUI,
  SearchPortfolioUI,
  SetContextPanelUI,
  ShowEvidenceUI,
} from "@/components/ai/evidence-result";

/**
 * Wires the assistant runtime, the browser-executed tools, and the
 * allowlisted tool UIs (spec §18, §19).
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
      <ContextPanelProvider>
        <ClientTools />
        <SearchPortfolioUI />
        <NavigatePortfolioUI />
        <ShowEvidenceUI />
        <SetContextPanelUI />
        {children}
      </ContextPanelProvider>
    </AssistantRuntimeProvider>
  );
}

export { AiLouieRuntime };
