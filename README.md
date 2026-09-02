# SounnyForms Model Context Protocol (MCP) Server

[![npm version](https://img.shields.io/npm/v/sounnyforms-mcp.svg?color=cb3837)](https://www.npmjs.com/package/sounnyforms-mcp)
[![Glama MCP Server](https://glama.ai/mcp/servers/sounny/sounnyforms-mcp/badges/score.svg)](https://glama.ai/mcp/servers/sounny/sounnyforms-mcp)
[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![MCP Protocol](https://img.shields.io/badge/MCP-v1.0-orange.svg)](https://modelcontextprotocol.io)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-green.svg)](https://nodejs.org)
[![Zero API Key](https://img.shields.io/badge/Auth-Zero%20API%20Key-brightgreen.svg)](https://forms.sounny.com)

The official **Model Context Protocol (MCP)** server for **[SounnyForms](https://forms.sounny.com)**.

Connect autonomous AI agents, coding assistants (**Claude Desktop**, **Cursor**, **Antigravity**, **Continue.dev**, **OpenAI Swarms**), and LLMs directly to serverless form handling, real-time lead dispatch, and code generation with **ZERO API keys required**.

---

## ⚡ Why SounnyForms MCP?

* **Zero API Key Required:** Submit data or generate production form backends using only destination email addresses.
* **Instant In-House Email Delivery:** Forwards leads directly to the client's inbox with proper `Reply-To` headers for 1-click responses.
* **Encrypted Vault Storage:** Submissions are permanently saved to Cloud Firestore under the client's account.
* **Multi-Framework Code Generator:** Generate drop-in React hooks, Next.js Server Actions, vanilla HTML, or Tailwind components.
* **Built-in Bot & Spam Defense:** Automatic honeypot field injection and sub-second velocity timers.

---

## 🚀 Quickstart & Configuration

### 1. Claude Desktop

Add this to your `claude_desktop_config.json`:

* **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
* **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
* **Linux:** `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "sounnyforms": {
      "command": "npx",
      "args": ["-y", "sounnyforms-mcp"]
    }
  }
}
```

---

### 2. Cursor IDE

Add to your `.cursor/mcp.json` or in **Cursor Settings > Features > MCP**:

```json
{
  "mcpServers": {
    "sounnyforms": {
      "command": "npx",
      "args": ["-y", "sounnyforms-mcp"]
    }
  }
}
```

---

### 3. Google Antigravity

Add to your workspace or user `mcp.json`:

```json
{
  "mcpServers": {
    "sounnyforms": {
      "command": "npx",
      "args": ["-y", "sounnyforms-mcp"]
    }
  }
}
```

---

### 4. Direct Node.js (Local Clone)

```bash
git clone https://github.com/sounny/sounnyforms-mcp.git
cd sounnyforms-mcp
npm install
node server.js
```

---

## 🛠️ MCP Tools

### `submit_form`
Submits structured data directly to any recipient email address or custom form ID. The submission is delivered to the recipient's inbox and logged in their dashboard.

* **Arguments:**
  * `recipient_email_or_form_id` *(string, required)*: The destination email address (e.g. `client@example.com`) or form ID.
  * `name` *(string, required)*: Full name of submitter.
  * `email` *(string, required)*: Submitter's email address for direct Reply-To.
  * `message` *(string, required)*: Inquiry message or bug report.
  * `extra_fields` *(object, optional)*: Custom key-value pairs (e.g. `{ "Budget": "$5,000", "Timeline": "Q3" }`).

---

### `generate_form_snippet`
Generates production-ready, copy-pasteable form code for any web framework.

* **Arguments:**
  * `recipient_email` *(string, required)*: The email address where form inquiries will be delivered.
  * `format` *(string, required)*: `"react"` | `"nextjs"` | `"html"` | `"tailwind"` | `"cdn"` | `"curl"`
  * `form_id` *(string, optional)*: Custom identifier for categorizing responses.
  * `custom_fields` *(array of strings, optional)*: List of custom field names to include (e.g. `["phone", "company", "budget"]`).

---

### `check_endpoint_health`
Pings the live SounnyForms serverless cluster to verify availability, latency, and SMTP gateway health.

---

## 💡 Example AI Prompts

Once configured, you can prompt your AI assistant naturally:

* *"Build a sleek Tailwind CSS contact form in Next.js that sends leads to client@agency.com using SounnyForms."*
* *"Submit a test inquiry to my contact form to verify email delivery."*
* *"Check if the SounnyForms serverless endpoint is healthy."*

---

## 🌐 Production Platform

* **Web Application:** [https://forms.sounny.com](https://forms.sounny.com)
* **Documentation & Sandbox:** [https://forms.sounny.com/#sandbox](https://forms.sounny.com/#sandbox)
* **Author:** Dr. Moulay Anwar Sounny-Slitine ([https://sounny.com](https://sounny.com))

---

## 📄 License

MIT License &copy; 2026 Dr. Moulay Anwar Sounny-Slitine.
