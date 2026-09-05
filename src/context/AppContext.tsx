import { createContext, useContext, useState, ReactNode } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

export type Role = "citizen" | "official" | "university" | "staff" | "admin" | "industry";

export interface UserSession {
  virtualId: string;
  name: string;
  role: Role;
  email: string;
  phone: string;
  organization?: string;
  district?: string;
  designation?: string;
  lastLogin: string;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  category: string;
  domain: string;
  district: string;
  block?: string;
  source: "citizen" | "csc" | "official";
  citizenVirtualId: string;
  citizenName: string;
  date: string;
  status: "Pending" | "Assigned" | "In Progress" | "University Routed" | "Resolved" | "Closed";
  priority: "High" | "Medium" | "Low";
  track: "Simple Civic" | "Innovation Route";
  assignedTo?: string;
  assignedDept?: string;
  taskId?: string;
  teamId?: string;
  routingId?: string;
}

export interface Task {
  id: string;
  problemId: string;
  problemTitle: string;
  assignedTo: string;
  assignedToType: "department" | "university" | "officer" | "agency";
  assignedBy: string;
  assignedDate: string;
  deadline: string;
  priority: "High" | "Medium" | "Low";
  instructions: string;
  status: "Pending" | "In Progress" | "Completed" | "Overdue";
  progressUpdates: { date: string; note: string }[];
  completedDate?: string;
  remarks?: string;
}

export interface TeamMember {
  name: string;
  memberId: string;
  department: string;
  role: string;
  skills: string;
}

export type ImplementationStatus =
  | "Not Started"
  | "In Progress"
  | "Under Testing"
  | "Ready for Implementation"
  | "Pilot Implementation"
  | "Implemented"
  | "Completed"
  | "Blocked";

export interface Team {
  id: string;
  universityName: string;
  department: string;
  teamName: string;
  teamLeader: string;
  contactEmail: string;
  contactPhone: string;
  problemId: string;
  problemTitle: string;
  problemDescription: string;
  whySelected: string;
  expectedOutcome: string;
  proposedSolution: string;
  domain: string;
  teamSize: number;
  members: TeamMember[];
  startDate: string;
  expectedCompletionDate: string;
  milestones: string;
  currentProgress: string;
  mentorName: string;
  mentorDesignation: string;
  mentorDept: string;
  mentorType: string;
  mentorContact: string;
  mentorExpertise: string;
  status: "Proposed" | "Approved" | "Active" | "Submitted" | "Implemented";
  implementationStatus?: ImplementationStatus;
  createdAt: string;
  technologies?: string;
  industryRating?: string;
}

export interface Milestone {
  id: string;
  teamId: string;
  title: string;
  description: string;
  deadline: string;
  status: "Pending" | "In Progress" | "Completed" | "Blocked";
  createdAt: string;
  completedAt?: string;
}

export interface Deliverable {
  id: string;
  teamId: string;
  title: string;
  description: string;
  dueDate: string;
  status: "Pending" | "Uploaded" | "Reviewed" | "Approved";
  uploadedAt?: string;
  fileNote?: string;
}

export interface CollaborationRequest {
  id: string;
  industryName: string;
  contactPerson: string;
  designation: string;
  email: string;
  phone: string;
  areaOfInterest: string;
  teamId: string;
  projectTitle: string;
  reasonForInterest: string;
  collaborationType: string;
  requirements: string;
  message: string;
  sentAt: string;
  status: "Pending" | "Accepted" | "Rejected" | "More Info Requested";
}

export interface Opportunity {
  id: string;
  industryName: string;
  type: string;
  title: string;
  description: string;
  eligibility: string;
  skills: string;
  domain: string;
  deadline: string;
  postedAt: string;
  applications: number;
}

export interface MentoringEntry {
  id: string;
  industryVirtualId: string;
  industryName: string;
  mentorName: string;
  teamId: string;
  projectTitle: string;
  status: "Active" | "Completed" | "Paused";
  startDate: string;
  progress: string;
  expertise: string;
}

export interface FundingEntry {
  id: string;
  industryVirtualId: string;
  industryName: string;
  teamId: string;
  projectTitle: string;
  amount: string;
  status: "Committed" | "Disbursed" | "Pending" | "Completed";
  purpose: string;
  committedAt: string;
}

export interface PilotEntry {
  id: string;
  industryVirtualId: string;
  industryName: string;
  teamId: string;
  projectTitle: string;
  status: "Selected" | "In Progress" | "Testing" | "Completed" | "Feedback";
  startDate: string;
  location: string;
  feedback: string;
}

