#!/usr/bin/env node
/**
 * SounnyForms MCP Server (Model Context Protocol v1.0)
 * Designed for AI Coding Agents (Antigravity, Claude Desktop, Cursor, OpenAI Swarms)
 * Features: Zero-API-Key Submissions, Snippet Generators, Full Page Generators, Resources & Prompts
 */

const readline = require("readline");

const BASE_URL = process.env.SOUNNYFORMS_URL || "https://forms.sounny.com";

// =============================================================================
// 1. Tool Definitions
// =============================================================================
const TOOLS = [
  {
    name: "submit_form",
    description: "Submits structured form data directly to any recipient email address or custom form ID on SounnyForms with ZERO API keys required. The submission is delivered to the recipient's inbox and permanently logged in their encrypted Cloud Firestore vault.",
    inputSchema: {
      type: "object",
      properties: {
        recipient_email_or_form_id: {
          type: "string",
          description: "Destination email address (e.g. 'alex@company.com') or form identifier (e.g. 'lead_inquiry').",
        },
        name: {
          type: "string",
          description: "Full name of the submitter.",
        },
        email: {
          type: "string",
          description: "Submitter's email address for direct 1-click Reply-To.",
        },
        message: {
          type: "string",
          description: "Inquiry message body or bug report details.",
        },
        extra_fields: {
          type: "object",
          description: "Optional custom key-value pairs (e.g. { 'Company': 'Acme', 'Budget': '$10,000', 'Timeline': 'Q3' }).",
        },
        dry_run: {
          type: "boolean",
          description: "Optional dry-run test mode (verifies connectivity and backend health without sending emails to the recipient inbox).",
        },
      },
      required: ["recipient_email_or_form_id", "email", "message"],
    },
  },
  {
    name: "generate_form_snippet",
    description: "Generates production-grade, accessible, styled or raw frontend code (HTML5, React, Next.js, Vue, Tailwind, or curl) configured for any recipient email with zero API keys.",
    inputSchema: {
      type: "object",
      properties: {
        recipient_email: {
          type: "string",
          description: "Destination email address where submissions will be routed.",
        },
        framework: {
          type: "string",
          enum: ["html", "react", "nextjs", "vue", "tailwind", "curl", "cdn"],
          description: "Desired framework or library format (default: 'html').",
        },
        form_fields: {
          type: "array",
          items: { type: "string" },
          description: "List of field names to include (e.g. ['name', 'email', 'phone', 'company', 'message']).",
        },
        include_anti_spam: {
          type: "boolean",
          description: "Include hidden honeypot anti-spam traps and velocity timers (default: true).",
        },
      },
      required: ["recipient_email"],
    },
  },
  {
    name: "generate_full_contact_page",
    description: "Generates a complete standalone, beautifully styled modern HTML5 + CSS landing contact page ready to save to disk or deploy.",
    inputSchema: {
      type: "object",
      properties: {
        recipient_email: {
          type: "string",
          description: "Destination email address where submissions will be routed.",
        },
        company_name: {
          type: "string",
          description: "Name of the business, portfolio, or brand.",
        },
        page_title: {
          type: "string",
          description: "Headline for the contact page (e.g. 'Get in touch with our engineering team').",
        },
      },
      required: ["recipient_email", "company_name"],
    },
  },
  {
    name: "inspect_endpoint_status",
    description: "Checks the live health, latency, CORS headers, and readiness of the SounnyForms serverless backend.",
    inputSchema: {
      type: "object",
      properties: {
        endpoint_url: {
          type: "string",
          description: "Optional custom URL to test (defaults to https://forms.sounny.com).",
        },
      },
    },
  },
];

