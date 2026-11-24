// VanPak DOM smoke test — run with: node dom-smoke.js
// Executes data.js + logic.js + app.js in a tiny fake DOM (vm sandbox)
// and asserts the page renders the canonical figures.
var fs = require("fs");
var vm = require("vm");
var assert = require("assert");

function FakeEl(tag) {
  this.tagName = (tag || "div").toUpperCase();
  this.children = [];
  this._html = "";
  this.textContent = "";
  this.value = "";
  this.checked = false;
  this.disabled = false;
  this.className = "";
  this.style = {};
  this.listeners = {};
  this.attributes = {};
  this.type = "";
}
FakeEl.prototype.addEventListener = function (ev, fn) {
  (this.listeners[ev] = this.listeners[ev] || []).push(fn);
};
FakeEl.prototype.appendChild = function (child) { this.children.push(child); return child; };
FakeEl.prototype.setAttribute = function (k, v) { this.attributes[k] = v; };
FakeEl.prototype.getAttribute = function (k) { return this.attributes[k]; };
Object.defineProperty(FakeEl.prototype, "innerHTML", {
  get: function () { return this._html; },
  set: function (v) { this._html = String(v); this.children = []; }
});

var byId = {};
function el(id) {
  if (!byId[id]) byId[id] = new FakeEl("div");
  return byId[id];
}
var documentStub = {
  getElementById: el,
  createElement: function (tag) { return new FakeEl(tag); }
};
var store = {};
var localStorageStub = {
  getItem: function (k) { return store[k] || null; },
  setItem: function (k, v) { store[k] = String(v); }
};
function fire(id, ev, arg) {
  (byId[id].listeners[ev] || []).forEach(function (fn) { fn(arg || {}); });
}
function fireEl(node, ev, arg) {
  (node.listeners[ev] || []).forEach(function (fn) { fn(arg || {}); });
}

var sandbox = { document: documentStub, localStorage: localStorageStub, console: console,
  Date: Date, setInterval: function () { return 0; }, clearInterval: function () {} };
sandbox.window = sandbox;
vm.createContext(sandbox);
// Pre-seed the fake DOM with the defaults index.html declares in markup
// (the fake DOM does not parse value/selected attributes).
el("van-select").value = "VP-2026-011";
el("driver-van-select").value = "VP-2026-011";
el("fee-km-input").value = "5.2";
el("fee-children-input").value = "2";
el("absence-date").value = "2026-11-25";
el("alert-name-input").value = "Ayesha";
el("alert-van-input").value = "VP-2026-011";
el("route-sort").value = "status";
el("route-search").value = "";
["data.js", "logic.js", "app.js"].forEach(function (f) {
  vm.runInContext(fs.readFileSync(f, "utf8"), sandbox, { filename: f });
});

var n = 0;
function eq(a, b, msg) { assert.strictEqual(a, b, msg); n++; }
function ok(v, msg) { assert.ok(v, msg); n++; }

// 1. Tracker tab is active on load; VP-2026-011 is 25 min late in fog.
eq(el("section-tracker").style.display, "block", "tracker section shows on load");
ok(el("tracker-status").innerHTML.indexOf("25 MIN LATE") !== -1, "VP-2026-011 is 25 min late");
ok(el("tracker-status").innerHTML.indexOf("8:10 AM") !== -1, "ETA school is 8:10 AM");
ok(el("tracker-status").innerHTML.indexOf("62%") !== -1, "the van is 62% along its route");
ok(el("tracker-status").innerHTML.indexOf("2 of 4 stops passed") !== -1, "2 of 4 stops passed");
ok(el("tracker-summary").textContent.indexOf("24 Nov 2026") !== -1, "summary names 24 Nov 2026");
eq(el("tracker-stops").children.length, 4, "tracker shows 4 stops");
ok(el("tracker-stops").children[0].innerHTML.indexOf("Gulberg III") !== -1, "first stop is Home, Gulberg III");
ok(el("tracker-stops").children[2].innerHTML.indexOf("Main Boulevard") !== -1, "third stop is Main Boulevard");
ok(el("tracker-driver").innerHTML.indexOf("Bilal Ahmed") !== -1, "driver chip names Bilal Ahmed");
ok(el("tracker-driver").innerHTML.indexOf("4.9") !== -1, "driver chip shows the 4.9 rating");
eq(el("boarding-list").children.length, 3, "boarding list has 2 children + a summary line");
ok(el("boarding-list").children[2].textContent.indexOf("2 of 2 on board") !== -1, "both children are on board");
ok((store["vanpak-boarding"] || "").indexOf("hania") !== -1, "boarding state is saved on this device");

