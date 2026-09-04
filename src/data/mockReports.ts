import { Report } from '../types';

export const CITIES = ['All Cities', 'Indore', 'Ujjain', 'Bhopal'];
export const CITY_LIST = ['Indore', 'Ujjain', 'Bhopal'];

export const DEPARTMENTS = [
  { id: 'PWD',  name: 'PWD',  fullName: 'Public Works Department',      type: 'road',        color: 'bg-blue-100 text-blue-800'   },
  { id: 'MSWM', name: 'MSWM', fullName: 'Municipal Solid Waste Mgmt',   type: 'garbage',     color: 'bg-green-100 text-green-800' },
  { id: 'MVB',  name: 'MVB',  fullName: 'Municipal Water Board',        type: 'water',       color: 'bg-cyan-100 text-cyan-800'   },
  { id: 'USLD', name: 'USLD', fullName: 'Urban Street Light Department', type: 'streetlight', color: 'bg-yellow-100 text-yellow-800'},
];

// ── Account credentials ─────────────────────────────────────────────────────
export const ADMIN_ACCOUNTS: Record<string, { city: string; password: string; name: string }> = {
  'admin.indore@nagarsetu.gov.in': { city: 'Indore', password: 'admin123', name: 'Indore City Admin' },
  'admin.ujjain@nagarsetu.gov.in': { city: 'Ujjain', password: 'admin123', name: 'Ujjain City Admin' },
  'admin.bhopal@nagarsetu.gov.in': { city: 'Bhopal', password: 'admin123', name: 'Bhopal City Admin' },
};

export const STAFF_ACCOUNTS: Record<string, { city: string; dept: string; password: string; name: string }> = {
  'pwd.indore@nagarsetu.gov.in':   { city: 'Indore', dept: 'PWD',  password: 'staff123', name: 'PWD Indore'  },
  'mswm.indore@nagarsetu.gov.in':  { city: 'Indore', dept: 'MSWM', password: 'staff123', name: 'MSWM Indore' },
  'water.indore@nagarsetu.gov.in': { city: 'Indore', dept: 'MVB',  password: 'staff123', name: 'MVB Indore'  },
  'lights.indore@nagarsetu.gov.in':{ city: 'Indore', dept: 'USLD', password: 'staff123', name: 'USLD Indore' },
  'pwd.ujjain@nagarsetu.gov.in':   { city: 'Ujjain', dept: 'PWD',  password: 'staff123', name: 'PWD Ujjain'  },
  'mswm.ujjain@nagarsetu.gov.in':  { city: 'Ujjain', dept: 'MSWM', password: 'staff123', name: 'MSWM Ujjain' },
  'water.ujjain@nagarsetu.gov.in': { city: 'Ujjain', dept: 'MVB',  password: 'staff123', name: 'MVB Ujjain'  },
  'lights.ujjain@nagarsetu.gov.in':{ city: 'Ujjain', dept: 'USLD', password: 'staff123', name: 'USLD Ujjain' },
  'pwd.bhopal@nagarsetu.gov.in':   { city: 'Bhopal', dept: 'PWD',  password: 'staff123', name: 'PWD Bhopal'  },
  'mswm.bhopal@nagarsetu.gov.in':  { city: 'Bhopal', dept: 'MSWM', password: 'staff123', name: 'MSWM Bhopal' },
  'water.bhopal@nagarsetu.gov.in': { city: 'Bhopal', dept: 'MVB',  password: 'staff123', name: 'MVB Bhopal'  },
  'lights.bhopal@nagarsetu.gov.in':{ city: 'Bhopal', dept: 'USLD', password: 'staff123', name: 'USLD Bhopal' },
};

