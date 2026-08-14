// ============================================================
// WasteWise AI — Demo Data (Simulated Gujarat Municipal Data)
// All data is SIMULATED for hackathon demonstration only.
// ============================================================

const DEMO_WARDS = [
  {
    id: 1, name: "Ward 1 – Maninagar", zone: "East",
    wasteGenerated: 18.4, wasteCollected: 17.1, segregationPct: 82,
    complaints: 12, resolvedComplaints: 9, missedCollections: 3,
    routeEfficiency: 88, vehicles: ["V-01", "V-02"], population: 24500,
    wetWastePct: 48, dryWastePct: 38, hazardousPct: 4, mixedPct: 10
  },
  {
    id: 2, name: "Ward 2 – Navrangpura", zone: "Central",
    wasteGenerated: 22.6, wasteCollected: 21.8, segregationPct: 91,
    complaints: 6, resolvedComplaints: 6, missedCollections: 1,
    routeEfficiency: 95, vehicles: ["V-03", "V-04"], population: 31200,
    wetWastePct: 45, dryWastePct: 42, hazardousPct: 3, mixedPct: 10
  },
  {
    id: 3, name: "Ward 3 – Satellite", zone: "West",
    wasteGenerated: 26.1, wasteCollected: 24.9, segregationPct: 87,
    complaints: 9, resolvedComplaints: 7, missedCollections: 2,
    routeEfficiency: 91, vehicles: ["V-05", "V-06"], population: 38400,
    wetWastePct: 43, dryWastePct: 44, hazardousPct: 5, mixedPct: 8
  },
  {
    id: 4, name: "Ward 4 – Vatva", zone: "South-East",
    wasteGenerated: 31.2, wasteCollected: 27.4, segregationPct: 58,
    complaints: 28, resolvedComplaints: 14, missedCollections: 8,
    routeEfficiency: 72, vehicles: ["V-07", "V-08", "V-09"], population: 52100,
    wetWastePct: 40, dryWastePct: 30, hazardousPct: 8, mixedPct: 22
  },
  {
    id: 5, name: "Ward 5 – Gota", zone: "North",
    wasteGenerated: 19.8, wasteCollected: 18.0, segregationPct: 74,
    complaints: 18, resolvedComplaints: 11, missedCollections: 6,
    routeEfficiency: 79, vehicles: ["V-10", "V-11"], population: 29700,
    wetWastePct: 46, dryWastePct: 36, hazardousPct: 4, mixedPct: 14
  },
  {
    id: 6, name: "Ward 6 – Bopal", zone: "West",
    wasteGenerated: 17.3, wasteCollected: 16.8, segregationPct: 89,
    complaints: 7, resolvedComplaints: 7, missedCollections: 1,
    routeEfficiency: 93, vehicles: ["V-12"], population: 21800,
    wetWastePct: 47, dryWastePct: 41, hazardousPct: 3, mixedPct: 9
  },
  {
    id: 7, name: "Ward 7 – Naroda", zone: "North-East",
    wasteGenerated: 28.9, wasteCollected: 24.6, segregationPct: 62,
    complaints: 23, resolvedComplaints: 12, missedCollections: 7,
    routeEfficiency: 74, vehicles: ["V-13", "V-14"], population: 45600,
    wetWastePct: 41, dryWastePct: 31, hazardousPct: 7, mixedPct: 21
  },
  {
    id: 8, name: "Ward 8 – Paldi", zone: "South",
    wasteGenerated: 15.6, wasteCollected: 15.2, segregationPct: 93,
    complaints: 4, resolvedComplaints: 4, missedCollections: 0,
    routeEfficiency: 97, vehicles: ["V-15"], population: 18900,
    wetWastePct: 49, dryWastePct: 43, hazardousPct: 3, mixedPct: 5
  }
];

const DEMO_VEHICLES = [
  { id: "V-01", type: "Compactor", capacity: 5, ward: 1, status: "active", lat: 23.0225, lng: 72.5714 },
  { id: "V-02", type: "Auto-Tipper", capacity: 2, ward: 1, status: "active", lat: 23.0190, lng: 72.5780 },
  { id: "V-03", type: "Compactor", capacity: 5, ward: 2, status: "active", lat: 23.0369, lng: 72.5568 },
  { id: "V-04", type: "Auto-Tipper", capacity: 2, ward: 2, status: "maintenance", lat: 23.0400, lng: 72.5600 },
  { id: "V-05", type: "Compactor", capacity: 7, ward: 3, status: "active", lat: 23.0307, lng: 72.5090 },
  { id: "V-06", type: "Auto-Tipper", capacity: 2, ward: 3, status: "active", lat: 23.0280, lng: 72.5150 },
  { id: "V-07", type: "Compactor", capacity: 7, ward: 4, status: "active", lat: 22.9784, lng: 72.6517 },
  { id: "V-08", type: "Compactor", capacity: 7, ward: 4, status: "active", lat: 22.9720, lng: 72.6480 },
  { id: "V-09", type: "Auto-Tipper", capacity: 2, ward: 4, status: "breakdown", lat: 22.9800, lng: 72.6550 },
  { id: "V-10", type: "Compactor", capacity: 5, ward: 5, status: "active", lat: 23.1119, lng: 72.5460 },
  { id: "V-11", type: "Auto-Tipper", capacity: 2, ward: 5, status: "active", lat: 23.1080, lng: 72.5500 },
  { id: "V-12", type: "Compactor", capacity: 5, ward: 6, status: "active", lat: 23.0336, lng: 72.4696 },
  { id: "V-13", type: "Compactor", capacity: 7, ward: 7, status: "active", lat: 23.0840, lng: 72.6491 },
  { id: "V-14", type: "Auto-Tipper", capacity: 2, ward: 7, status: "active", lat: 23.0800, lng: 72.6450 },
  { id: "V-15", type: "Compactor", capacity: 5, ward: 8, status: "active", lat: 23.0098, lng: 72.5850 }
];

