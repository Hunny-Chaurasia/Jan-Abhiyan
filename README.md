# Jan Abhiyan — Societal Innovation Collaboration Portal (Jharkhand)

**PS ID :** SIH26043 | **Theme :** Disaster Management | **Category :** Software

A unified, AI-enabled digital ecosystem that transforms citizen-reported societal challenges into research, innovation, and deployable solutions — by connecting **Citizens, Government, Universities, and Industry** in one continuous problem-to-solution pipeline.

> Existing grievance systems (CPGRAMS, MyGov, state portals) stop at "complaint filed → complaint closed." Jan Abhiyan goes further: unresolved or research-worthy civic problems don't dead-end at government — they flow into university research pipelines and industry-funded deployment, with full lifecycle visibility for every stakeholder.

---

## 1. Problem Statement Alignment

| Official Requirement (SIH26043) | Jan Abhiyan Module |
|---|---|
| Citizen/PRI/ULB challenge submission with multimedia, location, documents | Citizen Engagement Module |
| AI-enabled categorization by thematic domain | AI Problem Intelligence Engine |
| Deduplication of submitted problems | AI Problem Intelligence Engine |
| Routing to universities by discipline/expertise/incubation capability | Smart Routing Engine |
| University team formation, faculty mentorship, proposal management | University Collaboration Module |
| Industry mentorship, funding, prototyping, testing, tech transfer | Industry Partnership Module |
| Project lifecycle: milestones, IP, testing, documentation | Project Lifecycle Tracker |
| Analytics: domain trends, patents, startups, district-wise impact | Visual Analytics Dashboard |
| Cross-stakeholder notifications | Unified Notification System |
| Access for citizens without digital devices | CSC / Assisted Access Network |

---

## 2. User Roles

Registration supports **eight submitting/participating entities**, expanded from the base six to fully cover the PS's mandate for community and civic-body participation:

1. **Citizen**
2. **Community Group / Panchayati Raj Institution (PRI) / Urban Local Body (ULB)** — *new: enables village- and ward-level bodies to submit on behalf of a community, not just individuals*
3. **Government Official**
4. **University / College / HEI**
5. **Industry / Organization / Startup / MSME / CSR Entity**
6. **CSC / Govt. Staff (Assisted Access Operator)**
7. **Administrator**

### Registration & Verification Flow
- **Identity Collection:** Full Name, Aadhaar Number (masked, last 4 digits shown), Registered Mobile Number.
- **Privacy & Compliance:** AES-256 encryption at rest for Aadhaar and mobile number; Aadhaar is used **only for OTP-based identity anchoring**, never displayed publicly, never used for profiling. *(Note: production deployment integrates via a UIDAI-licensed AUA/KUA partner for eKYC — a hackathon prototype simulates this step and clearly discloses the simulation.)*
- **Optional Fields:** Email, Date of Birth, Gender.
- **Verification:** Mobile OTP as the primary verification anchor (works even where Aadhaar eKYC integration is pending); role-specific document verification for Government/University/Industry accounts (e.g., official ID, institutional affiliation letter) before dashboard access is unlocked.
- **Role Selection:** Chosen at registration; Government/University/Industry/CSC roles require secondary approval by an Administrator before activation, preventing impersonation of official entities.

---

## 3. Role-Specific Dashboards

### 3.1 Citizen / Community / PRI / ULB Dashboard
- **Issue Reporting:** Submit civic challenges with photos, video, geo-tagged location, and supporting documents.
- **Guided Categorization:** AI suggests the most likely domain (education, health, agriculture, water, environment, energy, urban infra, accessibility, rural livelihoods) at submission time — citizen confirms or edits.
- **Tracking:** Real-time status against a unique Reference ID (Submitted → Validated → Routed to University → In Progress → Solution Proposed → Industry Approved → Resolved).
- **Community Escalation:** PRI/ULB accounts can submit on behalf of a village/ward and see aggregated status of all issues raised from that jurisdiction.

### 3.2 Government Official Dashboard
- **Zone Insights:** Designation-based view of all active issues within assigned jurisdiction, with domain-wise and severity-wise breakdown.
- **Task Management:** Assign issues to departments/officers, set deadlines, track completion.
- **Innovation Pipeline View:** Visibility into which citizen-reported problems have been picked up by universities and industry — closing the loop government previously lacked.
- **Validation Gate:** Officials validate/approve incoming citizen submissions before AI routes them to universities, preventing spam or duplicate entries from consuming institutional bandwidth.

### 3.3 University / College / HEI Dashboard
- **Smart-Routed Problem Feed:** Receives challenges pre-matched to the institution's registered disciplines, research centres, and incubation facilities (not an open browse-all list).
- **Team Formation:** Create multidisciplinary student teams against a selected problem statement.
- **Faculty Mentor Assignment:** Assign a faculty mentor per team; mentor sign-off required before a proposal moves to Industry review.
- **Project Tracking:** Milestones, prototypes, reports, and progress updates in one timeline.
- **IP & Outcome Logging:** Record patents filed, publications, and prototype-to-product outcomes tied to each solved challenge.