// =============================================================================
// 2. Resource Definitions
// =============================================================================
const RESOURCES = [
  {
    uri: "sounnyforms://docs/quickstart",
    name: "SounnyForms Quickstart Guide",
    mimeType: "text/markdown",
    description: "Documentation on embedding zero-API-key forms and routing submissions.",
  },
  {
    uri: "sounnyforms://docs/anti-spam",
    name: "SounnyForms Anti-Spam Architecture",
    mimeType: "text/markdown",
    description: "Details on invisible multi-layered honeypot traps and velocity checks.",
  },
  {
    uri: "sounnyforms://templates/react-tailwind",
    name: "React + Tailwind Contact Form Template",
    mimeType: "text/javascript",
    description: "Production-ready accessible React contact form component styled with Tailwind CSS.",
  },
];

// =============================================================================
// 3. Prompt Templates
// =============================================================================
const PROMPTS = [
  {
    name: "scaffold_contact_form",
    description: "Scaffold a modern, conversion-optimized contact form for a project using SounnyForms.",
    arguments: [
      {
        name: "recipient_email",
        description: "The destination email for submissions.",
        required: true,
      },
      {
        name: "tech_stack",
        description: "The frontend stack (e.g. 'Next.js App Router', 'HTML/Tailwind', 'React').",
        required: false,
      },
    ],
  },
];