// 2. Boarding toggle: mark Hania alighted, then boarded again.
fireEl(el("boarding-list").children[0].children[0], "click");
ok(el("boarding-list").children[2].textContent.indexOf("1 of 2 on board") !== -1, "marking Hania alighted leaves 1 of 2 on board");
fireEl(el("boarding-list").children[0].children[0], "click");
ok(el("boarding-list").children[2].textContent.indexOf("2 of 2 on board") !== -1, "marking Hania boarded restores 2 of 2 on board");

// 3. Switching vans: the cancelled Peshawar van.
el("van-select").value = "VP-2026-016";
fire("van-select", "change");
ok(el("tracker-status").innerHTML.indexOf("CANCELLED") !== -1, "VP-2026-016 is cancelled");
ok(el("tracker-status").innerHTML.indexOf("0 of 4 stops passed") !== -1, "the cancelled van passed 0 stops");
ok(el("tracker-driver").innerHTML.indexOf("Gul Nawaz") !== -1, "the cancelled van's driver is Gul Nawaz");
el("van-select").value = "VP-2026-011";
fire("van-select", "change");
ok(el("tracker-status").innerHTML.indexOf("25 MIN LATE") !== -1, "switching back restores the 25 min late status");

// 4. Routes tab: 10 vans, cancelled first; morning counts.
fire("tab-routes", "click");
eq(el("section-routes").style.display, "block", "routes section shows on tab click");
eq(el("section-tracker").style.display, "none", "tracker section hides on tab click");
eq(el("route-list").children.length, 10, "route list renders 10 vans");
ok(el("route-list").children[0].innerHTML.indexOf("VP-2026-016") !== -1, "cancelled first is VP-2026-016");
ok(el("route-list").children[1].innerHTML.indexOf("VP-2026-014") !== -1, "most delayed next is VP-2026-014");
ok(el("route-summary").textContent.indexOf("5 on time, 4 delayed, 1 cancelled") !== -1, "summary counts 5 on time, 4 delayed, 1 cancelled");
ok(el("fee-result").innerHTML.indexOf("Rs 13,000") !== -1, "Ayesha's fee is Rs 13,000 a month");
ok(el("fee-result").innerHTML.indexOf("Rs 6,500") !== -1, "Ayesha's fee is Rs 6,500 per child");

// 5. Search and sort.
el("route-search").value = "lahore";
fire("route-search", "input");
eq(el("route-list").children.length, 3, "searching Lahore finds 3 vans");
el("route-search").value = "gulberg";
fire("route-search", "input");
eq(el("route-list").children.length, 2, "searching Gulberg finds 2 vans");
el("route-search").value = "";
fire("route-search", "input");
eq(el("route-list").children.length, 10, "clearing the search restores 10 vans");
el("route-sort").value = "fee";
fire("route-sort", "change");
ok(el("route-list").children[0].innerHTML.indexOf("Rs 4,500") !== -1, "lowest fee first is Rs 4,500");
el("route-sort").value = "city";
fire("route-sort", "change");
ok(el("route-list").children[0].innerHTML.indexOf("Islamabad") !== -1, "first city alphabetically is Islamabad");
el("route-sort").value = "status";
fire("route-sort", "change");

// 6. Fee calculator: a different distance and child count.
el("fee-km-input").value = "2.6";
el("fee-children-input").value = "1";
fire("fee-km-input", "input");
ok(el("fee-result").innerHTML.indexOf("Rs 4,500") !== -1, "2.6 km for 1 child is Rs 4,500 a month");
ok(el("fee-result").innerHTML.indexOf("Rs 205") !== -1, "the cancelled-day credit is Rs 205");
el("fee-km-input").value = "5.2";
el("fee-children-input").value = "2";
fire("fee-km-input", "input");
ok(el("fee-result").innerHTML.indexOf("Rs 13,000") !== -1, "restoring 5.2 km and 2 children restores Rs 13,000");

