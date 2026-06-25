Design a B2B SaaS dashboard called UPSCALE — an AI-powered lead conversion engine. UPSCALE sits between a business's marketing and their sales team: an AI agent (named "Helen" for this demo client, "Atmax Green Planet," a solar energy company) talks to incoming leads over Telegram/WhatsApp, qualifies them through natural conversation, scores them, and hands off warm leads to the sales team. This dashboard is what the business owner / sales rep sees — it is NOT a chatbot builder or CRM configuration tool, it's a monitoring and lead-management view.

Tone: professional, calm, trustworthy — think Linear, Stripe Dashboard, or Vercel's dashboard aesthetic. Not playful or "AI startup neon," not generic Bootstrap-template either. It should feel like a tool a real sales manager would trust with real customer data. Avoid decorative gradients, glows, or anything that looks "vibe-coded" — clean, confident, restrained.

IMPORTANT: Design both a light mode and a dark mode for every screen. Include a way to toggle between them (a small switch, not a button with text/emoji).

---

## Pages & Layout

### Global structure
A persistent left sidebar (collapsed width ~190px) present on every page except the login screen, containing:
- Brand mark "UPSCALE" + small subtitle showing the active client's business name (e.g. "Atmax Green Planet")
- Three nav items: **Pipeline**, **Analytics**, **Settings**
- Active nav item should be clearly highlighted

### 1. Login Page
A centered card on a plain background (no decorative shapes/glows). Contents:
- Small logo mark
- Heading: "Welcome back, [Business Name]"
- Subheading: "Never miss a lead again. Sign in to see who's talking to Helen right now."
- Password input field
- Submit button: "Enter Dashboard"
- Small footer text: "Powered by UPSCALE — an Axliq product"

### 2. Pipeline Page (main view)
Header row: page title, summary stats (total leads, hot count, warm count, urgent count if any), a Kanban/Table view toggle, theme toggle.

Below header: a **stats bar** showing key metrics as small cards — total leads, conversion rate, average lead score, average AI response time.

Below that, an "Urgent" banner area that only appears when a lead has explicitly requested human help — should stand out (red accent) but not be obnoxious.

Main content has two view modes:
- **Kanban view**: Cards organized into columns by stage. Stages, in order, split into two visual groups:
  - "AI Qualification" group (automatic): New, Hot, Warm, Cold
  - "Sales Pipeline" group (manual): Nurture, Handed Off, Closed Won, Closed Lost
  Each card shows: lead name, score badge (e.g. "75/100"), stage badge, property type, location, budget, timeline, source channel icon, date. Clicking a card opens the Lead Detail page.
- **Table view**: same leads as a sortable data table with columns: Name, Score, Stage, Property, Location, Budget, Timeline, Source, Date. Clicking a row opens Lead Detail.

### 3. Lead Detail Page
Two-column layout (stacks on mobile).

Left column (top to bottom):
- **Identity card**: lead name (large), score (large, color-coded), stage badge, source + date, then a grid of contact/qualification details: phone, email, property type, location, budget, timeline, electricity spend, decision maker (yes/no/unknown).
- **Stage & Notes card**: a row of stage buttons/chips (New, Hot, Warm, Cold, Nurture, Handed Off, Closed Won, Closed Lost) — clicking one instantly updates the lead's stage. Below that, a notes textarea for internal sales notes, with a subtle "saving…" indicator while typing.
- **Score breakdown card**: four labeled progress bars (Need Clarity, Budget, Timeline, Decision Maker), each out of 25 points.
- **AI Summary card**: a short paragraph summarizing the lead, written by the AI for a sales rep to read quickly.

Right column:
- **Conversation transcript card**: a WhatsApp-style chat interface showing the full back-and-forth between the AI (Helen) and the customer. Customer messages and AI messages should be visually distinct (different bubble colors/alignment, like real WhatsApp — one side green/right-aligned, other side white-or-gray/left-aligned). Each message has a timestamp. Show a small sender label ("Helen (AI)" or the customer's name) only when the speaker changes, not on every message. Background of this panel should evoke a chat app wallpaper, distinct from the rest of the dashboard.

### 4. Analytics Page
A fuller version of the stats bar — bigger cards/charts showing: total leads over time, stage distribution (how many leads in each stage), conversion rate, average score, lead source breakdown, average AI response time.

### 5. Settings Page
Mostly informational — shows that this dashboard is configured and managed by the agency (Axliq) on behalf of the business; no self-service configuration options. Include business profile info (read-only) and a support/contact section.

---

## Data model context (for realism, not literal display)
Each lead has: name, phone, email, property_type, location, electricity_spend, budget, timeline, decision_maker (bool), score (0-100), stage, summary, source (e.g. "telegram"), urgent (bool), handed_off (bool), notes, created_at.

Each message has: role ("user" or "assistant"), content, channel, created_at.

---

Please design all five pages above in both light and dark mode, with a cohesive color system (not literal WhatsApp green/teal copy — your own palette, but keep the chat bubble distinction concept). Favor generous whitespace, clear typography hierarchy, and subtle borders/shadows over heavy color blocking.