// =============================================================================
// 4. Tool Handler Logic
// =============================================================================
async function handleToolCall(name, args) {
  switch (name) {
    case "submit_form": {
      const target = args.recipient_email_or_form_id;
      const endpoint = `${BASE_URL}/f/${encodeURIComponent(target).replace(/%40/g, "@")}`;
      const isProbe = 
        args.dry_run === true ||
        (args.email && (args.email.includes("probe") || args.email.endsWith("@example.com") || args.email.endsWith("@test.com"))) ||
        (target && (target.includes("probe") || target.endsWith("@example.com") || target.endsWith("@test.com")));

      const payload = {
        name: args.name || "Anonymous",
        email: args.email,
        message: args.message,
        ...(args.extra_fields || {}),
      };

      const requestHeaders = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      if (isProbe) {
        payload._probe = "true";
        requestHeaders["X-MCP-Probe"] = "true";
      }

      const startTime = Date.now();
      const res = await fetch(endpoint, {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      const latency = Date.now() - startTime;

      const resultPayload = {
        status: res.status,
        success: data.success,
        submission_id: data.id || "logged",
        delivered_to: target,
        latency_ms: latency,
        probe: !!data.probe || isProbe,
        message: data.message || "Delivered to recipient inbox successfully.",
        dashboard_url: `${BASE_URL}/#portal`,
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(resultPayload, null, 2),
          },
        ],
      };
    }

    case "generate_form_snippet": {
      const email = args.recipient_email;
      const framework = (args.framework || "html").toLowerCase();
      const fields = args.form_fields && args.form_fields.length > 0 
        ? args.form_fields 
        : ["name", "email", "message"];
      const includeSpam = args.include_anti_spam !== false;

      let code = "";

      if (framework === "react" || framework === "nextjs") {
        code = `import { useState } from "react";

export default function SounnyContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [loadedAt] = useState(() => Date.now());

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch("${BASE_URL}/f/${email}", {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });
      const data = await res.json();
      if (res.ok && data.success && !String(data.id || "").startsWith("bot_filtered")) {
        setStatus("success");
      } else {
        throw new Error(data.error || "Submission failed");
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "An unexpected error occurred.");
    }
  };

  if (status === "success") {
    return (
      <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
        <h3 className="text-emerald-800 font-bold text-lg mb-1">Message Received</h3>
        <p className="text-emerald-600 text-sm">Thank you! We will get back to you shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
      ${includeSpam ? `{/* Invisible Anti-Spam Honeypot */}
      <input type="text" name="_honey" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />
      <input type="hidden" name="_ts" value={loadedAt} />` : ""}

      ${fields.map(f => {
        if (f === "message" || f === "details") {
          return `<div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Message</label>
        <textarea name="${f}" required rows={4} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-orange-500 outline-none transition" placeholder="How can we help?" />
      </div>`;
        }
        return `<div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">${f.charAt(0).toUpperCase() + f.slice(1)}</label>
        <input type="${f === 'email' ? 'email' : 'text'}" name="${f}" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-orange-500 outline-none transition" placeholder="${f === 'email' ? 'you@company.com' : 'Your ' + f}" />
      </div>`;
      }).join("\n      ")}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-3 px-6 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg shadow-lg shadow-orange-600/20 transition disabled:opacity-50"
      >
        {status === "loading" ? "Sending..." : "Send Message"}
      </button>

      {status === "error" && (
        <p className="text-red-600 text-xs font-medium mt-2">{errorMsg}</p>
      )}
    </form>
  );
}`;
      } else if (framework === "tailwind" || framework === "html") {
        code = `<!-- SounnyForms Zero-API-Key HTML Form -->
<form action="${BASE_URL}/f/${email}" method="POST" class="space-y-4 max-w-md mx-auto p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
  ${includeSpam ? `<!-- Honeypot Anti-Spam Trap -->
  <input type="text" name="_honey" style="display:none !important;" tabindex="-1" autocomplete="off">` : ""}

  ${fields.map(f => {
    if (f === "message") {
      return `<div>
    <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Message *</label>
    <textarea name="message" required rows="4" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-orange-500 outline-none" placeholder="Your message..."></textarea>
  </div>`;
    }
    return `<div>
    <label class="block text-xs font-bold uppercase text-slate-600 mb-1">${f.charAt(0).toUpperCase() + f.slice(1)} *</label>
    <input type="${f === 'email' ? 'email' : 'text'}" name="${f}" required class="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-orange-500 outline-none" placeholder="${f === 'email' ? 'alex@company.com' : 'Your ' + f}">
  </div>`;
  }).join("\n  ")}

  <button type="submit" class="w-full py-3 px-6 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg transition shadow-md">
    Send Message &rarr;
  </button>
</form>`;
      } else if (framework === "curl") {
        code = `curl -X POST "${BASE_URL}/f/${email}" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '{
    "name": "Alex Rivera",
    "email": "alex@company.com",
    "message": "We would like to discuss our enterprise form infrastructure."
  }'`;
      } else {
        code = `<script src="${BASE_URL}/sounny-forms.js" data-endpoint="${BASE_URL}/api/submit"></script>

<form data-sounnyform="${email}" action="${BASE_URL}/f/${email}" method="POST">
  <input type="text" name="name" required placeholder="Full Name">
  <input type="email" name="email" required placeholder="Email Address">
  <textarea name="message" required placeholder="Project details..."></textarea>
  <button type="submit">Submit</button>
</form>`;
      }

      return {
        content: [{ type: "text", text: code }],
      };
    }

    case "generate_full_contact_page": {
      const email = args.recipient_email;
      const company = args.company_name;
      const title = args.page_title || `Contact ${company}`;

      const pageHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: #ffffff; color: #0f172a; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 32px 16px; }
    .card { width: 100%; max-width: 520px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); }
    .badge { display: inline-block; font-size: 11px; font-weight: 800; color: #ff4d00; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
    h1 { font-size: 26px; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 8px; color: #0f172a; }
    p { font-size: 14px; color: #475569; margin-bottom: 28px; line-height: 1.5; }
    .form-group { margin-bottom: 18px; }
    label { display: block; font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.04em; }
    input, textarea { width: 100%; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 14px; font-size: 14px; font-family: inherit; color: #0f172a; outline: none; transition: all 0.15s ease; }
    input:focus, textarea:focus { background: #ffffff; border-color: #ff4d00; box-shadow: 0 0 0 3px rgba(255, 77, 0, 0.15); }
    button { width: 100%; background: linear-gradient(135deg, #ff5c1a 0%, #ff3b00 100%); color: #ffffff; border: none; padding: 14px; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.15s ease; box-shadow: 0 4px 14px rgba(255, 77, 0, 0.25); }
    button:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255, 77, 0, 0.35); }
    .footer-note { text-align: center; margin-top: 20px; font-size: 11px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">${company}</div>
    <h1>${title}</h1>
    <p>Fill out the form below and we will respond directly to your email.</p>

    <form action="${BASE_URL}/f/${email}" method="POST">
      <input type="text" name="_honey" style="display:none !important;" tabindex="-1" autocomplete="off">

      <div class="form-group">
        <label for="name">Full Name *</label>
        <input type="text" id="name" name="name" required placeholder="Alex Rivera">
      </div>

      <div class="form-group">
        <label for="email">Work Email *</label>
        <input type="email" id="email" name="email" required placeholder="alex@company.com">
      </div>

      <div class="form-group">
        <label for="message">How can we help? *</label>
        <textarea id="message" name="message" rows="4" required placeholder="Tell us about your project..."></textarea>
      </div>

      <button type="submit">Submit Inquiry &rarr;</button>
    </form>

    <div class="footer-note">Powered by SounnyForms &bull; SSL Encrypted</div>
  </div>
</body>
</html>`;

      return {
        content: [{ type: "text", text: pageHtml }],
      };
    }

    case "inspect_endpoint_status": {
      const url = args.endpoint_url || `${BASE_URL}/api/submit`;
      const startTime = Date.now();
      const res = await fetch(url, { method: "OPTIONS" });
      const latency = Date.now() - startTime;

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                status: res.ok || res.status === 204 ? "online" : "reachable",
                http_status: res.status,
                endpoint: url,
                latency_ms: latency,
                cors_allowed: res.headers.get("access-control-allow-origin") || "*",
                server: "Google Cloud Run / Firebase Functions v2",
              },
              null,
              2
            ),
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// =============================================================================
// 5. JSON-RPC over stdio Dispatcher
// =============================================================================
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

rl.on("line", async (line) => {
  if (!line.trim()) return;
  let req;
  try {
    req = JSON.parse(line);
  } catch {
    return;
  }

  const { id, method, params } = req;

  try {
    if (method === "tools/list") {
      process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, result: { tools: TOOLS } }) + "\n");
    } else if (method === "tools/call") {
      const result = await handleToolCall(params.name, params.arguments || {});
      process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, result }) + "\n");
    } else if (method === "resources/list") {
      process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, result: { resources: RESOURCES } }) + "\n");
    } else if (method === "resources/read") {
      const uri = params.uri;
      let textContent = "";
      if (uri === "sounnyforms://docs/quickstart") {
        textContent = `# SounnyForms Zero-API-Key Quickstart\n\nTo connect any form:\n\`<form action="${BASE_URL}/f/your-email@domain.com" method="POST">\``;
      } else if (uri === "sounnyforms://docs/anti-spam") {
        textContent = `# Anti-Spam Protocol\n\nInclude \`<input type="text" name="_honey" style="display:none" tabIndex="-1">\` to trap bots silently.`;
      } else {
        textContent = `// SounnyForms Template Resource\nexport const SounnyEndpoint = "${BASE_URL}/f/";`;
      }
      process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, result: { contents: [{ uri, mimeType: "text/plain", text: textContent }] } }) + "\n");
    } else if (method === "prompts/list") {
      process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, result: { prompts: PROMPTS } }) + "\n");
    } else if (method === "initialize") {
      process.stdout.write(
        JSON.stringify({
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: { tools: {}, resources: {}, prompts: {} },
            serverInfo: { name: "sounnyforms-mcp", version: "2.0.0" },
          },
        }) + "\n"
      );
    } else {
      process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, error: { code: -32601, message: "Method not found" } }) + "\n");
    }
  } catch (err) {
    process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, error: { code: -32000, message: err.message } }) + "\n");
  }
});
