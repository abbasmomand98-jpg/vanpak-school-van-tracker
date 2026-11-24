// VanPak — School Van Live Tracker & Safety (UX Concept).
// IMPORTANT: every van, time, fare, driver, school and child below is SAMPLE
// data invented for this UX concept demo. These are NOT real vans, real
// drivers, real children or real fares. The school names are real
// institutions used as sample examples, not partners. No real CNIC
// numbers and no phone numbers appear anywhere.

// FEE TIERS — monthly fee per child, by home-to-school distance.
//   0-3 km Rs 4,500; 3-6 km Rs 6,500; 6-10 km Rs 8,000; 10+ km Rs 9,000.
//   Ayesha: 5.2 km -> Rs 6,500 per child; 2 children = Rs 13,000 a month.
//   Paid 1 Nov 2026 via JazzCash, receipt VPR-2026-1187, next due 1 Dec 2026.
var FEE_TIERS = [
  { maxKm: 3, fee: 4500, label: "0\u20133 km" },
  { maxKm: 6, fee: 6500, label: "3\u20136 km" },
  { maxKm: 10, fee: 8000, label: "6\u201310 km" },
  { maxKm: Infinity, fee: 9000, label: "10+ km" }
];

// CHILDREN — Ayesha's two children, both on van VP-2026-011.
var CHILDREN = [
  { id: "hania", name: "Hania", age: 10, vanId: "VP-2026-011" },
  { id: "zain", name: "Zain", age: 7, vanId: "VP-2026-011" }
];

// PERSONA: Ayesha, 34, Lahore, mother of Hania (10) and Zain (7).
// Illustrative proto-persona — a design hypothesis, not an interviewed
// participant.
var PERSONA = { name: "Ayesha", age: 34, city: "Lahore",
  children: ["Hania", "Zain"], vanId: "VP-2026-011",
  distanceKm: 5.2, feePerChild: 6500, childrenCount: 2,
  monthlyTotal: 13000 };

// RECEIPT — November 2026 fee for Ayesha's two children.
var RECEIPT = { id: "VPR-2026-1187", month: "November 2026",
  amount: 13000, paidOn: "1 Nov 2026", method: "JazzCash",
  nextDue: "1 Dec 2026" };

