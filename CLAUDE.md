# UPSCALE — AI-Powered Lead Conversion Engine

## What This Is
UPSCALE is an AI-powered lead conversion engine that sits between a business's marketing and their sales team. It responds instantly, qualifies leads through natural conversation, scores them, and hands off warm leads to the sales team.

Tagline: "Companies spend money generating leads. We make sure they don't go to waste."

## What UPSCALE Is Not
- Not a CRM
- Not a chatbot
- Not a lead generation tool
- Not a social media scheduler (future vision only)

## Agency Model
UPSCALE is a service offered by an AI automation agency. The agency configures everything for clients — system prompts, n8n workflows, AI personas, qualification logic. Clients never touch the backend. Clients only see the dashboard and receive sales notifications.

## Demo Business
Atmax Green Planet — solar energy company in Lagos, Nigeria.
Website: https://www.atmaxgreenplanet.com/
Used as demo case study only. UPSCALE is not solar-specific.

## AI Agent
- Name: Helen (for Atmax Green Planet demo)
- Each client gets their own named agent
- Agent is configured by the agency during onboarding
- Customers never know they're talking to UPSCALE — they think they're talking to the business directly

## Tech Stack
- **Workflow Engine:** n8n Cloud (upscale01.app.n8n.cloud)
- **AI:** Claude API (claude-sonnet-4-6) via HTTP Request node in n8n
- **Messaging:** Telegram Bot (@Upsscale_Bot) — stand-in for WhatsApp in demo
- **Database:** Supabase — stores leads, scores, conversation transcripts
- **Dashboard:** Next.js + Supabase Realtime — what clients see
- **Notifications:** Resend (email) — sales team alerts
- **Hosting:** Vercel (dashboard frontend)

## Current Build Status
- [x] Phase 1 — Infrastructure (n8n, Supabase, Telegram Bot, Anthropic API, Resend, GitHub)
- [x] Phase 2 — AI Qualification Engine (Telegram → n8n → Claude → Reply)
- [ ] Phase 3 — Data Layer (Supabase tables, lead scoring, AI summary)
- [ ] Phase 4 — Notifications (Resend email to sales rep)
- [ ] Phase 5 — Web Form Entry Point
- [ ] Phase 6 — Dashboard (Next.js + Supabase Realtime)
- [ ] Phase 7 — Polish
- [ ] Phase 8 — Demo Preparation

## n8n Workflow Structure
Workflow name: UPSCALE - Lead Qualification

Nodes in order:
1. Telegram Trigger (On message)
2. Telegram Send Chat Action (typing indicator)
3. JS code (conversation memory — stores chat history in static data)
4. HTTP Request (Claude API call)
5. Process Response (extracts AI reply, saves assistant message to memory)
6. Telegram Send Message (sends Helen's reply back to customer)

Node naming matters — reference exact names when writing n8n code expressions.

## Supabase Tables (to be created)
- `leads` — name, phone, email, score, stage, source, summary, chat_id
- `messages` — lead_id, role, content, timestamp, channel

## Lead Scoring
- Need clarity: 0-25 points
- Budget: 0-25 points
- Timeline: 0-25 points
- Decision maker: 0-25 points
- Total: 0-100

## Lead States
- URGENT (human requested mid-conversation) — immediate alert
- HOT (score 70+) — immediate sales notification
- WARM (score 40-69) — 1 hour delay, nurture sequence
- COLD (score below 40) — daily digest

## Handoff Trigger
Handoff happens when:
1. AI has collected property type, location, budget, timeline (score determines urgency)
2. Customer asks to speak to a human (URGENT — bypasses score)
3. Customer asks pricing specifics the AI cannot answer
4. Customer expresses frustration

## Follow Up Sequences (Phase 4+)
- Warm lead: automated follow up after 24 hours
- Cold lead: follow up after 3 days
- No sales rep response: remind sales rep

## Dashboard UI
- Pipeline view (kanban: New → Qualified → Nurture → Closed)
- Individual lead card with WhatsApp-style conversation transcript
- Lead score, summary, contact details, stage dropdown, notes field
- Supabase Realtime — updates live without refresh
- URGENT leads always pinned to top in red

## Hackathon Demo Plan
1. Web form submission → AI qualifies → dashboard updates live → email notification fires
2. Telegram message → AI qualifies in real time → dashboard updates → notification fires
3. Show lead card — full summary, score, transcript — "this is what your sales rep receives"

## Judge Q&A Key Points
- Not just a chatbot — has a goal, qualification logic, scoring, handoff
- Not competing with CRMs — feeds them
- n8n is prototype layer — production will be full Node.js backend
- CRM agnostic — connects to HubSpot, Zoho, GHL, Salesforce via n8n nodes
- Clients never see Supabase — they see the branded dashboard
- Customers never see UPSCALE — they see the business's named AI agent

## Pricing Model (Pitch Only)
- Starter: $297/month — 1 channel, 500 leads/month
- Growth: $597/month — 3 channels, 2000 leads/month  
- Scale: $1,497/month — unlimited, white-label ready