const DEMO_COMPLAINTS = [
  { id: "GRV-001", type: "Missed Collection", ward: 5, area: "Gota Cross Roads", priority: "High", status: "Open", date: "2026-08-12", description: "Garbage not collected for 3 days" },
  { id: "GRV-002", type: "Overflowing Bin", ward: 4, area: "Vatva GIDC Gate 2", priority: "High", status: "In Progress", date: "2026-08-13", description: "Roadside bin overflowing near market" },
  { id: "GRV-003", type: "Illegal Dumping", ward: 7, area: "Naroda Patiya Road", priority: "Medium", status: "Open", date: "2026-08-11", description: "Construction waste dumped illegally" },
  { id: "GRV-004", type: "Missed Collection", ward: 7, area: "Naroda Sector 12", priority: "High", status: "Open", date: "2026-08-13", description: "No collection since 4 days" },
  { id: "GRV-005", type: "Street Cleanliness", ward: 1, area: "Maninagar Main Road", priority: "Low", status: "Resolved", date: "2026-08-10", description: "Litter near bus stop" },
  { id: "GRV-006", type: "Vehicle Not Arrived", ward: 5, area: "Gota Flyover Area", priority: "Medium", status: "Open", date: "2026-08-14", description: "Morning collection vehicle missed" },
  { id: "GRV-007", type: "E-Waste", ward: 3, area: "Satellite Sachin Tower", priority: "Low", status: "Resolved", date: "2026-08-09", description: "Old electronics disposal request" },
  { id: "GRV-008", type: "Overflowing Bin", ward: 4, area: "Vatva Industrial Area", priority: "High", status: "Open", date: "2026-08-14", description: "Industrial waste bin overflowing" }
];

const DEMO_ROUTES = {
  4: {
    vehicleId: "V-07",
    zones: [
      { name: "Zone A – Vatva GIDC", waste: 8.2, priority: "High", missed: true, lat: 22.978, lng: 72.651 },
      { name: "Zone B – Vatva Market", waste: 6.1, priority: "High", missed: false, lat: 22.975, lng: 72.648 },
      { name: "Zone C – Vatva Residential", waste: 4.9, priority: "Medium", missed: false, lat: 22.981, lng: 72.655 },
      { name: "Zone D – Vatva School Area", waste: 3.2, priority: "Low", missed: false, lat: 22.970, lng: 72.643 }
    ],
    optimizedOrder: [0, 1, 2, 3],
    estimatedTime: "4h 20min",
    estimatedDistance: "18.4 km"
  },
  5: {
    vehicleId: "V-10",
    zones: [
      { name: "Zone A – Gota Cross Roads", waste: 5.8, priority: "High", missed: true, lat: 23.112, lng: 72.546 },
      { name: "Zone B – Gota Flyover", waste: 4.2, priority: "Medium", missed: true, lat: 23.110, lng: 72.548 },
      { name: "Zone C – Gota Residential", waste: 3.9, priority: "Medium", missed: false, lat: 23.108, lng: 72.543 },
      { name: "Zone D – Gota Market", waste: 2.7, priority: "Low", missed: false, lat: 23.115, lng: 72.550 }
    ],
    optimizedOrder: [0, 1, 2, 3],
    estimatedTime: "3h 10min",
    estimatedDistance: "12.6 km"
  },
  7: {
    vehicleId: "V-13",
    zones: [
      { name: "Zone A – Naroda Sector 12", waste: 7.4, priority: "High", missed: true, lat: 23.083, lng: 72.649 },
      { name: "Zone B – Naroda Patiya", waste: 6.8, priority: "High", missed: false, lat: 23.080, lng: 72.645 },
      { name: "Zone C – Naroda Market", waste: 5.1, priority: "Medium", missed: false, lat: 23.086, lng: 72.652 },
      { name: "Zone D – Naroda Residential", waste: 3.8, priority: "Low", missed: false, lat: 23.077, lng: 72.641 }
    ],
    optimizedOrder: [0, 1, 2, 3],
    estimatedTime: "4h 45min",
    estimatedDistance: "19.8 km"
  }
};

const SYSTEM_STATS = {
  totalWasteCollectedToday: 165.8,
  overallSegregationRate: 79.5,
  activeVehicles: 13,
  totalVehicles: 15,
  pendingComplaints: 6,
  resolvedComplaints: 2,
  totalComplaints: 8,
  collectionEfficiency: 89.2,
  date: "14 August 2026 (Demo Data)"
};

module.exports = { DEMO_WARDS, DEMO_VEHICLES, DEMO_COMPLAINTS, DEMO_ROUTES, SYSTEM_STATS };
