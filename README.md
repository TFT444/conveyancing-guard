# Conveyancing Guard

A payment fraud checker for UK conveyancing solicitors that flags suspicious bank-detail changes and payment instructions before funds are sent — checked against the specifics of the transaction, not just whether the message "looks like a scam."

**[Try it live](#)** — link will be added once GitHub Pages is enabled for this repo.

## The problem

Payment diversion fraud (also called Friday afternoon fraud or bank mandate fraud) is one of the most damaging scams in UK conveyancing. A fraudster intercepts email correspondence between a solicitor and a client or another firm, then sends a message — often timed to look routine — asking for completion funds to be sent to a "new" or "updated" bank account. UK cases have seen losses over **£640,000** from this exact pattern in a single transaction.

This is a recognized, well-documented fraud pattern. The [Law Society](https://www.lawsociety.org.uk/) and the [National Crime Agency](https://www.nationalcrimeagency.gov.uk/) have both run awareness campaigns specifically about email interception and bank mandate fraud in conveyancing, because the pattern keeps working: the email looks legitimate, the amount is often correct, and the request lands at a moment when a firm is moving quickly to complete a transaction.

## What makes this different

Most scam checkers ask a single, isolated question: *"does this message look like a scam?"* That's a weak signal on its own — a well-written fraud email can look perfectly professional.

Conveyancing Guard asks a different question: ***does this match what should be happening in this transaction?*** Specifically, it checks the pasted message against two facts only the solicitor knows:

- **Has this account been used before** in this transaction?
- **Does the amount match** what was actually expected?

A message asking for exactly the right amount, sent to an account that has never been used before, is the single most common shape of a successful diversion fraud — and it's a pattern that generic "does this look phishy?" tools miss, because the email text alone often gives nothing away.

## How it works

1. Paste the payment instruction or email text into the checker.
2. Answer two quick yes/no questions about the transaction.
3. Get a risk verdict — **High**, **Medium**, or **Low** — with the specific reasons behind it and a recommended next action.

Detection is a rule-based keyword/pattern-matching engine (see [`assets/app.js`](assets/app.js)) — not a machine-learning model or a third-party AI API. It combines your two answers with phrases known to appear in real payment-diversion fraud attempts (bank-change language, urgency pressure, compliance-audit pretexts, requests to avoid phone verification) to produce a score, and flags the classic diversion pattern — the right amount, sent to an unused account — with its own banner.

## Pages

The site is four static pages sharing one stylesheet and one script, linked by a persistent nav:

- **`index.html`** — the live entry point. Paste a message, answer the two questions, get a verdict.
- **`history.html`** — every check run this session: searchable, filterable by risk, paginated.
- **`about.html`** — the problem, how the engine works, the real tech stack, a demo flow for judges, and the full disclaimer.
- **`settings.html`** — adjustable risk-score thresholds and a clear-session-history control.

## Tech stack

- Plain HTML, CSS, and JavaScript — no frameworks, no build step, no bundler.
- Fully client-side. No backend, no API calls, no database.
- No data is transmitted anywhere. Check history and thresholds live in your browser's `sessionStorage` for the current tab only, and are cleared the moment the tab closes.

## Setup

This is a static site — there is nothing to install or build.

**Option 1: Open directly**

Open `index.html` in any browser. All four pages work the same way — `history.html`, `about.html`, and `settings.html` are reachable from the nav bar.

**Option 2: Serve locally**

```bash
python3 -m http.server
```

Then visit `http://localhost:8000` in your browser.

## Disclaimer

Conveyancing Guard is a **prototype built for a hackathon**, demonstrating an approach to catching payment diversion fraud. It is **not** a certified compliance product, has not been audited or accredited, and should not be relied on as a sole safeguard.

Always independently verify large or unusual payment instructions — especially any request to change bank details — **by phone, using a number you already have on file**, never a number or contact provided in the message itself.

## License

MIT — see [LICENSE](LICENSE).
