import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export interface StaticProviderToolRegistryEntry {
  provider: string;
  url: string;
  generatedAt: string;
  toolCount: number;
  fingerprint: string;
  tools: Tool[];
}

export const STATIC_TOOL_REGISTRY_GENERATED_AT = "2026-06-05T08:00:19.675Z";

export const STATIC_TOOL_REGISTRY: Record<string, StaticProviderToolRegistryEntry> = {
  "brightdata": {
    "provider": "brightdata",
    "url": "https://mcp.brightdata.com/mcp",
    "generatedAt": "2026-06-05T08:00:19.675Z",
    "toolCount": 5,
    "fingerprint": "e21ce8de679845d7fbc4048360da1b1c2ce9691978bc8e0e44b0ba21aaf377e7",
    "tools": [
      {
        "name": "ask_brightdata_assistant",
        "description": "Ask Bright Data's support assistant (Sophie) a question about Bright Data products, APIs, MCP usage, zones, scraping, or account setup. Use when the user asks \"how do I...\" about Bright Data, when you hit a Bright Data error you don't recognize, or when deciding between products (Web Unlocker vs. Scraping Browser vs. dataset tools). Supports threaded follow-ups via dialog_id.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "question": {
              "type": "string",
              "minLength": 1,
              "maxLength": 20480,
              "description": "The question to ask. Max 20480 chars."
            },
            "dialog_id": {
              "type": "string",
              "minLength": 24,
              "maxLength": 24,
              "description": "Optional 24-char dialog_id from a previous call to continue the same thread."
            }
          },
          "required": [
            "question"
          ],
          "additionalProperties": false,
          "$schema": "http://json-schema.org/draft-07/schema#"
        },
        "annotations": {
          "title": "Ask Bright Data Assistant",
          "readOnlyHint": true,
          "openWorldHint": true
        }
      },
      {
        "name": "scrape_as_markdown",
        "description": "Scrape a single webpage URL with advanced options for content extraction and get back the results in MarkDown language. This tool can unlock any webpage even if it uses bot detection or CAPTCHA.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "url": {
              "type": "string",
              "format": "uri"
            }
          },
          "required": [
            "url"
          ],
          "additionalProperties": false,
          "$schema": "http://json-schema.org/draft-07/schema#"
        },
        "annotations": {
          "title": "Scrape as Markdown",
          "readOnlyHint": true,
          "openWorldHint": true
        }
      },
      {
        "name": "scrape_batch",
        "description": "Scrape multiple webpages URLs with advanced options for content extraction and get back the results in MarkDown language. This tool can unlock any webpage even if it uses bot detection or CAPTCHA.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "urls": {
              "type": "array",
              "items": {
                "type": "string",
                "format": "uri"
              },
              "minItems": 1,
              "maxItems": 10,
              "description": "Array of URLs to scrape (max 10)"
            }
          },
          "required": [
            "urls"
          ],
          "additionalProperties": false,
          "$schema": "http://json-schema.org/draft-07/schema#"
        },
        "annotations": {
          "title": "Scrape Batch",
          "readOnlyHint": true,
          "openWorldHint": true
        }
      },
      {
        "name": "search_engine",
        "description": "Scrape search results from Google, Bing or Yandex. Returns SERP results in JSON or Markdown (URL, title, description), Ideal for gathering current information, news, and detailed search results.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string"
            },
            "engine": {
              "type": "string",
              "enum": [
                "google",
                "bing",
                "yandex"
              ],
              "default": "google"
            },
            "cursor": {
              "type": "string",
              "description": "Pagination cursor for next page"
            },
            "geo_location": {
              "type": "string",
              "minLength": 2,
              "maxLength": 2,
              "description": "2-letter country code for geo-targeted results (e.g., \"us\", \"uk\")"
            }
          },
          "required": [
            "query"
          ],
          "additionalProperties": false,
          "$schema": "http://json-schema.org/draft-07/schema#"
        },
        "annotations": {
          "title": "Search Engine",
          "readOnlyHint": true,
          "openWorldHint": true
        }
      },
      {
        "name": "search_engine_batch",
        "description": "Run multiple search queries simultaneously. Returns JSON for Google, Markdown for Bing/Yandex.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "queries": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "query": {
                    "type": "string"
                  },
                  "engine": {
                    "type": "string",
                    "enum": [
                      "google",
                      "bing",
                      "yandex"
                    ],
                    "default": "google"
                  },
                  "cursor": {
                    "type": "string"
                  },
                  "geo_location": {
                    "type": "string",
                    "minLength": 2,
                    "maxLength": 2,
                    "description": "2-letter country code for geo-targeted results (e.g., \"us\", \"uk\")"
                  }
                },
                "required": [
                  "query"
                ],
                "additionalProperties": false
              },
              "minItems": 1,
              "maxItems": 10
            }
          },
          "required": [
            "queries"
          ],
          "additionalProperties": false,
          "$schema": "http://json-schema.org/draft-07/schema#"
        },
        "annotations": {
          "title": "Search Engine Batch",
          "readOnlyHint": true,
          "openWorldHint": true
        }
      }
    ]
  },
  "dappier": {
    "provider": "dappier",
    "url": "https://mcp.dappier.com/mcp",
    "generatedAt": "2026-06-05T08:00:19.675Z",
    "toolCount": 14,
    "fingerprint": "9ee04eca1929415ddb3ced43d07cdd31f900e6e2e156cbd62ce7e60ae8da8dab",
    "tools": [
      {
        "name": "benzinga",
        "description": "Access real-time financial news from Benzinga.com. ($0.02 / query)",
        "inputSchema": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "Query"
            },
            "similarity_top_k": {
              "type": "number",
              "default": 9,
              "description": "Number of top similar articles to retrieve."
            },
            "ref": {
              "type": "string",
              "description": "Optional site domain to prioritize recommendations."
            },
            "num_articles_ref": {
              "type": "number",
              "default": 0,
              "description": "Minimum number of articles to return from the reference domain."
            },
            "search_algorithm": {
              "type": "string",
              "enum": [
                "most_recent",
                "semantic",
                "most_recent_semantic",
                "trending"
              ],
              "default": "most_recent",
              "description": "The search algorithm to use. ex: 'most_recent', 'semantic', 'most_recent_semantic' \n\t\t\tor 'trending'."
            }
          },
          "required": [
            "query"
          ],
          "additionalProperties": false,
          "$schema": "http://json-schema.org/draft-07/schema#"
        },
        "annotations": {
          "title": "Benzinga"
        }
      },
      {
        "name": "cafemom-parenting",
        "description": "Access expert-backed parenting advice, family tips, self-care strategies, and everyday life hacks from CafeMom, Mom.com, LittleThings, and MamasLatinas. Trusted by a community of 85 million moms. ($0.01 / query)",
        "inputSchema": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "Query"
            },
            "similarity_top_k": {
              "type": "number",
              "default": 9,
              "description": "Number of top similar articles to retrieve."
            },
            "ref": {
              "type": "string",
              "description": "Optional site domain to prioritize recommendations."
            },
            "num_articles_ref": {
              "type": "number",
              "default": 0,
              "description": "Minimum number of articles to return from the reference domain."
            },
            "search_algorithm": {
              "type": "string",
              "enum": [
                "most_recent",
                "semantic",
                "most_recent_semantic",
                "trending"
              ],
              "default": "most_recent",
              "description": "The search algorithm to use. ex: 'most_recent', 'semantic', 'most_recent_semantic' \n\t\t\tor 'trending'."
            }
          },
          "required": [
            "query"
          ],
          "additionalProperties": false,
          "$schema": "http://json-schema.org/draft-07/schema#"
        },
        "annotations": {
          "title": "CafeMom Parenting"
        }
      },
      {
        "name": "iheartcats-ai",
        "description": "Fetch AI-powered iHeartCats content recommendations. Utilize a cat care specialist that provides comprehensive content on cat health, behavior, and lifestyle from iHeartCats.com. ($0.01 / query)",
        "inputSchema": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "Query"
            },
            "similarity_top_k": {
              "type": "number",
              "default": 9,
              "description": "Number of top similar articles to retrieve."
            },
            "ref": {
              "type": "string",
              "description": "Optional site domain to prioritize recommendations."
            },
            "num_articles_ref": {
              "type": "number",
              "default": 0,
              "description": "Minimum number of articles to return from the reference domain."
            },
            "search_algorithm": {
              "type": "string",
              "enum": [
                "most_recent",
                "semantic",
                "most_recent_semantic",
                "trending"
              ],
              "default": "most_recent",
              "description": "The search algorithm to use. ex: 'most_recent', 'semantic', 'most_recent_semantic' \n\t\t\tor 'trending'."
            }
          },
          "required": [
            "query"
          ],
          "additionalProperties": false,
          "$schema": "http://json-schema.org/draft-07/schema#"
        },
        "annotations": {
          "title": "iHeartCats AI"
        }
      },
      {
        "name": "iheartdogs-ai",
        "description": "Fetch AI-powered iHeartDogs content recommendations. Tap into a dog care expert with access to thousands of articles covering pet health, behavior, grooming, and ownership from iHeartDogs.com. ($0.01 / query)",
        "inputSchema": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "Query"
            },
            "similarity_top_k": {
              "type": "number",
              "default": 9,
              "description": "Number of top similar articles to retrieve."
            },
            "ref": {
              "type": "string",
              "description": "Optional site domain to prioritize recommendations."
            },
            "num_articles_ref": {
              "type": "number",
              "default": 0,
              "description": "Minimum number of articles to return from the reference domain."
            },
            "search_algorithm": {
              "type": "string",
              "enum": [
                "most_recent",
                "semantic",
                "most_recent_semantic",
                "trending"
              ],
              "default": "most_recent",
              "description": "The search algorithm to use. ex: 'most_recent', 'semantic', 'most_recent_semantic' \n\t\t\tor 'trending'."
            }
          },
          "required": [
            "query"
          ],
          "additionalProperties": false,
          "$schema": "http://json-schema.org/draft-07/schema#"
        },
        "annotations": {
          "title": "iHeartDogs AI"
        }
      },
      {
        "name": "lifestyle-news",
        "description": "Fetch AI-powered Lifestyle News recommendations. Access current lifestyle updates, analysis, and insights from leading lifestyle publications like The Mix, Snipdaily, Nerdable and Familyproof. ($0.1 / query)",
        "inputSchema": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "Query"
            },
            "similarity_top_k": {
              "type": "number",
              "default": 9,
              "description": "Number of top similar articles to retrieve."
            },
            "ref": {
              "type": "string",
              "description": "Optional site domain to prioritize recommendations."
            },
            "num_articles_ref": {
              "type": "number",
              "default": 0,
              "description": "Minimum number of articles to return from the reference domain."
            },
            "search_algorithm": {
              "type": "string",
              "enum": [
                "most_recent",
                "semantic",
                "most_recent_semantic",
                "trending"
              ],
              "default": "most_recent",
              "description": "The search algorithm to use. ex: 'most_recent', 'semantic', 'most_recent_semantic' \n\t\t\tor 'trending'."
            }
          },
          "required": [
            "query"
          ],
          "additionalProperties": false,
          "$schema": "http://json-schema.org/draft-07/schema#"
        },
        "annotations": {
          "title": "Lifestyle News"
        }
      },
      {
        "name": "methodshop",
        "description": "Access tech guides, how-tos, and digital lifestyle articles from MethodShop.com. Perfect for delivering gadget tips, answering tech questions, and recommending productivity content. ($0.003 / query)",
        "inputSchema": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "Query"
            },
            "similarity_top_k": {
              "type": "number",
              "default": 9,
              "description": "Number of top similar articles to retrieve."
            },
            "ref": {
              "type": "string",
              "description": "Optional site domain to prioritize recommendations."
            },
            "num_articles_ref": {
              "type": "number",
              "default": 0,
              "description": "Minimum number of articles to return from the reference domain."
            },
            "search_algorithm": {
              "type": "string",
              "enum": [
                "most_recent",
                "semantic",
                "most_recent_semantic",
                "trending"
              ],
              "default": "most_recent",
              "description": "The search algorithm to use. ex: 'most_recent', 'semantic', 'most_recent_semantic' \n\t\t\tor 'trending'."
            }
          },
          "required": [
            "query"
          ],
          "additionalProperties": false,
          "$schema": "http://json-schema.org/draft-07/schema#"
        },
        "annotations": {
          "title": "MethodShop"
        }
      },
      {
        "name": "nine-ten-news",
        "description": "Fetch up-to-date local news, weather forecasts, sports coverage, and community stories for Northern Michigan, including the Cadillac and Traverse City areas from 9 and 10 News. ($0.01 / query)",
        "inputSchema": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "Query"
            },
            "similarity_top_k": {
              "type": "number",
              "default": 9,
              "description": "Number of top similar articles to retrieve."
            },
            "ref": {
              "type": "string",
              "description": "Optional site domain to prioritize recommendations."
            },
            "num_articles_ref": {
              "type": "number",
              "default": 0,
              "description": "Minimum number of articles to return from the reference domain."
            },
            "search_algorithm": {
              "type": "string",
              "enum": [
                "most_recent",
                "semantic",
                "most_recent_semantic",
                "trending"
              ],
              "default": "most_recent",
              "description": "The search algorithm to use. ex: 'most_recent', 'semantic', 'most_recent_semantic' \n\t\t\tor 'trending'."
            }
          },
          "required": [
            "query"
          ],
          "additionalProperties": false,
          "$schema": "http://json-schema.org/draft-07/schema#"
        },
        "annotations": {
          "title": "9 and 10 News"
        }
      },
      {
        "name": "one-green-planet",
        "description": "Fetch AI-powered One Green Planet guides and articles on plant-based diets, conscious consumerism, animal rights, sustainability, food, wellness and environmental categories. ($0.01 / query)",
        "inputSchema": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "Query"
            },
            "similarity_top_k": {
              "type": "number",
              "default": 9,
              "description": "Number of top similar articles to retrieve."
            },
            "ref": {
              "type": "string",
              "description": "Optional site domain to prioritize recommendations."
            },
            "num_articles_ref": {
              "type": "number",
              "default": 0,
              "description": "Minimum number of articles to return from the reference domain."
            },
            "search_algorithm": {
              "type": "string",
              "enum": [
                "most_recent",
                "semantic",
                "most_recent_semantic",
                "trending"
              ],
              "default": "most_recent",
              "description": "The search algorithm to use. ex: 'most_recent', 'semantic', 'most_recent_semantic' \n\t\t\tor 'trending'."
            }
          },
          "required": [
            "query"
          ],
          "additionalProperties": false,
          "$schema": "http://json-schema.org/draft-07/schema#"
        },
        "annotations": {
          "title": "One Green Planet"
        }
      },
      {
        "name": "real-time-search",
        "description": "Real-time web search to access the latest news, stocks, gold stocks, uk stock market, global market performance, financial news, weather, travel information, deals, and more.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "Query"
            }
          },
          "required": [
            "query"
          ],
          "additionalProperties": false,
          "$schema": "http://json-schema.org/draft-07/schema#"
        },
        "annotations": {
          "title": "Real Time Search"
        }
      },
      {
        "name": "research-papers-search",
        "description": "Perform a real-time research paper search. Provides instant access to over 2.4 million open-access scholarly articles across domains including physics, mathematics, computer science, quantitative biology, quantitative finance, statistics, electrical engineering and systems science, and economics. ($0.003 / query)",
        "inputSchema": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "Query"
            }
          },
          "required": [
            "query"
          ],
          "additionalProperties": false,
          "$schema": "http://json-schema.org/draft-07/schema#"
        },
        "annotations": {
          "title": "Research Papers Search"
        }
      },
      {
        "name": "sports-news",
        "description": "Fetch AI-powered Sports News recommendations. Get real-time news, updates, and personalized content from top sports sources like Sportsnaut, Forever Blueshirts, Minnesota Sports Fan, LAFB Network, Bounding Into Sports, and Ringside Intel. ($0.004 / query)",
        "inputSchema": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "Query"
            },
            "similarity_top_k": {
              "type": "number",
              "default": 9,
              "description": "Number of top similar articles to retrieve."
            },
            "ref": {
              "type": "string",
              "description": "Optional site domain to prioritize recommendations."
            },
            "num_articles_ref": {
              "type": "number",
              "default": 0,
              "description": "Minimum number of articles to return from the reference domain."
            },
            "search_algorithm": {
              "type": "string",
              "enum": [
                "most_recent",
                "semantic",
                "most_recent_semantic",
                "trending"
              ],
              "default": "most_recent",
              "description": "The search algorithm to use. ex: 'most_recent', 'semantic', 'most_recent_semantic' \n\t\t\tor 'trending'."
            }
          },
          "required": [
            "query"
          ],
          "additionalProperties": false,
          "$schema": "http://json-schema.org/draft-07/schema#"
        },
        "annotations": {
          "title": "Sports News"
        }
      },
      {
        "name": "stellar-ai",
        "description": "Get advanced roof analysis and solar panel placement recommendations with just a residential home address. Powered by Digital Satellite Imagery (DSM) and solar irradiance insights for precise energy estimates. ($0.5 / query)",
        "inputSchema": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "Query"
            }
          },
          "required": [
            "query"
          ],
          "additionalProperties": false,
          "$schema": "http://json-schema.org/draft-07/schema#"
        },
        "annotations": {
          "title": "Stellar AI"
        }
      },
      {
        "name": "stock-market-data",
        "description": "only use this if user query requires real-time financial news, stock prices, and trades",
        "inputSchema": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "Query"
            }
          },
          "required": [
            "query"
          ],
          "additionalProperties": false,
          "$schema": "http://json-schema.org/draft-07/schema#"
        },
        "annotations": {
          "title": "Stock Market Data"
        }
      },
      {
        "name": "wish-tv-ai",
        "description": "The WISH-TV AI datamodel provides real-time news, sports scores, and local event information for Indiana. It can answer questions about breaking news and broadcasts, while offering personalized news directing users to video clips and shows. ($0.004 / query)",
        "inputSchema": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "Query"
            },
            "similarity_top_k": {
              "type": "number",
              "default": 9,
              "description": "Number of top similar articles to retrieve."
            },
            "ref": {
              "type": "string",
              "description": "Optional site domain to prioritize recommendations."
            },
            "num_articles_ref": {
              "type": "number",
              "default": 0,
              "description": "Minimum number of articles to return from the reference domain."
            },
            "search_algorithm": {
              "type": "string",
              "enum": [
                "most_recent",
                "semantic",
                "most_recent_semantic",
                "trending"
              ],
              "default": "most_recent",
              "description": "The search algorithm to use. ex: 'most_recent', 'semantic', 'most_recent_semantic' \n\t\t\tor 'trending'."
            }
          },
          "required": [
            "query"
          ],
          "additionalProperties": false,
          "$schema": "http://json-schema.org/draft-07/schema#"
        },
        "annotations": {
          "title": "WISH-TV AI"
        }
      }
    ]
  },
  "exa": {
    "provider": "exa",
    "url": "https://mcp.exa.ai/mcp",
    "generatedAt": "2026-06-05T08:00:19.675Z",
    "toolCount": 2,
    "fingerprint": "7d961e9e17040aa636ddea7404322db4d0aa6ef4927589d37153eba87d242f95",
    "tools": [
      {
        "name": "web_fetch_exa",
        "description": "Read a webpage's full content as clean markdown. Use after web_search_exa when highlights are insufficient or to read any URL.\n\nBest for: Extracting full content from known URLs. Batch multiple URLs in one call.\nReturns: Clean text content and metadata from the page(s).",
        "inputSchema": {
          "type": "object",
          "properties": {
            "urls": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "description": "URLs to read. Batch multiple URLs in one call."
            },
            "maxCharacters": {
              "type": "number",
              "minimum": 1,
              "description": "Maximum characters to extract per page (default: 3000)"
            }
          },
          "required": [
            "urls"
          ],
          "additionalProperties": false,
          "$schema": "http://json-schema.org/draft-07/schema#"
        },
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "execution": {
          "taskSupport": "forbidden"
        }
      },
      {
        "name": "web_search_exa",
        "description": "Search the web for any topic and get clean, ready-to-use content.\n\n      Best for: Finding current information, news, facts, people, companies, or answering questions about any topic.\n      Returns: Clean text content from top search results.\n\n      Query tips:\n      describe the ideal page, not keywords. \"blog post comparing React and Vue performance\" not \"React vs Vue\".\n      Use category:people / category:company to search through Linkedin profiles / companies respectively.\n      If highlights are insufficient, follow up with web_fetch_exa on the best URLs.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "minLength": 1,
              "description": "Natural language search query. Should be a semantically rich description of the ideal page, not just keywords. Optionally include category:<type> (company, people) to focus results — e.g. 'category:people John Doe software engineer'."
            },
            "numResults": {
              "type": "number",
              "description": "Number of search results to return (default: 10)."
            }
          },
          "required": [
            "query"
          ],
          "additionalProperties": false,
          "$schema": "http://json-schema.org/draft-07/schema#"
        },
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "execution": {
          "taskSupport": "forbidden"
        }
      }
    ]
  },
  "firecrawl": {
    "provider": "firecrawl",
    "url": "https://mcp.firecrawl.dev/mcp",
    "generatedAt": "2026-06-05T08:00:19.675Z",
    "toolCount": 19,
    "fingerprint": "fd423e1ec635d5ed7490c9397939bbbacdb270a2873162f281d0b956202480bc",
    "tools": [
      {
        "name": "firecrawl_agent",
        "description": "\nAutonomous web research agent. This is a separate AI agent layer that independently browses the internet, searches for information, navigates through pages, and extracts structured data based on your query. You describe what you need, and the agent figures out where to find it.\n\n**How it works:** The agent performs web searches, follows links, reads pages, and gathers data autonomously. This runs **asynchronously** - it returns a job ID immediately, and you poll `firecrawl_agent_status` to check when complete and retrieve results.\n\n**IMPORTANT - Async workflow with patient polling:**\n1. Call `firecrawl_agent` with your prompt/schema → returns job ID immediately\n2. Poll `firecrawl_agent_status` with the job ID to check progress\n3. **Keep polling for at least 2-3 minutes** - agent research typically takes 1-5 minutes for complex queries\n4. Poll every 15-30 seconds until status is \"completed\" or \"failed\"\n5. Do NOT give up after just a few polling attempts - the agent needs time to research\n\n**Expected wait times:**\n- Simple queries with provided URLs: 30 seconds - 1 minute\n- Complex research across multiple sites: 2-5 minutes\n- Deep research tasks: 5+ minutes\n\n**Best for:** Complex research tasks where you don't know the exact URLs; multi-source data gathering; finding information scattered across the web; extracting data from JavaScript-heavy SPAs that fail with regular scrape.\n**Not recommended for:**\n- Single-page extraction when you have a URL (use firecrawl_scrape, faster and cheaper)\n- Web search (use firecrawl_search first)\n- Interactive page tasks like clicking, filling forms, login, or navigating JS-heavy SPAs (use firecrawl_scrape + firecrawl_interact)\n- Extracting specific data from a known page (use firecrawl_scrape with JSON format)\n\n**Arguments:**\n- prompt: Natural language description of the data you want (required, max 10,000 characters)\n- urls: Optional array of URLs to focus the agent on specific pages\n- schema: Optional JSON schema for structured output\n\n**Prompt Example:** \"Find the founders of Firecrawl and their backgrounds\"\n**Usage Example (start agent, then poll patiently for results):**\n```json\n{\n  \"name\": \"firecrawl_agent\",\n  \"arguments\": {\n    \"prompt\": \"Find the top 5 AI startups founded in 2024 and their funding amounts\",\n    \"schema\": {\n      \"type\": \"object\",\n      \"properties\": {\n        \"startups\": {\n          \"type\": \"array\",\n          \"items\": {\n            \"type\": \"object\",\n            \"properties\": {\n              \"name\": { \"type\": \"string\" },\n              \"funding\": { \"type\": \"string\" },\n              \"founded\": { \"type\": \"string\" }\n            }\n          }\n        }\n      }\n    }\n  }\n}\n```\nThen poll with `firecrawl_agent_status` every 15-30 seconds for at least 2-3 minutes.\n\n**Usage Example (with URLs - agent focuses on specific pages):**\n```json\n{\n  \"name\": \"firecrawl_agent\",\n  \"arguments\": {\n    \"urls\": [\"https://docs.firecrawl.dev\", \"https://firecrawl.dev/pricing\"],\n    \"prompt\": \"Compare the features and pricing information from these pages\"\n  }\n}\n```\n**Returns:** Job ID for status checking. Use `firecrawl_agent_status` to poll for results.\n",
        "inputSchema": {
          "type": "object",
          "properties": {
            "prompt": {
              "type": "string",
              "minLength": 1,
              "maxLength": 10000
            },
            "urls": {
              "type": "array",
              "items": {
                "type": "string",
                "format": "uri"
              }
            },
            "schema": {
              "type": "object",
              "propertyNames": {
                "type": "string"
              },
              "additionalProperties": {}
            }
          },
          "required": [
            "prompt"
          ],
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "additionalProperties": false
        },
        "annotations": {
          "title": "Start a research agent",
          "readOnlyHint": false,
          "destructiveHint": false,
          "openWorldHint": true
        }
      },
      {
        "name": "firecrawl_agent_status",
        "description": "\nCheck the status of an agent job and retrieve results when complete. Use this to poll for results after starting an agent with `firecrawl_agent`.\n\n**IMPORTANT - Be patient with polling:**\n- Poll every 15-30 seconds\n- **Keep polling for at least 2-3 minutes** before considering the request failed\n- Complex research can take 5+ minutes - do not give up early\n- Only stop polling when status is \"completed\" or \"failed\"\n\n**Usage Example:**\n```json\n{\n  \"name\": \"firecrawl_agent_status\",\n  \"arguments\": {\n    \"id\": \"550e8400-e29b-41d4-a716-446655440000\"\n  }\n}\n```\n**Possible statuses:**\n- processing: Agent is still researching - keep polling, do not give up\n- completed: Research finished - response includes the extracted data\n- failed: An error occurred (only stop polling on this status)\n\n**Returns:** Status, progress, and results (if completed) of the agent job.\n",
        "inputSchema": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "required": [
            "id"
          ],
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "additionalProperties": false
        },
        "annotations": {
          "title": "Get agent job status",
          "readOnlyHint": true,
          "openWorldHint": false
        }
      },
      {
        "name": "firecrawl_check_crawl_status",
        "description": "\nCheck the status of a crawl job.\n\n**Usage Example:**\n```json\n{\n  \"name\": \"firecrawl_check_crawl_status\",\n  \"arguments\": {\n    \"id\": \"550e8400-e29b-41d4-a716-446655440000\"\n  }\n}\n```\n**Returns:** Status and progress of the crawl job, including results if available.\n",
        "inputSchema": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "required": [
            "id"
          ],
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "additionalProperties": false
        },
        "annotations": {
          "title": "Get crawl status",
          "readOnlyHint": true,
          "openWorldHint": false
        }
      },
      {
        "name": "firecrawl_crawl",
        "description": "\n Starts a crawl job on a website and extracts content from all pages.\n \n **Best for:** Extracting content from multiple related pages, when you need comprehensive coverage.\n **Not recommended for:** Extracting content from a single page (use scrape); when token limits are a concern (use map + batch_scrape); when you need fast results (crawling can be slow).\n **Warning:** Crawl responses can be very large and may exceed token limits. Limit the crawl depth and number of pages, or use map + batch_scrape for better control.\n **Common mistakes:** Setting limit or maxDiscoveryDepth too high (causes token overflow) or too low (causes missing pages); using crawl for a single page (use scrape instead). Using a /* wildcard is not recommended.\n **Prompt Example:** \"Get all blog posts from the first two levels of example.com/blog.\"\n **Usage Example:**\n ```json\n {\n   \"name\": \"firecrawl_crawl\",\n   \"arguments\": {\n     \"url\": \"https://example.com/blog/*\",\n     \"maxDiscoveryDepth\": 5,\n     \"limit\": 20,\n     \"allowExternalLinks\": false,\n     \"deduplicateSimilarURLs\": true,\n     \"sitemap\": \"include\"\n   }\n }\n ```\n **Returns:** Operation ID for status checking; use firecrawl_check_crawl_status to check progress.\n **Safe Mode:** Read-only crawling. Webhooks and interactive actions are disabled for security.\n ",
        "inputSchema": {
          "type": "object",
          "properties": {
            "url": {
              "type": "string"
            },
            "prompt": {
              "type": "string"
            },
            "excludePaths": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "includePaths": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "maxDiscoveryDepth": {
              "type": "number"
            },
            "sitemap": {
              "type": "string",
              "enum": [
                "skip",
                "include",
                "only"
              ]
            },
            "limit": {
              "type": "number"
            },
            "allowExternalLinks": {
              "type": "boolean"
            },
            "allowSubdomains": {
              "type": "boolean"
            },
            "crawlEntireDomain": {
              "type": "boolean"
            },
            "delay": {
              "type": "number"
            },
            "maxConcurrency": {
              "type": "number"
            },
            "deduplicateSimilarURLs": {
              "type": "boolean"
            },
            "ignoreQueryParameters": {
              "type": "boolean"
            },
            "scrapeOptions": {
              "type": "object",
              "properties": {
                "formats": {
                  "type": "array",
                  "items": {
                    "type": "string",
                    "enum": [
                      "markdown",
                      "html",
                      "rawHtml",
                      "screenshot",
                      "links",
                      "summary",
                      "changeTracking",
                      "branding",
                      "json",
                      "query",
                      "audio"
                    ]
                  }
                },
                "jsonOptions": {
                  "type": "object",
                  "properties": {
                    "prompt": {
                      "type": "string"
                    },
                    "schema": {
                      "type": "object",
                      "propertyNames": {
                        "type": "string"
                      },
                      "additionalProperties": {}
                    }
                  },
                  "additionalProperties": false
                },
                "queryOptions": {
                  "type": "object",
                  "properties": {
                    "prompt": {
                      "type": "string",
                      "maxLength": 10000
                    },
                    "mode": {
                      "default": "freeform",
                      "type": "string",
                      "enum": [
                        "directQuote",
                        "freeform"
                      ]
                    }
                  },
                  "required": [
                    "prompt",
                    "mode"
                  ],
                  "additionalProperties": false
                },
                "screenshotOptions": {
                  "type": "object",
                  "properties": {
                    "fullPage": {
                      "type": "boolean"
                    },
                    "quality": {
                      "type": "number"
                    },
                    "viewport": {
                      "type": "object",
                      "properties": {
                        "width": {
                          "type": "number"
                        },
                        "height": {
                          "type": "number"
                        }
                      },
                      "required": [
                        "width",
                        "height"
                      ],
                      "additionalProperties": false
                    }
                  },
                  "additionalProperties": false
                },
                "parsers": {
                  "type": "array",
                  "items": {
                    "type": "string",
                    "enum": [
                      "pdf"
                    ]
                  }
                },
                "pdfOptions": {
                  "type": "object",
                  "properties": {
                    "maxPages": {
                      "type": "integer",
                      "minimum": 1,
                      "maximum": 10000
                    }
                  },
                  "additionalProperties": false
                },
                "onlyMainContent": {
                  "type": "boolean"
                },
                "redactPII": {
                  "type": "boolean"
                },
                "includeTags": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                "excludeTags": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                "waitFor": {
                  "type": "number"
                },
                "mobile": {
                  "type": "boolean"
                },
                "skipTlsVerification": {
                  "type": "boolean"
                },
                "removeBase64Images": {
                  "type": "boolean"
                },
                "location": {
                  "type": "object",
                  "properties": {
                    "country": {
                      "type": "string"
                    },
                    "languages": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      }
                    }
                  },
                  "additionalProperties": false
                },
                "storeInCache": {
                  "type": "boolean"
                },
                "zeroDataRetention": {
                  "type": "boolean"
                },
                "maxAge": {
                  "type": "number"
                },
                "lockdown": {
                  "type": "boolean"
                },
                "proxy": {
                  "type": "string",
                  "enum": [
                    "basic",
                    "stealth",
                    "enhanced",
                    "auto"
                  ]
                },
                "profile": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string"
                    },
                    "saveChanges": {
                      "type": "boolean"
                    }
                  },
                  "required": [
                    "name"
                  ],
                  "additionalProperties": false
                }
              },
              "additionalProperties": false
            }
          },
          "required": [
            "url"
          ],
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "additionalProperties": false
        },
        "annotations": {
          "title": "Start a site crawl",
          "readOnlyHint": false,
          "destructiveHint": false,
          "openWorldHint": true
        }
      },
      {
        "name": "firecrawl_extract",
        "description": "\nExtract structured information from web pages using LLM capabilities. Supports both cloud AI and self-hosted LLM extraction.\n\n**Best for:** Extracting specific structured data like prices, names, details from web pages.\n**Not recommended for:** When you need the full content of a page (use scrape); when you're not looking for specific structured data.\n**Arguments:**\n- urls: Array of URLs to extract information from\n- prompt: Custom prompt for the LLM extraction\n- schema: JSON schema for structured data extraction\n- allowExternalLinks: Allow extraction from external links\n- enableWebSearch: Enable web search for additional context\n- includeSubdomains: Include subdomains in extraction\n**Prompt Example:** \"Extract the product name, price, and description from these product pages.\"\n**Usage Example:**\n```json\n{\n  \"name\": \"firecrawl_extract\",\n  \"arguments\": {\n    \"urls\": [\"https://example.com/page1\", \"https://example.com/page2\"],\n    \"prompt\": \"Extract product information including name, price, and description\",\n    \"schema\": {\n      \"type\": \"object\",\n      \"properties\": {\n        \"name\": { \"type\": \"string\" },\n        \"price\": { \"type\": \"number\" },\n        \"description\": { \"type\": \"string\" }\n      },\n      \"required\": [\"name\", \"price\"]\n    },\n    \"allowExternalLinks\": false,\n    \"enableWebSearch\": false,\n    \"includeSubdomains\": false\n  }\n}\n```\n**Returns:** Extracted structured data as defined by your schema.\n",
        "inputSchema": {
          "type": "object",
          "properties": {
            "urls": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "prompt": {
              "type": "string"
            },
            "schema": {
              "type": "object",
              "propertyNames": {
                "type": "string"
              },
              "additionalProperties": {}
            },
            "allowExternalLinks": {
              "type": "boolean"
            },
            "enableWebSearch": {
              "type": "boolean"
            },
            "includeSubdomains": {
              "type": "boolean"
            }
          },
          "required": [
            "urls"
          ],
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "additionalProperties": false
        },
        "annotations": {
          "title": "Extract structured data",
          "readOnlyHint": true,
          "openWorldHint": true
        }
      },
      {
        "name": "firecrawl_interact",
        "description": "\nInteract with a previously scraped page in a live browser session. Scrape a page first with firecrawl_scrape, then use the returned scrapeId to click buttons, fill forms, extract dynamic content, or navigate deeper.\n\n**Best for:** Multi-step workflows on a single page — searching a site, clicking through results, filling forms, extracting data that requires interaction.\n**Requires:** A scrapeId from a previous firecrawl_scrape call (found in the metadata of the scrape response).\n\n**Arguments:**\n- scrapeId: The scrape job ID from a previous scrape (required)\n- prompt: Natural language instruction describing the action to take (use this OR code)\n- code: Code to execute in the browser session (use this OR prompt)\n- language: \"bash\", \"python\", or \"node\" (optional, defaults to \"node\", only used with code)\n- timeout: Execution timeout in seconds, 1-300 (optional, defaults to 30)\n\n**Usage Example (prompt):**\n```json\n{\n  \"name\": \"firecrawl_interact\",\n  \"arguments\": {\n    \"scrapeId\": \"scrape-id-from-previous-scrape\",\n    \"prompt\": \"Click on the first product and tell me its price\"\n  }\n}\n```\n\n**Usage Example (code):**\n```json\n{\n  \"name\": \"firecrawl_interact\",\n  \"arguments\": {\n    \"scrapeId\": \"scrape-id-from-previous-scrape\",\n    \"code\": \"agent-browser click @e5\",\n    \"language\": \"bash\"\n  }\n}\n```\n**Returns:** Execution result including output, stdout, stderr, exit code, and live view URLs.\n",
        "inputSchema": {
          "type": "object",
          "properties": {
            "scrapeId": {
              "type": "string"
            },
            "prompt": {
              "type": "string"
            },
            "code": {
              "type": "string"
            },
            "language": {
              "type": "string",
              "enum": [
                "bash",
                "python",
                "node"
              ]
            },
            "timeout": {
              "type": "number",
              "minimum": 1,
              "maximum": 300
            }
          },
          "required": [
            "scrapeId"
          ],
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "additionalProperties": false
        },
        "annotations": {
          "title": "Interact with a scraped page",
          "readOnlyHint": false,
          "destructiveHint": false,
          "openWorldHint": true
        }
      },
      {
        "name": "firecrawl_interact_stop",
        "description": "\nStop an interact session for a scraped page. Call this when you are done interacting to free resources.\n\n**Usage Example:**\n```json\n{\n  \"name\": \"firecrawl_interact_stop\",\n  \"arguments\": {\n    \"scrapeId\": \"scrape-id-here\"\n  }\n}\n```\n**Returns:** Success confirmation.\n",
        "inputSchema": {
          "type": "object",
          "properties": {
            "scrapeId": {
              "type": "string"
            }
          },
          "required": [
            "scrapeId"
          ],
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "additionalProperties": false
        },
        "annotations": {
          "title": "Stop interact session",
          "readOnlyHint": false,
          "destructiveHint": true,
          "openWorldHint": false
        }
      },
      {
        "name": "firecrawl_map",
        "description": "\nMap a website to discover all indexed URLs on the site.\n\n**Best for:** Discovering URLs on a website before deciding what to scrape; finding specific sections or pages within a large site; locating the correct page when scrape returns empty or incomplete results.\n**Not recommended for:** When you already know which specific URL you need (use scrape); when you need the content of the pages (use scrape after mapping).\n**Common mistakes:** Using crawl to discover URLs instead of map; jumping straight to firecrawl_agent when scrape fails instead of using map first to find the right page.\n\n**IMPORTANT - Use map before agent:** If `firecrawl_scrape` returns empty, minimal, or irrelevant content, use `firecrawl_map` with the `search` parameter to find the specific page URL containing your target content. This is faster and cheaper than using `firecrawl_agent`. Only use the agent as a last resort after map+scrape fails.\n\n**Prompt Example:** \"Find the webhook documentation page on this API docs site.\"\n**Usage Example (discover all URLs):**\n```json\n{\n  \"name\": \"firecrawl_map\",\n  \"arguments\": {\n    \"url\": \"https://example.com\"\n  }\n}\n```\n**Usage Example (search for specific content - RECOMMENDED when scrape fails):**\n```json\n{\n  \"name\": \"firecrawl_map\",\n  \"arguments\": {\n    \"url\": \"https://docs.example.com/api\",\n    \"search\": \"webhook events\"\n  }\n}\n```\n**Returns:** Array of URLs found on the site, filtered by search query if provided.\n",
        "inputSchema": {
          "type": "object",
          "properties": {
            "url": {
              "type": "string",
              "format": "uri"
            },
            "search": {
              "type": "string"
            },
            "sitemap": {
              "type": "string",
              "enum": [
                "include",
                "skip",
                "only"
              ]
            },
            "includeSubdomains": {
              "type": "boolean"
            },
            "limit": {
              "type": "number"
            },
            "ignoreQueryParameters": {
              "type": "boolean"
            }
          },
          "required": [
            "url"
          ],
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "additionalProperties": false
        },
        "annotations": {
          "title": "Map a website",
          "readOnlyHint": true,
          "openWorldHint": true
        }
      },
      {
        "name": "firecrawl_monitor_check",
        "description": "\nGet a single check with page-level diff results. Filter `pageStatus` to surface only the pages that changed (or were new, removed, etc.).\n\nEach entry in `data.pages[]` has `url`, `status` (`same` | `new` | `changed` | `removed` | `error`), optional `judgment` when goal-based judging ran, and — when changed — a `diff` and possibly a `snapshot`. The shape of `diff` depends on the monitor's `formats` configuration:\n\n- **Markdown mode (default).** `diff.text` is the unified markdown diff; `diff.json` is a parse-diff AST (`{ files: [...] }`). No `snapshot`.\n- **JSON mode** (`changeTracking` with `modes: [\"json\"]`). `diff.json` is a per-field map keyed by JSON path into the extraction, e.g. `plans[0].price`, with each value being `{ previous, current }`. `snapshot.json` is the full current extraction. No `diff.text`.\n- **Mixed mode** (`modes: [\"json\", \"git-diff\"]`). Both `diff.text` (markdown sidecar) AND `diff.json` (per-field map) are present, plus `snapshot.json`.\n\n**Example JSON-mode response `pages[]` entry:**\n\n```json\n{\n  \"url\": \"https://example.com/pricing\",\n  \"status\": \"changed\",\n  \"diff\": {\n    \"json\": {\n      \"plans[0].price\":       { \"previous\": \"$19/mo\",        \"current\": \"$24/mo\" },\n      \"plans[1].features[2]\": { \"previous\": \"10 GB storage\", \"current\": \"25 GB storage\" }\n    }\n  },\n  \"snapshot\": { \"json\": { \"plans\": [/* current full extraction matching the monitor's schema */] } },\n  \"judgment\": {\n    \"meaningful\": true,\n    \"confidence\": \"high\",\n    \"reason\": \"The pricing changed, which matches the monitor goal.\",\n    \"meaningfulChanges\": [\n      {\n        \"type\": \"changed\",\n        \"before\": \"$19/mo\",\n        \"after\": \"$24/mo\",\n        \"reason\": \"The tracked plan price changed.\"\n      }\n    ]\n  }\n}\n```\n\nWhen summarizing a check for the user, prefer `diff.json` paths (e.g. \"plans[0].price changed from $19/mo to $24/mo\") over re-printing the markdown diff — it's more concise and grounded in the schema fields they asked for.\n\nWhen `judgment` is present, use it to decide what to surface. `judgment.meaningful: false` means the change was classified as noise for the monitor's goal. When `judgment.meaningfulChanges` is present, prefer those goal-relevant changes over raw diff hunks; each item includes `type`, `before`, `after`, and `reason`.\n\nThe endpoint paginates via a top-level `next` URL; this tool returns one page at a time. Increase `limit` (max 100) to fetch fewer pages.\n\n**Usage Example:**\n```json\n{\n  \"name\": \"firecrawl_monitor_check\",\n  \"arguments\": {\n    \"id\": \"mon_abc123\",\n    \"checkId\": \"chk_xyz\",\n    \"pageStatus\": \"changed\"\n  }\n}\n```\n",
        "inputSchema": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            },
            "checkId": {
              "type": "string"
            },
            "limit": {
              "type": "integer",
              "exclusiveMinimum": 0,
              "maximum": 9007199254740991
            },
            "skip": {
              "type": "integer",
              "minimum": 0,
              "maximum": 9007199254740991
            },
            "pageStatus": {
              "type": "string",
              "enum": [
                "same",
                "new",
                "changed",
                "removed",
                "error"
              ]
            }
          },
          "required": [
            "id",
            "checkId"
          ],
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "additionalProperties": false
        },
        "annotations": {
          "title": "Get monitor check",
          "readOnlyHint": true,
          "openWorldHint": false
        }
      },
      {
        "name": "firecrawl_monitor_checks",
        "description": "\nList historical checks for a monitor.\n\n**Usage Example:**\n```json\n{ \"name\": \"firecrawl_monitor_checks\", \"arguments\": { \"id\": \"mon_abc123\", \"limit\": 10, \"status\": \"completed\" } }\n```\n",
        "inputSchema": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            },
            "limit": {
              "type": "integer",
              "exclusiveMinimum": 0,
              "maximum": 9007199254740991
            },
            "offset": {
              "type": "integer",
              "minimum": 0,
              "maximum": 9007199254740991
            },
            "status": {
              "type": "string",
              "enum": [
                "queued",
                "running",
                "completed",
                "failed",
                "partial",
                "skipped_overlap"
              ]
            }
          },
          "required": [
            "id"
          ],
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "additionalProperties": false
        },
        "annotations": {
          "title": "List monitor checks",
          "readOnlyHint": true,
          "openWorldHint": false
        }
      },
      {
        "name": "firecrawl_monitor_create",
        "description": "\nCreate a Firecrawl monitor — a recurring scrape or crawl that diffs each result against the last retained snapshot.\n\nPrefer the simple path: pass `page` or `pages` plus `goal`. The tool will create a scrape monitor with a 30-minute schedule and meaningful-change judging enabled by the API. Use `body` only for advanced requests such as crawl targets, JSON change tracking, custom retention, or manual `judgeEnabled` control.\n\nMeaningful-change judge: set `goal` to a plain-language description of what the user actually cares about. `judgeEnabled` defaults to true when `goal` is set, so providing `goal` is enough. Page webhooks expose `isMeaningful` and `judgment` on `monitor.page` events.\n\nSimple fields:\n- `page`: one page URL to monitor.\n- `pages`: multiple page URLs to monitor.\n- `goal`: plain-English instruction for what changes matter. Required for the simple path.\n- `scheduleText`: optional natural-language schedule, default `every 30 minutes`.\n- `email`: optional email recipient for summaries.\n- `webhookUrl`: optional webhook URL. Configures `monitor.page` and `monitor.check.completed`.\n\nGoal guidance:\n- Expand the user's one-line monitoring intent into a concise 2-3 sentence monitor goal.\n- State what should trigger an alert, restate any scope the user gave, and include intent-specific exclusions only when obvious from the user's request.\n- Generic noise such as whitespace, formatting-only changes, request IDs, tracking params, generic metadata, and unrelated page chrome is already handled by the judge; do not repeat it in every goal.\n- If the user is vague, keep the goal broad rather than guessing exclusions. If the user asks for broad monitoring or \"any change\", preserve that and do not add exclusions that hide changes.\n- If the user says they do not care about something, include that explicitly. It is okay to ask whether they want to ignore specific noise when it is likely to matter.\n- Do not invent page-specific sections, thresholds, entities, or business rules unless the user mentioned them.\n\nFull `body` requests require: `name`, `schedule` (with `cron` or `text`), and `targets` (one or more `{ type: 'scrape', urls: [...] }` or `{ type: 'crawl', url: '...' }`). Optional: `goal`, `judgeEnabled`, `webhook`, `notification`, `retentionDays`.\n\n**Markdown-mode (default):** Each check produces a unified text diff of the page's markdown. No extra configuration needed.\n\n```json\n{\n  \"name\": \"firecrawl_monitor_create\",\n  \"arguments\": {\n    \"page\": \"https://example.com/blog\",\n    \"goal\": \"Alert when a new blog post is published or an existing headline changes.\",\n    \"email\": \"alerts@example.com\"\n  }\n}\n```\n\n**Multiple pages:**\n\n```json\n{\n  \"name\": \"firecrawl_monitor_create\",\n  \"arguments\": {\n    \"pages\": [\"https://example.com/pricing\", \"https://example.com/changelog\"],\n    \"goal\": \"Alert when pricing, packaging, or launch messaging changes.\",\n    \"webhookUrl\": \"https://example.com/webhooks/firecrawl\"\n  }\n}\n```\n\n**JSON-mode change tracking:** To detect changes in **specific structured fields** (price, headline, in-stock flag, list items) instead of the whole page, add a `changeTracking` format with `modes: [\"json\"]` and a JSON schema to the target's `scrapeOptions.formats`. The check response will then carry a per-field diff (keyed by JSON path, e.g. `plans[0].price`) and a `snapshot.json` with the full current extraction. See `firecrawl_monitor_check` for the response shape.\n\n```json\n{\n  \"name\": \"firecrawl_monitor_create\",\n  \"arguments\": {\n    \"body\": {\n      \"name\": \"Pricing watch\",\n      \"schedule\": { \"text\": \"hourly\", \"timezone\": \"UTC\" },\n      \"goal\": \"Alert when a pricing tier, price, billing period, limit, or headline feature changes. Ignore unrelated marketing copy unless it changes the pricing offer.\",\n      \"targets\": [{\n        \"type\": \"scrape\",\n        \"urls\": [\"https://example.com/pricing\"],\n        \"scrapeOptions\": {\n          \"formats\": [{\n            \"type\": \"changeTracking\",\n            \"modes\": [\"json\"],\n            \"prompt\": \"Extract pricing tiers and headline features for each plan.\",\n            \"schema\": {\n              \"type\": \"object\",\n              \"properties\": {\n                \"plans\": {\n                  \"type\": \"array\",\n                  \"items\": {\n                    \"type\": \"object\",\n                    \"properties\": {\n                      \"name\":     { \"type\": \"string\" },\n                      \"price\":    { \"type\": \"string\" },\n                      \"features\": { \"type\": \"array\", \"items\": { \"type\": \"string\" } }\n                    }\n                  }\n                }\n              }\n            }\n          }]\n        }\n      }]\n    }\n  }\n}\n```\n\n**Mixed mode (JSON + git-diff):** Use `modes: [\"json\", \"git-diff\"]` to get both per-field diffs and a markdown sidecar. The page is marked `changed` whenever either surface changed.\n",
        "inputSchema": {
          "type": "object",
          "properties": {
            "body": {
              "type": "object",
              "propertyNames": {
                "type": "string"
              },
              "additionalProperties": {}
            },
            "page": {
              "type": "string"
            },
            "pages": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "goal": {
              "type": "string"
            },
            "name": {
              "type": "string"
            },
            "scheduleText": {
              "type": "string"
            },
            "timezone": {
              "type": "string"
            },
            "email": {
              "type": "string"
            },
            "includeDiffs": {
              "type": "boolean"
            },
            "webhookUrl": {
              "type": "string"
            }
          },
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "additionalProperties": false
        },
        "annotations": {
          "title": "Create monitor",
          "readOnlyHint": false,
          "openWorldHint": true
        }
      },
      {
        "name": "firecrawl_monitor_delete",
        "description": "\nPermanently delete a monitor and stop its schedule. This cannot be undone.\n\n**Usage Example:**\n```json\n{ \"name\": \"firecrawl_monitor_delete\", \"arguments\": { \"id\": \"mon_abc123\" } }\n```\n",
        "inputSchema": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "required": [
            "id"
          ],
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "additionalProperties": false
        },
        "annotations": {
          "title": "Delete monitor",
          "readOnlyHint": false,
          "destructiveHint": true,
          "openWorldHint": true
        }
      },
      {
        "name": "firecrawl_monitor_get",
        "description": "\nGet a single monitor by ID.\n\n**Usage Example:**\n```json\n{ \"name\": \"firecrawl_monitor_get\", \"arguments\": { \"id\": \"mon_abc123\" } }\n```\n",
        "inputSchema": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "required": [
            "id"
          ],
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "additionalProperties": false
        },
        "annotations": {
          "title": "Get monitor",
          "readOnlyHint": true,
          "openWorldHint": false
        }
      },
      {
        "name": "firecrawl_monitor_list",
        "description": "\nList all Firecrawl monitors for the authenticated account.\n\n**Usage Example:**\n```json\n{ \"name\": \"firecrawl_monitor_list\", \"arguments\": { \"limit\": 20 } }\n```\n",
        "inputSchema": {
          "type": "object",
          "properties": {
            "limit": {
              "type": "integer",
              "exclusiveMinimum": 0,
              "maximum": 9007199254740991
            },
            "offset": {
              "type": "integer",
              "minimum": 0,
              "maximum": 9007199254740991
            }
          },
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "additionalProperties": false
        },
        "annotations": {
          "title": "List monitors",
          "readOnlyHint": true,
          "openWorldHint": false
        }
      },
      {
        "name": "firecrawl_monitor_run",
        "description": "\nTrigger a monitor check immediately, outside its normal schedule. Returns the queued check.\n\n**Usage Example:**\n```json\n{ \"name\": \"firecrawl_monitor_run\", \"arguments\": { \"id\": \"mon_abc123\" } }\n```\n",
        "inputSchema": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "required": [
            "id"
          ],
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "additionalProperties": false
        },
        "annotations": {
          "title": "Run monitor now",
          "readOnlyHint": false,
          "openWorldHint": true
        }
      },
      {
        "name": "firecrawl_monitor_update",
        "description": "\nUpdate a monitor. Pass any subset of fields to patch: `name`, `status` (\"active\" | \"paused\"), `schedule`, `targets`, `goal`, `judgeEnabled`, `webhook`, `notification`, `retentionDays`.\n\n**Usage Example:**\n```json\n{\n  \"name\": \"firecrawl_monitor_update\",\n  \"arguments\": {\n    \"id\": \"mon_abc123\",\n    \"body\": { \"status\": \"paused\" }\n  }\n}\n```\n",
        "inputSchema": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            },
            "body": {
              "type": "object",
              "propertyNames": {
                "type": "string"
              },
              "additionalProperties": {}
            }
          },
          "required": [
            "id",
            "body"
          ],
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "additionalProperties": false
        },
        "annotations": {
          "title": "Update monitor",
          "readOnlyHint": false,
          "openWorldHint": true
        }
      },
      {
        "name": "firecrawl_scrape",
        "description": "\nScrape content from a single URL with advanced options.\nThis is the most powerful, fastest and most reliable scraper tool, if available you should always default to using this tool for any web scraping needs.\n\n**Best for:** Single page content extraction, when you know exactly which page contains the information.\n**Not recommended for:** Multiple pages (call scrape multiple times or use crawl), unknown page location (use search).\n**Common mistakes:** Using markdown format when extracting specific data points (use JSON instead).\n**Other Features:** Use 'branding' format to extract brand identity (colors, fonts, typography, spacing, UI components) for design analysis or style replication.\n\n**CRITICAL - Format Selection (you MUST follow this):**\nWhen the user asks for SPECIFIC data points, you MUST use JSON format with a schema. Only use markdown when the user needs the ENTIRE page content.\n\n**Use JSON format when user asks for:**\n- Parameters, fields, or specifications (e.g., \"get the header parameters\", \"what are the required fields\")\n- Prices, numbers, or structured data (e.g., \"extract the pricing\", \"get the product details\")\n- API details, endpoints, or technical specs (e.g., \"find the authentication endpoint\")\n- Lists of items or properties (e.g., \"list the features\", \"get all the options\")\n- Any specific piece of information from a page\n\n**Use markdown format ONLY when:**\n- User wants to read/summarize an entire article or blog post\n- User needs to see all content on a page without specific extraction\n- User explicitly asks for the full page content\n\n**Handling JavaScript-rendered pages (SPAs):**\nIf JSON extraction returns empty, minimal, or just navigation content, the page is likely JavaScript-rendered or the content is on a different URL. Try these steps IN ORDER:\n1. **Add waitFor parameter:** Set `waitFor: 5000` to `waitFor: 10000` to allow JavaScript to render before extraction\n2. **Try a different URL:** If the URL has a hash fragment (#section), try the base URL or look for a direct page URL\n3. **Use firecrawl_map to find the correct page:** Large documentation sites or SPAs often spread content across multiple URLs. Use `firecrawl_map` with a `search` parameter to discover the specific page containing your target content, then scrape that URL directly.\n   Example: If scraping \"https://docs.example.com/reference\" fails to find webhook parameters, use `firecrawl_map` with `{\"url\": \"https://docs.example.com/reference\", \"search\": \"webhook\"}` to find URLs like \"/reference/webhook-events\", then scrape that specific page.\n4. **Use firecrawl_agent:** As a last resort for heavily dynamic pages where map+scrape still fails, use the agent which can autonomously navigate and research\n\n**Usage Example (JSON format - REQUIRED for specific data extraction):**\n```json\n{\n  \"name\": \"firecrawl_scrape\",\n  \"arguments\": {\n    \"url\": \"https://example.com/api-docs\",\n    \"formats\": [\"json\"],\n    \"jsonOptions\": {\n      \"prompt\": \"Extract the header parameters for the authentication endpoint\",\n      \"schema\": {\n        \"type\": \"object\",\n        \"properties\": {\n          \"parameters\": {\n            \"type\": \"array\",\n            \"items\": {\n              \"type\": \"object\",\n              \"properties\": {\n                \"name\": { \"type\": \"string\" },\n                \"type\": { \"type\": \"string\" },\n                \"required\": { \"type\": \"boolean\" },\n                \"description\": { \"type\": \"string\" }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}\n```\n\n**Prefer markdown format by default.** You can read and reason over the full page content directly — no need for an intermediate query step. Use markdown for questions about page content, factual lookups, and any task where you need to understand the page.\n\n**Use JSON format when user needs:**\n- Structured data with specific fields (extract all products with name, price, description)\n- Data in a specific schema for downstream processing\n\n**Use query format only when:**\n- The page is extremely long and you need a single targeted answer without processing the full content\n- You want a quick factual answer and don't need to retain the page content\n- Set `queryOptions.mode` to `\"directQuote\"` when you need verbatim page text; otherwise it defaults to `\"freeform\"`\n\n**Usage Example (markdown format - default for most tasks):**\n```json\n{\n  \"name\": \"firecrawl_scrape\",\n  \"arguments\": {\n    \"url\": \"https://example.com/article\",\n    \"formats\": [\"markdown\"],\n    \"onlyMainContent\": true\n  }\n}\n```\n**Usage Example (branding format - extract brand identity):**\n```json\n{\n  \"name\": \"firecrawl_scrape\",\n  \"arguments\": {\n    \"url\": \"https://example.com\",\n    \"formats\": [\"branding\"]\n  }\n}\n```\n**Branding format:** Extracts comprehensive brand identity (colors, fonts, typography, spacing, logo, UI components) for design analysis or style replication.\n**Performance:** Add maxAge parameter for 500% faster scrapes using cached data.\n**Lockdown mode:** Set `lockdown: true` to serve the request only from the existing index/cache without any outbound network request. For air-gapped or compliance-constrained use where the request URL itself is considered sensitive. Errors on cache miss. Billed at 5 credits.\n**Privacy:** Set `redactPII: true` to return content with personally identifiable information redacted.\n**Returns:** JSON structured data, markdown, branding profile, or other formats as specified.\n**Safe Mode:** Read-only content extraction. Interactive actions (click, write, executeJavascript) are disabled for security.\n",
        "inputSchema": {
          "type": "object",
          "properties": {
            "url": {
              "type": "string",
              "format": "uri"
            },
            "formats": {
              "type": "array",
              "items": {
                "type": "string",
                "enum": [
                  "markdown",
                  "html",
                  "rawHtml",
                  "screenshot",
                  "links",
                  "summary",
                  "changeTracking",
                  "branding",
                  "json",
                  "query",
                  "audio"
                ]
              }
            },
            "jsonOptions": {
              "type": "object",
              "properties": {
                "prompt": {
                  "type": "string"
                },
                "schema": {
                  "type": "object",
                  "propertyNames": {
                    "type": "string"
                  },
                  "additionalProperties": {}
                }
              },
              "additionalProperties": false
            },
            "queryOptions": {
              "type": "object",
              "properties": {
                "prompt": {
                  "type": "string",
                  "maxLength": 10000
                },
                "mode": {
                  "default": "freeform",
                  "type": "string",
                  "enum": [
                    "directQuote",
                    "freeform"
                  ]
                }
              },
              "required": [
                "prompt",
                "mode"
              ],
              "additionalProperties": false
            },
            "screenshotOptions": {
              "type": "object",
              "properties": {
                "fullPage": {
                  "type": "boolean"
                },
                "quality": {
                  "type": "number"
                },
                "viewport": {
                  "type": "object",
                  "properties": {
                    "width": {
                      "type": "number"
                    },
                    "height": {
                      "type": "number"
                    }
                  },
                  "required": [
                    "width",
                    "height"
                  ],
                  "additionalProperties": false
                }
              },
              "additionalProperties": false
            },
            "parsers": {
              "type": "array",
              "items": {
                "type": "string",
                "enum": [
                  "pdf"
                ]
              }
            },
            "pdfOptions": {
              "type": "object",
              "properties": {
                "maxPages": {
                  "type": "integer",
                  "minimum": 1,
                  "maximum": 10000
                }
              },
              "additionalProperties": false
            },
            "onlyMainContent": {
              "type": "boolean"
            },
            "redactPII": {
              "type": "boolean"
            },
            "includeTags": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "excludeTags": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "waitFor": {
              "type": "number"
            },
            "mobile": {
              "type": "boolean"
            },
            "skipTlsVerification": {
              "type": "boolean"
            },
            "removeBase64Images": {
              "type": "boolean"
            },
            "location": {
              "type": "object",
              "properties": {
                "country": {
                  "type": "string"
                },
                "languages": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                }
              },
              "additionalProperties": false
            },
            "storeInCache": {
              "type": "boolean"
            },
            "zeroDataRetention": {
              "type": "boolean"
            },
            "maxAge": {
              "type": "number"
            },
            "lockdown": {
              "type": "boolean"
            },
            "proxy": {
              "type": "string",
              "enum": [
                "basic",
                "stealth",
                "enhanced",
                "auto"
              ]
            },
            "profile": {
              "type": "object",
              "properties": {
                "name": {
                  "type": "string"
                },
                "saveChanges": {
                  "type": "boolean"
                }
              },
              "required": [
                "name"
              ],
              "additionalProperties": false
            }
          },
          "required": [
            "url"
          ],
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "additionalProperties": false
        },
        "annotations": {
          "title": "Scrape a URL",
          "readOnlyHint": true,
          "openWorldHint": true
        }
      },
      {
        "name": "firecrawl_search",
        "description": "\nSearch the web and optionally extract content from search results. This is the most powerful web search tool available, and if available you should always default to using this tool for any web search needs.\n\nThe query also supports search operators, that you can use if needed to refine the search:\n| Operator | Functionality | Examples |\n---|-|-|\n| `\"\"` | Non-fuzzy matches a string of text | `\"Firecrawl\"`\n| `-` | Excludes certain keywords or negates other operators | `-bad`, `-site:firecrawl.dev`\n| `site:` | Only returns results from a specified website | `site:firecrawl.dev`\n| `inurl:` | Only returns results that include a word in the URL | `inurl:firecrawl`\n| `allinurl:` | Only returns results that include multiple words in the URL | `allinurl:git firecrawl`\n| `intitle:` | Only returns results that include a word in the title of the page | `intitle:Firecrawl`\n| `allintitle:` | Only returns results that include multiple words in the title of the page | `allintitle:firecrawl playground`\n| `related:` | Only returns results that are related to a specific domain | `related:firecrawl.dev`\n| `imagesize:` | Only returns images with exact dimensions | `imagesize:1920x1080`\n| `larger:` | Only returns images larger than specified dimensions | `larger:1920x1080`\n\n**Best for:** Finding specific information across multiple websites, when you don't know which website has the information; when you need the most relevant content for a query.\n**Not recommended for:** When you need to search the filesystem. When you already know which website to scrape (use scrape); when you need comprehensive coverage of a single website (use map or crawl.\n**Common mistakes:** Using crawl or map for open-ended questions (use search instead).\n**Prompt Example:** \"Find the latest research papers on AI published in 2023.\"\n**Sources:** web, images, news, default to web unless needed images or news.\n**Domain filters:** Use includeDomains to restrict results to specific domains, or excludeDomains to remove domains. Do not use both in the same request. Domains must be hostnames only, without protocol or path.\n**Scrape Options:** Only use scrapeOptions when you think it is absolutely necessary. When you do so default to a lower limit to avoid timeouts, 5 or lower.\n**Optimal Workflow:** Search first using firecrawl_search without formats, then after fetching the results, use the scrape tool to get the content of the relevantpage(s) that you want to scrape\n**After the search:** Once you have processed the results (or decided they were not useful), call `firecrawl_search_feedback` with the `id` from this response. The first feedback per search refunds 1 credit and helps Firecrawl improve search quality.\n\n**Usage Example without formats (Preferred):**\n```json\n{\n  \"name\": \"firecrawl_search\",\n  \"arguments\": {\n    \"query\": \"top AI companies\",\n    \"limit\": 5,\n    \"includeDomains\": [\"example.com\"],\n    \"sources\": [\n      { \"type\": \"web\" }\n    ]\n  }\n}\n```\n**Usage Example with formats:**\n```json\n{\n  \"name\": \"firecrawl_search\",\n  \"arguments\": {\n    \"query\": \"latest AI research papers 2023\",\n    \"limit\": 5,\n    \"lang\": \"en\",\n    \"country\": \"us\",\n    \"sources\": [\n      { \"type\": \"web\" },\n      { \"type\": \"images\" },\n      { \"type\": \"news\" }\n    ],\n    \"scrapeOptions\": {\n      \"formats\": [\"markdown\"],\n      \"onlyMainContent\": true\n    }\n  }\n}\n```\n**Returns:** A JSON envelope of the form `{ success, data: { web?, images?, news? }, id, creditsUsed }`. Each result array contains the search results (with optional scraped content). Pass the top-level `id` to `firecrawl_search_feedback` after you've used the results.\n",
        "inputSchema": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "minLength": 1
            },
            "limit": {
              "type": "number"
            },
            "tbs": {
              "type": "string"
            },
            "filter": {
              "type": "string"
            },
            "location": {
              "type": "string"
            },
            "includeDomains": {
              "type": "array",
              "items": {
                "type": "string",
                "minLength": 1,
                "maxLength": 253,
                "pattern": "^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$"
              }
            },
            "excludeDomains": {
              "type": "array",
              "items": {
                "type": "string",
                "minLength": 1,
                "maxLength": 253,
                "pattern": "^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$"
              }
            },
            "sources": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "type": {
                    "type": "string",
                    "enum": [
                      "web",
                      "images",
                      "news"
                    ]
                  }
                },
                "required": [
                  "type"
                ],
                "additionalProperties": false
              }
            },
            "scrapeOptions": {
              "type": "object",
              "properties": {
                "formats": {
                  "type": "array",
                  "items": {
                    "type": "string",
                    "enum": [
                      "markdown",
                      "html",
                      "rawHtml",
                      "screenshot",
                      "links",
                      "summary",
                      "changeTracking",
                      "branding",
                      "json",
                      "query",
                      "audio"
                    ]
                  }
                },
                "jsonOptions": {
                  "type": "object",
                  "properties": {
                    "prompt": {
                      "type": "string"
                    },
                    "schema": {
                      "type": "object",
                      "propertyNames": {
                        "type": "string"
                      },
                      "additionalProperties": {}
                    }
                  },
                  "additionalProperties": false
                },
                "queryOptions": {
                  "type": "object",
                  "properties": {
                    "prompt": {
                      "type": "string",
                      "maxLength": 10000
                    },
                    "mode": {
                      "default": "freeform",
                      "type": "string",
                      "enum": [
                        "directQuote",
                        "freeform"
                      ]
                    }
                  },
                  "required": [
                    "prompt",
                    "mode"
                  ],
                  "additionalProperties": false
                },
                "screenshotOptions": {
                  "type": "object",
                  "properties": {
                    "fullPage": {
                      "type": "boolean"
                    },
                    "quality": {
                      "type": "number"
                    },
                    "viewport": {
                      "type": "object",
                      "properties": {
                        "width": {
                          "type": "number"
                        },
                        "height": {
                          "type": "number"
                        }
                      },
                      "required": [
                        "width",
                        "height"
                      ],
                      "additionalProperties": false
                    }
                  },
                  "additionalProperties": false
                },
                "parsers": {
                  "type": "array",
                  "items": {
                    "type": "string",
                    "enum": [
                      "pdf"
                    ]
                  }
                },
                "pdfOptions": {
                  "type": "object",
                  "properties": {
                    "maxPages": {
                      "type": "integer",
                      "minimum": 1,
                      "maximum": 10000
                    }
                  },
                  "additionalProperties": false
                },
                "onlyMainContent": {
                  "type": "boolean"
                },
                "redactPII": {
                  "type": "boolean"
                },
                "includeTags": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                "excludeTags": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                "waitFor": {
                  "type": "number"
                },
                "mobile": {
                  "type": "boolean"
                },
                "skipTlsVerification": {
                  "type": "boolean"
                },
                "removeBase64Images": {
                  "type": "boolean"
                },
                "location": {
                  "type": "object",
                  "properties": {
                    "country": {
                      "type": "string"
                    },
                    "languages": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      }
                    }
                  },
                  "additionalProperties": false
                },
                "storeInCache": {
                  "type": "boolean"
                },
                "zeroDataRetention": {
                  "type": "boolean"
                },
                "maxAge": {
                  "type": "number"
                },
                "lockdown": {
                  "type": "boolean"
                },
                "proxy": {
                  "type": "string",
                  "enum": [
                    "basic",
                    "stealth",
                    "enhanced",
                    "auto"
                  ]
                },
                "profile": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string"
                    },
                    "saveChanges": {
                      "type": "boolean"
                    }
                  },
                  "required": [
                    "name"
                  ],
                  "additionalProperties": false
                }
              },
              "additionalProperties": false
            },
            "enterprise": {
              "type": "array",
              "items": {
                "type": "string",
                "enum": [
                  "default",
                  "anon",
                  "zdr"
                ]
              }
            }
          },
          "required": [
            "query"
          ],
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "additionalProperties": false
        },
        "annotations": {
          "title": "Search the web",
          "readOnlyHint": true,
          "openWorldHint": true
        }
      },
      {
        "name": "firecrawl_search_feedback",
        "description": "\nSend structured feedback on a previous `firecrawl_search` result. **Call this immediately after a search where you used the results** so we can improve search quality and refund 1 credit (search costs 2).\n\nPass the `searchId` returned by `firecrawl_search` (the `id` field on the response) and tell us:\n\n- **rating** — overall result quality: `good`, `partial`, or `bad`.\n- **valuableSources** — which result URLs were actually useful, and a short reason why.\n- **missingContent** — **the most important field.** An ARRAY of specific pieces of content you expected to find but didn't. One entry per missing piece, each with a short `topic` and an optional longer `description`. Examples: `{\"topic\":\"enterprise pricing\",\"description\":\"no pricing tier table for the Enterprise plan was returned\"}`, `{\"topic\":\"API rate limits\"}`, `{\"topic\":\"comparison vs competitors\"}`. **Be specific** — these aggregate across teams and tell us what to index next. Do not pack multiple topics into one entry.\n- **querySuggestions** — how the query or response shape could be improved (e.g. \"would have liked official docs first\", \"should boost github.com\").\n\n**Substantive-feedback requirement** (zero-effort feedback is rejected with HTTP 400):\n- `good` — must include at least one `valuableSources` entry\n- `partial` — must include `valuableSources` or at least one `missingContent` entry\n- `bad` — must include at least one `missingContent` entry or `querySuggestions`\n\n**Time window:** Feedback must be submitted within ~2 minutes of the search. Beyond that, the call returns HTTP 409 with `feedbackErrorCode: \"FEEDBACK_WINDOW_EXPIRED\"` — do not retry, just move on. Same goes for any 4xx response: do not retry-loop.\n\n**Behaviors:**\n- Idempotent per `searchId`. Re-submitting for the same id returns `alreadySubmitted: true` with `creditsRefunded: 0`.\n- Refund only applies to billable searches; preview teams are blocked.\n- Failed searches cannot receive feedback (the search itself already returned an error you can act on).\n- **Daily refund cap (per team, per UTC day, default 100 credits).** Once a team's `creditsRefundedToday` reaches `dailyRefundCap`, the response returns `dailyCapReached: true` with `creditsRefunded: 0`. The feedback is still recorded for search-quality improvement — only the credit refund is gated. **Stop calling this tool for the rest of the UTC day** when you see `dailyCapReached: true`.\n\n**When to call:** Right after processing a search result. If the result didn't help, send rating `bad` with a clear `missingContent` — that is just as valuable as a `good` rating.\n\n**Usage Example (good rating with valuable sources + missing content):**\n```json\n{\n  \"name\": \"firecrawl_search_feedback\",\n  \"arguments\": {\n    \"searchId\": \"0193f6c5-1234-7890-abcd-1234567890ab\",\n    \"rating\": \"good\",\n    \"valuableSources\": [\n      { \"url\": \"https://docs.firecrawl.dev/features/search\", \"reason\": \"Most up-to-date description of /search.\" }\n    ],\n    \"missingContent\": [\n      { \"topic\": \"Pricing for the search endpoint\", \"description\": \"No pricing tier table for /search specifically.\" },\n      { \"topic\": \"Rate limits\", \"description\": \"Per-team RPS for /search not documented.\" }\n    ],\n    \"querySuggestions\": \"Boost docs.firecrawl.dev for queries that mention 'firecrawl'\"\n  }\n}\n```\n\n**Usage Example (bad rating, what was missing):**\n```json\n{\n  \"name\": \"firecrawl_search_feedback\",\n  \"arguments\": {\n    \"searchId\": \"0193f6c5-1234-7890-abcd-1234567890ab\",\n    \"rating\": \"bad\",\n    \"missingContent\": [\n      { \"topic\": \"Recent benchmarks\", \"description\": \"All results were >12 months old.\" },\n      { \"topic\": \"Comparison vs Algolia\" }\n    ]\n  }\n}\n```\n\n**Returns:** `{ success, feedbackId, creditsRefunded, creditsRefundedToday, dailyRefundCap, dailyCapReached?, alreadySubmitted?, warning? }` JSON.\n",
        "inputSchema": {
          "type": "object",
          "properties": {
            "searchId": {
              "type": "string",
              "format": "uuid",
              "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"
            },
            "rating": {
              "type": "string",
              "enum": [
                "good",
                "bad",
                "partial"
              ]
            },
            "valuableSources": {
              "maxItems": 50,
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "url": {
                    "type": "string",
                    "format": "uri"
                  },
                  "reason": {
                    "type": "string",
                    "maxLength": 1000
                  }
                },
                "required": [
                  "url"
                ],
                "additionalProperties": false
              }
            },
            "missingContent": {
              "maxItems": 20,
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "topic": {
                    "type": "string",
                    "minLength": 1,
                    "maxLength": 200
                  },
                  "description": {
                    "type": "string",
                    "maxLength": 2000
                  }
                },
                "required": [
                  "topic"
                ],
                "additionalProperties": false
              }
            },
            "querySuggestions": {
              "type": "string",
              "maxLength": 2000
            }
          },
          "required": [
            "searchId",
            "rating"
          ],
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "additionalProperties": false
        },
        "annotations": {
          "title": "Send feedback on a search result",
          "readOnlyHint": false,
          "openWorldHint": true
        }
      }
    ]
  },
  "linkup": {
    "provider": "linkup",
    "url": "https://mcp.linkup.so/mcp",
    "generatedAt": "2026-06-05T08:00:19.675Z",
    "toolCount": 2,
    "fingerprint": "fa73a59226cc3ec58c7795e6f2c6f2020c701fb1f5e38a4bdaaf1610f8cd04cc",
    "tools": [
      {
        "name": "linkup-fetch",
        "title": "Linkup page fetch",
        "description": "Fetch a URL and return the content of the page. If you are unable to fetch the page content, might be worth trying to render the JavaScript content.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "extractImages": {
              "default": false,
              "description": "Define if the images should be extracted from the page and returned in the response in a dedicated \"images\" field. This is useful when you need to have a list of all images found on the page for further processing or analysis.",
              "type": "boolean"
            },
            "includeRawHtml": {
              "default": false,
              "description": "Define if the raw HTML of the page should be included in the response in a dedicated \"rawHtml\" field. This is useful when you need to perform custom HTML parsing, preserve specific formatting, or access elements that might be filtered out during the standard content extraction process.",
              "type": "boolean"
            },
            "renderJs": {
              "default": false,
              "description": "Whether to render the JavaScript content. Only use this if explicitly asked to by the user or if the page content is not available. This will make the request slower.",
              "type": "boolean"
            },
            "url": {
              "type": "string",
              "format": "uri",
              "description": "The URL to fetch."
            }
          },
          "required": [
            "url"
          ],
          "$schema": "http://json-schema.org/draft-07/schema#"
        },
        "execution": {
          "taskSupport": "forbidden"
        }
      },
      {
        "name": "linkup-search",
        "title": "Linkup web search",
        "description": "Search the web in real time using Linkup to retrieve current information, facts, and news from trusted sources. Use this tool for: real-time data (weather, stocks, sports scores, events), breaking news, current events, recent research, product information, up-to-date prices, schedules, and any information not available in your knowledge base. Returns comprehensive content from the most relevant sources.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "depth": {
              "default": "standard",
              "description": "The search depth to perform. Use \"standard\" for queries with direct answers, \"deep\" for complex research requiring analysis across multiple sources.",
              "type": "string",
              "enum": [
                "standard",
                "deep"
              ]
            },
            "excludeDomains": {
              "description": "A list of domains to exclude from search results, e.g. [\"reddit.com\", \"quora.com\"]. Results from these domains will be filtered out.",
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "fromDate": {
              "description": "Filter results to only include content published on or after this date. Format: YYYY-MM-DD.",
              "type": "string",
              "format": "date",
              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))$"
            },
            "includeDomains": {
              "description": "A list of domains to restrict search results to, e.g. [\"bbc.com\", \"reuters.com\"]. Only results from these domains will be returned. Max 100 domains.",
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "includeImages": {
              "default": false,
              "description": "Allows you to receive image results alongside text results in your search responses. When set to true, Linkup will return relevant images related to your query, each with a URL and metadata.",
              "type": "boolean"
            },
            "maxResults": {
              "description": "Maximum number of results to return.",
              "type": "integer",
              "exclusiveMinimum": 0,
              "maximum": 9007199254740991
            },
            "query": {
              "type": "string",
              "description": "Natural language search query. Full questions work best, e.g., \"How does the new EU AI Act affect startups?\""
            },
            "toDate": {
              "description": "Filter results to only include content published on or before this date. Format: YYYY-MM-DD.",
              "type": "string",
              "format": "date",
              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))$"
            }
          },
          "required": [
            "query"
          ],
          "$schema": "http://json-schema.org/draft-07/schema#"
        },
        "execution": {
          "taskSupport": "forbidden"
        }
      }
    ]
  },
  "olostep": {
    "provider": "olostep",
    "url": "https://mcp.olostep.com/mcp",
    "generatedAt": "2026-06-05T08:00:19.675Z",
    "toolCount": 10,
    "fingerprint": "745e9089e0ae205eee2e88c196f5dd3498184dfd9443e44686c9980019a498cf",
    "tools": [
      {
        "name": "answers",
        "description": "Search the web and return AI-powered answers in the JSON structure you want, with sources and citations.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "task": {
              "type": "string",
              "description": "Question or task to answer using web data."
            },
            "json": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "object",
                  "additionalProperties": {}
                }
              ],
              "description": "Optional JSON schema/object or a short description of the desired output shape. Example object: { \"book_title\": \"\", \"author\": \"\", \"release_date\": \"\" }"
            }
          },
          "required": [
            "task"
          ],
          "additionalProperties": false,
          "$schema": "http://json-schema.org/draft-07/schema#"
        },
        "execution": {
          "taskSupport": "forbidden"
        }
      },
      {
        "name": "batch_scrape_urls",
        "description": "Scrape a SPECIFIC, KNOWN list of URLs (typically from different domains). **Do NOT use this for crawling a website** - if the user wants to scrape a whole site or 'crawl' a domain, use `create_crawl` instead. Use this only when you already have an explicit list of URLs to scrape (e.g., user provides a CSV of URLs, or you need to scrape unrelated pages). Returns a batch_id immediately. Use `get_batch_results` with the batch_id to fetch the scraped content once the batch completes (~5–8 min). Set `wait_for_completion_seconds` to poll automatically.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "urls": {
              "type": "array",
              "items": {
                "anyOf": [
                  {
                    "type": "string",
                    "format": "uri"
                  },
                  {
                    "type": "object",
                    "properties": {
                      "url": {
                        "type": "string",
                        "format": "uri"
                      },
                      "custom_id": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "url"
                    ],
                    "additionalProperties": false
                  }
                ]
              },
              "minItems": 1,
              "maxItems": 10000,
              "description": "Array of URLs to scrape — plain URL strings, or objects with \"url\" and optional \"custom_id\"."
            },
            "urls_to_scrape": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "url": {
                    "type": "string",
                    "format": "uri"
                  },
                  "custom_id": {
                    "type": "string"
                  }
                },
                "required": [
                  "url"
                ],
                "additionalProperties": false
              },
              "minItems": 1,
              "maxItems": 10000,
              "description": "Alias for `urls`."
            },
            "output_format": {
              "type": "string",
              "enum": [
                "markdown",
                "html",
                "json",
                "text"
              ],
              "default": "markdown",
              "description": "Choose format for all URLs. Default: \"markdown\"."
            },
            "country": {
              "type": "string",
              "description": "Optional country code for location-specific scraping."
            },
            "wait_before_scraping": {
              "type": "integer",
              "minimum": 0,
              "maximum": 10000,
              "default": 0,
              "description": "Wait time in milliseconds before scraping each URL."
            },
            "parser": {
              "type": "string",
              "description": "Optional parser ID for specialized extraction (e.g. @olostep/google-search)."
            },
            "wait_for_completion_seconds": {
              "type": "integer",
              "minimum": 0,
              "maximum": 900,
              "default": 0,
              "description": "Seconds to wait for batch completion. If >0, polls every 10s until done or timeout, then returns status. Use 0 to return immediately with batch_id (then call get_batch_results later). Recommended: 60 for batches <50 URLs, 300–600 for 50–1k URLs, 0 for larger batches (poll separately)."
            }
          },
          "additionalProperties": false,
          "$schema": "http://json-schema.org/draft-07/schema#"
        },
        "execution": {
          "taskSupport": "forbidden"
        }
      },
      {
        "name": "create_crawl",
        "description": "**PREFERRED tool for crawling a website.** Use this whenever the user says 'crawl', 'scrape the whole site', 'get all pages from a site', or wants multiple pages from a single domain. This is the CORRECT tool for any whole-site scraping task. **Do NOT use `batch_scrape_urls` for crawling** - that tool is only for when you already have a specific list of unrelated URLs from different domains. Starts an ASYNC crawl that autonomously discovers and scrapes pages by following links from a start URL. Returns a crawl_id - the crawl runs in the background. You MUST then call `get_crawl_results` with the returned crawl_id to poll status and retrieve the scraped pages. Do NOT call `get_batch_results` with a crawl_id - crawls and batches are separate resources.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "url": {
              "type": "string",
              "format": "uri",
              "description": "Starting URL for the crawl."
            },
            "start_url": {
              "type": "string",
              "format": "uri",
              "description": "Alias for `url`."
            },
            "max_pages": {
              "type": "integer",
              "minimum": 1,
              "default": 10,
              "description": "Maximum number of pages to crawl."
            },
            "follow_links": {
              "type": "boolean",
              "default": true,
              "description": "Whether to follow links found on pages."
            },
            "output_format": {
              "type": "string",
              "enum": [
                "markdown",
                "html",
                "json",
                "text"
              ],
              "default": "markdown",
              "description": "Format for scraped content. Default: \"markdown\"."
            },
            "country": {
              "type": "string",
              "description": "Optional country code for location-specific crawling."
            },
            "parser": {
              "type": "string",
              "description": "Optional parser ID for specialized content extraction."
            }
          },
          "additionalProperties": false,
          "$schema": "http://json-schema.org/draft-07/schema#"
        },
        "execution": {
          "taskSupport": "forbidden"
        }
      },
      {
        "name": "create_map",
        "description": "Get a LIST of URLs on a website (URL discovery only — does NOT scrape content). Use when the user wants a list of links: 'show me all URLs on this site', 'map this website', or when you want to surface candidate URLs to the user before scraping a subset. Prefer `create_crawl` if the goal is to scrape the whole site — it discovers AND scrapes in one workflow. Use this only when the URL list itself is the deliverable.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "url": {
              "type": "string",
              "format": "uri",
              "description": "Website URL to extract links from."
            },
            "website_url": {
              "type": "string",
              "format": "uri",
              "description": "Alias for `url`."
            },
            "search_query": {
              "type": "string",
              "description": "Optional search query to filter URLs (e.g., \"blog\")."
            },
            "top_n": {
              "type": "integer",
              "minimum": 1,
              "description": "Optional limit for number of URLs returned."
            },
            "include_url_patterns": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "description": "Optional glob patterns to include (e.g., \"/blog/**\")."
            },
            "exclude_url_patterns": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "description": "Optional glob patterns to exclude (e.g., \"/admin/**\")."
            }
          },
          "additionalProperties": false,
          "$schema": "http://json-schema.org/draft-07/schema#"
        },
        "execution": {
          "taskSupport": "forbidden"
        }
      },
      {
        "name": "get_batch_results",
        "description": "Retrieve the status and scraped content for a batch job. Pass the batch_id returned by batch_scrape_urls. If the batch is completed, returns the scraped content for each URL. If still in_progress, returns the current status so you can call again later.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "batch_id": {
              "type": "string",
              "minLength": 1,
              "description": "The batch_id (or id) returned from batch_scrape_urls."
            },
            "formats": {
              "type": "array",
              "items": {
                "type": "string",
                "enum": [
                  "markdown",
                  "html",
                  "json",
                  "text"
                ]
              },
              "default": [
                "markdown"
              ],
              "description": "Content formats to retrieve per URL. Default: [\"markdown\"]."
            },
            "items_limit": {
              "type": "integer",
              "minimum": 1,
              "maximum": 100,
              "default": 20,
              "description": "Max number of items to retrieve content for (1-100). Default: 20."
            }
          },
          "required": [
            "batch_id"
          ],
          "additionalProperties": false,
          "$schema": "http://json-schema.org/draft-07/schema#"
        },
        "execution": {
          "taskSupport": "forbidden"
        }
      },
      {
        "name": "get_crawl_results",
        "description": "Retrieve the status and scraped pages for a crawl job. Pass the crawl_id returned by create_crawl. If the crawl is still in_progress, returns the current status so you can call again later (poll every ~10 seconds). Once completed, returns the list of discovered pages with their scraped content in the requested formats. This is the REQUIRED companion to create_crawl — create_crawl only kicks off the async job, this tool is how you actually get the content.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "crawl_id": {
              "type": "string",
              "minLength": 1,
              "description": "The crawl_id (or id) returned from create_crawl."
            },
            "formats": {
              "type": "array",
              "items": {
                "type": "string",
                "enum": [
                  "markdown",
                  "html",
                  "json",
                  "text"
                ]
              },
              "default": [
                "markdown"
              ],
              "description": "Content formats to retrieve per page. Default: [\"markdown\"]."
            },
            "items_limit": {
              "type": "integer",
              "minimum": 1,
              "maximum": 100,
              "default": 20,
              "description": "Max number of pages to retrieve content for (1-100). Default: 20."
            },
            "cursor": {
              "type": "integer",
              "minimum": 0,
              "default": 0,
              "description": "Pagination cursor for list-pages. Default: 0 (first page)."
            },
            "search_query": {
              "type": "string",
              "description": "Optional filter to rank/select pages by relevance to a query."
            }
          },
          "required": [
            "crawl_id"
          ],
          "additionalProperties": false,
          "$schema": "http://json-schema.org/draft-07/schema#"
        },
        "execution": {
          "taskSupport": "forbidden"
        }
      },
      {
        "name": "get_webpage_content",
        "description": "Retrieve content of a webpage in markdown",
        "inputSchema": {
          "type": "object",
          "properties": {
            "url": {
              "type": "string",
              "format": "uri",
              "description": "The URL of the webpage to scrape."
            },
            "url_to_scrape": {
              "type": "string",
              "format": "uri",
              "description": "Alias for `url`."
            },
            "wait_before_scraping": {
              "type": "integer",
              "minimum": 0,
              "default": 0,
              "description": "Time to wait in milliseconds before starting the scrape."
            },
            "country": {
              "type": "string",
              "description": "Residential country to load the request from (e.g., US, CA, GB). Optional."
            }
          },
          "additionalProperties": false,
          "$schema": "http://json-schema.org/draft-07/schema#"
        },
        "execution": {
          "taskSupport": "forbidden"
        }
      },
      {
        "name": "get_website_urls",
        "description": "Search and retrieve relevant URLs from a website (URL discovery only - does NOT scrape content). Use this only when the user wants a *filtered list of links* matching a search query. **Do NOT use this as a precursor to scraping** - if the user wants to scrape/crawl a site, use `create_crawl` directly.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "url": {
              "type": "string",
              "format": "uri",
              "description": "The URL of the website to map."
            },
            "search_query": {
              "type": "string",
              "description": "The search query to sort URLs by."
            }
          },
          "required": [
            "url",
            "search_query"
          ],
          "additionalProperties": false,
          "$schema": "http://json-schema.org/draft-07/schema#"
        },
        "execution": {
          "taskSupport": "forbidden"
        }
      },
      {
        "name": "scrape_website",
        "description": "Extract content from a single URL. Supports multiple formats and JavaScript rendering.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "url": {
              "type": "string",
              "format": "uri",
              "description": "The URL of the website you want to scrape."
            },
            "url_to_scrape": {
              "type": "string",
              "format": "uri",
              "description": "Alias for `url`."
            },
            "output_format": {
              "type": "string",
              "enum": [
                "markdown",
                "html",
                "json",
                "text"
              ],
              "default": "markdown",
              "description": "Choose format (\"html\", \"markdown\", \"json\", or \"text\"). Default: \"markdown\""
            },
            "country": {
              "type": "string",
              "description": "Optional country code (e.g., US, GB, CA) for location-specific scraping."
            },
            "wait_before_scraping": {
              "type": "integer",
              "minimum": 0,
              "maximum": 10000,
              "default": 0,
              "description": "Wait time in milliseconds before scraping (0-10000). Useful for dynamic content."
            },
            "parser": {
              "type": "string",
              "description": "Optional parser ID for specialized extraction (e.g., \"@olostep/amazon-product\")."
            }
          },
          "additionalProperties": false,
          "$schema": "http://json-schema.org/draft-07/schema#"
        },
        "execution": {
          "taskSupport": "forbidden"
        }
      },
      {
        "name": "search_web",
        "description": "Search the web for a given query and return structured results (non-AI, parser-based).",
        "inputSchema": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "Search query"
            },
            "country": {
              "type": "string",
              "default": "US",
              "description": "Optional country code for localized results (e.g., US, GB)."
            }
          },
          "required": [
            "query"
          ],
          "additionalProperties": false,
          "$schema": "http://json-schema.org/draft-07/schema#"
        },
        "execution": {
          "taskSupport": "forbidden"
        }
      }
    ]
  },
  "parallel": {
    "provider": "parallel",
    "url": "https://search.parallel.ai/mcp",
    "generatedAt": "2026-06-05T08:00:19.675Z",
    "toolCount": 2,
    "fingerprint": "05f32a60efaf68e300d7a46afd58080ccd28be46ca1509786d1dc822562c963d",
    "tools": [
      {
        "name": "web_fetch",
        "description": "Purpose: Fetch and extract relevant content\nfrom specific web URLs. Use only when web_search excerpts are insufficient\nfor the task at hand.\n\nIdeal Use Cases:\n- The user asked about a specific URL or page\n- You need exact wording or quotes that excerpts may have truncated\n- You need full-page analysis (long article, document, or page structure)\n- web_search excerpts are conflicting or clearly insufficient to answer\n",
        "inputSchema": {
          "type": "object",
          "properties": {
            "urls": {
              "description": "List of URLs to extract content from. Must be\nvalid HTTP/HTTPS URLs. Up to 20 URLs per request.",
              "items": {
                "type": "string"
              },
              "title": "Urls",
              "type": "array"
            },
            "objective": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ],
              "default": null,
              "description": "Natural-language description of what\ninformation you're looking for from the URLs. Limit to 200 characters.",
              "title": "Objective"
            },
            "search_queries": {
              "anyOf": [
                {
                  "items": {
                    "type": "string"
                  },
                  "type": "array"
                },
                {
                  "type": "null"
                }
              ],
              "default": null,
              "description": "Optional keyword search queries (3-6\nwords each) used together with objective to focus excerpts on the most\nrelevant content. Pass the queries from the prior web_search call that\nsurfaced these URLs, if applicable.",
              "title": "Search Queries"
            },
            "full_content": {
              "default": false,
              "description": "Prefer leaving this off. The default\nexcerpt mode returns LLM-optimized snippets focused on your objective — they\nare much smaller, cheaper, and usually all you need. Only set to true when\nyou explicitly need the entire page as markdown (e.g. reading a long article\nin full, or running a document through a downstream summarizer).\n\nWarning: enabling full content can return a large amount of content —\noften tens of thousands of tokens for a long article. This may exceed your\nMCP client's tool-output limit and will substantially increase response\nsize and latency.",
              "title": "Full Content",
              "type": "boolean"
            },
            "session_id": {
              "type": "string",
              "description": "Stable identifier for the current conversation. Generate a random value (UUID or 32+ character hex string) at the start of your session and reuse the exact same value on every web_search / web_fetch call. Do NOT change it between turns. Used for free-tier rate limiting and correlating your tool calls in our logs; ignored on paid-tier keys.",
              "maxLength": 100
            },
            "model_name": {
              "type": "string",
              "description": "The identifier of the LLM model making this tool call (e.g. 'claude-opus-4.7', 'gpt-5.5', 'gemini-2.5-pro'). Before the first call, verify the exact active model slug from trusted runtime/session metadata or active client configuration. Pass the full slug verbatim; never shorten or substitute a model-family alias like 'gpt-5'. Used for product analytics only; does not affect search behavior.",
              "maxLength": 100
            }
          },
          "required": [
            "urls"
          ],
          "title": "v1_extract_toolArguments"
        },
        "outputSchema": {
          "type": "object",
          "properties": {
            "extract_id": {
              "description": "Extract request ID, e.g. `extract_cad0a6d2dec046bd95ae900527d880e7`",
              "title": "Extract Id",
              "type": "string"
            },
            "results": {
              "description": "Successful extract results.",
              "items": {
                "$ref": "#/$defs/V1ExtractResult"
              },
              "title": "Results",
              "type": "array"
            },
            "errors": {
              "description": "Extract errors: requested URLs not in the results.",
              "items": {
                "$ref": "#/$defs/ExtractError"
              },
              "title": "Errors",
              "type": "array"
            },
            "warnings": {
              "anyOf": [
                {
                  "items": {
                    "$ref": "#/$defs/Warning"
                  },
                  "type": "array"
                },
                {
                  "type": "null"
                }
              ],
              "default": null,
              "description": "Warnings for the extract request, if any.",
              "title": "Warnings"
            },
            "usage": {
              "anyOf": [
                {
                  "items": {
                    "$ref": "#/$defs/UsageItem"
                  },
                  "type": "array"
                },
                {
                  "type": "null"
                }
              ],
              "default": null,
              "description": "Usage metrics for the extract request.",
              "title": "Usage"
            },
            "session_id": {
              "description": "Session identifier. Echoed back from the request if provided, otherwise generated by the server. Should be passed to future search and extract calls made by the agent as part of the same larger task.",
              "examples": [
                "session_8a911eb27c7a4afaa20d0d9dc98d07c0"
              ],
              "title": "Session Id",
              "type": "string"
            }
          },
          "required": [
            "extract_id",
            "results",
            "errors",
            "session_id"
          ],
          "$defs": {
            "ExtractError": {
              "description": "Extract error details.",
              "properties": {
                "url": {
                  "title": "Url",
                  "type": "string"
                },
                "error_type": {
                  "description": "Error type.",
                  "title": "Error Type",
                  "type": "string"
                },
                "http_status_code": {
                  "anyOf": [
                    {
                      "type": "integer"
                    },
                    {
                      "type": "null"
                    }
                  ],
                  "description": "HTTP status code, if available.",
                  "title": "Http Status Code"
                },
                "content": {
                  "anyOf": [
                    {
                      "type": "string"
                    },
                    {
                      "type": "null"
                    }
                  ],
                  "description": "Content returned for http client or server errors, if any.",
                  "title": "Content"
                }
              },
              "required": [
                "url",
                "error_type",
                "http_status_code",
                "content"
              ],
              "title": "ExtractError",
              "type": "object"
            },
            "UsageItem": {
              "description": "Usage item for a single operation.",
              "properties": {
                "name": {
                  "description": "Name of the SKU.",
                  "examples": [
                    "sku_search_additional_results",
                    "sku_extract_excerpts"
                  ],
                  "title": "Name",
                  "type": "string"
                },
                "count": {
                  "description": "Count of the SKU.",
                  "examples": [
                    1
                  ],
                  "title": "Count",
                  "type": "integer"
                }
              },
              "required": [
                "name",
                "count"
              ],
              "title": "UsageItem",
              "type": "object"
            },
            "V1ExtractResult": {
              "description": "Extract result for a single URL.",
              "properties": {
                "url": {
                  "description": "URL associated with the search result.",
                  "title": "Url",
                  "type": "string"
                },
                "title": {
                  "anyOf": [
                    {
                      "type": "string"
                    },
                    {
                      "type": "null"
                    }
                  ],
                  "default": null,
                  "description": "Title of the webpage, if available.",
                  "title": "Title"
                },
                "publish_date": {
                  "anyOf": [
                    {
                      "type": "string"
                    },
                    {
                      "type": "null"
                    }
                  ],
                  "default": null,
                  "description": "Publish date of the webpage in YYYY-MM-DD format, if available.",
                  "title": "Publish Date"
                },
                "excerpts": {
                  "description": "Relevant excerpted content from the URL, formatted as markdown.",
                  "items": {
                    "type": "string"
                  },
                  "title": "Excerpts",
                  "type": "array"
                },
                "full_content": {
                  "anyOf": [
                    {
                      "type": "string"
                    },
                    {
                      "type": "null"
                    }
                  ],
                  "default": null,
                  "description": "Full content from the URL formatted as markdown, if requested.",
                  "title": "Full Content"
                }
              },
              "required": [
                "url",
                "excerpts"
              ],
              "title": "V1ExtractResult",
              "type": "object"
            },
            "Warning": {
              "description": "Human-readable message for a task.",
              "properties": {
                "type": {
                  "description": "Type of warning. Note that adding new warning types is considered a backward-compatible change.",
                  "enum": [
                    "spec_validation_warning",
                    "input_validation_warning",
                    "warning"
                  ],
                  "examples": [
                    "spec_validation_warning",
                    "input_validation_warning"
                  ],
                  "title": "Type",
                  "type": "string"
                },
                "message": {
                  "description": "Human-readable message.",
                  "title": "Message",
                  "type": "string"
                },
                "detail": {
                  "anyOf": [
                    {
                      "additionalProperties": true,
                      "type": "object"
                    },
                    {
                      "type": "null"
                    }
                  ],
                  "default": null,
                  "description": "Optional detail supporting the warning.",
                  "title": "Detail"
                }
              },
              "required": [
                "type",
                "message"
              ],
              "title": "Warning",
              "type": "object"
            }
          },
          "description": "Extract response.",
          "title": "V1ExtractResponse"
        },
        "annotations": {
          "title": "Web fetch",
          "readOnlyHint": true,
          "destructiveHint": false,
          "openWorldHint": true
        }
      },
      {
        "name": "web_search",
        "description": "Purpose: Perform web searches and return\nLLM-friendly results, including excerpts that are usually sufficient to\nanswer directly without a follow-up fetch.\n\nIdeal Use Cases:\n- Answering questions that require fresh or current information\n- Research, comparison, documentation, and troubleshooting questions\n- Broad tasks where multiple `search_queries` can be issued in a single call\n",
        "inputSchema": {
          "type": "object",
          "properties": {
            "objective": {
              "description": "Natural-language description of what the web search is trying to find.\nTry to make the search objective atomic, looking for a specific piece of information. May include guidance about preferred sources or freshness.",
              "title": "Objective",
              "type": "string"
            },
            "search_queries": {
              "description": "Concise keyword search queries, 3-6 words\neach, which may include search operators. At least one query is required;\nprovide 2-3 for best results. For broad tasks, you can include multiple\nrelated queries in a single call instead of chaining web_search calls. The\nqueries should be related to the objective.",
              "items": {
                "type": "string"
              },
              "title": "Search Queries",
              "type": "array"
            },
            "session_id": {
              "type": "string",
              "description": "Stable identifier for the current conversation. Generate a random value (UUID or 32+ character hex string) at the start of your session and reuse the exact same value on every web_search / web_fetch call. Do NOT change it between turns. Used for free-tier rate limiting and correlating your tool calls in our logs; ignored on paid-tier keys.",
              "maxLength": 100
            },
            "model_name": {
              "type": "string",
              "description": "The identifier of the LLM model making this tool call (e.g. 'claude-opus-4.7', 'gpt-5.5', 'gemini-2.5-pro'). Before the first call, verify the exact active model slug from trusted runtime/session metadata or active client configuration. Pass the full slug verbatim; never shorten or substitute a model-family alias like 'gpt-5'. Used for product analytics only; does not affect search behavior.",
              "maxLength": 100
            }
          },
          "required": [
            "objective",
            "search_queries"
          ],
          "title": "v1_search_toolArguments"
        },
        "outputSchema": {
          "type": "object",
          "properties": {
            "search_id": {
              "description": "Search ID. Example: `search_cad0a6d2dec046bd95ae900527d880e7`",
              "title": "Search Id",
              "type": "string"
            },
            "results": {
              "description": "A list of search results, ordered by decreasing relevance.",
              "items": {
                "$ref": "#/$defs/V1WebSearchResult"
              },
              "title": "Results",
              "type": "array"
            },
            "warnings": {
              "anyOf": [
                {
                  "items": {
                    "$ref": "#/$defs/Warning"
                  },
                  "type": "array"
                },
                {
                  "type": "null"
                }
              ],
              "default": null,
              "description": "Warnings for the search request, if any.",
              "title": "Warnings"
            },
            "usage": {
              "anyOf": [
                {
                  "items": {
                    "$ref": "#/$defs/UsageItem"
                  },
                  "type": "array"
                },
                {
                  "type": "null"
                }
              ],
              "default": null,
              "description": "Usage metrics for the search request.",
              "title": "Usage"
            },
            "session_id": {
              "description": "Session identifier, echoed back from the request if provided, otherwise generated by the server. Should be passed to future search and extract calls made by the agent as part of the same larger task.",
              "examples": [
                "session_8a911eb27c7a4afaa20d0d9dc98d07c0"
              ],
              "title": "Session Id",
              "type": "string"
            }
          },
          "required": [
            "search_id",
            "results",
            "session_id"
          ],
          "$defs": {
            "UsageItem": {
              "description": "Usage item for a single operation.",
              "properties": {
                "name": {
                  "description": "Name of the SKU.",
                  "examples": [
                    "sku_search_additional_results",
                    "sku_extract_excerpts"
                  ],
                  "title": "Name",
                  "type": "string"
                },
                "count": {
                  "description": "Count of the SKU.",
                  "examples": [
                    1
                  ],
                  "title": "Count",
                  "type": "integer"
                }
              },
              "required": [
                "name",
                "count"
              ],
              "title": "UsageItem",
              "type": "object"
            },
            "V1WebSearchResult": {
              "description": "A single search result from the web search API.",
              "properties": {
                "url": {
                  "description": "URL associated with the search result.",
                  "title": "Url",
                  "type": "string"
                },
                "title": {
                  "anyOf": [
                    {
                      "type": "string"
                    },
                    {
                      "type": "null"
                    }
                  ],
                  "default": null,
                  "description": "Title of the webpage, if available.",
                  "title": "Title"
                },
                "publish_date": {
                  "anyOf": [
                    {
                      "type": "string"
                    },
                    {
                      "type": "null"
                    }
                  ],
                  "default": null,
                  "description": "Publish date of the webpage in YYYY-MM-DD format, if available.",
                  "title": "Publish Date"
                },
                "excerpts": {
                  "description": "Relevant excerpted content from the URL, formatted as markdown.",
                  "items": {
                    "type": "string"
                  },
                  "title": "Excerpts",
                  "type": "array"
                }
              },
              "required": [
                "url",
                "excerpts"
              ],
              "title": "V1WebSearchResult",
              "type": "object"
            },
            "Warning": {
              "description": "Human-readable message for a task.",
              "properties": {
                "type": {
                  "description": "Type of warning. Note that adding new warning types is considered a backward-compatible change.",
                  "enum": [
                    "spec_validation_warning",
                    "input_validation_warning",
                    "warning"
                  ],
                  "examples": [
                    "spec_validation_warning",
                    "input_validation_warning"
                  ],
                  "title": "Type",
                  "type": "string"
                },
                "message": {
                  "description": "Human-readable message.",
                  "title": "Message",
                  "type": "string"
                },
                "detail": {
                  "anyOf": [
                    {
                      "additionalProperties": true,
                      "type": "object"
                    },
                    {
                      "type": "null"
                    }
                  ],
                  "default": null,
                  "description": "Optional detail supporting the warning.",
                  "title": "Detail"
                }
              },
              "required": [
                "type",
                "message"
              ],
              "title": "Warning",
              "type": "object"
            }
          },
          "description": "Search response.",
          "title": "V1SearchResponse"
        },
        "annotations": {
          "title": "Web search",
          "readOnlyHint": true,
          "destructiveHint": false,
          "openWorldHint": true
        }
      }
    ]
  },
  "tavily": {
    "provider": "tavily",
    "url": "https://mcp.tavily.com/mcp/",
    "generatedAt": "2026-06-05T08:00:19.675Z",
    "toolCount": 5,
    "fingerprint": "df43cc8f57b920e808cdde2fe6cc934c94b43771b43be1bf7889ea155063f6d8",
    "tools": [
      {
        "name": "tavily_crawl",
        "description": "Crawl a website starting from a URL. Extracts content from pages with configurable depth and breadth.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "url": {
              "description": "The root URL to begin the crawl",
              "type": "string"
            },
            "max_depth": {
              "default": 1,
              "description": "Max depth of the crawl. Defines how far from the base URL the crawler can explore.",
              "minimum": 1,
              "type": "integer"
            },
            "max_breadth": {
              "default": 20,
              "description": "Max number of links to follow per level of the tree (i.e., per page)",
              "minimum": 1,
              "type": "integer"
            },
            "limit": {
              "default": 50,
              "description": "Total number of links the crawler will process before stopping",
              "minimum": 1,
              "type": "integer"
            },
            "instructions": {
              "default": "",
              "description": "Natural language instructions for the crawler. Instructions specify which types of pages the crawler should return.",
              "type": "string"
            },
            "select_paths": {
              "default": [],
              "description": "Regex patterns to select only URLs with specific path patterns (e.g., /docs/.*, /api/v1.*)",
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "select_domains": {
              "default": [],
              "description": "Regex patterns to restrict crawling to specific domains or subdomains (e.g., ^docs\\.example\\.com$)",
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "allow_external": {
              "default": true,
              "description": "Whether to return external links in the final response",
              "type": "boolean"
            },
            "extract_depth": {
              "default": "basic",
              "description": "Advanced extraction retrieves more data, including tables and embedded content, with higher success but may increase latency",
              "enum": [
                "basic",
                "advanced"
              ],
              "type": "string"
            },
            "format": {
              "default": "markdown",
              "description": "The format of the extracted web page content. markdown returns content in markdown format. text returns plain text and may increase latency.",
              "enum": [
                "markdown",
                "text"
              ],
              "type": "string"
            },
            "include_favicon": {
              "default": false,
              "description": "Whether to include the favicon URL for each result",
              "type": "boolean"
            }
          },
          "required": [
            "url"
          ],
          "additionalProperties": false
        },
        "outputSchema": {
          "type": "object",
          "additionalProperties": true
        },
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": false,
          "openWorldHint": true
        },
        "_meta": {
          "fastmcp": {
            "tags": []
          }
        }
      },
      {
        "name": "tavily_extract",
        "description": "Extract content from URLs. Returns raw page content in markdown or text format.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "urls": {
              "description": "List of URLs to extract content from",
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "extract_depth": {
              "default": "basic",
              "description": "Use 'advanced' for LinkedIn, protected sites, or tables/embedded content",
              "enum": [
                "basic",
                "advanced"
              ],
              "type": "string"
            },
            "include_images": {
              "default": false,
              "description": "Include images from pages",
              "type": "boolean"
            },
            "format": {
              "default": "markdown",
              "description": "Output format",
              "enum": [
                "markdown",
                "text"
              ],
              "type": "string"
            },
            "include_favicon": {
              "default": false,
              "description": "Include favicon URLs",
              "type": "boolean"
            },
            "query": {
              "default": "",
              "description": "Query to rerank content chunks by relevance",
              "type": "string"
            }
          },
          "required": [
            "urls"
          ],
          "additionalProperties": false
        },
        "outputSchema": {
          "type": "object",
          "additionalProperties": true
        },
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": false,
          "openWorldHint": true
        },
        "_meta": {
          "fastmcp": {
            "tags": []
          }
        }
      },
      {
        "name": "tavily_map",
        "description": "Map a website's structure. Returns a list of URLs found starting from the base URL.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "url": {
              "description": "The root URL to begin the mapping",
              "type": "string"
            },
            "max_depth": {
              "default": 1,
              "description": "Max depth of the mapping. Defines how far from the base URL the crawler can explore",
              "minimum": 1,
              "type": "integer"
            },
            "max_breadth": {
              "default": 20,
              "description": "Max number of links to follow per level of the tree (i.e., per page)",
              "minimum": 1,
              "type": "integer"
            },
            "limit": {
              "default": 50,
              "description": "Total number of links the crawler will process before stopping",
              "minimum": 1,
              "type": "integer"
            },
            "instructions": {
              "default": "",
              "description": "Natural language instructions for the crawler",
              "type": "string"
            },
            "select_paths": {
              "default": [],
              "description": "Regex patterns to select only URLs with specific path patterns (e.g., /docs/.*, /api/v1.*)",
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "select_domains": {
              "default": [],
              "description": "Regex patterns to restrict crawling to specific domains or subdomains (e.g., ^docs\\.example\\.com$)",
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "allow_external": {
              "default": true,
              "description": "Whether to return external links in the final response",
              "type": "boolean"
            }
          },
          "required": [
            "url"
          ],
          "additionalProperties": false
        },
        "outputSchema": {
          "type": "object",
          "additionalProperties": true
        },
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": false,
          "openWorldHint": true
        },
        "_meta": {
          "fastmcp": {
            "tags": []
          }
        }
      },
      {
        "name": "tavily_research",
        "description": "Perform comprehensive research on a given topic or question. Use this tool when you need to gather information from multiple sources, including web pages, documents, and other resources, to answer a question or complete a task. Returns a detailed response based on the research findings. Rate limit: 20 requests per minute.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "input": {
              "description": "A comprehensive description of the research task",
              "type": "string"
            },
            "model": {
              "default": "auto",
              "description": "Defines the degree of depth of the research. 'mini' is good for narrow tasks with few subtopics. 'pro' is good for broad tasks with many subtopics",
              "enum": [
                "mini",
                "pro",
                "auto"
              ],
              "type": "string"
            }
          },
          "required": [
            "input"
          ],
          "additionalProperties": false
        },
        "outputSchema": {
          "type": "object",
          "additionalProperties": true
        },
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": false,
          "openWorldHint": true
        },
        "_meta": {
          "fastmcp": {
            "tags": []
          }
        }
      },
      {
        "name": "tavily_search",
        "description": "Search the web for current information on any topic. Use for news, facts, or data beyond your knowledge cutoff. Returns snippets and source URLs.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "query": {
              "description": "Search query",
              "type": "string"
            },
            "max_results": {
              "default": 5,
              "description": "The maximum number of search results to return",
              "type": "integer"
            },
            "search_depth": {
              "default": "basic",
              "description": "The depth of the search. 'basic' for generic results, 'advanced' for more thorough search, 'fast' for optimized low latency with high relevance, 'ultra-fast' for prioritizing latency above all else",
              "enum": [
                "basic",
                "advanced",
                "fast",
                "ultra-fast"
              ],
              "type": "string"
            },
            "topic": {
              "const": "general",
              "default": "general",
              "description": "The category of the search. This will determine which of our agents will be used for the search",
              "type": "string"
            },
            "time_range": {
              "anyOf": [
                {
                  "enum": [
                    "day",
                    "week",
                    "month",
                    "year"
                  ],
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ],
              "default": null,
              "description": "The time range back from the current date to include in the search results"
            },
            "include_images": {
              "default": false,
              "description": "Include a list of query-related images in the response",
              "type": "boolean"
            },
            "include_image_descriptions": {
              "default": false,
              "description": "Include a list of query-related images and their descriptions in the response",
              "type": "boolean"
            },
            "include_raw_content": {
              "default": false,
              "description": "Include the cleaned and parsed HTML content of each search result",
              "type": "boolean"
            },
            "include_domains": {
              "default": [],
              "description": "A list of domains to specifically include in the search results, if the user asks to search on specific sites set this to the domain of the site",
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "exclude_domains": {
              "default": [],
              "description": "List of domains to specifically exclude, if the user asks to exclude a domain set this to the domain of the site",
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "country": {
              "default": "",
              "description": "Boost search results from a specific country. Must be a full country name (e.g., 'United States', 'Japan', 'Germany'). ISO country codes (e.g., 'us', 'jp') are not supported. Available only if topic is general. See https://docs.tavily.com/documentation/api-reference/search for the full list of supported countries.",
              "type": "string"
            },
            "include_favicon": {
              "default": false,
              "description": "Whether to include the favicon URL for each result",
              "type": "boolean"
            },
            "start_date": {
              "default": "",
              "description": "Will return all results after the specified start date. Required to be written in the format YYYY-MM-DD.",
              "type": "string"
            },
            "end_date": {
              "default": "",
              "description": "Will return all results before the specified end date. Required to be written in the format YYYY-MM-DD",
              "type": "string"
            },
            "exact_match": {
              "anyOf": [
                {
                  "type": "boolean"
                },
                {
                  "type": "null"
                }
              ],
              "default": null,
              "description": "Only return results containing the exact phrase(s) in quotes in your query"
            }
          },
          "required": [
            "query"
          ],
          "additionalProperties": false
        },
        "outputSchema": {
          "type": "object",
          "additionalProperties": true
        },
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": false,
          "openWorldHint": true
        },
        "_meta": {
          "fastmcp": {
            "tags": []
          }
        }
      }
    ]
  }
};