export interface Message {
  id: string;
  fromVirtualId: string;
  fromName: string;
  fromRole: Role;
  toVirtualId: string;
  toName: string;
  toRole: Role;
  projectId: string;
  projectTitle: string;
  content: string;
  sentAt: string;
  read: boolean;
}

export interface IssueRouting {
  id: string;
  problemId: string;
  problemTitle: string;
  routedBy: string;
  routedByName: string;
  routingType: "innovation" | "non-innovation";
  routedTo: string;
  reason: string;
  routedAt: string;
  status: string;
}

export interface Notification {
  id: string;
  forRole: Role | "all";
  forVirtualId?: string;
  type: "info" | "warning" | "success" | "alert";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
}

// ── Seed Data ──────────────────────────────────────────────────────────────

const SEED_PROBLEMS: Problem[] = [
  { id: "JA-2024-00142", title: "Pothole on NH-33 near Ranchi Station", description: "Large pothole causing accidents and traffic jams near Ranchi Railway Station. Present since 3 months.", category: "Pothole / Road Damage", domain: "Infrastructure", district: "Ranchi", block: "Urban", source: "citizen", citizenVirtualId: "JA-C-00023", citizenName: "Ramesh Kumar Singh", date: "12 Aug 2024", status: "In Progress", priority: "High", track: "Simple Civic", assignedTo: "Road Dept. Ranchi", assignedDept: "PWD Jharkhand", taskId: "TASK-00011" },
  { id: "JA-2024-00139", title: "Garbage not collected — Lalpur Ward 7", description: "Municipal garbage collection has not happened for 2 weeks. Residents suffering due to smell and hygiene issues.", category: "Garbage / Sanitation", domain: "Sanitation", district: "Ranchi", block: "Lalpur", source: "citizen", citizenVirtualId: "JA-C-00031", citizenName: "Priya Devi", date: "11 Aug 2024", status: "Assigned", priority: "Medium", track: "Simple Civic", assignedTo: "Municipal Corp.", assignedDept: "RMC", taskId: "TASK-00012" },
  { id: "JA-2024-00135", title: "Streetlight failure — Gandhi Chowk", description: "All 12 streetlights at Gandhi Chowk have been non-functional for 3 days, causing safety issues.", category: "Streetlight", domain: "Infrastructure", district: "Ranchi", block: "Urban", source: "citizen", citizenVirtualId: "JA-C-00045", citizenName: "Mohammad Imran", date: "10 Aug 2024", status: "Resolved", priority: "Low", track: "Simple Civic", assignedTo: "Electricity Dept.", assignedDept: "JBVNL" },
  { id: "JA-2024-00067", title: "Water scarcity — sustainable solution needed", description: "Severe water scarcity affecting 3,000+ residents in Kokar colony. Traditional solutions have failed repeatedly.", category: "Water Scarcity", domain: "Environment", district: "Ranchi", block: "Kokar", source: "citizen", citizenVirtualId: "JA-C-00023", citizenName: "Ramesh Kumar Singh", date: "21 Jul 2024", status: "University Routed", priority: "High", track: "Innovation Route", teamId: "TEAM-001" },
  { id: "JA-2024-00052", title: "Agri-tech: Crop yield improvement for tribal farmers", description: "Tribal farming communities in Khunti need modern agri-tech solutions to improve crop yield sustainably.", category: "Agri-tech", domain: "Agriculture", district: "Khunti", source: "official", citizenVirtualId: "JA-O-00001", citizenName: "Arvind Kumar IAS", date: "14 Jul 2024", status: "University Routed", priority: "Medium", track: "Innovation Route", teamId: "TEAM-002" },
  { id: "JA-2024-00039", title: "Renewable energy micro-grid for remote village", description: "Village in Simdega is off-grid with no electricity. Need solar micro-grid implementation.", category: "Renewable Energy", domain: "Energy", district: "Simdega", source: "official", citizenVirtualId: "JA-O-00001", citizenName: "Arvind Kumar IAS", date: "05 Jul 2024", status: "Pending", priority: "High", track: "Innovation Route" },
  { id: "JA-2024-00031", title: "Health innovation: Mobile diagnostics for Adivasi communities", description: "Remote Adivasi communities lack access to basic diagnostics. Need mobile health solution.", category: "Health Innovation", domain: "Health", district: "West Singhbhum", source: "citizen", citizenVirtualId: "JA-C-00067", citizenName: "Mangal Munda", date: "28 Jun 2024", status: "University Routed", priority: "High", track: "Innovation Route", teamId: "TEAM-003" },
  { id: "JA-2024-00028", title: "Drinking water contamination — Dhanbad coal belt", description: "Mining area groundwater contaminated. Requires immediate public health intervention.", category: "Water Contamination", domain: "Health", district: "Dhanbad", source: "citizen", citizenVirtualId: "JA-C-00089", citizenName: "Suresh Paswan", date: "22 Jun 2024", status: "Pending", priority: "High", track: "Innovation Route" },
  { id: "JA-2024-00019", title: "Road connectivity to remote tribal hamlet", description: "Birsanagar hamlet has no motorable road. 340 residents walk 8km to reach the nearest town.", category: "Road Connectivity", domain: "Infrastructure", district: "Gumla", source: "official", citizenVirtualId: "JA-O-00001", citizenName: "Arvind Kumar IAS", date: "15 Jun 2024", status: "Assigned", priority: "Medium", track: "Simple Civic", assignedTo: "PWD Gumla" },
  { id: "JA-2024-00011", title: "Flood-prone area drainage — Bokaro", description: "Low-lying area floods every monsoon. 700+ households affected annually.", category: "Drainage / Flood", domain: "Infrastructure", district: "Bokaro", source: "citizen", citizenVirtualId: "JA-C-00101", citizenName: "Kavita Sharma", date: "08 Jun 2024", status: "Resolved", priority: "High", track: "Simple Civic" },
];

