import { useState } from "react";
import type { ReactNode } from "react";
import { useApp } from "../context/AppContext";
import type { Role, UserSession } from "../context/AppContext";

type Step = "landing" | "login" | "role-select" | "register" | "verify" | "virtual-id" | "set-password" | "done";

const ROLE_OPTIONS: { id: Role; label: string; icon: string; description: string }[] = [
  { id: "citizen", label: "Citizen", icon: "👤", description: "Report civic issues & track resolution" },
  { id: "official", label: "Government Official", icon: "🏛️", description: "Manage problems & assign tasks" },
  { id: "university", label: "University / College / HEI", icon: "🎓", description: "Form teams & develop solutions" },
  { id: "industry", label: "Industry / Organization", icon: "🏭", description: "Mentoring, funding & pilot implementation" },
  { id: "staff", label: "CSC / Govt. Staff", icon: "🖥️", description: "Assisted registration for citizens" },
  { id: "admin", label: "Administrator", icon: "⚙️", description: "Complete system administration" },
];

const DEMO_ACCOUNTS: Record<string, { virtualId: string; password: string; name: string; role: Role; organization?: string; district?: string; designation?: string }> = {
  "JA-C-00023": { virtualId: "JA-C-00023", password: "citizen123", name: "Ramesh Kumar Singh", role: "citizen", district: "Ranchi" },
  "JA-O-00001": { virtualId: "JA-O-00001", password: "official123", name: "Arvind Kumar IAS", role: "official", district: "Ranchi", designation: "District Collector" },
  "JA-U-00001": { virtualId: "JA-U-00001", password: "univ123", name: "Dr. Anita Sharma", role: "university", organization: "BIT Mesra", designation: "Dean, Research & Innovation" },
  "JA-I-00001": { virtualId: "JA-I-00001", password: "industry123", name: "Rajesh Verma", role: "industry", organization: "Tata Steel Ltd.", designation: "Head of CSR" },
  "JA-S-00001": { virtualId: "JA-S-00001", password: "staff123", name: "Ramani Devi", role: "staff", district: "Simdega", designation: "CSC Operator" },
  "JA-A-00001": { virtualId: "JA-A-00001", password: "admin123", name: "Chief Secretary Office", role: "admin", organization: "Govt. of Jharkhand" },
};

function genVirtualId(role: Role): string {
  const prefix: Record<Role, string> = { citizen: "C", official: "O", university: "U", industry: "I", staff: "S", admin: "A" };
  return `JA-${prefix[role]}-${String(Math.floor(Math.random() * 90000) + 10000)}`;
}

const DISTRICTS = ["Ranchi", "Dhanbad", "Jamshedpur", "Bokaro", "Deoghar", "Hazaribagh", "Dumka", "Giridih", "Gumla", "Simdega", "Lohardaga", "Khunti", "West Singhbhum", "Koderma", "Chatra", "Palamu", "Garwha", "Latehar", "Ramgarh", "Seraikela-Kharsawan", "Sahebganj", "Pakur", "Godda", "Jamtara"];

const ROLE_FIELD_INFO: Record<Role, { title: string; requiredNote: string }> = {
  citizen: { title: "Citizen Registration", requiredNote: "Gmail/Email and Aadhaar required for identity verification." },
  official: { title: "Government Official Registration", requiredNote: "Government Official ID and Aadhaar required. District assignment mandatory." },
  university: { title: "University / College / HEI Registration", requiredNote: "Aadhaar, College Name, AICTE Code, and your role (Student/Faculty) required." },
  industry: { title: "Industry / Organization Registration", requiredNote: "GST Number and organization name required. Aadhaar for contact person." },
  staff: { title: "CSC / Government Staff Registration", requiredNote: "Government/SI Official ID and district assignment required." },
  admin: { title: "Administrator Registration", requiredNote: "All fields required. Admin access is restricted." },
};

