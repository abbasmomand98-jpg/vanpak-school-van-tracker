// VanPak — pure logic, no DOM here, so it can be unit-tested in Node.
(function (root) {
  // Pakistani (Indian-system) grouping, matching the figures used in
  // the mockups, slides and copy: 6500 -> "6,500", 13000 -> "13,000",
  // 4500 -> "4,500", 9000 -> "9,000". Last three digits, then groups of two.
  function formatPKR(n) {
    var s = String(Math.round(n));
    if (s.length <= 3) return s;
    var last3 = s.slice(-3);
    var rest = s.slice(0, -3);
    var parts = [];
    while (rest.length > 2) { parts.unshift(rest.slice(-2)); rest = rest.slice(0, -2); }
    if (rest) parts.unshift(rest);
    return parts.join(",") + "," + last3;
  }

  // Monthly fee for a distance, from the fee tiers.
  //   2.6 km -> Rs 4,500; 3.0 km -> Rs 4,500; 5.2 km -> Rs 6,500;
  //   7.4 km -> Rs 8,000; 11.5 km -> Rs 9,000.
  // Negative or missing distances are treated as 0 km.
  function feeForDistance(km, tiers) {
    var d = Math.max(0, Number(km) || 0);
    var fee = tiers[tiers.length - 1].fee;
    for (var i = 0; i < tiers.length; i++) {
      if (d <= tiers[i].maxKm) { fee = tiers[i].fee; break; }
    }
    return fee;
  }
  function feeTierFor(km, tiers) {
    var d = Math.max(0, Number(km) || 0);
    var tier = tiers[tiers.length - 1];
    for (var i = 0; i < tiers.length; i++) {
      if (d <= tiers[i].maxKm) { tier = tiers[i]; break; }
    }
    return tier;
  }

  // Monthly fee for a family: per child times the number of children.
  //   Ayesha: 5.2 km, 2 children -> Rs 6,500 each, Rs 13,000 total.
  //   1 child at 2.6 km -> Rs 4,500 total.
  function monthlyFee(km, childCount, tiers) {
    var perChild = feeForDistance(km, tiers);
    var n = Math.max(0, Math.floor(Number(childCount) || 0));
    return { km: Math.max(0, Number(km) || 0), children: n,
             perChild: perChild, total: perChild * n,
             tier: feeTierFor(km, tiers) };
  }

  // A cancelled day earns a fee credit: one school day out of 22.
  //   Rs 6,500 a month -> Rs 295 credit for the cancelled day.
  //   Rs 4,500 a month -> Rs 205 credit.
  function feeCredit(monthly) {
    return Math.round((Number(monthly) || 0) / 22);
  }

  // Van ID format: VP-YYYY-NNN, e.g. VP-2026-011.
  function validVanId(raw) {
    return /^VP-\d{4}-\d{3}$/.test(String(raw || "").trim().toUpperCase());
  }

  // Find a sample van by ID (case-insensitive, trims spaces).
  // "vp-2026-011" finds the Lahore Gulberg van;
  // "VP-2026-999" finds nothing.
  function findVan(vans, raw) {
    var q = String(raw || "").trim().toUpperCase();
    if (!validVanId(q)) return null;
    var found = null;
    vans.forEach(function (v) {
      if (v.id.toUpperCase() === q) found = v;
    });
    return found;
  }

  // Van lookup: distinguishes a valid ID with no sample record
  // from a malformed ID, so the page can say the right thing.
  //   "VP-2026-011" -> { kind: "found", van: the Gulberg van }.
  //   "VP-2026-999" -> { kind: "not-found" }.
  //   "011" -> { kind: "invalid" }.
  function lookupVan(vans, raw) {
    var q = String(raw || "").trim();
    if (!q) return { kind: "empty" };
    if (!validVanId(q)) return { kind: "invalid" };
    var found = findVan(vans, q);
    if (!found) return { kind: "not-found" };
    return { kind: "found", van: found };
  }

  // How far along the route the van is, from its current position.
  //   VP-2026-011: 3.2 of 5.2 km -> 62%.
  //   A cancelled van (0 km) -> 0%.
  function progressPct(van) {
    if (!van || !van.km) return 0;
    return Math.round(Math.max(0, Math.min(1, van.currentKm / van.km)) * 100);
  }

  // Stops already passed, and the next stop on the route.
  //   VP-2026-011: 2 passed, next is Main Boulevard.
  //   VP-2026-016 (cancelled): 0 passed, no next stop.
  function stopsPassed(van) {
    if (!van) return 0;
    var n = 0;
    van.stops.forEach(function (s) { if (s.passed) n++; });
    return n;
  }
  function nextStop(van) {
    if (!van) return null;
    var found = null;
    van.stops.forEach(function (s) {
      if (!found && !s.passed) found = s;
    });
    return found;
  }

  // Boarding summary for Ayesha's children.
  //   Both boarded -> "2 of 2 on board".
  //   One boarded -> "1 of 2 on board".
  function boardingSummary(children, boarded) {
    var on = 0;
    children.forEach(function (c) { if (boarded[c.id]) on++; });
    return { onBoard: on, total: children.length,
             text: on + " of " + children.length + " on board",
             allOnBoard: on === children.length && children.length > 0 };
  }

  // Absence marking: absences is a plain object keyed "childId|date".
  // toggleAbsence returns a NEW object with the entry flipped.
  //   Mark Hania absent 25 Nov 2026 -> key "hania|2026-11-25" is true.
  //   Toggle again -> the key is gone.
  function absenceKey(childId, date) {
    return String(childId) + "|" + String(date);
  }
  function isAbsent(absences, childId, date) {
    return !!absences[absenceKey(childId, date)];
  }
  function toggleAbsence(absences, childId, date) {
    var out = {};
    Object.keys(absences).forEach(function (k) { out[k] = absences[k]; });
    var key = absenceKey(childId, date);
    if (out[key]) delete out[key];
    else out[key] = true;
    return out;
  }
  function absentChildren(children, absences, date) {
    return children.filter(function (c) { return isAbsent(absences, c.id, date); });
  }

  // Alert signup validation: a parent name and a real sample van ID.
  //   ("Ayesha", "VP-2026-011") -> ok.
  //   ("", "VP-2026-011") -> not ok, name error.
  //   ("Ayesha", "VP-2026-999") -> not ok, van error.
  function validAlertSignup(name, vanId, vans) {
    var errors = [];
    if (!String(name || "").trim()) errors.push("name");
    var van = findVan(vans, vanId);
    if (!van) errors.push("van");
    return { ok: errors.length === 0, errors: errors, van: van || null };
  }

  // Search vans by city, school, area or van ID, case-insensitive.
  //   "lahore" -> VP-2026-011, VP-2026-012, VP-2026-017.
  //   "gulberg" -> VP-2026-011, VP-2026-017.
  //   "" -> all vans.
  function filterVans(vans, query) {
    var q = String(query || "").trim().toLowerCase();
    if (!q) return vans.slice();
    return vans.filter(function (v) {
      return (v.city + " " + v.school + " " + v.area + " " + v.id + " " + v.driver)
        .toLowerCase().indexOf(q) !== -1;
    });
  }

  // Sort vans: delayed and cancelled first (the ones a parent
  // checks first on a fog morning), then on-time vans by city.
  function sortVans(vans, mode) {
    var copy = vans.slice();
    var rank = { "CANCELLED": 0, "DELAYED": 1, "ON TIME": 2 };
    if (mode === "fee") {
      copy.sort(function (a, b) { return a.fee - b.fee; });
    } else if (mode === "city") {
      copy.sort(function (a, b) {
        return a.city < b.city ? -1 : (a.city > b.city ? 1 : 0);
      });
    } else {
      copy.sort(function (a, b) {
        var ra = rank.hasOwnProperty(a.status) ? rank[a.status] : 9;
        var rb = rank.hasOwnProperty(b.status) ? rank[b.status] : 9;
        var r = ra - rb;
        if (r !== 0) return r;
        return b.delayMin - a.delayMin;
      });
    }
    return copy;
  }

  // Count vans by status, for the morning summary.
  //   10 vans: 5 on time, 4 delayed, 1 cancelled.
  function countByStatus(vans) {
    var out = { "ON TIME": 0, "DELAYED": 0, "CANCELLED": 0 };
    vans.forEach(function (v) {
      if (out.hasOwnProperty(v.status)) out[v.status]++;
    });
    out.total = vans.length;
    return out;
  }

  var api = { formatPKR: formatPKR,
              feeForDistance: feeForDistance,
              feeTierFor: feeTierFor,
              monthlyFee: monthlyFee,
              feeCredit: feeCredit,
              validVanId: validVanId,
              findVan: findVan,
              lookupVan: lookupVan,
              progressPct: progressPct,
              stopsPassed: stopsPassed,
              nextStop: nextStop,
              boardingSummary: boardingSummary,
              absenceKey: absenceKey,
              isAbsent: isAbsent,
              toggleAbsence: toggleAbsence,
              absentChildren: absentChildren,
              validAlertSignup: validAlertSignup,
              filterVans: filterVans,
              sortVans: sortVans,
              countByStatus: countByStatus };
  if (typeof module !== "undefined") { module.exports = api; }
  else { root.VanPakLogic = api; }
})(typeof window !== "undefined" ? window : globalThis);