const SEED_TASKS: Task[] = [
  { id: "TASK-00011", problemId: "JA-2024-00142", problemTitle: "Pothole on NH-33 near Ranchi Station", assignedTo: "Executive Engineer, PWD Ranchi", assignedToType: "department", assignedBy: "Arvind Kumar IAS", assignedDate: "13 Aug 2024", deadline: "25 Aug 2024", priority: "High", instructions: "Conduct site inspection within 24 hours. Repair pothole with asphalt patching. Submit photographic evidence on completion.", status: "In Progress", progressUpdates: [{ date: "14 Aug 2024", note: "Site inspected. Material procurement initiated." }, { date: "18 Aug 2024", note: "50% repair completed. Full completion by 23 Aug." }] },
  { id: "TASK-00012", problemId: "JA-2024-00139", problemTitle: "Garbage not collected — Lalpur Ward 7", assignedTo: "Ward Officer, RMC Ward 7", assignedToType: "department", assignedBy: "Arvind Kumar IAS", assignedDate: "12 Aug 2024", deadline: "15 Aug 2024", priority: "Medium", instructions: "Resume regular garbage collection immediately. Identify reason for disruption and submit report.", status: "Completed", progressUpdates: [{ date: "13 Aug 2024", note: "Collection resumed. Vehicle breakdown was the cause." }], completedDate: "14 Aug 2024", remarks: "Issue resolved. New collection schedule implemented." },
];

