/**
 * Lovable AI Gateway provider — server-only.
 * Uses openai-compatible provider with Lovable's gateway base URL and
 * the workspace-scoped `LOVABLE_API_KEY` header.
 */
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function createLovableAiGatewayProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "lovable-ai-gateway",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: { "Lovable-API-Key": apiKey },
  });
}