### 3.4 Industry / Organization Dashboard
- **Project Discovery:** Browse university projects filtered by domain, readiness stage, or district.
- **Engagement Options:** Post mentorship offers, funding opportunities, CSR-linked sponsorships, or prototyping/testing support.
- **Solution Approval Gate:** Review completed university solutions; approve for visibility to Government Officials as deployment-ready.
- **Technology Transfer Tracking:** Log pilot deployments, licensing, and startups spun out of approved solutions.

### 3.5 CSC / Govt. Staff Dashboard (Assisted Access)
- **Assisted Registration:** Register citizens without smartphones/internet access, capturing identity and consent on their behalf.
- **Assisted Issue Filing:** Log complaints for citizens directly at the CSC counter.
- **Receipt Generation:** Printable/downloadable receipt with Reference ID for the citizen's physical record.
- **Operator Accountability Log:** Every assisted action is tagged to the CSC operator's verified ID for auditability.

### 3.6 Administrator Dashboard
- **User & Access Management:** Approve/suspend accounts, manage role permissions, monitor active sessions across all six roles.
- **System Health & Audit Logs:** Track uptime, data-access logs, and flag anomalous activity.
- **Visual Analytics Dashboard:**
  - Domain-wise and district-wise challenge distribution
  - University and industry participation rates
  - Project completion and resolution-time metrics
  - **Patents filed, startups incubated, jobs/livelihoods impacted** — the outcome metrics the PS explicitly asks for
  - Funnel view: Submitted → Validated → Routed → Solved → Deployed

---

## 4. AI Problem Intelligence Engine

The core differentiator distinguishing this from a standard grievance portal:

- **Auto-Categorization:** NLP-based classification of submitted text/images into thematic domains (education, healthcare, agriculture, water, environment, energy, urban development, accessibility, rural livelihoods, public administration).
- **Deduplication:** Semantic similarity matching (embedding-based) flags likely duplicate reports from the same locality, merging them into a single tracked issue with a combined citizen count — surfacing high-impact problems automatically.
- **Dual-Track Routing:**
  - *Track A (Civic-resolvable):* Routine infrastructure/service issues routed directly to the relevant Government department.
  - *Track B (Innovation-worthy):* Problems requiring research, technology, or novel process solutions routed to universities matched by discipline, research centre focus, and incubation capability.
- **Priority Scoring:** Combines citizen-count (deduplication signal), severity keywords, and domain urgency to rank issues for faster institutional attention.

---

## 5. Unified Notification System

Cross-stakeholder alerts at every lifecycle transition — citizen on status change, university on new routed problem, industry on new approved-for-review solution, government on SLA breach — delivered via **push notification (PWA), SMS fallback, and email**, ensuring no stakeholder relies solely on logging into the portal to stay informed.

---

## 6. Accessibility & Inclusion (Jharkhand-Specific)

Built for a state where a large rural population lacks reliable smartphone or internet access:

- **Progressive Web App (PWA), Offline-First:** Citizens can draft and queue complaints without connectivity; **IndexedDB** stores drafts locally, **Background Sync** submits automatically once network is available.
- **CSC/VLE Network Integration:** Common Service Centres and Village Level Entrepreneurs act as assisted digital-access points, extending reach to citizens without devices.
- **SMS Fallback Roadmap:** Basic keypad-phone users can file and track complaints via a structured SMS/USSD gateway, receiving a Reference ID by SMS — no smartphone required.
- **Low-Bandwidth Mode:** Compressed image uploads and text-first UI for low-connectivity zones.

---

## 7. Technology Stack

| Layer | Technology |
|---|---|
| UI/UX Design | Figma — Government Standard Design System |
| Frontend | Progressive Web App (React/Vite), installable on mobile & desktop |
| Backend | REST API services (role-based access control, JWT auth) |
| AI/NLP Engine | Text classification & embedding-based deduplication (open-source NLP stack) |
| Offline Support | IndexedDB + Background Sync API |
| Notifications | Web Push + SMS gateway integration |
| Data Security | AES-256 encryption at rest, TLS in transit, Aadhaar masking |
| Database | Relational store for structured records + document store for media evidence |

---

## 8. System Workflow (High-Level)

```
Citizen / PRI / ULB submits challenge (text + media + geo-tag)
              │
              ▼
   AI Categorization + Deduplication
              │
              ▼
     Government Official Validation
        │                    │
        ▼                    ▼
 Track A: Direct        Track B: Routed to
 Govt Resolution        matched University
                              │
                              ▼
                University forms team,
              assigns faculty mentor,
                 builds solution
                              │
                              ▼
                 Industry review, funding,
                 prototyping, approval
                              │
                              ▼
        Approved solution → visible to Government
        → deployment / tech transfer / startup outcome
                              │
                              ▼
        Analytics Dashboard updates in real time
```

---

## 9. What Sets This Apart

- Closes the loop that existing grievance portals leave open — unresolved civic problems become research and enterprise opportunities, not dead ends.
- Explicit AI-driven categorization, deduplication, and discipline-based routing — not a manual browse-and-pick system.
- Built-in rural accessibility (CSC network + offline PWA + SMS roadmap) matched to Jharkhand's actual digital-divide reality.
- Full lifecycle traceability from citizen complaint to patent/startup outcome, with district-wise impact analytics for policy planning.

