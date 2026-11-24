// VanPak smoke tests — run with: node test.js
// Every canonical figure used in the mockups, slides and copy is asserted here.
var assert = require("assert");
var fs = require("fs");
var data = require("./data.js");
var L = require("./logic.js");

var n = 0;

function eq(a, b, msg) { assert.strictEqual(a, b, msg); n++; }
function ok(v, msg) { assert.ok(v, msg); n++; }
function deep(a, b, msg) { assert.deepStrictEqual(a, b, msg); n++; }

// 1. Data shape: 10 sample vans, 2 children, 3 alerts.
eq(data.VANS.length, 10, "there are 10 sample vans");
eq(data.CHILDREN.length, 2, "Ayesha has 2 children");
eq(data.ALERTS.length, 3, "there are 3 sample alerts");
eq(data.FEE_TIERS.length, 4, "there are 4 fee tiers");
data.VANS.forEach(function (v) {
  eq(v.stops.length, 4, v.id + " has 4 stops");
  ok(["ON TIME", "DELAYED", "CANCELLED"].indexOf(v.status) !== -1, v.id + " has a valid status");
  eq(v.fee, L.feeForDistance(v.km, data.FEE_TIERS), v.id + " fee matches its distance tier");
});

// 2. PKR formatting (Indian-system grouping).
eq(L.formatPKR(6500), "6,500", "Rs 6,500 formats as 6,500");
eq(L.formatPKR(13000), "13,000", "Rs 13,000 formats as 13,000");
eq(L.formatPKR(4500), "4,500", "Rs 4,500 formats as 4,500");
eq(L.formatPKR(9000), "9,000", "Rs 9,000 formats as 9,000");
eq(L.formatPKR(0), "0", "zero formats as 0");

// 3. Fee tiers by distance.
eq(L.feeForDistance(2.6, data.FEE_TIERS), 4500, "2.6 km costs Rs 4,500");
eq(L.feeForDistance(3.0, data.FEE_TIERS), 4500, "3.0 km costs Rs 4,500");
eq(L.feeForDistance(5.2, data.FEE_TIERS), 6500, "5.2 km costs Rs 6,500");
eq(L.feeForDistance(7.4, data.FEE_TIERS), 8000, "7.4 km costs Rs 8,000");
eq(L.feeForDistance(11.5, data.FEE_TIERS), 9000, "11.5 km costs Rs 9,000");
eq(L.feeForDistance(-2, data.FEE_TIERS), 4500, "a negative distance is treated as 0 km");
eq(L.feeForDistance(0, data.FEE_TIERS), 4500, "0 km costs Rs 4,500");
eq(L.feeTierFor(5.2, data.FEE_TIERS).label, "3\u20136 km", "5.2 km is in the 3-6 km band");

// 4. Monthly fee for a family — Ayesha's canonical figures.
var ayesha = L.monthlyFee(5.2, 2, data.FEE_TIERS);
eq(ayesha.perChild, 6500, "Ayesha pays Rs 6,500 per child");
eq(ayesha.total, 13000, "Ayesha pays Rs 13,000 a month for two children");
eq(ayesha.children, 2, "the fee counts 2 children");
var one = L.monthlyFee(2.6, 1, data.FEE_TIERS);
eq(one.total, 4500, "1 child at 2.6 km costs Rs 4,500 a month");
var three = L.monthlyFee(11.5, 3, data.FEE_TIERS);
eq(three.perChild, 9000, "11.5 km costs Rs 9,000 per child");
eq(three.total, 27000, "3 children at 11.5 km cost Rs 27,000 a month");
var none = L.monthlyFee(5.2, 0, data.FEE_TIERS);
eq(none.total, 0, "0 children cost nothing");

// 5. Fee credit for a cancelled fog day (one of 22 school days).
eq(L.feeCredit(6500), 295, "a Rs 6,500 month earns a Rs 295 credit for one cancelled day");
eq(L.feeCredit(4500), 205, "a Rs 4,500 month earns a Rs 205 credit for one cancelled day");
eq(L.feeCredit(0), 0, "no fee means no credit");

