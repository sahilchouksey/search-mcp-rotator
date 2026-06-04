import assert from "node:assert/strict";

import { ExhaustionDetector, extractCooldown } from "../dist/detector.js";

const wrapped402 = {
  isError: true,
  message: "Tool execution failed",
  mcpResultText: "Tool execution failed: Request failed with status code 402",
  toolErrorText: "Tool execution failed: Request failed with status code 402",
};

for (const provider of [
  "exa",
  "firecrawl",
  "brightdata",
  "olostep",
  "dappier",
  "parallel",
]) {
  assert.equal(
    new ExhaustionDetector(provider).isExhausted(wrapped402),
    true,
    `${provider} should rotate on wrapped 402`,
  );
}

for (const provider of ["tavily", "linkup"]) {
  assert.equal(
    new ExhaustionDetector(provider).isExhausted(wrapped402),
    false,
    `${provider} should not rotate on wrapped 402`,
  );
}

assert.equal(
  new ExhaustionDetector("firecrawl").isExhausted({
    isError: true,
    mcpResultText: "Request failed with status code 408",
  }),
  false,
  "firecrawl should not rotate hard wrapped 408",
);

assert.equal(
  new ExhaustionDetector("tavily").isExhausted({
    isError: true,
    mcpResultText: "Request failed with status code 432",
  }),
  true,
  "tavily should rotate wrapped 432 usage limit",
);

assert.equal(
  new ExhaustionDetector("linkup").isExhausted({
    isError: true,
    mcpResultText: "Request failed with status code 429",
  }),
  true,
  "linkup should rotate wrapped 429",
);

assert.equal(
  extractCooldown({ headers: { "x-ratelimit-reset": "2" } }, "linkup", 60_000),
  2_000,
  "linkup x-ratelimit-reset is a seconds duration",
);

console.log("detector regression tests passed");