const SEED_TEAMS: Team[] = [
  { id: "TEAM-001", universityName: "BIT Mesra", department: "Environmental Engineering", teamName: "AquaSolve JH", teamLeader: "Rohit Kumar", contactEmail: "rohit.k@bitmesra.ac.in", contactPhone: "9876543210", problemId: "JA-2024-00067", problemTitle: "Water scarcity — sustainable solution needed", problemDescription: "Severe water scarcity affecting 3,000+ residents in Kokar colony.", whySelected: "Our department has expertise in water conservation and treatment technologies.", expectedOutcome: "Deploy 3 rainwater harvesting structures and 1 water recycling unit serving 500 households.", proposedSolution: "Community rainwater harvesting + greywater recycling system using low-cost locally available materials.", domain: "Environmental Engineering", teamSize: 5, members: [{ name: "Rohit Kumar", memberId: "BM-2021-045", department: "Env. Engg.", role: "Team Leader", skills: "Water treatment, GIS" }, { name: "Ananya Singh", memberId: "BM-2021-067", department: "Env. Engg.", role: "Research Lead", skills: "Hydrology, Data analysis" }, { name: "Prashant Oraon", memberId: "BM-2022-012", department: "Civil Engg.", role: "Site Engineer", skills: "Construction, AutoCAD" }], startDate: "2024-08-01", expectedCompletionDate: "2024-10-15", milestones: "M1: Site survey (Aug 15) | M2: Design (Sep 1) | M3: Construction (Oct 1) | M4: Testing (Oct 10)", currentProgress: "Site survey completed. Design phase in progress.", mentorName: "Prof. Sunita Patel", mentorDesignation: "Associate Professor", mentorDept: "Environmental Engineering", mentorType: "Faculty Mentor", mentorContact: "sunita.p@bitmesra.ac.in", mentorExpertise: "Water resource management, Environmental impact assessment", status: "Active", implementationStatus: "In Progress", createdAt: "2024-07-28", technologies: "GIS Mapping, Rainwater harvesting, IoT sensors" },
  { id: "TEAM-002", universityName: "RIMS Ranchi", department: "Agriculture & Food Technology", teamName: "KisanTech Jharkhand", teamLeader: "Sunita Mahto", contactEmail: "sunita.m@rims.ac.in", contactPhone: "9765432109", problemId: "JA-2024-00052", problemTitle: "Agri-tech: Crop yield improvement for tribal farmers", problemDescription: "Tribal farming communities in Khunti need modern agri-tech solutions.", whySelected: "We have been working on indigenous crop varieties and soil health for 2 years.", expectedOutcome: "30% improvement in crop yield for 200 tribal farming families.", proposedSolution: "Soil health monitoring + crop variety recommendation system using mobile app with offline capability.", domain: "Agriculture Technology", teamSize: 4, members: [{ name: "Sunita Mahto", memberId: "RI-2020-034", department: "Agriculture", role: "Team Leader", skills: "Agronomy, soil science" }], startDate: "2024-07-20", expectedCompletionDate: "2024-09-30", milestones: "M1: Soil testing (Aug 10) | M2: App prototype (Sep 1) | M3: Field trial (Sep 20)", currentProgress: "Proposal submitted. Awaiting final approval.", mentorName: "Dr. Manoj Hembram", mentorDesignation: "Professor", mentorDept: "Agriculture", mentorType: "Faculty Mentor", mentorContact: "manoj.h@rims.ac.in", mentorExpertise: "Indigenous crop research, tribal agronomy", status: "Proposed", implementationStatus: "Not Started", createdAt: "2024-07-15", technologies: "Mobile app, Soil sensors, ML crop recommendation" },
  { id: "TEAM-003", universityName: "AIIMS Jharkhand", department: "Community Medicine", teamName: "HealthReach Adivasi", teamLeader: "Dr. Sita Hembrom", contactEmail: "sita.h@aiimsj.edu.in", contactPhone: "9654321098", problemId: "JA-2024-00031", problemTitle: "Health innovation: Mobile diagnostics for Adivasi communities", problemDescription: "Remote Adivasi communities lack access to basic diagnostics.", whySelected: "AIIMS Jharkhand has a community medicine program focused on tribal health.", expectedOutcome: "Mobile diagnostic unit reaching 10 remote villages monthly.", proposedSolution: "Low-cost portable diagnostic kit with telemedicine consultation via satellite internet.", domain: "Health Technology", teamSize: 7, members: [{ name: "Dr. Sita Hembrom", memberId: "AJ-DOC-012", department: "Community Medicine", role: "Team Leader", skills: "Diagnostics, telemedicine" }], startDate: "2024-06-15", expectedCompletionDate: "2024-09-01", milestones: "M1: Equipment (Jun 30) | M2: Training (Jul 20) | M3: Deployment (Aug 15)", currentProgress: "Equipment procured. Training sessions ongoing.", mentorName: "Dr. Rekha Munda", mentorDesignation: "HOD, Community Medicine", mentorDept: "Community Medicine", mentorType: "Faculty Mentor", mentorContact: "rekha.m@aiimsj.edu.in", mentorExpertise: "Tribal health, public health policy", status: "Submitted", implementationStatus: "Under Testing", createdAt: "2024-06-10", technologies: "Portable diagnostics, Telemedicine, Satellite IoT" },
];