// 7. Driver tab: verified driver, van checks, emergency, report.
fire("tab-driver", "click");
eq(el("section-driver").style.display, "block", "driver section shows on tab click");
ok(el("driver-card").innerHTML.indexOf("Bilal Ahmed") !== -1, "driver card names Bilal Ahmed");
ok(el("driver-card").innerHTML.indexOf("Police clearance") !== -1, "driver card names the police clearance");
ok(el("driver-card").innerHTML.indexOf("128 rides") !== -1, "driver card names 128 rides");
ok(el("van-card").innerHTML.indexOf("Suzuki Bolan 2021") !== -1, "van card names the Suzuki Bolan 2021");
ok(el("van-card").innerHTML.indexOf("LHR-24-1187") !== -1, "van card names the sample registration");
fire("emergency-btn", "click");
ok(el("emergency-result").innerHTML.indexOf("EMERGENCY ALERT SENT") !== -1, "emergency button sends the alert");
ok(el("emergency-result").innerHTML.indexOf("VP-2026-011") !== -1, "the emergency alert names VP-2026-011");
el("report-text").value = "The van was 40 minutes late today";
fire("report-btn", "click");
eq(el("report-list").children.length, 1, "one report is saved");
ok(el("report-list").children[0].innerHTML.indexOf("40 minutes late") !== -1, "the report text is saved");
ok((store["vanpak-reports"] || "").indexOf("40 minutes late") !== -1, "the report persists in localStorage");
el("report-text").value = "";
fire("report-btn", "click");
ok(el("report-list").innerHTML.indexOf("WRITE WHAT HAPPENED FIRST") !== -1, "an empty report asks what happened");

// 8. Alerts tab: alerts, receipt, absence, signup.
fire("tab-alerts", "click");
eq(el("section-alerts").style.display, "block", "alerts section shows on tab click");
eq(el("alerts-list").children.length, 3, "alerts list renders 3 alerts");
ok(el("alerts-list").children[0].innerHTML.indexOf("FOG DELAY") !== -1, "first alert is the fog delay");
ok(el("alerts-list").children[1].innerHTML.indexOf("VAN CANCELLED") !== -1, "second alert is the cancellation");
ok(el("receipt-card").innerHTML.indexOf("Rs 13,000") !== -1, "receipt is Rs 13,000");
ok(el("receipt-card").innerHTML.indexOf("VPR-2026-1187") !== -1, "receipt number is VPR-2026-1187");
ok(el("receipt-card").innerHTML.indexOf("JazzCash") !== -1, "receipt was paid via JazzCash");
eq(el("absence-list").children.length, 2, "absence list has 2 children");
fireEl(el("absence-list").children[0].children[0], "click");
ok(el("absence-summary").textContent.indexOf("Hania marked absent") !== -1, "Hania is marked absent on 25 Nov");
ok((store["vanpak-absences"] || "").indexOf("hania|2026-11-25") !== -1, "the absence persists in localStorage");
fireEl(el("absence-list").children[0].children[0], "click");
ok(el("absence-summary").textContent.indexOf("Nobody marked absent") !== -1, "toggling again clears the absence");
fire("alert-btn", "click");
ok(el("alert-result").innerHTML.indexOf("FOG ALERTS ON") !== -1, "alert signup turns fog alerts on");
ok(el("alert-result").innerHTML.indexOf("VP-2026-011") !== -1, "the signup names VP-2026-011");
eq(el("saved-alerts").children.length, 1, "one alert signup is saved");
ok((store["vanpak-alerts"] || "").indexOf("Ayesha") !== -1, "the signup persists in localStorage");
el("alert-van-input").value = "VP-2026-999";
fire("alert-btn", "click");
ok(el("alert-result").innerHTML.indexOf("COULD NOT TURN ALERTS ON") !== -1, "an unknown van ID is rejected");
el("alert-van-input").value = "VP-2026-011";
fire("alert-btn", "click");
ok(el("alert-result").innerHTML.indexOf("FOG ALERTS ON") !== -1, "restoring the van ID turns alerts on again");

// 9. Reset restores the canonical defaults.
fire("reset-demo", "click");
eq(el("section-tracker").style.display, "block", "reset returns to the tracker tab");
ok(el("tracker-status").innerHTML.indexOf("25 MIN LATE") !== -1, "reset restores the 25 min late status");
ok(el("boarding-list").children[2].textContent.indexOf("2 of 2 on board") !== -1, "reset restores 2 of 2 on board");
ok(el("fee-result").innerHTML.indexOf("Rs 13,000") !== -1, "reset restores the Rs 13,000 fee");
ok(el("saved-alerts").innerHTML.indexOf("No alert signups") !== -1, "reset clears the alert signups");
eq(el("fee-km-input").value, "5.2", "reset restores 5.2 km");
eq(el("fee-children-input").value, "2", "reset restores 2 children");
eq(el("alert-van-input").value, "VP-2026-011", "reset restores van ID VP-2026-011");

console.log("\n" + n + " DOM assertions passed.");
