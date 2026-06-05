import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { STATIC_TOOL_REGISTRY } from "./generated/tool-registry.js";

const STRATEGY_PROPERTY = {
  type: "string",
  enum: ["round-robin", "priority", "random"],
  description:
    "Key rotation strategy for this call. Overrides provider default.",
};

export function prefixToolName(provider: string, toolName: string): string {
  return `${provider}__${toolName}`;
}

export function unprefixToolName(
  prefixedName: string,
): { provider: string; toolName: string } | null {
  const idx = prefixedName.indexOf("__");
  if (idx === -1) return null;

  return {
    provider: prefixedName.slice(0, idx),
    toolName: prefixedName.slice(idx + 2),
  };
}

export function injectStrategyParam(
  schema: Tool["inputSchema"],
): Tool["inputSchema"] {
  return {
    ...schema,
    properties: {
      ...schema.properties,
      strategy: STRATEGY_PROPERTY,
    },
  };
}

export function getStaticProviderTools(provider: string): Tool[] {
  return STATIC_TOOL_REGISTRY[provider]?.tools ?? [];
}

export function exposeProviderTools(provider: string, tools: Tool[]): Tool[] {
  return tools.map((tool) => ({
    ...tool,
    name: prefixToolName(provider, tool.name),
    inputSchema: injectStrategyParam(tool.inputSchema),
  }));
}