const SEED_MILESTONES: Milestone[] = [
  { id: "MS-001", teamId: "TEAM-001", title: "Site survey and needs assessment", description: "Survey 500 households in Kokar colony to assess water usage patterns and identify installation sites.", deadline: "2024-08-15", status: "Completed", createdAt: "2024-07-28", completedAt: "2024-08-14" },
  { id: "MS-002", teamId: "TEAM-001", title: "System design and engineering", description: "Design rainwater harvesting structures and greywater recycling units tailored to local conditions.", deadline: "2024-09-01", status: "In Progress", createdAt: "2024-07-28" },
  { id: "MS-003", teamId: "TEAM-001", title: "Construction and installation", description: "Build 3 rainwater harvesting structures and 1 greywater recycling unit.", deadline: "2024-10-01", status: "Pending", createdAt: "2024-07-28" },
  { id: "MS-004", teamId: "TEAM-001", title: "Testing and commissioning", description: "Test all installed systems for operational effectiveness.", deadline: "2024-10-10", status: "Pending", createdAt: "2024-07-28" },
  { id: "MS-005", teamId: "TEAM-003", title: "Equipment procurement", description: "Procure portable diagnostic kits and telemedicine hardware.", deadline: "2024-06-30", status: "Completed", createdAt: "2024-06-10", completedAt: "2024-06-28" },
  { id: "MS-006", teamId: "TEAM-003", title: "Training health workers", description: "Train 20 community health workers in operating the diagnostic kits.", deadline: "2024-07-20", status: "Completed", createdAt: "2024-06-10", completedAt: "2024-07-18" },
  { id: "MS-007", teamId: "TEAM-003", title: "Field deployment — pilot villages", description: "Deploy mobile diagnostic units in 3 pilot Adivasi villages.", deadline: "2024-08-15", status: "In Progress", createdAt: "2024-06-10" },
];

const SEED_DELIVERABLES: Deliverable[] = [
  { id: "DL-001", teamId: "TEAM-001", title: "Site Survey Report", description: "Comprehensive survey of 500 households with water usage data and site maps.", dueDate: "2024-08-15", status: "Approved", uploadedAt: "2024-08-13", fileNote: "PDF — 45 pages, includes GIS maps" },
  { id: "DL-002", teamId: "TEAM-001", title: "Engineering Design Drawings", description: "AutoCAD drawings for rainwater harvesting and greywater recycling systems.", dueDate: "2024-09-05", status: "Uploaded", uploadedAt: "2024-09-02", fileNote: "DWG + PDF files submitted" },
  { id: "DL-003", teamId: "TEAM-001", title: "Testing & Commissioning Report", description: "Final report on system performance, water quality results, and community feedback.", dueDate: "2024-10-15", status: "Pending" },
  { id: "DL-004", teamId: "TEAM-003", title: "Training Module Documentation", description: "Training materials and recorded sessions for community health workers.", dueDate: "2024-07-25", status: "Approved", uploadedAt: "2024-07-19", fileNote: "Video recordings + PDF manual" },
  { id: "DL-005", teamId: "TEAM-003", title: "Field Deployment Report — Phase 1", description: "Report on pilot deployment in 3 villages including patient data and outcomes.", dueDate: "2024-08-30", status: "Uploaded", uploadedAt: "2024-08-22", fileNote: "Report submitted for review" },
];

const SEED_MENTORING: MentoringEntry[] = [
  { id: "MNT-001", industryVirtualId: "JA-I-00001", industryName: "Tata Steel Ltd.", mentorName: "Dr. P.K. Sharma", teamId: "TEAM-001", projectTitle: "AquaSolve JH — Water scarcity solution", status: "Active", startDate: "2024-08-05", progress: "3 sessions completed. Team is progressing well on design phase.", expertise: "Environmental engineering, water treatment" },
];

const SEED_FUNDING: FundingEntry[] = [
  { id: "FND-001", industryVirtualId: "JA-I-00001", industryName: "Tata Steel Ltd.", teamId: "TEAM-003", projectTitle: "HealthReach Adivasi", amount: "₹12,50,000", status: "Disbursed", purpose: "Procurement of portable diagnostic equipment and satellite IoT hardware.", committedAt: "2024-07-01" },
];

const SEED_PILOTS: PilotEntry[] = [
  { id: "PLT-001", industryVirtualId: "JA-I-00001", industryName: "Tata Steel Ltd.", teamId: "TEAM-003", projectTitle: "HealthReach Adivasi — Mobile diagnostics", status: "In Progress", startDate: "2024-08-01", location: "Noamundi block, West Singhbhum", feedback: "Initial results promising. Patient response positive. Equipment reliability good." },
];

const SEED_MESSAGES: Message[] = [
  { id: "MSG-001", fromVirtualId: "JA-I-00001", fromName: "Rajesh Verma", fromRole: "industry", toVirtualId: "JA-U-00001", toName: "Dr. Anita Sharma", toRole: "university", projectId: "TEAM-003", projectTitle: "HealthReach Adivasi", content: "Hello Dr. Sharma, we have reviewed Phase 1 results. The diagnostic accuracy rates are excellent. We would like to discuss scaling to 5 more villages next month. Can we schedule a call?", sentAt: "23 Aug 2024 10:30", read: false },
  { id: "MSG-002", fromVirtualId: "JA-U-00001", fromName: "Dr. Anita Sharma", fromRole: "university", toVirtualId: "JA-I-00001", toName: "Rajesh Verma", toRole: "industry", projectId: "TEAM-003", projectTitle: "HealthReach Adivasi", content: "Thank you Mr. Verma! The team is thrilled with the progress. We are ready to discuss scaling. How about a video call on Wednesday at 3 PM? We will also share the complete Phase 1 data report.", sentAt: "23 Aug 2024 14:15", read: true },
];

