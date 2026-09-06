# NagarSetu — Civic Issue Reporting System

[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-purple)](https://vitejs.dev/)

A mobile-first civic engagement platform for Madhya Pradesh municipalities. Citizens can report local issues, track resolution, and hold their municipal corporations accountable — in their own language.

The prototype is configured for **Indore, Ujjain, and Bhopal**.

---

## What It Does

NagarSetu lets citizens photograph and report civic problems (potholes, garbage overflow, broken streetlights, water supply failures, drainage issues). Each report is automatically classified by an AI engine, assigned a severity score, and routed to the correct municipal department. Admins and department staff have separate portals to manage and resolve complaints.

---

## Features

### For Citizens
- **In-app camera** with front/rear switching and gallery upload
- **AI classification** — photo + description auto-fills issue type, severity (1–10), and priority
- **Voice recorder** — describe an issue by speaking instead of typing
- **Multilingual UI** — English, Hindi, Bengali, Santhali, Nagpuri
- **Live feed** — district-filtered view of all nearby reports sorted by distance
- **Upvote & comment** on issues to show community support
- **Interactive map** — Leaflet/OpenStreetMap view with all issue markers
- **Leaderboard** — earn 100 pts per complaint, 50 bonus pts when resolved
- **Light and dark mode** — persistent theme preference across the app
- **Animated transitions** — polished screen changes and loading states
- **Offline support** — reports saved locally and synced when back online

### For Admins (City Portal)
- City-scoped dashboard (Indore / Ujjain / Bhopal)
- Stats: total, pending, in-progress, resolved, unassigned
- Assign complaints to departments (PWD, MSWM, MVB, USLD)
- Filter by status, issue type, or search by ward/street
- Export filtered complaints as CSV

### For Staff (Department Portal)
- Department-scoped complaint queue
- Update complaint status: Pending → Acknowledged → In Progress → Resolved
- Upload resolution proof from the gallery or device camera

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18.3.1 + TypeScript 5.9.2 |
| Build Tool | Vite 6.3.5 |
| Styling | Tailwind CSS |
| Components | Radix UI primitives + shadcn/ui pattern |
| Animations | Motion (Framer Motion) |
| Maps | Leaflet 1.9.4 + OpenStreetMap |
| Charts | Recharts |
| Icons | Lucide React |
| Forms | React Hook Form |
| Notifications | Sonner |
| Persistence | localStorage (UserStore, SessionStore, ReportStore) |
| AI Engine | Custom keyword + image analysis classifier (client-side) |

---

## Project Structure

```
src/
├── App.tsx                        # Root: auth, routing, state, report CRUD
├── components/
│   ├── HomeScreen.tsx             # Live feed + report detail modal
│   ├── ReportScreen.tsx           # Camera, AI classify, submit flow
│   ├── LeafletMapScreen.tsx       # Interactive issue map
│   ├── AnalyticsScreen.tsx        # Municipal analytics dashboard
│   ├── LeaderboardScreen.tsx      # Points + city rankings
│   ├── AdminPortal.tsx            # City admin dashboard
│   ├── StaffPortal.tsx            # Department staff portal
│   ├── ProfileScreen.tsx          # User profile + settings
│   ├── OnboardingScreen.tsx       # City selection + location detect
│   ├── LoginScreen.tsx            # Citizen login
│   ├── RegisterScreen.tsx         # New account registration
│   ├── VoiceRecorder.tsx          # Voice-to-text for report description
│   ├── translations.ts            # All UI strings in 5 languages
│   ├── ThemeToggle.tsx            # Persistent light/dark mode control
│   └── ui/                        # Reusable UI components (40+)
├── data/
│   └── mockReports.ts             # Seed complaints + dept/account config
├── lib/
│   └── storage.ts                 # localStorage abstraction layer
├── types/                         # Shared TypeScript types
└── styles/                        # Global CSS + map-specific CSS
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

---

## Demo Credentials

### Citizen
Register a new account from the app, or use the demo login flow.

### Admin Portal
Access via the "Admin" button on the login screen.

| City | Email | Password |
|---|---|---|
| Indore | admin.indore@nagarsetu.gov.in | admin123 |
| Ujjain | admin.ujjain@nagarsetu.gov.in | admin123 |
| Bhopal | admin.bhopal@nagarsetu.gov.in | admin123 |

### Staff Portal
Access via the "Staff" button on the login screen.

| Dept / City | Email | Password |
|---|---|---|
| PWD Indore | pwd.indore@nagarsetu.gov.in | staff123 |
| MSWM Indore | mswm.indore@nagarsetu.gov.in | staff123 |
| MVB Indore | water.indore@nagarsetu.gov.in | staff123 |
| USLD Indore | lights.indore@nagarsetu.gov.in | staff123 |
| *(same pattern for Ujjain and Bhopal)* | | |

---

## Departments

| Code | Full Name | Issue Type |
|---|---|---|
| PWD | Public Works Department | Road / Pothole |
| MSWM | Municipal Solid Waste Management | Garbage / Drainage |
| MVB | Municipal Water Board | Water Supply |
| USLD | Urban Street Light Department | Streetlights |

---

## Points System

- Submit a complaint → **+100 pts**
- Complaint resolved → **+50 bonus pts**

Rankings are shown city-wide and can be filtered by city (Indore, Ujjain, Bhopal).

---

## License

All rights reserved.