// 6. Van ID format and lookup.
ok(L.validVanId("VP-2026-011"), "VP-2026-011 is a valid van ID");
ok(L.validVanId("vp-2026-011"), "a lowercase van ID is valid");
ok(!L.validVanId("011"), "'011' is not a van ID");
ok(!L.validVanId("VP-2026-11"), "a two-digit number is not a van ID");
ok(!L.validVanId(""), "an empty string is not a van ID");
var v011 = L.findVan(data.VANS, "VP-2026-011");
eq(v011.city, "Lahore", "VP-2026-011 is in Lahore");
eq(v011.driver, "Bilal Ahmed", "VP-2026-011 is driven by Bilal Ahmed");
eq(L.findVan(data.VANS, "vp-2026-011").id, "VP-2026-011", "lookup is case-insensitive");
eq(L.findVan(data.VANS, "VP-2026-999"), null, "VP-2026-999 finds no van");
eq(L.lookupVan(data.VANS, "VP-2026-011").kind, "found", "VP-2026-011 lookup is found");
eq(L.lookupVan(data.VANS, "VP-2026-999").kind, "not-found", "VP-2026-999 lookup is not-found");
eq(L.lookupVan(data.VANS, "011").kind, "invalid", "'011' lookup is invalid");
eq(L.lookupVan(data.VANS, "").kind, "empty", "an empty lookup is empty");
eq(L.lookupVan(data.VANS, "  VP-2026-016  ").van.status, "CANCELLED", "lookup trims spaces");

// 7. Route progress.
eq(L.progressPct(v011), 62, "VP-2026-011 is 62% along its route");
eq(L.progressPct(L.findVan(data.VANS, "VP-2026-016")), 0, "the cancelled van is 0% along its route");
eq(L.progressPct(L.findVan(data.VANS, "VP-2026-013")), 62, "VP-2026-013 is 62% along its route");
eq(L.progressPct(null), 0, "no van means 0% progress");
eq(L.stopsPassed(v011), 2, "VP-2026-011 has passed 2 of 4 stops");
eq(L.stopsPassed(L.findVan(data.VANS, "VP-2026-016")), 0, "the cancelled van passed 0 stops");
eq(L.nextStop(v011).name, "Main Boulevard", "VP-2026-011's next stop is Main Boulevard");
eq(L.nextStop(L.findVan(data.VANS, "VP-2026-016")).name, "Home \u2014 Hayatabad Phase 2", "the cancelled van's next stop is its first stop");
eq(L.nextStop(null), null, "no van means no next stop");

// 8. Boarding summary.
var both = L.boardingSummary(data.CHILDREN, { hania: true, zain: true });
eq(both.onBoard, 2, "both children on board");
eq(both.text, "2 of 2 on board", "boarding text is '2 of 2 on board'");
ok(both.allOnBoard, "all on board is true when both are boarded");
var oneBoarded = L.boardingSummary(data.CHILDREN, { hania: true, zain: false });
eq(oneBoarded.onBoard, 1, "one child on board");
eq(oneBoarded.text, "1 of 2 on board", "boarding text is '1 of 2 on board'");
ok(!oneBoarded.allOnBoard, "all on board is false when one is waiting");
var neither = L.boardingSummary(data.CHILDREN, {});
eq(neither.onBoard, 0, "no children on board");
eq(neither.text, "0 of 2 on board", "boarding text is '0 of 2 on board'");

// 9. Absence marking.
var abs = {};
eq(L.isAbsent(abs, "hania", "2026-11-25"), false, "Hania is not absent yet");
abs = L.toggleAbsence(abs, "hania", "2026-11-25");
ok(L.isAbsent(abs, "hania", "2026-11-25"), "Hania is absent after marking");
ok(!L.isAbsent(abs, "zain", "2026-11-25"), "Zain is still riding");
ok(!L.isAbsent(abs, "hania", "2026-11-26"), "Hania is riding the next day");
eq(L.absentChildren(data.CHILDREN, abs, "2026-11-25").length, 1, "one child is absent on 25 Nov");
eq(L.absentChildren(data.CHILDREN, abs, "2026-11-25")[0].name, "Hania", "the absent child is Hania");
abs = L.toggleAbsence(abs, "hania", "2026-11-25");
eq(L.isAbsent(abs, "hania", "2026-11-25"), false, "toggling again marks Hania riding");
eq(L.absenceKey("zain", "2026-11-25"), "zain|2026-11-25", "absence key is child|date");

