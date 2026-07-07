# Conveyancing Guard

AI-assisted payment fraud checker that flags suspicious bank-detail changes and payment instructions in UK property transactions before funds are sent.

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

Every check is also added to a session history panel, so a firm can show a clear record that a check was performed before funds were released.

## Tech stack

- Plain HTML, CSS, and JavaScript — no frameworks, no build step.
- Fully client-side. No backend, no API calls, no database.
- No data is stored or transmitted anywhere — everything runs and resets in the browser session.

## Setup

This is a static site — there is nothing to install or build.

**Option 1: Open directly**

Open `index.html` in any browser.

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
