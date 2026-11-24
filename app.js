// VanPak — page wiring. All rules live in logic.js; this file only renders.
// "Today" is pinned to 2026-11-24 so the sample figures (the 25-minute
// fog delay on VP-2026-011, the 10 sample vans, the Rs 6,500 fee and the
// Rs 13,000 November receipt) stay stable no matter when you open it.
(function () {
  var L = window.VanPakLogic;
  var TODAY = "2026-11-24";
  var TODAY_LABEL = "24 Nov 2026";
  var TOMORROW = "2026-11-25";
  var STORE_BOARDING = "vanpak-boarding";
  var STORE_ABSENCES = "vanpak-absences";
  var STORE_ALERTS = "vanpak-alerts";
  var STORE_REPORTS = "vanpak-reports";
  var STORE_VAN = "vanpak-van";
  var STORE_FEE_KM = "vanpak-fee-km";
  var STORE_FEE_CHILDREN = "vanpak-fee-children";

  function el(id) { return document.getElementById(id); }
  function rs(n) { return "Rs " + L.formatPKR(n); }

  function loadJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || "null") || fallback; }
    catch (e) { return fallback; }
  }
  function saveJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }
  var boarding = loadJSON(STORE_BOARDING, { hania: true, zain: true });
  var absences = loadJSON(STORE_ABSENCES, {});
  var savedAlerts = loadJSON(STORE_ALERTS, []);
  var reports = loadJSON(STORE_REPORTS, []);
  // Persist the initial boarding state so it survives a reload too.
  saveJSON(STORE_BOARDING, boarding);
  var savedVanId = loadJSON(STORE_VAN, null);
  var savedKm = loadJSON(STORE_FEE_KM, null);
  var savedChildren = loadJSON(STORE_FEE_CHILDREN, null);
  if (savedKm !== null) el("fee-km-input").value = String(savedKm);
  if (savedChildren !== null) el("fee-children-input").value = String(savedChildren);

  // ---- Tabs ----
  var TABS = ["tracker", "routes", "driver", "alerts"];
  function showTab(name) {
    TABS.forEach(function (t) {
      el("section-" + t).style.display = (t === name) ? "block" : "none";
      el("tab-" + t).className = "tab-btn" + (t === name ? " active" : "");
    });
  }
  TABS.forEach(function (t) {
    el("tab-" + t).addEventListener("click", function () { showTab(t); });
  });
  showTab("tracker");

  function fillVanSelect(selectEl, selectedId) {
    selectEl.innerHTML = "";
    VANS.forEach(function (v) {
      var opt = document.createElement("option");
      opt.value = v.id;
      opt.textContent = v.id + " \u2014 " + v.city + ", " + v.school;
      selectEl.appendChild(opt);
    });
    selectEl.value = selectedId || VANS[0].id;
  }
  fillVanSelect(el("van-select"), savedVanId);
  fillVanSelect(el("driver-van-select"), savedVanId);

  function selectedVan(selectEl) {
    return L.findVan(VANS, selectEl.value) || VANS[0];
  }

  function statusLine(van) {
    if (van.status === "CANCELLED") return "CANCELLED \u2014 DENSE FOG";
    if (van.status === "DELAYED") return van.delayMin + " MIN LATE \u2014 DENSE FOG";
    return "ON TIME \u2014 RUNNING TO SCHEDULE";
  }

  // ---- Live tracker ----
  function renderTracker() {
    var van = selectedVan(el("van-select"));
    saveJSON(STORE_VAN, van.id);
    var pct = L.progressPct(van);
    var passed = L.stopsPassed(van);
    var next = L.nextStop(van);
    var cls = van.status === "ON TIME" ? "ok" : (van.status === "DELAYED" ? "warn" : "risk");
    el("tracker-status").innerHTML = '<div class="alert ' + cls + '"><strong>\u25CF LIVE \u2014 ' +
      van.id + " \u00b7 " + statusLine(van) + "</strong><p>" +
      "ETA school " + van.eta + (van.status === "DELAYED" ? " \u00b7 was " + van.schedEta : "") +
      ". " + passed + " of " + van.stops.length + " stops passed \u00b7 " + pct +
      "% of the " + van.km + " km route done." +
      (next ? " Next stop: " + next.name + " \u2014 " + next.note + "." : " No stops left today.") +
      "</p></div>";
    var box = el("tracker-stops");
    box.innerHTML = "";
    van.stops.forEach(function (s) {
      var div = document.createElement("div");
      div.className = "bundle" + (s.passed ? " best" : "");
      div.innerHTML = "<div><h3>" + (s.passed ? "\u2713 " : "\u2022 ") + s.name + "</h3><p>" +
        s.note + "</p></div>" +
        '<div class="recv">' + s.time + "<span>" + (s.passed ? "passed" : "scheduled") + "</span></div>";
      box.appendChild(div);
    });
    renderBoarding();
    el("tracker-summary").textContent = "Checked " + TODAY_LABEL + " \u00b7 " + FOG_NOTE +
      " Sample data \u2014 all van times, fares and drivers are sample.";
    el("tracker-driver").innerHTML = '<div class="bundle best"><div><h3>' + van.driver +
      " \u2014 Verified driver</h3><p>" + van.rating + " \u2605 \u00b7 " + van.rides +
      " rides \u00b7 " + van.driverYears + " years \u00b7 licence (LTV) verified \u00b7 police clearance verified</p></div>" +
      '<div class="recv">' + van.id + "<span>" + van.city + "</span></div></div>";
  }

  function renderBoarding() {
    var box = el("boarding-list");
    box.innerHTML = "";
    CHILDREN.forEach(function (c) {
      var on = !!boarding[c.id];
      var div = document.createElement("div");
      div.className = "bundle" + (on ? " best" : "");
      div.innerHTML = "<div><h3>" + c.name + ", " + c.age + "</h3><p>" +
        (on ? "Boarded 7:35 AM \u00b7 VP-2026-011" : "Not on the van yet") + "</p></div>" +
        '<div class="recv">' + (on ? "BOARDED \u2713" : "WAITING") + "</div>";
      var btn = document.createElement("button");
      btn.className = "save-btn";
      btn.textContent = on ? "Mark alighted" : "Mark boarded";
      btn.addEventListener("click", function () {
        boarding[c.id] = !boarding[c.id];
        saveJSON(STORE_BOARDING, boarding);
        renderTracker();
      });
      div.appendChild(btn);
      box.appendChild(div);
    });
    var sum = L.boardingSummary(CHILDREN, boarding);
    var p = document.createElement("p");
    p.textContent = sum.text + " \u2014 saved on this device.";
    box.appendChild(p);
  }
  renderTracker();
  el("van-select").addEventListener("change", renderTracker);

  // ---- Routes & fees ----
  function renderRoutes() {
    var q = el("route-search").value || "";
    var sort = el("route-sort").value || "status";
    var rows = L.sortVans(L.filterVans(VANS, q), sort);
    var box = el("route-list");
    box.innerHTML = "";
    rows.forEach(function (v) {
      var div = document.createElement("div");
      var cls = v.status === "ON TIME" ? " best" : "";
      div.className = "bundle" + cls;
      var badge = v.status === "CANCELLED"
        ? '<span class="badge-risk">CANCELLED \u2014 FOG</span>'
        : (v.status === "DELAYED"
          ? '<span class="badge-best">' + v.delayMin + " MIN LATE</span>"
          : '<span class="badge-ok">\u2713 ON TIME</span>');
      div.innerHTML = "<div><h3>" + v.id + " \u00b7 " + v.city + "</h3><p>" + v.school +
        " \u00b7 " + v.area + " \u2192 " + v.km + " km \u00b7 " + v.children +
        " children \u00b7 driver " + v.driver + "</p></div>" +
        '<div class="recv">' + rs(v.fee) + "<span>per child / month</span>" + badge + "</div>";
      box.appendChild(div);
    });
    var counts = L.countByStatus(VANS);
    el("route-summary").textContent = "Showing " + rows.length + " of " + VANS.length +
      " sample vans \u00b7 this morning: " + counts["ON TIME"] + " on time, " +
      counts["DELAYED"] + " delayed, " + counts["CANCELLED"] + " cancelled.";
  }
  renderRoutes();
  el("route-search").addEventListener("input", renderRoutes);
  el("route-sort").addEventListener("change", renderRoutes);

  function renderFee() {
    var km = parseFloat(el("fee-km-input").value);
    var kids = parseInt(el("fee-children-input").value, 10);
    if (isNaN(km) || km < 0) km = 0;
    if (isNaN(kids) || kids < 0) kids = 0;
    saveJSON(STORE_FEE_KM, km);
    saveJSON(STORE_FEE_CHILDREN, kids);
    var fee = L.monthlyFee(km, kids, FEE_TIERS);
    var box = el("fee-result");
    if (!kids) {
      box.innerHTML = '<div class="total"><strong>NO CHILDREN ENTERED YET</strong>' +
        "<p>Enter how many children ride the van.</p></div>";
      return;
    }
    box.innerHTML = '<div class="total"><strong>' + fee.km + " KM \u2014 " + rs(fee.perChild) +
      " PER CHILD \u00b7 " + rs(fee.total) + " A MONTH FOR " + fee.children + " " +
      (fee.children === 1 ? "CHILD" : "CHILDREN") + "</strong>" +
      "<p>Fee band " + fee.tier.label + " \u00b7 " + rs(fee.perChild) + " a month per child. " +
      "A cancelled fog day earns a " + rs(L.feeCredit(fee.perChild)) +
      " credit for that day (one of 22 school days).</p></div>";
  }
  renderFee();
  el("fee-km-input").addEventListener("input", renderFee);
  el("fee-children-input").addEventListener("input", renderFee);
  el("fee-btn").addEventListener("click", renderFee);

  // ---- Driver & safety ----
  function renderDriver() {
    var van = selectedVan(el("driver-van-select"));
    el("driver-card").innerHTML = '<div class="bundle best"><div><h3>' + van.driver +
      " \u2014 Verified \u2713</h3><p>" + van.driverYears + " years driving school vans \u00b7 " +
      van.rating + " \u2605 \u00b7 " + van.rides + " rides \u00b7 no complaints</p><p>" +
      "Licence (LTV) \u2014 Verified \u2713 \u00b7 Police clearance \u2014 Verified \u2713</p><p>" +
      "A different driver today? The app tells you first.</p></div>" +
      '<div class="recv">' + van.id + "<span>" + van.city + "</span></div></div>";
    el("van-card").innerHTML = '<div class="bundle"><div><h3>' + van.van + "</h3><p>" +
      "Registration (sample) " + van.reg + " \u00b7 " + van.children +
      " seats \u00b7 seat belts on every seat</p><p>First-aid kit \u2713 \u00b7 GPS tracker \u2713</p></div>" +
      '<div class="recv">' + van.km + " km<span>route</span></div></div>";
  }
  renderDriver();
  el("driver-van-select").addEventListener("change", renderDriver);

  el("emergency-btn").addEventListener("click", function () {
    var van = selectedVan(el("driver-van-select"));
    el("emergency-result").innerHTML = '<div class="alert risk"><strong>EMERGENCY ALERT SENT \u2014 ' +
      van.id + "</strong><p>The school and both parents have been alerted, with the van's live location attached. " +
      "(Sample \u2014 no real alert was sent from this demo.)</p></div>";
  });

  function renderReports() {
    var box = el("report-list");
    box.innerHTML = "";
    if (!reports.length) {
      box.innerHTML = "<p>No reports sent yet on this device.</p>";
      return;
    }
    reports.forEach(function (r) {
      var div = document.createElement("div");
      div.className = "bundle";
      div.innerHTML = "<div><h3>" + r.vanId + "</h3><p>" + r.text + "</p></div>" +
        '<div class="recv">sent<span>' + r.when + "</span></div>";
      box.appendChild(div);
    });
  }
  renderReports();
  el("report-btn").addEventListener("click", function () {
    var text = (el("report-text").value || "").trim();
    if (!text) {
      el("report-list").innerHTML = '<div class="alert warn"><strong>WRITE WHAT HAPPENED FIRST</strong>' +
        "<p>Describe the issue \u2014 late pickup, rash driving, a different driver \u2014 then send it.</p></div>";
      return;
    }
    var van = selectedVan(el("driver-van-select"));
    reports.push({ vanId: van.id, text: text, when: TODAY_LABEL });
    saveJSON(STORE_REPORTS, reports);
    el("report-text").value = "";
    renderReports();
  });

  // ---- Alerts & fees ----
  function renderAlerts() {
    var box = el("alerts-list");
    box.innerHTML = "";
    ALERTS.forEach(function (a) {
      var div = document.createElement("div");
      var cls = a.kind === "delay" ? "warn" : (a.kind === "cancel" ? "risk" : "ok");
      div.className = "alert " + cls;
      div.innerHTML = "<strong>" + a.title + " \u00b7 " + a.time + "</strong><p>" + a.body + "</p>";
      box.appendChild(div);
    });
    el("receipt-card").innerHTML = '<div class="bundle best"><div><h3>' + RECEIPT.month +
      " \u2014 2 children \u00b7 5.2 km</h3><p>Hania, 10 \u2014 Rs 6,500 \u00b7 Zain, 7 \u2014 Rs 6,500</p><p>" +
      "Paid " + RECEIPT.paidOn + " via " + RECEIPT.method + " \u00b7 Receipt " + RECEIPT.id +
      " \u00b7 Next due " + RECEIPT.nextDue + "</p></div>" +
      '<div class="recv">' + rs(RECEIPT.amount) + "<span>PAID \u2713</span></div></div>";
  }
  renderAlerts();

  function renderAbsence() {
    var date = el("absence-date").value || TOMORROW;
    var box = el("absence-list");
    box.innerHTML = "";
    CHILDREN.forEach(function (c) {
      var absent = L.isAbsent(absences, c.id, date);
      var div = document.createElement("div");
      div.className = "bundle" + (absent ? " best" : "");
      div.innerHTML = "<div><h3>" + c.name + ", " + c.age + "</h3><p>" +
        (absent ? "Absent on " + date + " \u2014 the van skips your stop" : "Riding on " + date) +
        "</p></div>" +
        '<div class="recv">' + (absent ? "ABSENT" : "RIDING") + "</div>";
      var btn = document.createElement("button");
      btn.className = "save-btn";
      btn.textContent = absent ? "Mark riding" : "Mark absent";
      btn.addEventListener("click", function () {
        absences = L.toggleAbsence(absences, c.id, date);
        saveJSON(STORE_ABSENCES, absences);
        renderAbsence();
      });
      div.appendChild(btn);
      box.appendChild(div);
    });
    var away = L.absentChildren(CHILDREN, absences, date);
    el("absence-summary").textContent = away.length
      ? away.map(function (c) { return c.name; }).join(" and ") + " marked absent on " + date +
        " \u2014 the driver knows, and the van skips your stop."
      : "Nobody marked absent on " + date + " \u2014 both children ride as usual.";
  }
  renderAbsence();
  el("absence-date").addEventListener("change", renderAbsence);
  el("absence-date").addEventListener("input", renderAbsence);

  function renderSavedAlerts() {
    var box = el("saved-alerts");
    box.innerHTML = "";
    if (!savedAlerts.length) {
      box.innerHTML = "<p>No alert signups yet on this device. Ayesha's fog alerts for VP-2026-011 are on in the sample.</p>";
      return;
    }
    savedAlerts.forEach(function (s) {
      var div = document.createElement("div");
      div.className = "bundle";
      div.innerHTML = "<div><h3>" + s.name + "</h3><p>Fog alerts on for " + s.vanId + "</p></div>" +
        '<div class="recv">ON<span>alerts</span></div>';
      box.appendChild(div);
    });
  }
  renderSavedAlerts();

  el("alert-btn").addEventListener("click", function () {
    var name = el("alert-name-input").value || "";
    var vanId = el("alert-van-input").value || "";
    var check = L.validAlertSignup(name, vanId, VANS);
    if (!check.ok) {
      var msg = check.errors.indexOf("name") !== -1
        ? "Add your name first."
        : "That is not a sample van ID \u2014 try VP-2026-011.";
      el("alert-result").innerHTML = '<div class="alert warn"><strong>COULD NOT TURN ALERTS ON</strong><p>' +
        msg + " Sample vans: VP-2026-011 to VP-2026-020.</p></div>";
      return;
    }
    var van = check.van;
    savedAlerts.push({ name: name.trim(), vanId: van.id });
    saveJSON(STORE_ALERTS, savedAlerts);
    el("alert-result").innerHTML = '<div class="alert ok"><strong>\u2713 FOG ALERTS ON \u2014 ' +
      van.id + "</strong><p>" + name.trim() +
      " gets delay, cancellation and boarding alerts for " + van.id + " (" + van.city +
      " \u00b7 " + van.school + "). Saved on this device.</p></div>";
    renderSavedAlerts();
  });

  el("reset-demo").addEventListener("click", function () {
    boarding = { hania: true, zain: true };
    absences = {};
    savedAlerts = [];
    reports = [];
    saveJSON(STORE_BOARDING, boarding);
    saveJSON(STORE_ABSENCES, absences);
    saveJSON(STORE_ALERTS, savedAlerts);
    saveJSON(STORE_REPORTS, reports);
    el("van-select").value = "VP-2026-011";
    el("driver-van-select").value = "VP-2026-011";
    el("route-search").value = "";
    el("route-sort").value = "status";
    el("fee-km-input").value = "5.2";
    el("fee-children-input").value = "2";
    el("absence-date").value = TOMORROW;
    el("alert-name-input").value = "Ayesha";
    el("alert-van-input").value = "VP-2026-011";
    el("report-text").value = "";
    el("emergency-result").innerHTML = "";
    el("alert-result").innerHTML = "";
    showTab("tracker");
    renderTracker();
    renderRoutes();
    renderFee();
    renderDriver();
    renderReports();
    renderAlerts();
    renderAbsence();
    renderSavedAlerts();
  });
})();