// VANS — 10 sample vans across Lahore, Karachi, Islamabad, Rawalpindi,
// Peshawar and Multan. Status: ON TIME, DELAYED (fog) or CANCELLED (fog).
//   VP-2026-011 Lahore: 25 min late in dense fog, ETA 8:10 AM (was 7:45).
//   VP-2026-016 Peshawar: CANCELLED, dense fog, fee credit for today.
var VANS = [
  { id: "VP-2026-011", city: "Lahore", school: "The City School \u2014 Gulberg Campus",
    area: "Gulberg III", driver: "Bilal Ahmed", driverYears: 8,
    rating: 4.9, rides: 128, km: 5.2, fee: 6500, status: "DELAYED",
    delayMin: 25, eta: "8:10 AM", schedEta: "7:45 AM", children: 12,
    currentKm: 3.2, van: "Suzuki Bolan 2021 \u00b7 White",
    reg: "LHR-24-1187",
    stops: [
      { name: "Home \u2014 Gulberg III", time: "7:10 AM", passed: true, note: "Picked up 7:35 AM", km: 0 },
      { name: "Liberty Market", time: "7:18 AM", passed: true, note: "Passed 7:52 AM", km: 1.8 },
      { name: "Main Boulevard", time: "7:26 AM", passed: false, note: "Next stop \u00b7 4 min away", km: 3.6 },
      { name: "The City School, Gulberg", time: "7:45 AM", passed: false, note: "ETA 8:10 AM", km: 5.2 }
    ] },
  { id: "VP-2026-012", city: "Lahore", school: "Beaconhouse \u2014 Johar Town Campus",
    area: "Johar Town", driver: "Usman Tariq", driverYears: 6,
    rating: 4.8, rides: 96, km: 7.4, fee: 8000, status: "DELAYED",
    delayMin: 35, eta: "8:25 AM", schedEta: "7:50 AM", children: 14,
    currentKm: 4.6, van: "Suzuki Bolan 2020 \u00b7 White",
    reg: "LHR-19-2044",
    stops: [
      { name: "Home \u2014 Johar Town", time: "7:05 AM", passed: true, note: "Picked up 7:30 AM", km: 0 },
      { name: "Allah Hu Chowk", time: "7:14 AM", passed: true, note: "Passed 7:48 AM", km: 2.1 },
      { name: "Model Town Link Road", time: "7:24 AM", passed: false, note: "Next stop \u00b7 6 min away", km: 4.4 },
      { name: "Beaconhouse, Johar Town", time: "7:50 AM", passed: false, note: "ETA 8:25 AM", km: 7.4 }
    ] },
  { id: "VP-2026-013", city: "Karachi", school: "The City School \u2014 Clifton Campus",
    area: "Clifton Block 4", driver: "Naveed Akhtar", driverYears: 10,
    rating: 4.9, rides: 210, km: 6.8, fee: 8000, status: "ON TIME",
    delayMin: 0, eta: "7:50 AM", schedEta: "7:50 AM", children: 11,
    currentKm: 4.2, van: "Toyota Hiace 2019 \u00b7 White",
    reg: "KHI-22-7710",
    stops: [
      { name: "Home \u2014 Clifton Block 4", time: "7:15 AM", passed: true, note: "Picked up 7:15 AM", km: 0 },
      { name: "Boat Basin", time: "7:22 AM", passed: true, note: "Passed 7:22 AM", km: 1.9 },
      { name: "Teen Talwar", time: "7:30 AM", passed: false, note: "Next stop \u00b7 5 min away", km: 3.9 },
      { name: "The City School, Clifton", time: "7:50 AM", passed: false, note: "ETA 7:50 AM", km: 6.8 }
    ] },
  { id: "VP-2026-014", city: "Islamabad", school: "Beaconhouse \u2014 F-7 Campus",
    area: "F-7/2", driver: "Imran Shah", driverYears: 7,
    rating: 4.7, rides: 88, km: 11.5, fee: 9000, status: "DELAYED",
    delayMin: 50, eta: "8:30 AM", schedEta: "7:40 AM", children: 13,
    currentKm: 7.1, van: "Toyota Hiace 2018 \u00b7 White",
    reg: "ICT-21-5523",
    stops: [
      { name: "Home \u2014 F-7/2", time: "7:00 AM", passed: true, note: "Picked up 7:25 AM", km: 0 },
      { name: "Jinnah Super Market", time: "7:10 AM", passed: true, note: "Passed 7:44 AM", km: 3.2 },
      { name: "Faisal Avenue", time: "7:20 AM", passed: false, note: "Next stop \u00b7 8 min away", km: 6.8 },
      { name: "Beaconhouse, F-7", time: "7:40 AM", passed: false, note: "ETA 8:30 AM", km: 11.5 }
    ] },
  { id: "VP-2026-015", city: "Rawalpindi", school: "Army Public School \u2014 Westridge",
    area: "Westridge", driver: "Shahid Mehmood", driverYears: 9,
    rating: 4.8, rides: 154, km: 4.1, fee: 6500, status: "ON TIME",
    delayMin: 0, eta: "7:40 AM", schedEta: "7:40 AM", children: 10,
    currentKm: 2.5, van: "Suzuki Bolan 2021 \u00b7 White",
    reg: "RWP-23-9081",
    stops: [
      { name: "Home \u2014 Westridge", time: "7:05 AM", passed: true, note: "Picked up 7:05 AM", km: 0 },
      { name: "Harley Street", time: "7:12 AM", passed: true, note: "Passed 7:12 AM", km: 1.2 },
      { name: "The Mall", time: "7:20 AM", passed: false, note: "Next stop \u00b7 3 min away", km: 2.4 },
      { name: "Army Public School, Westridge", time: "7:40 AM", passed: false, note: "ETA 7:40 AM", km: 4.1 }
    ] },
  { id: "VP-2026-016", city: "Peshawar", school: "Peshawar Model School \u2014 Hayatabad",
    area: "Hayatabad Phase 2", driver: "Gul Nawaz", driverYears: 5,
    rating: 4.6, rides: 61, km: 3.0, fee: 4500, status: "CANCELLED",
    delayMin: 0, eta: "Cancelled", schedEta: "7:45 AM", children: 12,
    currentKm: 0, van: "Suzuki Bolan 2020 \u00b7 White",
    reg: "PEW-20-3356",
    stops: [
      { name: "Home \u2014 Hayatabad Phase 2", time: "7:10 AM", passed: false, note: "Cancelled \u2014 dense fog", km: 0 },
      { name: "Hayatabad Phase 1", time: "7:18 AM", passed: false, note: "Cancelled \u2014 dense fog", km: 1.1 },
      { name: "Tatara Park", time: "7:26 AM", passed: false, note: "Cancelled \u2014 dense fog", km: 2.0 },
      { name: "Peshawar Model School, Hayatabad", time: "7:45 AM", passed: false, note: "Cancelled \u2014 dense fog", km: 3.0 }
    ] },
  { id: "VP-2026-017", city: "Lahore", school: "Lahore Grammar School \u2014 Gulberg",
    area: "Gulberg V", driver: "Rana Faisal", driverYears: 11,
    rating: 4.9, rides: 187, km: 4.8, fee: 6500, status: "ON TIME",
    delayMin: 0, eta: "7:45 AM", schedEta: "7:45 AM", children: 12,
    currentKm: 3.0, van: "Toyota Hiace 2019 \u00b7 White",
    reg: "LHR-18-4419",
    stops: [
      { name: "Home \u2014 Gulberg V", time: "7:10 AM", passed: true, note: "Picked up 7:10 AM", km: 0 },
      { name: "Zahoor Elahi Road", time: "7:16 AM", passed: true, note: "Passed 7:16 AM", km: 1.4 },
      { name: "Main Boulevard", time: "7:24 AM", passed: false, note: "Next stop \u00b7 4 min away", km: 2.8 },
      { name: "Lahore Grammar School, Gulberg", time: "7:45 AM", passed: false, note: "ETA 7:45 AM", km: 4.8 }
    ] },
  { id: "VP-2026-018", city: "Karachi", school: "Karachi Grammar School \u2014 Saddar",
    area: "Saddar", driver: "Abdul Rehman", driverYears: 8,
    rating: 4.8, rides: 132, km: 8.9, fee: 8000, status: "DELAYED",
    delayMin: 25, eta: "8:10 AM", schedEta: "7:45 AM", children: 15,
    currentKm: 5.5, van: "Toyota Hiace 2020 \u00b7 White",
    reg: "KHI-21-6678",
    stops: [
      { name: "Home \u2014 Saddar", time: "7:05 AM", passed: true, note: "Picked up 7:28 AM", km: 0 },
      { name: "Empress Market", time: "7:12 AM", passed: true, note: "Passed 7:40 AM", km: 2.4 },
      { name: "M.A. Jinnah Road", time: "7:22 AM", passed: false, note: "Next stop \u00b7 6 min away", km: 5.1 },
      { name: "Karachi Grammar School, Saddar", time: "7:45 AM", passed: false, note: "ETA 8:10 AM", km: 8.9 }
    ] },
  { id: "VP-2026-019", city: "Islamabad", school: "Roots Millennium \u2014 I-8 Campus",
    area: "I-8/1", driver: "Tariq Aziz", driverYears: 6,
    rating: 4.7, rides: 74, km: 6.2, fee: 8000, status: "ON TIME",
    delayMin: 0, eta: "7:50 AM", schedEta: "7:50 AM", children: 9,
    currentKm: 3.8, van: "Suzuki Bolan 2021 \u00b7 White",
    reg: "ICT-22-1187",
    stops: [
      { name: "Home \u2014 I-8/1", time: "7:12 AM", passed: true, note: "Picked up 7:12 AM", km: 0 },
      { name: "I-8 Markaz", time: "7:18 AM", passed: true, note: "Passed 7:18 AM", km: 1.7 },
      { name: "Ninth Avenue", time: "7:26 AM", passed: false, note: "Next stop \u00b7 4 min away", km: 3.5 },
      { name: "Roots Millennium, I-8", time: "7:50 AM", passed: false, note: "ETA 7:50 AM", km: 6.2 }
    ] },
  { id: "VP-2026-020", city: "Multan", school: "The City School \u2014 Bosan Road",
    area: "Bosan Road", driver: "Muhammad Asif", driverYears: 7,
    rating: 4.8, rides: 103, km: 2.6, fee: 4500, status: "ON TIME",
    delayMin: 0, eta: "7:35 AM", schedEta: "7:35 AM", children: 10,
    currentKm: 1.6, van: "Suzuki Bolan 2020 \u00b7 White",
    reg: "MUL-23-7745",
    stops: [
      { name: "Home \u2014 Bosan Road", time: "7:00 AM", passed: true, note: "Picked up 7:00 AM", km: 0 },
      { name: "Gulgasht Colony", time: "7:08 AM", passed: true, note: "Passed 7:08 AM", km: 0.9 },
      { name: "Abdali Road", time: "7:16 AM", passed: false, note: "Next stop \u00b7 3 min away", km: 1.5 },
      { name: "The City School, Bosan Road", time: "7:35 AM", passed: false, note: "ETA 7:35 AM", km: 2.6 }
    ] }
];