const SEED_ROUTING: IssueRouting[] = [
  { id: "RT-001", problemId: "JA-2024-00135", problemTitle: "Streetlight failure — Gandhi Chowk", routedBy: "JA-O-00001", routedByName: "Arvind Kumar IAS", routingType: "non-innovation", routedTo: "JBVNL — Electrical Division Ranchi", reason: "Standard electrical maintenance issue, does not require innovation. Routed to JBVNL for immediate repair.", routedAt: "10 Aug 2024 09:30", status: "Resolved" },
];

const SEED_NOTIFICATIONS: Notification[] = [
  { id: "N001", forRole: "official", type: "alert", title: "New High Priority Issue", message: "Issue JA-2024-00149 reported: Pothole near RIMS Hospital, Ranchi. Requires immediate action.", read: false, createdAt: "23 Aug 2024 09:12" },
  { id: "N002", forRole: "university", type: "info", title: "New Innovation Problem Available", message: "Problem JA-2024-00039: Renewable energy micro-grid for remote village is available for team formation.", read: false, createdAt: "22 Aug 2024 14:30" },
  { id: "N003", forRole: "industry", type: "success", title: "New Project Submission", message: "Team AquaSolve JH (BIT Mesra) has submitted their water scarcity project. Evaluate now.", read: false, createdAt: "22 Aug 2024 16:00" },
  { id: "N004", forRole: "admin", type: "info", title: "New Team Registered", message: "Team KisanTech Jharkhand from RIMS Ranchi has been registered for problem JA-2024-00052.", read: false, createdAt: "22 Aug 2024 11:45" },
  { id: "N005", forRole: "citizen", type: "success", title: "Issue Resolved", message: "Your issue JA-2024-00135 (Streetlight failure) has been marked as Resolved by JBVNL.", read: false, createdAt: "20 Aug 2024 17:00" },
  { id: "N006", forRole: "official", type: "warning", title: "Task Deadline Approaching", message: "Task TASK-00011 deadline is 25 Aug 2024 (2 days remaining). Current status: In Progress.", read: false, createdAt: "23 Aug 2024 08:00" },
  { id: "N007", forRole: "university", type: "alert", title: "Industry Collaboration Request", message: "Tata Steel Ltd. has sent a collaboration request for your project HealthReach Adivasi.", read: false, createdAt: "23 Aug 2024 10:20" },
  { id: "N008", forRole: "university", type: "info", title: "New Message from Tata Steel", message: "Rajesh Verma sent you a message regarding HealthReach Adivasi project.", read: false, createdAt: "23 Aug 2024 10:31" },
];

const SEED_COLLAB_REQUESTS: CollaborationRequest[] = [
  { id: "CR-001", industryName: "Tata Steel Ltd.", contactPerson: "Rajesh Verma", designation: "Head of CSR", email: "rajesh.v@tatasteel.com", phone: "9123456789", areaOfInterest: "Health Technology", teamId: "TEAM-003", projectTitle: "HealthReach Adivasi", reasonForInterest: "We run health programs for tribal communities in Jharkhand and this project aligns perfectly.", collaborationType: "CSR Partnership", requirements: "Looking to fund Phase 2 and deploy in 5 additional villages.", message: "We are impressed by the diagnostic approach and would like to discuss a full-scale deployment.", sentAt: "23 Aug 2024 10:20", status: "Pending" },
];

