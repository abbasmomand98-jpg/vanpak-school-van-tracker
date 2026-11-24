# VanPak — School Van Live Tracker & Safety (UX Concept)

A working website by Muhammad Abbas Khan — a UX concept demo for the VanPak case study. Pure HTML, CSS and JavaScript, no frameworks. Open `index.html` in a browser, or visit the live demo:

- **Live demo:** https://abbasmomand98-jpg.github.io/vanpak-school-van-tracker/
- **Code:** https://github.com/abbasmomand98-jpg/vanpak-school-van-tracker

## What it does

Millions of Pakistani schoolchildren ride private school vans every day, and their parents have no idea where the van is. No live tracking, no alert when the van is late, no verified driver identity, no pickup or drop confirmation, no way to know if a child actually boarded. In the November to February fog season vans run late or get cancelled with a single WhatsApp message a parent may miss — while children wait on cold, foggy streets. VanPak has four parts:

1. **Live Tracker** — pick any of 10 sample vans across Lahore, Karachi, Islamabad, Rawalpindi, Peshawar and Multan and see it live on its route: stops passed, the next stop, and how far along the route it is. Ayesha's van, VP-2026-011, is running 25 minutes late in dense fog — ETA school 8:10 AM, was 7:45 AM — 62% of its 5.2 km route done, 2 of 4 stops passed. Both her children, Hania (10) and Zain (7), boarded at 7:35 AM, and you can toggle their boarding status; it saves on the device.
2. **Routes & Fees** — search the 10 vans by city, school or van ID, sort by status, city or fee. This morning: 5 on time, 4 delayed in fog, 1 cancelled in Peshawar (VP-2026-016, Hayatabad route, fee credit for today). A fee calculator works out the monthly fee from the home-to-school distance: 0–3 km Rs 4,500; 3–6 km Rs 6,500; 6–10 km Rs 8,000; 10+ km Rs 9,000 per child per month. Ayesha: 5.2 km, 2 children — Rs 6,500 each, Rs 13,000 a month.
3. **Driver & Safety** — a verified driver card for the chosen van: Bilal Ahmed, 8 years driving school vans, licence (LTV) verified, police clearance verified, 4.9 stars across 128 rides with no complaints. The van is checked too — Suzuki Bolan 2021, white, 12 seats with a belt on every seat, first-aid kit, GPS tracker. One tap on the emergency button alerts the school and both parents with the van's live location (sample — no real alert is sent). Report an issue — late pickup, rash driving, a different driver — and it saves on the device; the school sees it the same minute.
4. **Alerts & Fees** — today's sample alerts: the 7:32 AM fog delay on VP-2026-011, the 6:50 AM cancellation of VP-2026-016 in Peshawar, and the November fee receipt — Rs 13,000 paid 1 Nov via JazzCash, receipt VPR-2026-1187, next due 1 Dec 2026. Mark a child absent for a date — the van skips your stop and the driver knows — and sign up for fog alerts for any sample van (name + van ID, validated, saved on the device).

## How it works

Open `index.html`. The tracker tab is prefilled with Ayesha's van, VP-2026-011 — 25 minutes late in dense fog, both children boarded. The routes tab lists all 10 vans, delayed and cancelled first. The driver tab shows Bilal Ahmed's verified card for the chosen van. The alerts tab shows the three sample alerts, the November receipt, the absence marker for 25 Nov 2026, and the fog-alert signup.

The fix is in the app: show the van live on its route instead of a guess; confirm the moment each child boards; verify the driver and the van before the first ride; and send the delay or cancellation as an alert the moment it happens — not a WhatsApp message a parent may miss. And on fog days, the schedule bends instead of breaking: the van never leaves a stop early, so a child running late still gets picked up.

The code is split the way a small real app would be: `data.js` holds the sample data, `logic.js` holds the pure rules (no DOM, unit-tested in Node), and `app.js` only wires the page. Boarding status, absences, alert signups, reports, the chosen van and the fee inputs are saved in `localStorage`, so they survive a reload; "Reset demo data" restores the sample figures. Run the tests with `node test.js` (unit smoke test) and `node dom-smoke.js` (DOM smoke test in a fake DOM).

## What you can learn from this project

- **Separating data, logic and rendering.** `data.js` is just facts; `logic.js` is pure functions you can test without a browser; `app.js` only touches the page. Change a fare in one place and every tab agrees.
- **A lookup with three honest answers.** A van ID can be found, valid but unknown, or malformed — the demo answers each one differently instead of showing the same "not found" for all three. Honest edge cases make a product feel trustworthy.
- **Fees as bands, not guesses.** Four distance bands turn one number (5.2 km) into a fare (Rs 6,500) — and the same function prices every van, the calculator and the receipt, so they can never disagree.
- **Progress as a distance, not a count.** The van is 62% along its route because it has covered 3.2 of 5.2 km — not because it passed 2 of 4 stops. Distance is honest; stop counts hide the long gaps between stops.
- **A cancelled day earns a credit.** One school day out of 22 is Rs 295 of a Rs 6,500 month — the demo shows the maths, so a cancellation feels fair instead of feeling like a loss.
- **Absence as a toggle, not a phone call.** Marking a child absent flips one key in a small object — `childId|date` — and the driver knows without a call, a message, or a missed WhatsApp.
- **localStorage as a tiny database.** Boarding status, absences, alert signups, reports, the chosen van and the fee inputs persist across reloads with a few lines of `JSON.parse` / `JSON.stringify` — no server, no account, no backend.
- **A fake DOM for testing.** `dom-smoke.js` runs the real `app.js` in Node against a stub `document`, so the page logic is tested without opening a browser.
- **Sample data, labelled everywhere.** Every van, time, fare, driver, school and child is invented and says so on the page. A demo that looks real must never pretend to be real.

## Sample-data honesty note

All vans, times, fares, drivers, schools and children in this demo are invented for a UX concept. The school names are real institutions used as sample examples, not partners. No real CNIC numbers and no phone numbers appear anywhere. This is an unofficial UX concept by Muhammad Abbas Khan, not a school, not a transport company and not a van service.

## Fork it and make it yours

This pattern fits any "where is my ride, and is my child on it?" problem — school buses anywhere, office shuttles, pilgrim transport, hospital patient pickups, or a daycare van. Fork the repo, swap the van table in `data.js`, and adapt the tracker to your own local problem. If you build something with it, I would love to see it — abbasmomand98@gmail.com.