// ALERTS — today's sample alerts for Ayesha's van.
var ALERTS = [
  { id: "fog-011", kind: "delay", time: "7:32 AM", vanId: "VP-2026-011",
    title: "FOG DELAY \u2014 VP-2026-011",
    body: "Running 25 min late. ETA school 8:10 AM \u2014 was 7:45 AM." },
  { id: "cancel-016", kind: "cancel", time: "6:50 AM", vanId: "VP-2026-016",
    title: "VAN CANCELLED \u2014 VP-2026-016",
    body: "Peshawar \u2014 Hayatabad route. Dense fog. Fee credit for today." },
  { id: "receipt-nov", kind: "receipt", time: "1 Nov 2026", vanId: "VP-2026-011",
    title: "FEE RECEIPT \u2014 NOV 2026 \u00b7 PAID",
    body: "Rs 13,000 paid 1 Nov via JazzCash. Receipt VPR-2026-1187 \u00b7 next due 1 Dec." }
];

// FOG NOTE — the winter fog-season note shown on the tracker.
var FOG_NOTE = "Dense fog in Lahore today \u2014 vans may run 20\u201340 min late.";

if (typeof module !== "undefined") {
  module.exports = { FEE_TIERS: FEE_TIERS, CHILDREN: CHILDREN,
    PERSONA: PERSONA, RECEIPT: RECEIPT, VANS: VANS,
    ALERTS: ALERTS, FOG_NOTE: FOG_NOTE };
}