const SEED_OPPORTUNITIES: Opportunity[] = [
  { id: "OPP-001", industryName: "Tata Steel Ltd.", type: "Internship", title: "Sustainability & CSR Internship", description: "6-month internship in our sustainability division. Work on real community projects in Jharkhand.", eligibility: "3rd/4th year engineering students", skills: "Environmental engineering, data analysis, report writing", domain: "Sustainability", deadline: "15 Sep 2024", postedAt: "20 Aug 2024", applications: 12 },
  { id: "OPP-002", industryName: "SAIL Bokaro", type: "Live Project", title: "Industrial Waste Management Solution", description: "Design and prototype a low-cost industrial effluent treatment system for SAIL Bokaro.", eligibility: "Chemical/Environmental engineering teams", skills: "Chemical engineering, CAD, environmental chemistry", domain: "Industrial Engineering", deadline: "30 Sep 2024", postedAt: "18 Aug 2024", applications: 5 },
  { id: "OPP-003", industryName: "Infosys BPM", type: "Hackathon", title: "Rural Digital Connect Hackathon", description: "Build digital solutions for rural Jharkhand communities. ₹5L prize pool.", eligibility: "Any student team, all disciplines", skills: "Any technology stack", domain: "Digital Innovation", deadline: "10 Sep 2024", postedAt: "15 Aug 2024", applications: 34 },
];

// ── Context ────────────────────────────────────────────────────────────────

interface AppContextValue {
  user: UserSession | null;
  setUser: (u: UserSession | null) => void;
  problems: Problem[];
  addProblem: (p: Problem) => void;
  updateProblemStatus: (id: string, status: Problem["status"], extra?: Partial<Problem>) => void;
  tasks: Task[];
  addTask: (t: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  teams: Team[];
  addTeam: (t: Team) => void;
  updateTeam: (id: string, updates: Partial<Team>) => void;
  milestones: Milestone[];
  addMilestone: (m: Milestone) => void;
  updateMilestone: (id: string, updates: Partial<Milestone>) => void;
  deliverables: Deliverable[];
  addDeliverable: (d: Deliverable) => void;
  updateDeliverable: (id: string, updates: Partial<Deliverable>) => void;
  mentoringEntries: MentoringEntry[];
  addMentoringEntry: (m: MentoringEntry) => void;
  updateMentoringEntry: (id: string, updates: Partial<MentoringEntry>) => void;
  fundingEntries: FundingEntry[];
  addFundingEntry: (f: FundingEntry) => void;
  updateFundingEntry: (id: string, updates: Partial<FundingEntry>) => void;
  pilotEntries: PilotEntry[];
  addPilotEntry: (p: PilotEntry) => void;
  updatePilotEntry: (id: string, updates: Partial<PilotEntry>) => void;
  messages: Message[];
  sendMessage: (m: Omit<Message, "id" | "sentAt" | "read">) => void;
  markMessageRead: (id: string) => void;
  issueRoutings: IssueRouting[];
  addIssueRouting: (r: IssueRouting) => void;
  notifications: Notification[];
  markNotifRead: (id: string) => void;
  addNotification: (n: Omit<Notification, "id">) => void;
  collabRequests: CollaborationRequest[];
  addCollabRequest: (r: CollaborationRequest) => void;
  updateCollabRequest: (id: string, status: CollaborationRequest["status"]) => void;
  opportunities: Opportunity[];
  addOpportunity: (o: Opportunity) => void;
  auditLog: AuditEntry[];
  logAudit: (entry: Omit<AuditEntry, "id" | "timestamp">) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

let notifCounter = SEED_NOTIFICATIONS.length + 1;
let auditCounter = 1;
let msgCounter = SEED_MESSAGES.length + 1;
let msCounter = SEED_MILESTONES.length + 1;
let dlCounter = SEED_DELIVERABLES.length + 1;
let mntCounter = SEED_MENTORING.length + 1;
let fndCounter = SEED_FUNDING.length + 1;
let pltCounter = SEED_PILOTS.length + 1;
let rtCounter = SEED_ROUTING.length + 1;

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [problems, setProblems] = useState<Problem[]>(SEED_PROBLEMS);
  const [tasks, setTasks] = useState<Task[]>(SEED_TASKS);
  const [teams, setTeams] = useState<Team[]>(SEED_TEAMS);
  const [milestones, setMilestones] = useState<Milestone[]>(SEED_MILESTONES);
  const [deliverables, setDeliverables] = useState<Deliverable[]>(SEED_DELIVERABLES);
  const [mentoringEntries, setMentoringEntries] = useState<MentoringEntry[]>(SEED_MENTORING);
  const [fundingEntries, setFundingEntries] = useState<FundingEntry[]>(SEED_FUNDING);
  const [pilotEntries, setPilotEntries] = useState<PilotEntry[]>(SEED_PILOTS);
  const [messages, setMessages] = useState<Message[]>(SEED_MESSAGES);
  const [issueRoutings, setIssueRoutings] = useState<IssueRouting[]>(SEED_ROUTING);
  const [notifications, setNotifications] = useState<Notification[]>(SEED_NOTIFICATIONS);
  const [collabRequests, setCollabRequests] = useState<CollaborationRequest[]>(SEED_COLLAB_REQUESTS);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(SEED_OPPORTUNITIES);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);