// 10. Alert signup validation.
var signup = L.validAlertSignup("Ayesha", "VP-2026-011", data.VANS);
ok(signup.ok, "Ayesha + VP-2026-011 is a valid signup");
eq(signup.van.city, "Lahore", "the signup van is in Lahore");
var noName = L.validAlertSignup("", "VP-2026-011", data.VANS);
ok(!noName.ok, "an empty name is not a valid signup");
deep(noName.errors, ["name"], "the error names the missing name");
var badVan = L.validAlertSignup("Ayesha", "VP-2026-999", data.VANS);
ok(!badVan.ok, "an unknown van is not a valid signup");
deep(badVan.errors, ["van"], "the error names the bad van");
var bothBad = L.validAlertSignup("", "011", data.VANS);
deep(bothBad.errors, ["name", "van"], "both errors are listed");

// 11. Van search.
eq(L.filterVans(data.VANS, "lahore").length, 3, "3 vans run in Lahore");
eq(L.filterVans(data.VANS, "gulberg").length, 2, "2 vans serve Gulberg");
eq(L.filterVans(data.VANS, "VP-2026-016").length, 1, "searching the ID finds 1 van");
eq(L.filterVans(data.VANS, "").length, 10, "an empty search returns all 10 vans");
eq(L.filterVans(data.VANS, "karachi").length, 2, "2 vans run in Karachi");
eq(L.filterVans(data.VANS, "peshawar").length, 1, "1 van runs in Peshawar");
eq(L.filterVans(data.VANS, "LAHORE").length, 3, "search is case-insensitive");
eq(L.filterVans(data.VANS, "zzz").length, 0, "a nonsense search finds nothing");

// 12. Van sorting.
var byStatus = L.sortVans(data.VANS, "status");
eq(byStatus[0].id, "VP-2026-016", "cancelled first is VP-2026-016");
eq(byStatus[1].id, "VP-2026-014", "most delayed next is VP-2026-014 (50 min)");
var byFee = L.sortVans(data.VANS, "fee");
eq(byFee[0].fee, 4500, "lowest fee first is Rs 4,500");
eq(byFee[byFee.length - 1].fee, 9000, "highest fee last is Rs 9,000");
var byCity = L.sortVans(data.VANS, "city");
eq(byCity[0].city, "Islamabad", "first city alphabetically is Islamabad");
eq(byCity[byCity.length - 1].city, "Rawalpindi", "last city alphabetically is Rawalpindi");

// 13. Morning status counts.
var counts = L.countByStatus(data.VANS);
eq(counts.total, 10, "10 vans in total");
eq(counts["ON TIME"], 5, "5 vans are on time");
eq(counts["DELAYED"], 4, "4 vans are delayed");
eq(counts["CANCELLED"], 1, "1 van is cancelled");

// 14. Canonical persona, receipt and alerts.
eq(data.PERSONA.name, "Ayesha", "the persona is Ayesha");
eq(data.PERSONA.vanId, "VP-2026-011", "Ayesha's van is VP-2026-011");
eq(data.PERSONA.monthlyTotal, 13000, "Ayesha's monthly total is Rs 13,000");
eq(data.RECEIPT.id, "VPR-2026-1187", "the receipt number is VPR-2026-1187");
eq(data.RECEIPT.amount, 13000, "the receipt is Rs 13,000");
eq(data.RECEIPT.method, "JazzCash", "the receipt was paid via JazzCash");
eq(data.ALERTS[0].vanId, "VP-2026-011", "the fog-delay alert is for VP-2026-011");
eq(data.ALERTS[1].kind, "cancel", "the second alert is a cancellation");
eq(data.ALERTS[2].kind, "receipt", "the third alert is the fee receipt");
ok(data.FOG_NOTE.indexOf("20\u201340 min") !== -1, "the fog note names the 20-40 minute delay");

// 15. The demo's source files all exist.
["index.html", "style.css", "data.js", "logic.js", "app.js"].forEach(function (f) {
  ok(fs.existsSync(f), f + " exists");
});

console.log("\n" + n + " unit assertions passed.");
