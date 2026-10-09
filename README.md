# SafeLearn – Interactive Health & Safety Training System

**Client**: Logistics and Warehousing Company (Automotive Sector)  
**Developer**: EduSpark Technologies (Team 9, University of Sunderland – CET257)  
**Academic Tutor**: Dr. Becky Allen  

---

## 📌 Project Purpose

SafeLearn is an **interactive workplace health and safety training system** designed specifically for warehouse operatives, picking technicians, and plant machinery operators in the automotive logistics sector. 

The system replaces passive static manuals with a gamified, scenario-driven digital learning ecosystem featuring:
- **Dual Role-Based Interfaces**:
  1. **Employee / Learner Experience**: Engaging, modern educational web application (not an administrative dashboard) with interactive hazard spotting, PPE checks, decision scenarios, and accredited digital certificates.
  2. **Admin / Supervisor Console**: Professional management dashboard for workforce tracking, question bank authoring, passing mark configuration, and compliance audit reporting.
- **UK Statutory Safety Compliance**: Grounded in the Health & Safety at Work Act 1974 (HASAWA), ISO 45001, and SEMA racking standards.
- **Verified 70% Pass Mark**: Knowledge assessments enforce a mandatory 70% threshold before issuing unique, verifiable completion certificates.

---

## 🔑 Demo Access & Login Details

For academic evaluation (CET257 Assignment 1 & 2), 1-click credential switching is embedded into the Login modal and floating switcher:

| Role | Name | Demo Identifier | Access Level |
| :--- | :--- | :--- | :--- |
| **Employee / Learner** | Alex Morgan | `alex.morgan@logistics.demo` | Learner Portal, 6 Modules, 3 Interactive Activities, 70% Assessment Quiz, My Progress, Certificates |
| **Admin / Supervisor** | Marcus Vance | `supervisor@logistics.demo` | Management Console, KPI Dashboard, User Rosters, Module Publishing, Quiz Bank Builder, Audits, CSV Reports |

---

## 💻 Tech Stack

- **Framework**: React 18
- **Tooling**: Vite 6 (Preset to Port `5174`)
- **Styling**: Tailwind CSS with industrial safety color tokens (HSE Green, Caution Amber, Hazard Red)
- **Icons**: Lucide React
- **Celebration Effects**: Canvas Confetti

---

## 🚀 Installation & Running

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Company Website Link (Optional)
The client application includes an attribution back-link to the independently hosted EduSpark company website. A default `.env` file is provided:
```env
VITE_COMPANY_URL=http://localhost:5173
```

### 3. Run Development Server
```bash
npm run dev
```
The application will launch on port `5174`: `http://localhost:5174`

### 4. Build for Production
```bash
npm run build
```
Production assets compile cleanly into `/dist`.

---

## 📑 Application Architecture & Key Pages

### 1. Public Landing Page (Pre-Login)
- **Hero**: Tagline *"Interactive Health & Safety Training: Learn. Practise. Identify Hazards. Stay Safe."*
- **Safety Topics**: Cards for Warehouse Safety, PPE, Manual Handling, Forklift Safety, Emergency Procedures, Hazard Awareness.
- **Workflow**: 6-step guided methodology (Select, Learn, Activities, Quiz, Progress, Certificate).
- **About the System**: Automotive warehousing operational context & EduSpark Technologies attribution.

### 2. Employee / Learner Experience
- **Home**: Personalized welcome, 68% progress ring, resume training banner, safety tip of the day, activity shortcuts.
- **Safety Modules (6 Units)**:
  - HSE-101: Workplace Safety Basics
  - HSE-202: Warehouse Safety & Racking
  - HSE-303: Manual Handling & Lifting
  - HSE-404: Forklift & Vehicle Safety
  - HSE-505: Emergency Procedures
  - HSE-606: Personal Protective Equipment (PPE)
- **Lesson Player**: Objectives, core knowledge, critical red warning callouts, and green rule checklists.
- **Interactive Activity 1 (PPE Challenge)**: High-vis, steel toe boots, helmet, and puncture gloves selection with immediate feedback.
- **Interactive Activity 2 (Bay 4 Hazard Sim)**: Interactive warehouse scene with 6 clickable hotspots (hydraulic spill, blocked fire exit, leaning pallet stack, moving forklift, charging cable trip, missing PPE) and victory confetti.
- **Interactive Activity 3 (Walkway Spill Dilemma)**: HASAWA 1974 liquid spill response scenario.
- **Safety Assessment Quiz**: Multiple choice test with 70% passing threshold, scorecard, feedback, and certificate generation.
- **My Progress**: Circular completion gauges, safety streak, XP points, and unlocked achievement badges.
- **Certificates**: Printable/downloadable official completion certificate with unique ID (`SAFE-2026-XXXX`).

### 3. Admin / Supervisor Management Dashboard
- **Executive Dashboard**: KPIs (148 users, 89% completed, 84.6% avg score), departmental compliance rates, and module popularity.
- **User Management**: Filterable workforce table, view individual dossier, toggle status (Active/Disabled), and Add New Employee modal.
- **Training Modules Management**: Module catalog, duration, enrollment counts, publish/archive toggles, and Add Module modal.
- **Quiz Management**: Passing score slider (50%–95%), question bank editor, delete questions, and Add Question modal.
- **User Progress Audit**: Dropdown selector to inspect any employee's individual training records, quiz scores, and areas needing improvement.
- **Reports & Analytics**: Compliance matrix, printable audit report, and instant CSV dataset export (`safelearn_warehouse_compliance_report.csv`).
- **Notifications Center**: Urgent safety broadcast dispatcher and reminders.

---

## 🌐 Independent Deployment Guide

This project is decoupled from the company website and can be deployed independently:

### Deploying to Vercel
```bash
vercel
```
- Framework Preset: `Vite`
- Set Root Directory: `interactive-safety-training-system`
- Configure `VITE_COMPANY_URL` to point to the live EduSpark company website.

### Deploying to Netlify
1. Connect `CET257-Team9/interactive-safety-training-system`
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Environment variable: `VITE_COMPANY_URL`"# interactive_safety_training_system" 
"# interactive_safety_training" 