  const addProblem = (p: Problem) => setProblems(prev => [p, ...prev]);
  const updateProblemStatus = (id: string, status: Problem["status"], extra?: Partial<Problem>) =>
    setProblems(prev => prev.map(p => p.id === id ? { ...p, status, ...extra } : p));
  const addTask = (t: Task) => setTasks(prev => [t, ...prev]);
  const updateTask = (id: string, updates: Partial<Task>) =>
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  const addTeam = (t: Team) => setTeams(prev => [t, ...prev]);
  const updateTeam = (id: string, updates: Partial<Team>) =>
    setTeams(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  const addMilestone = (m: Milestone) => setMilestones(prev => [m, ...prev]);
  const updateMilestone = (id: string, updates: Partial<Milestone>) =>
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  const addDeliverable = (d: Deliverable) => setDeliverables(prev => [d, ...prev]);
  const updateDeliverable = (id: string, updates: Partial<Deliverable>) =>
    setDeliverables(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  const addMentoringEntry = (m: MentoringEntry) => setMentoringEntries(prev => [m, ...prev]);
  const updateMentoringEntry = (id: string, updates: Partial<MentoringEntry>) =>
    setMentoringEntries(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  const addFundingEntry = (f: FundingEntry) => setFundingEntries(prev => [f, ...prev]);
  const updateFundingEntry = (id: string, updates: Partial<FundingEntry>) =>
    setFundingEntries(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  const addPilotEntry = (p: PilotEntry) => setPilotEntries(prev => [p, ...prev]);
  const updatePilotEntry = (id: string, updates: Partial<PilotEntry>) =>
    setPilotEntries(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  const sendMessage = (m: Omit<Message, "id" | "sentAt" | "read">) =>
    setMessages(prev => [...prev, { ...m, id: `MSG-${String(msgCounter++).padStart(3, "0")}`, sentAt: new Date().toLocaleString("en-IN"), read: false }]);
  const markMessageRead = (id: string) =>
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
  const addIssueRouting = (r: IssueRouting) => {
    setIssueRoutings(prev => [{ ...r, id: `RT-${String(rtCounter++).padStart(3, "0")}` }, ...prev]);
  };
  const markNotifRead = (id: string) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const addNotification = (n: Omit<Notification, "id">) =>
    setNotifications(prev => [{ ...n, id: `N${String(notifCounter++).padStart(3, "0")}` }, ...prev]);
  const addCollabRequest = (r: CollaborationRequest) => setCollabRequests(prev => [r, ...prev]);
  const updateCollabRequest = (id: string, status: CollaborationRequest["status"]) =>
    setCollabRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  const addOpportunity = (o: Opportunity) => setOpportunities(prev => [o, ...prev]);
  const logAudit = (entry: Omit<AuditEntry, "id" | "timestamp">) =>
    setAuditLog(prev => [{ ...entry, id: `AUD-${String(auditCounter++).padStart(4, "0")}`, timestamp: new Date().toLocaleString("en-IN") }, ...prev]);

  return (
    <AppContext.Provider value={{
      user, setUser, problems, addProblem, updateProblemStatus,
      tasks, addTask, updateTask,
      teams, addTeam, updateTeam,
      milestones, addMilestone, updateMilestone,
      deliverables, addDeliverable, updateDeliverable,
      mentoringEntries, addMentoringEntry, updateMentoringEntry,
      fundingEntries, addFundingEntry, updateFundingEntry,
      pilotEntries, addPilotEntry, updatePilotEntry,
      messages, sendMessage, markMessageRead,
      issueRoutings, addIssueRouting,
      notifications, markNotifRead, addNotification,
      collabRequests, addCollabRequest, updateCollabRequest,
      opportunities, addOpportunity,
      auditLog, logAudit,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}

// Counter helpers for new IDs
export function newMilestoneId() { return `MS-${String(msCounter++).padStart(3, "0")}`; }
export function newDeliverableId() { return `DL-${String(dlCounter++).padStart(3, "0")}`; }
export function newMentoringId() { return `MNT-${String(mntCounter++).padStart(3, "0")}`; }
export function newFundingId() { return `FND-${String(fndCounter++).padStart(3, "0")}`; }
export function newPilotId() { return `PLT-${String(pltCounter++).padStart(3, "0")}`; }