// ── Seed complaints ──────────────────────────────────────────────────────────
export const allCityReports: Report[] = [

  // ── INDORE ─────────────────────────────────────────────────────────────────
  {
    id: 's1', title: 'Large pothole on AB Road near Palasia',
    description: 'A deep pothole near Palasia square is causing accidents daily. Multiple vehicles have been damaged.',
    imageUrl: 'https://www.transpoco.com/hubfs/the_pothole_problem_1%2C000%2C000%20reports%20every%20year%20(one%20every%20two%20minutes).png?w=400',
    media: [{ id: 's1-1', type: 'image', url: 'https://www.transpoco.com/hubfs/the_pothole_problem_1%2C000%2C000%20reports%20every%20year%20(one%20every%20two%20minutes).png?w=400' }],
    district: 'Indore', ward: 'Ward 14 - Palasia', street: 'AB Road', coordinates: { lat: 22.7196, lng: 75.8577 },
    distance: 0.4, timestamp: new Date(Date.now() - 2 * 3600000), aiTag: 'Road Infrastructure', aiConfidence: 95,
    status: 'pending', upvotes: 52, comments: [{ id: 'c1', text: 'Very dangerous at night!', timestamp: new Date(), author: 'Vikram Patel' }],
    severity: 9, type: 'road', priority: 'high', hasUserUpvoted: false, assignedDept: undefined,
  },
  {
    id: 's2', title: 'Garbage not collected for 5 days - Vijay Nagar',
    description: 'Garbage bins overflowing in Vijay Nagar colony. Foul smell and disease risk for residents.',
    imageUrl: 'https://i.pinimg.com/736x/80/f3/96/80f3960217c48c2f1a8eda45ff5da35b.jpg?w=400',
    media: [{ id: 's2-1', type: 'image', url: 'https://i.pinimg.com/736x/80/f3/96/80f3960217c48c2f1a8eda45ff5da35b.jpg?w=400' }],
    district: 'Indore', ward: 'Ward 22 - Vijay Nagar', street: 'Scheme No. 54', coordinates: { lat: 22.7534, lng: 75.8934 },
    distance: 1.1, timestamp: new Date(Date.now() - 5 * 3600000), aiTag: 'Waste Management', aiConfidence: 92,
    status: 'submitted', upvotes: 38, comments: [{ id: 'c2', text: 'Kids falling sick because of this', timestamp: new Date(), author: 'Sunita Sharma' }],
    severity: 8, type: 'garbage', priority: 'high', hasUserUpvoted: false, assignedDept: 'MSWM',
  },
  {
    id: 's3', title: 'Water supply disruption - Rajendra Nagar',
    description: 'No water supply for 4 days in Rajendra Nagar. Pipeline damaged near main road.',
    imageUrl: 'https://i.pinimg.com/1200x/1f/fe/4b/1ffe4b43e9dd07dda46f73aa463883e9.jpg?w=400',
    media: [{ id: 's3-1', type: 'image', url: 'https://i.pinimg.com/1200x/1f/fe/4b/1ffe4b43e9dd07dda46f73aa463883e9.jpg?w=400' }],
    district: 'Indore', ward: 'Ward 18 - Rajendra Nagar', street: 'Rajendra Nagar Main Road', coordinates: { lat: 22.7019, lng: 75.8694 },
    distance: 2.0, timestamp: new Date(Date.now() - 96 * 3600000), aiTag: 'Water Supply', aiConfidence: 90,
    status: 'acknowledged', upvotes: 71, comments: [{ id: 'c3', text: 'IMC team please respond ASAP', timestamp: new Date(), author: 'Ramesh Gupta' }],
    severity: 10, type: 'water', priority: 'high', hasUserUpvoted: false, assignedDept: 'MVB',
  },
  {
    id: 's4', title: 'Street lights off - Bhawarkuan Square',
    description: '6 street light poles not working near Bhawarkuan for 10 days. Safety issue at night.',
    imageUrl: 'https://i.pinimg.com/1200x/90/13/ef/9013ef81025bd58455e717daaaa1934b.jpg?w=400',
    media: [{ id: 's4-1', type: 'image', url: 'https://i.pinimg.com/1200x/90/13/ef/9013ef81025bd58455e717daaaa1934b.jpg?w=400' }],
    district: 'Indore', ward: 'Ward 5 - Bhawarkuan', street: 'Bhawarkuan Square Road', coordinates: { lat: 22.6913, lng: 75.8426 },
    distance: 3.2, timestamp: new Date(Date.now() - 240 * 3600000), aiTag: 'Street Lighting', aiConfidence: 97,
    status: 'resolved', upvotes: 29, comments: [{ id: 'c4', text: 'Fixed! Thank you IMC.', timestamp: new Date(), author: 'Geeta Rao' }],
    severity: 6, type: 'streetlight', priority: 'medium', hasUserUpvoted: false, assignedDept: 'USLD',
  },
  {
    id: 's5', title: 'Drainage overflow near Sarwate Bus Stand',
    description: 'Open drain overflowing near Sarwate bus stand, waterlogging causing major inconvenience.',
    imageUrl: 'https://i.pinimg.com/1200x/2b/79/8c/2b798c30e78d360375daafa709d68270.jpg?w=400',
    media: [{ id: 's5-1', type: 'image', url: 'https://i.pinimg.com/1200x/2b/79/8c/2b798c30e78d360375daafa709d68270.jpg?w=400' }],
    district: 'Indore', ward: 'Ward 9 - Sarwate', street: 'Sarwate Road', coordinates: { lat: 22.7179, lng: 75.8376 },
    distance: 0.8, timestamp: new Date(Date.now() - 6 * 3600000), aiTag: 'Drainage System', aiConfidence: 88,
    status: 'pending', upvotes: 44, comments: [],
    severity: 8, type: 'drainage', priority: 'high', hasUserUpvoted: false, assignedDept: undefined,
  },

  // ── UJJAIN ─────────────────────────────────────────────────────────────────
  {
    id: 's6', title: 'Road damaged near Mahakal Temple approach',
    description: 'Heavy rain has damaged the road leading to Mahakal Temple. Pilgrim safety at risk.',
    imageUrl: 'https://i.pinimg.com/736x/bd/b7/e8/bdb7e8ec4259508ce023744b1aeb99fa.jpg?w=400',
    media: [{ id: 's6-1', type: 'image', url: 'https://i.pinimg.com/736x/bd/b7/e8/bdb7e8ec4259508ce023744b1aeb99fa.jpg?w=400' }],
    district: 'Ujjain', ward: 'Ward 3 - Mahakal Area', street: 'Mahakal Temple Road', coordinates: { lat: 23.1828, lng: 75.7682 },
    distance: 0.3, timestamp: new Date(Date.now() - 3 * 3600000), aiTag: 'Road Infrastructure', aiConfidence: 93,
    status: 'pending', upvotes: 88, comments: [{ id: 'c5', text: 'Thousands of pilgrims walk here daily', timestamp: new Date(), author: 'Temple Trust' }],
    severity: 9, type: 'road', priority: 'high', hasUserUpvoted: false, assignedDept: undefined,
  },
  {
    id: 's7', title: 'Garbage pile at Freeganj Market',
    description: 'Massive garbage accumulation at Freeganj market. No collection in over a week.',
    imageUrl: 'https://i.pinimg.com/1200x/96/16/38/96163836005bd8560ce0ebd6d3aa3e14.jpg?w=400',
    media: [{ id: 's7-1', type: 'image', url: 'https://i.pinimg.com/1200x/96/16/38/96163836005bd8560ce0ebd6d3aa3e14.jpg?w=400' }],
    district: 'Ujjain', ward: 'Ward 11 - Freeganj', street: 'Freeganj Main Road', coordinates: { lat: 23.1765, lng: 75.7820 },
    distance: 1.0, timestamp: new Date(Date.now() - 168 * 3600000), aiTag: 'Waste Management', aiConfidence: 91,
    status: 'submitted', upvotes: 34, comments: [],
    severity: 7, type: 'garbage', priority: 'medium', hasUserUpvoted: false, assignedDept: 'MSWM',
  },
  {
    id: 's8', title: 'Water contamination in Nanakheda area',
    description: 'Residents reporting brownish water supply for 3 days. Health concern for 200+ families.',
    imageUrl: 'https://i.pinimg.com/736x/95/b9/99/95b9990ad03eef2a719e7d2dba1e431a.jpg?w=400',
    media: [{ id: 's8-1', type: 'image', url: 'https://i.pinimg.com/736x/95/b9/99/95b9990ad03eef2a719e7d2dba1e431a.jpg?w=400' }],
    district: 'Ujjain', ward: 'Ward 7 - Nanakheda', street: 'Nanakheda Colony', coordinates: { lat: 23.1892, lng: 75.7764 },
    distance: 1.5, timestamp: new Date(Date.now() - 72 * 3600000), aiTag: 'Water Supply', aiConfidence: 89,
    status: 'acknowledged', upvotes: 56, comments: [{ id: 'c6', text: 'Several children fell ill', timestamp: new Date(), author: 'Dr. Pankaj Joshi' }],
    severity: 9, type: 'water', priority: 'high', hasUserUpvoted: false, assignedDept: 'MVB',
  },
  {
    id: 's9', title: 'Street lights non-functional - Tower Chowk',
    description: 'Entire Tower Chowk area dark at night. Accidents and crime incidents increasing.',
    imageUrl: 'https://i.pinimg.com/1200x/f4/c0/5c/f4c05c75472d231f783af9b203cc2ec0.jpg?w=400',
    media: [{ id: 's9-1', type: 'image', url: 'https://i.pinimg.com/1200x/f4/c0/5c/f4c05c75472d231f783af9b203cc2ec0.jpg?w=400' }],
    district: 'Ujjain', ward: 'Ward 15 - Tower Chowk', street: 'Tower Chowk Road', coordinates: { lat: 23.1796, lng: 75.7882 },
    distance: 0.6, timestamp: new Date(Date.now() - 48 * 3600000), aiTag: 'Street Lighting', aiConfidence: 96,
    status: 'pending', upvotes: 41, comments: [],
    severity: 7, type: 'streetlight', priority: 'medium', hasUserUpvoted: false, assignedDept: undefined,
  },

  // ── BHOPAL ─────────────────────────────────────────────────────────────────
  {
    id: 's10', title: 'Pothole cluster on Hoshangabad Road',
    description: 'Multiple large potholes on Hoshangabad Road near DB Mall causing vehicle damage.',
    imageUrl: 'https://i.pinimg.com/736x/d0/3f/c2/d03fc2fe363172d449e218a84b557508.jpg?w=400',
    media: [{ id: 's10-1', type: 'image', url: 'https://i.pinimg.com/736x/d0/3f/c2/d03fc2fe363172d449e218a84b557508.jpg?w=400' }],
    district: 'Bhopal', ward: 'Ward 30 - Hoshangabad Road', street: 'Hoshangabad Road', coordinates: { lat: 23.2332, lng: 77.4272 },
    distance: 0.9, timestamp: new Date(Date.now() - 4 * 3600000), aiTag: 'Road Infrastructure', aiConfidence: 94,
    status: 'pending', upvotes: 63, comments: [{ id: 'c7', text: 'My scooter tyre burst here', timestamp: new Date(), author: 'Ajay Singh' }],
    severity: 9, type: 'road', priority: 'high', hasUserUpvoted: false, assignedDept: undefined,
  },
  {
    id: 's11', title: 'Garbage bins overflowing near New Market',
    description: 'New Market garbage bins not emptied for 6 days. Tourist area badly affected.',
    imageUrl: 'https://i.pinimg.com/736x/5c/7c/6b/5c7c6b139ab69341800be13b9ba038cb.jpg?w=400',
    media: [{ id: 's11-1', type: 'image', url: 'https://i.pinimg.com/736x/5c/7c/6b/5c7c6b139ab69341800be13b9ba038cb.jpg?w=400' }],
    district: 'Bhopal', ward: 'Ward 12 - New Market', street: 'New Market Road', coordinates: { lat: 23.2335, lng: 77.4010 },
    distance: 1.3, timestamp: new Date(Date.now() - 144 * 3600000), aiTag: 'Waste Management', aiConfidence: 93,
    status: 'submitted', upvotes: 27, comments: [],
    severity: 7, type: 'garbage', priority: 'medium', hasUserUpvoted: false, assignedDept: 'MSWM',
  },
  {
    id: 's12', title: 'Water supply pipe burst - Kolar Road',
    description: 'Major water pipe burst on Kolar Road wasting thousands of litres and causing road damage.',
    imageUrl: 'https://i.pinimg.com/736x/5d/d9/86/5dd9865dc83354c74323a381faf3d3e3.jpg?w=400',
    media: [{ id: 's12-1', type: 'image', url: 'https://i.pinimg.com/736x/5d/d9/86/5dd9865dc83354c74323a381faf3d3e3.jpg?w=400' }],
    district: 'Bhopal', ward: 'Ward 44 - Kolar Road', street: 'Kolar Road', coordinates: { lat: 23.1822, lng: 77.4634 },
    distance: 2.2, timestamp: new Date(Date.now() - 10 * 3600000), aiTag: 'Water Supply', aiConfidence: 91,
    status: 'acknowledged', upvotes: 48, comments: [{ id: 'c8', text: 'Road also getting damaged due to water', timestamp: new Date(), author: 'Pradeep Verma' }],
    severity: 10, type: 'water', priority: 'high', hasUserUpvoted: false, assignedDept: 'MVB',
  },
  {
    id: 's13', title: 'Street lights not working - MP Nagar Zone 1',
    description: 'Entire Zone 1 of MP Nagar has no street lights for 2 weeks. Business community upset.',
    imageUrl: 'https://i.pinimg.com/1200x/90/13/ef/9013ef81025bd58455e717daaaa1934b.jpg?w=400',
    media: [{ id: 's13-1', type: 'image', url: 'https://i.pinimg.com/1200x/90/13/ef/9013ef81025bd58455e717daaaa1934b.jpg?w=400' }],
    district: 'Bhopal', ward: 'Ward 8 - MP Nagar', street: 'MP Nagar Zone 1', coordinates: { lat: 23.2295, lng: 77.4348 },
    distance: 0.7, timestamp: new Date(Date.now() - 336 * 3600000), aiTag: 'Street Lighting', aiConfidence: 98,
    status: 'resolved', upvotes: 55, comments: [{ id: 'c9', text: 'Repaired! Thanks to BDA team', timestamp: new Date(), author: 'Kavita Dubey' }],
    severity: 6, type: 'streetlight', priority: 'low', hasUserUpvoted: false, assignedDept: 'USLD',
  },
  {
    id: 's14', title: 'Open drainage blockage near Bittan Market',
    description: 'Stagnant water and blocked drain near Bittan Market creating mosquito breeding ground.',
    imageUrl: 'https://i.pinimg.com/736x/3b/46/d9/3b46d9f4426d98d5d45e035c53b5836d.jpg?w=400',
    media: [{ id: 's14-1', type: 'image', url: 'https://i.pinimg.com/736x/3b/46/d9/3b46d9f4426d98d5d45e035c53b5836d.jpg?w=400' }],
    district: 'Bhopal', ward: 'Ward 19 - Bittan Market', street: 'Bittan Market Road', coordinates: { lat: 23.2441, lng: 77.4195 },
    distance: 1.6, timestamp: new Date(Date.now() - 8 * 3600000), aiTag: 'Drainage System', aiConfidence: 87,
    status: 'pending', upvotes: 31, comments: [],
    severity: 8, type: 'drainage', priority: 'high', hasUserUpvoted: false, assignedDept: undefined,
  },
];