export default function AuthFlow() {
  const { setUser, logAudit } = useApp();
  const [step, setStep] = useState<Step>("landing");

  // Login state
  const [loginId, setLoginId] = useState("");
  const [loginPwd, setLoginPwd] = useState("");
  const [loginError, setLoginError] = useState("");

  // Registration state — base fields
  const [reg, setReg] = useState({
    name: "", aadhaar: "", phone: "", role: "" as Role | "",
    organization: "", district: "", designation: "", email: "",
    dob: "", gender: "",
    // Role-specific fields
    officialId: "",           // official, staff
    gstNumber: "",            // industry
    aicteCode: "",            // university
    universitySubRole: "",    // university: "Student" | "Teacher/Faculty"
    collegeName: "",          // university
  });
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});
  const [otp, setOtp] = useState("");
  const [generatedId, setGeneratedId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdError, setPwdError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const acc = DEMO_ACCOUNTS[loginId.trim().toUpperCase()];
    if (!acc) { setLoginError("Virtual ID not found. Please check and try again."); return; }
    if (acc.password !== loginPwd) { setLoginError("Incorrect password. Please try again."); return; }
    const session: UserSession = { virtualId: acc.virtualId, name: acc.name, role: acc.role, email: `${acc.virtualId.toLowerCase()}@janabhiyan.jh.gov.in`, phone: "XXXXXXXXXX", organization: acc.organization, district: acc.district, designation: acc.designation, lastLogin: new Date().toLocaleString("en-IN") };
    logAudit({ actor: acc.name, actorRole: acc.role, action: "LOGIN", entity: "Session", entityId: acc.virtualId, details: "User logged in successfully" });
    setUser(session);
  };

  const validateReg = () => {
    const errors: Record<string, string> = {};
    if (!reg.name.trim()) errors.name = "Full name is required";
    if (!reg.aadhaar.replace(/\s/g, "").match(/^\d{12}$/) && reg.role !== "industry") errors.aadhaar = "Valid 12-digit Aadhaar number required";
    if (!reg.phone.match(/^[6-9]\d{9}$/)) errors.phone = "Valid 10-digit mobile number required";
    if (!reg.email.trim()) errors.email = "Email address is required";
    if (reg.role === "official") {
      if (!reg.district) errors.district = "District is required";
      if (!reg.officialId.trim()) errors.officialId = "Government Official ID is required";
    }
    if (reg.role === "staff") {
      if (!reg.district) errors.district = "District is required";
      if (!reg.officialId.trim()) errors.officialId = "Government/SI Official ID is required";
    }
    if (reg.role === "university") {
      if (!reg.collegeName.trim()) errors.collegeName = "College/University name is required";
      if (!reg.aicteCode.trim()) errors.aicteCode = "AICTE Code is required";
      if (!reg.universitySubRole) errors.universitySubRole = "Please select Student or Teacher/Faculty";
    }
    if (reg.role === "industry") {
      if (!reg.organization.trim()) errors.organization = "Industry/Company name is required";
      if (!reg.gstNumber.trim()) errors.gstNumber = "GST Number is required";
    }
    setRegErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateReg()) setStep("verify");
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    const newId = genVirtualId(reg.role as Role);
    setGeneratedId(newId);
    setStep("virtual-id");
  };

  const handleSetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError("");
    if (password.length < 8) { setPwdError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setPwdError("Passwords do not match."); return; }
    setStep("done");
  };

  const handleStartUsing = () => {
    const session: UserSession = {
      virtualId: generatedId,
      name: reg.name,
      role: reg.role as Role,
      email: reg.email,
      phone: reg.phone,
      organization: reg.role === "university" ? (reg.collegeName || reg.organization) : reg.organization || undefined,
      district: reg.district || undefined,
      designation: reg.designation || undefined,
      lastLogin: new Date().toLocaleString("en-IN"),
    };
    logAudit({ actor: reg.name, actorRole: reg.role, action: "REGISTRATION", entity: "User", entityId: generatedId, details: `New ${reg.role} account created.` });
    setUser(session);
  };

  const progressSteps = ["Step 1: Select Role", "Step 2: Identity", "Step 3: Verify OTP", "Step 4: Virtual ID", "Step 5: Password"];
  const stepIndex: Record<Step, number> = { landing: 0, login: 0, "role-select": 0, register: 1, verify: 2, "virtual-id": 3, "set-password": 4, done: 4 };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", display: "flex", flexDirection: "column" }}>
      {/* National Header */}
      <div style={{ background: "#003580", color: "rgba(255,255,255,0.85)", padding: "4px 16px", fontSize: 11, display: "flex", justifyContent: "space-between" }}>
        <span>भारत सरकार | Government of India — झारखंड सरकार | Government of Jharkhand</span>
        <div style={{ display: "flex", gap: 16 }}><span>English</span><span>हिन्दी</span><span>संताली</span></div>
      </div>

      {/* App Header */}
      <div style={{ background: "white", borderBottom: "3px solid #ff6600", padding: "12px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 52, height: 52, background: "#003580", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🇮🇳</div>
        <div>
          <div style={{ fontFamily: "'Noto Serif', serif", fontWeight: 700, fontSize: 22, color: "#003580", lineHeight: 1.1 }}>Jan Abhiyan</div>
          <div style={{ fontSize: 11, color: "#5a6675", fontWeight: 500, letterSpacing: "0.04em" }}>SOCIETAL INNOVATION COLLABORATION PORTAL — JHARKHAND</div>
          <div style={{ fontSize: 10, color: "#ff6600", fontStyle: "italic" }}>Ek Unnati, Samadhan aur Navachar ka Manch</div>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "32px 16px" }}>
        <div style={{ width: "100%", maxWidth: 560 }}>

          {/* LANDING */}
          {step === "landing" && (
            <div>
              <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 28, textAlign: "center", marginBottom: 16 }}>
                <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 20, fontWeight: 700, color: "#003580" }}>Welcome to Jan Abhiyan</div>
                <div style={{ fontSize: 13, color: "#5a6675", marginTop: 6 }}>People. Problems. Ideas. Innovations. Impact.</div>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20 }}>
                  <button onClick={() => setStep("login")} style={{ background: "#003580", color: "white", border: "none", borderRadius: 3, padding: "10px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                    Login
                  </button>
                  <button onClick={() => setStep("role-select")} style={{ background: "transparent", color: "#003580", border: "2px solid #003580", borderRadius: 3, padding: "10px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                    New Registration
                  </button>
                </div>
              </div>
              <div style={{ background: "#fff8e1", border: "1px solid #f39c12", borderRadius: 4, padding: "10px 16px", fontSize: 12, color: "#7d5a00" }}>
                <strong>Demo Accounts:</strong>{" "}
                <code style={{ background: "#f5e8c0", padding: "1px 5px", borderRadius: 2 }}>JA-C-00023</code> / <code style={{ background: "#f5e8c0", padding: "1px 5px", borderRadius: 2 }}>citizen123</code> Citizen &nbsp;|&nbsp;
                <code style={{ background: "#f5e8c0", padding: "1px 5px", borderRadius: 2 }}>JA-O-00001</code> / <code style={{ background: "#f5e8c0", padding: "1px 5px", borderRadius: 2 }}>official123</code> Official &nbsp;|&nbsp;
                <code style={{ background: "#f5e8c0", padding: "1px 5px", borderRadius: 2 }}>JA-U-00001</code> / <code style={{ background: "#f5e8c0", padding: "1px 5px", borderRadius: 2 }}>univ123</code> University &nbsp;|&nbsp;
                <code style={{ background: "#f5e8c0", padding: "1px 5px", borderRadius: 2 }}>JA-I-00001</code> / <code style={{ background: "#f5e8c0", padding: "1px 5px", borderRadius: 2 }}>industry123</code> Industry &nbsp;|&nbsp;
                <code style={{ background: "#f5e8c0", padding: "1px 5px", borderRadius: 2 }}>JA-A-00001</code> / <code style={{ background: "#f5e8c0", padding: "1px 5px", borderRadius: 2 }}>admin123</code> Admin
              </div>
            </div>
          )}

          {/* LOGIN */}
          {step === "login" && (
            <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 28 }}>
              <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 18, fontWeight: 700, color: "#003580", marginBottom: 4 }}>Login to Jan Abhiyan</div>
              <div style={{ fontSize: 12, color: "#5a6675", marginBottom: 20 }}>Enter your Virtual ID and password to access your dashboard.</div>
              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#5a6675", display: "block", marginBottom: 4 }}>Virtual User ID *</label>
                  <input value={loginId} onChange={e => setLoginId(e.target.value)} placeholder="e.g. JA-C-00023" required style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 3, padding: "9px 12px", fontSize: 13, fontFamily: "JetBrains Mono, monospace" }} />
                  <div style={{ fontSize: 11, color: "#5a6675", marginTop: 3 }}>Received during registration. Format: JA-X-XXXXX</div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#5a6675", display: "block", marginBottom: 4 }}>Password *</label>
                  <input type="password" value={loginPwd} onChange={e => setLoginPwd(e.target.value)} placeholder="Enter your password" required style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 3, padding: "9px 12px", fontSize: 13 }} />
                </div>
                {loginError && <div style={{ background: "#fdf0f0", border: "1px solid #e74c3c", borderRadius: 3, padding: "8px 12px", fontSize: 12, color: "#c0392b", marginBottom: 12 }}>❌ {loginError}</div>}
                <button type="submit" style={{ width: "100%", background: "#003580", color: "white", border: "none", borderRadius: 3, padding: "10px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                  Login → Access Dashboard
                </button>
              </form>
              <div style={{ marginTop: 16, textAlign: "center", fontSize: 12, color: "#5a6675" }}>
                New user?{" "}
                <button onClick={() => setStep("role-select")} style={{ background: "none", border: "none", color: "#003580", fontWeight: 700, cursor: "pointer", fontSize: 12 }}>Register here</button>
              </div>
              <div style={{ marginTop: 8, textAlign: "center" }}>
                <button onClick={() => setStep("landing")} style={{ background: "none", border: "none", color: "#7a8696", fontSize: 11, cursor: "pointer" }}>← Back</button>
              </div>
            </div>
          )}

          {/* STEP 1: ROLE SELECTION */}
          {step === "role-select" && (
            <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 28 }}>
              <ProgressBar steps={progressSteps} current={0} />
              <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 18, fontWeight: 700, color: "#003580", marginBottom: 4 }}>Select Your Role</div>
              <div style={{ fontSize: 12, color: "#5a6675", marginBottom: 20 }}>Choose the role that best describes your participation in Jan Abhiyan. Registration fields will be customized based on your role.</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                {ROLE_OPTIONS.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setReg(prev => ({ ...prev, role: r.id }))}
                    style={{
                      border: `2px solid ${reg.role === r.id ? "#003580" : "var(--border)"}`,
                      borderRadius: 4,
                      padding: "14px 12px",
                      cursor: "pointer",
                      background: reg.role === r.id ? "#f0f5ff" : "white",
                      textAlign: "left",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{r.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#003580" }}>{r.label}</div>
                    <div style={{ fontSize: 10, color: "#5a6675", marginTop: 2, lineHeight: 1.4 }}>{r.description}</div>
                    {reg.role === r.id && <div style={{ marginTop: 6, fontSize: 10, color: "#003580", fontWeight: 700 }}>✓ Selected</div>}
                  </button>
                ))}
              </div>
              {reg.role && (
                <div style={{ background: "#f0f8f0", border: "1px solid #27ae60", borderRadius: 3, padding: "8px 12px", fontSize: 11, color: "#1a6630", marginBottom: 16 }}>
                  ℹ️ <strong>{ROLE_FIELD_INFO[reg.role as Role].requiredNote}</strong>
                </div>
              )}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setStep("landing")} style={{ background: "transparent", border: "1.5px solid #5a6675", borderRadius: 3, padding: "9px 18px", fontSize: 13, color: "#5a6675", cursor: "pointer" }}>← Back</button>
                <button
                  onClick={() => { if (reg.role) setStep("register"); }}
                  disabled={!reg.role}
                  style={{ background: reg.role ? "#003580" : "#a0aab4", color: "white", border: "none", borderRadius: 3, padding: "9px 24px", fontSize: 13, fontWeight: 700, cursor: reg.role ? "pointer" : "not-allowed" }}
                >
                  Continue with {reg.role ? ROLE_OPTIONS.find(r => r.id === reg.role)?.label : "selected role"} →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: REGISTRATION FORM */}
          {step === "register" && (
            <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 28 }}>
              <ProgressBar steps={progressSteps} current={1} />
              <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 18, fontWeight: 700, color: "#003580", marginBottom: 2 }}>
                {ROLE_FIELD_INFO[reg.role as Role]?.title || "New Registration"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <span style={{ background: "#f0f5ff", border: "1.5px solid #003580", color: "#003580", fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>
                  {ROLE_OPTIONS.find(r => r.id === reg.role)?.icon} {ROLE_OPTIONS.find(r => r.id === reg.role)?.label}
                </span>
                <button onClick={() => setStep("role-select")} style={{ background: "none", border: "none", color: "#5a6675", fontSize: 11, cursor: "pointer", textDecoration: "underline" }}>Change role</button>
              </div>

              <form onSubmit={handleRegSubmit}>
                <Section title="Personal Information">
                  <Field2 label="Full Name *" value={reg.name} error={regErrors.name} onChange={v => setReg({ ...reg, name: v })} placeholder="As per Aadhaar card" />
                  {reg.role !== "industry" && (
                    <Field2 label="Aadhaar Number *" value={reg.aadhaar} error={regErrors.aadhaar} onChange={v => setReg({ ...reg, aadhaar: v })} placeholder="XXXX XXXX XXXX" />
                  )}
                  <Field2 label="Mobile Number *" value={reg.phone} error={regErrors.phone} onChange={v => setReg({ ...reg, phone: v })} placeholder="10-digit number" type="tel" />
                  <Field2 label="Email Address *" value={reg.email} error={regErrors.email} onChange={v => setReg({ ...reg, email: v })} placeholder="Gmail or official email" type="email" />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Field2 label="Date of Birth" value={reg.dob} onChange={v => setReg({ ...reg, dob: v })} type="date" />
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#5a6675", display: "block", marginBottom: 4 }}>Gender</label>
                      <select value={reg.gender} onChange={e => setReg({ ...reg, gender: e.target.value })} style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 3, padding: "8px 10px", fontSize: 13, background: "white" }}>
                        <option value="">Select</option>
                        <option>Male</option><option>Female</option><option>Other</option><option>Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                </Section>

                {/* CITIZEN role-specific */}
                {reg.role === "citizen" && (
                  <Section title="Location Information">
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#5a6675", display: "block", marginBottom: 4 }}>District</label>
                      <select value={reg.district} onChange={e => setReg({ ...reg, district: e.target.value })} style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 3, padding: "8px 10px", fontSize: 13, background: "white" }}>
                        <option value="">Select District</option>
                        {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                  </Section>
                )}

                {/* GOVERNMENT OFFICIAL role-specific */}
                {reg.role === "official" && (
                  <Section title="Government Official Details">
                    <Field2 label="Government Official ID *" value={reg.officialId} error={regErrors.officialId} onChange={v => setReg({ ...reg, officialId: v })} placeholder="e.g. IAS-JH-2018-0042" />
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#5a6675", display: "block", marginBottom: 4 }}>District *</label>
                      <select value={reg.district} onChange={e => setReg({ ...reg, district: e.target.value })} style={{ width: "100%", border: `1px solid ${regErrors.district ? "#e74c3c" : "var(--border)"}`, borderRadius: 3, padding: "8px 10px", fontSize: 13, background: "white" }}>
                        <option value="">Select District</option>
                        {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                      </select>
                      {regErrors.district && <div style={{ fontSize: 11, color: "#c0392b", marginTop: 3 }}>⚠️ {regErrors.district}</div>}
                    </div>
                    <Field2 label="Designation / Rank *" value={reg.designation} onChange={v => setReg({ ...reg, designation: v })} placeholder="e.g. District Collector, BDO" />
                    <Field2 label="Department / Office" value={reg.organization} onChange={v => setReg({ ...reg, organization: v })} placeholder="e.g. PWD Jharkhand, JBVNL" />
                    <div style={{ background: "#fff3e0", border: "1px solid #e67e22", borderRadius: 3, padding: "8px 10px", fontSize: 11, color: "#7d4e00" }}>
                      ℹ️ Government Official ID will be verified against the State Government employee database.
                    </div>
                  </Section>
                )}

                {/* UNIVERSITY role-specific */}
                {reg.role === "university" && (
                  <Section title="University / College Details">
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#5a6675", display: "block", marginBottom: 4 }}>You are a *</label>
                      {regErrors.universitySubRole && <div style={{ fontSize: 11, color: "#c0392b", marginBottom: 6 }}>⚠️ {regErrors.universitySubRole}</div>}
                      <div style={{ display: "flex", gap: 10 }}>
                        {["Student", "Teacher/Faculty"].map(opt => (
                          <label key={opt} style={{ flex: 1, border: `2px solid ${reg.universitySubRole === opt ? "#003580" : "var(--border)"}`, borderRadius: 3, padding: "10px 12px", cursor: "pointer", background: reg.universitySubRole === opt ? "#f0f5ff" : "white", display: "flex", alignItems: "center", gap: 8 }}>
                            <input type="radio" name="universitySubRole" value={opt} checked={reg.universitySubRole === opt} onChange={() => setReg({ ...reg, universitySubRole: opt })} />
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#003580" }}>{opt === "Student" ? "🎓 Student" : "👨‍🏫 Teacher / Faculty"}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <Field2 label="College / University Name *" value={reg.collegeName} error={regErrors.collegeName} onChange={v => setReg({ ...reg, collegeName: v })} placeholder="e.g. BIT Mesra, NIT Jamshedpur" />
                    <Field2 label="AICTE Code *" value={reg.aicteCode} error={regErrors.aicteCode} onChange={v => setReg({ ...reg, aicteCode: v })} placeholder="e.g. 1-1234567" />
                    <Field2 label="Designation / Department" value={reg.designation} onChange={v => setReg({ ...reg, designation: v })} placeholder={reg.universitySubRole === "Student" ? "e.g. B.Tech CSE, 3rd Year" : "e.g. Professor, Dept. of Civil Engg."} />
                    <div style={{ background: "#fff3e0", border: "1px solid #e67e22", borderRadius: 3, padding: "8px 10px", fontSize: 11, color: "#7d4e00" }}>
                      ℹ️ AICTE Code will be verified against the AICTE approved institutions database. Government Official ID is NOT required for university users.
                    </div>
                  </Section>
                )}

                {/* INDUSTRY role-specific */}
                {reg.role === "industry" && (
                  <Section title="Industry / Organization Details">
                    <Field2 label="Industry / Company Name *" value={reg.organization} error={regErrors.organization} onChange={v => setReg({ ...reg, organization: v })} placeholder="e.g. Tata Steel Ltd." />
                    <Field2 label="GST Number *" value={reg.gstNumber} error={regErrors.gstNumber} onChange={v => setReg({ ...reg, gstNumber: v.toUpperCase() })} placeholder="e.g. 20AAAAA0000A1Z5" />
                    <Field2 label="Designation / Role" value={reg.designation} onChange={v => setReg({ ...reg, designation: v })} placeholder="e.g. CEO, Head of CSR, Founder" />
                    <div style={{ background: "#fff3e0", border: "1px solid #e67e22", borderRadius: 3, padding: "8px 10px", fontSize: 11, color: "#7d4e00" }}>
                      ℹ️ GST Number will be verified against GSTIN portal. Aadhaar is not required for industry registration; your company identity is verified via GST.
                    </div>
                  </Section>
                )}

                {/* CSC / STAFF role-specific */}
                {reg.role === "staff" && (
                  <Section title="CSC / Staff Details">
                    <Field2 label="Government / SI Official ID *" value={reg.officialId} error={regErrors.officialId} onChange={v => setReg({ ...reg, officialId: v })} placeholder="e.g. CSC-JH-2022-0589" />
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#5a6675", display: "block", marginBottom: 4 }}>District *</label>
                      <select value={reg.district} onChange={e => setReg({ ...reg, district: e.target.value })} style={{ width: "100%", border: `1px solid ${regErrors.district ? "#e74c3c" : "var(--border)"}`, borderRadius: 3, padding: "8px 10px", fontSize: 13, background: "white" }}>
                        <option value="">Select District</option>
                        {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                      </select>
                      {regErrors.district && <div style={{ fontSize: 11, color: "#c0392b", marginTop: 3 }}>⚠️ {regErrors.district}</div>}
                    </div>
                    <Field2 label="CSC Centre Name / Office" value={reg.organization} onChange={v => setReg({ ...reg, organization: v })} placeholder="e.g. Simdega Block CSC" />
                    <Field2 label="Designation" value={reg.designation} onChange={v => setReg({ ...reg, designation: v })} placeholder="e.g. CSC Operator, SI Officer" />
                  </Section>
                )}

                {/* ADMIN role-specific */}
                {reg.role === "admin" && (
                  <Section title="Administrator Details">
                    <Field2 label="Department / Organization *" value={reg.organization} onChange={v => setReg({ ...reg, organization: v })} placeholder="e.g. Chief Secretary Office, NIC Jharkhand" />
                    <Field2 label="Official ID / Employee Code *" value={reg.officialId} onChange={v => setReg({ ...reg, officialId: v })} placeholder="e.g. GOJ-ADM-2024-001" />
                    <div style={{ background: "#fdf0f0", border: "1px solid #e74c3c", borderRadius: 3, padding: "8px 10px", fontSize: 11, color: "#c0392b" }}>
                      ⚠️ Administrator accounts require manual approval from the Jan Abhiyan system administrator before activation.
                    </div>
                  </Section>
                )}

                <div style={{ background: "#f0f5ff", border: "1px solid #c5d4f0", borderRadius: 3, padding: 12, marginTop: 16, fontSize: 11, color: "#003580" }}>
                  🔒 <strong>Privacy Notice:</strong> Your Aadhaar number, phone, and personal details are encrypted and stored securely. They will only be used for identity verification and will never be publicly displayed.
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 18, justifyContent: "flex-end" }}>
                  <button type="button" onClick={() => setStep("role-select")} style={{ background: "transparent", border: "1.5px solid #5a6675", borderRadius: 3, padding: "9px 18px", fontSize: 13, color: "#5a6675", cursor: "pointer" }}>← Back</button>
                  <button type="submit" style={{ background: "#003580", color: "white", border: "none", borderRadius: 3, padding: "9px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                    Send OTP for Verification →
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* VERIFY OTP */}
          {step === "verify" && (
            <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 28 }}>
              <ProgressBar steps={progressSteps} current={2} />
              <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 18, fontWeight: 700, color: "#003580", marginBottom: 4 }}>OTP Verification</div>
              <div style={{ fontSize: 12, color: "#5a6675", marginBottom: 20 }}>An OTP has been sent to <strong>+91 {reg.phone.replace(/(\d{2})(\d{4})(\d{4})/, "$1XX XXXX $3")}</strong> and <strong>{reg.email}</strong>.</div>
              <div style={{ background: "#fff8e1", border: "1px solid #f39c12", borderRadius: 3, padding: "8px 12px", fontSize: 11, color: "#7d5a00", marginBottom: 16 }}>
                Demo OTP: <strong>123456</strong> (any 6-digit number works in demo mode)
              </div>
              <form onSubmit={handleVerify}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#5a6675", display: "block", marginBottom: 4 }}>Enter 6-digit OTP *</label>
                  <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/, "").slice(0, 6))} placeholder="XXXXXX" maxLength={6} required style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 3, padding: "10px 12px", fontSize: 20, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.3em", textAlign: "center" }} />
                </div>
                <button type="submit" disabled={otp.length < 6} style={{ width: "100%", background: otp.length < 6 ? "#a0aab4" : "#003580", color: "white", border: "none", borderRadius: 3, padding: "10px", fontSize: 14, fontWeight: 700, cursor: otp.length < 6 ? "not-allowed" : "pointer" }}>
                  Verify & Continue →
                </button>
              </form>
              <div style={{ marginTop: 12, textAlign: "center" }}>
                <button onClick={() => setStep("register")} style={{ background: "none", border: "none", color: "#7a8696", fontSize: 11, cursor: "pointer" }}>← Back to Registration</button>
              </div>
            </div>
          )}

          {/* VIRTUAL ID */}
          {step === "virtual-id" && (
            <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 28 }}>
              <ProgressBar steps={progressSteps} current={3} />
              <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
                <div style={{ fontSize: 48 }}>🎉</div>
                <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 18, fontWeight: 700, color: "#003580", marginTop: 8 }}>Identity Verified!</div>
                <div style={{ fontSize: 13, color: "#5a6675", marginTop: 4 }}>Your unique Virtual User ID has been generated.</div>
              </div>
              <div style={{ background: "#f0f5ff", border: "2px solid #003580", borderRadius: 4, padding: "18px 24px", textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: "#5a6675", fontWeight: 600, marginBottom: 6 }}>YOUR VIRTUAL USER ID</div>
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 28, fontWeight: 700, color: "#003580", letterSpacing: "0.06em" }}>{generatedId}</div>
                <div style={{ fontSize: 11, color: "#5a6675", marginTop: 6 }}>Save this ID. You will use it every time you login.</div>
              </div>
              <div style={{ background: "#fdf0f0", border: "1px solid #e74c3c", borderRadius: 3, padding: "10px 14px", fontSize: 12, color: "#c0392b", marginBottom: 20 }}>
                ⚠️ <strong>Important:</strong> Write down or screenshot your Virtual ID now. It cannot be recovered without identity re-verification.
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#5a6675", marginBottom: 16 }}>
                <span>Name: <strong style={{ color: "#0d1b2a" }}>{reg.name}</strong></span>
                <span>Role: <strong style={{ color: "#003580" }}>{ROLE_OPTIONS.find(r => r.id === reg.role)?.label}</strong></span>
              </div>
              <button onClick={() => setStep("set-password")} style={{ width: "100%", background: "#003580", color: "white", border: "none", borderRadius: 3, padding: "10px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                Set Password →
              </button>
            </div>
          )}

          {/* SET PASSWORD */}
          {step === "set-password" && (
            <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 28 }}>
              <ProgressBar steps={progressSteps} current={4} />
              <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 18, fontWeight: 700, color: "#003580", marginBottom: 4 }}>Create Secure Password</div>
              <div style={{ fontSize: 12, color: "#5a6675", marginBottom: 20 }}>Create a strong password for your account. Minimum 8 characters.</div>
              <form onSubmit={handleSetPassword}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#5a6675", display: "block", marginBottom: 4 }}>New Password *</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimum 8 characters" required style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 3, padding: "9px 12px", fontSize: 13 }} />
                  <div style={{ marginTop: 4, display: "flex", gap: 6 }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{ height: 3, flex: 1, borderRadius: 2, background: password.length >= (i === 0 ? 1 : i === 1 ? 8 : 12) ? (password.length >= 12 ? "#138808" : password.length >= 8 ? "#e67e22" : "#e67e22") : "#e8ecf0" }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 10, color: "#7a8696", marginTop: 3 }}>Use uppercase, numbers, and symbols for stronger security</div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#5a6675", display: "block", marginBottom: 4 }}>Confirm Password *</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter your password" required style={{ width: "100%", border: `1px solid ${confirmPassword && confirmPassword !== password ? "#e74c3c" : "var(--border)"}`, borderRadius: 3, padding: "9px 12px", fontSize: 13 }} />
                  {confirmPassword && confirmPassword !== password && <div style={{ fontSize: 11, color: "#c0392b", marginTop: 3 }}>Passwords do not match</div>}
                </div>
                {pwdError && <div style={{ background: "#fdf0f0", border: "1px solid #e74c3c", borderRadius: 3, padding: "8px 12px", fontSize: 12, color: "#c0392b", marginBottom: 12 }}>⚠️ {pwdError}</div>}
                <button type="submit" style={{ width: "100%", background: "#138808", color: "white", border: "none", borderRadius: 3, padding: "10px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                  Create Account ✓
                </button>
              </form>
            </div>
          )}

          {/* DONE */}
          {step === "done" && (
            <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 4, padding: 28, textAlign: "center" }}>
              <div style={{ fontSize: 56 }}>🎊</div>
              <div style={{ fontFamily: "'Noto Serif', serif", fontSize: 20, fontWeight: 700, color: "#138808", marginTop: 12 }}>Account Created Successfully!</div>
              <div style={{ fontSize: 13, color: "#5a6675", marginTop: 6 }}>Welcome to Jan Abhiyan, <strong>{reg.name}</strong>.</div>
              <div style={{ background: "#f0f5ff", border: "2px solid #003580", borderRadius: 4, padding: "14px 20px", margin: "20px 0", display: "inline-block" }}>
                <div style={{ fontSize: 11, color: "#5a6675" }}>Virtual User ID</div>
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 22, fontWeight: 700, color: "#003580" }}>{generatedId}</div>
              </div>
              <div style={{ fontSize: 12, color: "#5a6675", marginBottom: 20 }}>
                You are registered as: <strong style={{ color: "#003580" }}>{ROLE_OPTIONS.find(r => r.id === reg.role)?.icon} {ROLE_OPTIONS.find(r => r.id === reg.role)?.label}</strong>.<br />
                You will be redirected to your assigned dashboard automatically.
              </div>
              <button onClick={handleStartUsing} style={{ background: "#003580", color: "white", border: "none", borderRadius: 3, padding: "11px 32px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                Enter Your Dashboard →
              </button>
            </div>
          )}

        </div>
      </div>

      <footer style={{ background: "#003580", color: "rgba(255,255,255,0.7)", fontSize: 11, textAlign: "center", padding: "8px 16px" }}>
        © 2024 Jan Abhiyan — Jharkhand Government | NIC Jharkhand | Help: 1800-XXX-XXXX
      </footer>
    </div>
  );
}

function ProgressBar({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", gap: 3 }}>
        {steps.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= current ? "#003580" : "#e8ecf0" }} />
        ))}
      </div>
      <div style={{ fontSize: 11, color: "#5a6675", marginTop: 5 }}>{steps[current]}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#003580", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid var(--border)" }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{children}</div>
    </div>
  );
}

function Field2({ label, value, onChange, placeholder, type = "text", error }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean; type?: string; error?: string;
}) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#5a6675", display: "block", marginBottom: 4 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: "100%", border: `1px solid ${error ? "#e74c3c" : "var(--border)"}`, borderRadius: 3, padding: "8px 10px", fontSize: 13, background: "white" }} />
      {error && <div style={{ fontSize: 11, color: "#c0392b", marginTop: 3 }}>⚠️ {error}</div>}
    </div>
  );
}
