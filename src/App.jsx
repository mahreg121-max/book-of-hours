import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "medusa-schedule-kemetic-v2";
const AUTH_KEY = "medusa-schedule-auth";
const PIN = "2026";

const ACTIVITY_PRESETS = {
  sleep: { label: "Sleep", color: "#2C2A4A", text: "#8B87B8", icon: "☽", lightBg: "#EEEDF5" },
  morning: { label: "Morning Ritual", color: "#7B6CB5", text: "#5A4A96", icon: "𓇳", lightBg: "#F0ECF8" },
  work: { label: "Work", color: "#3D6B8E", text: "#2A5070", icon: "𓊝", lightBg: "#E8F1F6" },
  job_search: { label: "Job Search", color: "#A0446C", text: "#883A5C", icon: "𓁹", lightBg: "#F5E8EF" },
  phd: { label: "PhD Prep", color: "#2D8B7A", text: "#1E7566", icon: "𓂀", lightBg: "#E6F4F1" },
  reading: { label: "Reading", color: "#B8860B", text: "#9A7009", icon: "𓏛", lightBg: "#F8F0DC" },
  tkd: { label: "Taekwondo", color: "#C0392B", text: "#A63125", icon: "𓃭", lightBg: "#FAEAE8" },
  swimming: { label: "Swimming", color: "#2980B9", text: "#1F6A9C", icon: "𓆛", lightBg: "#E6F0F9" },
  meal_prep: { label: "Meal Prep", color: "#27AE60", text: "#1E8C4E", icon: "𓇌", lightBg: "#E6F6ED" },
  financial: { label: "Financial", color: "#C49B1A", text: "#A68316", icon: "𓂝", lightBg: "#FAF3DC" },
  admin: { label: "Admin / Review", color: "#7F8C8D", text: "#626D6E", icon: "𓏜", lightBg: "#EFF1F1" },
  orthodoxy: { label: "Orthodoxy Course", color: "#8E5BAA", text: "#7A4D94", icon: "𓊽", lightBg: "#F2EAF6" },
  church: { label: "Divine Liturgy", color: "#8E5BAA", text: "#7A4D94", icon: "⛪", lightBg: "#F2EAF6" },
  self_time: { label: "Self-Time", color: "#16A085", text: "#11846C", icon: "𓋹", lightBg: "#E4F5F0" },
  buffer: { label: "Buffer", color: "#95A5A6", text: "#6B7B7C", icon: "𓃀", lightBg: "#F0F2F2" },
  bible: { label: "Bible + Prayer", color: "#7B6CB5", text: "#5A4A96", icon: "𓊹", lightBg: "#F0ECF8" },
  custom: { label: "Custom", color: "#6C757D", text: "#4A5258", icon: "◆", lightBg: "#EDEFF0" },
};

const COLOR_OPTIONS = [
  { name: "Indigo", color: "#5A4FCF", text: "#3F36A3", lightBg: "#EEECFA" },
  { name: "Ocean", color: "#2980B9", text: "#1F6A9C", lightBg: "#E6F0F9" },
  { name: "Emerald", color: "#27AE60", text: "#1E8C4E", lightBg: "#E6F6ED" },
  { name: "Gold", color: "#C49B1A", text: "#A68316", lightBg: "#FAF3DC" },
  { name: "Crimson", color: "#C0392B", text: "#A63125", lightBg: "#FAEAE8" },
  { name: "Plum", color: "#8E5BAA", text: "#7A4D94", lightBg: "#F2EAF6" },
  { name: "Teal", color: "#16A085", text: "#11846C", lightBg: "#E4F5F0" },
  { name: "Rose", color: "#A0446C", text: "#883A5C", lightBg: "#F5E8EF" },
  { name: "Slate", color: "#7F8C8D", text: "#626D6E", lightBg: "#EFF1F1" },
  { name: "Navy", color: "#1A3455", text: "#2A5070", lightBg: "#E8F1F6" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const FULL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DEFAULT_SCHEDULE = {
  Mon: [
    [6, 0.5, "morning", "Wake 6:00 · Prayer & meditation"],
    [6.5, 2, "buffer", "Get ready, breakfast, commute"],
    [8.5, 9, "work", ""],
    [17.5, 1, "buffer", "Commute, decompress, dinner"],
    [18.5, 2, "job_search", "Applications, networking, prep"],
    [20.5, 0.5, "bible", "Bible reading + evening prayer"],
    [21, 1, "self_time", "Journal, unwind"],
    [22, 8, "sleep", ""],
  ],
  Tue: [
    [6, 0.5, "morning", "Wake 6:00 · Prayer & meditation"],
    [6.5, 2, "buffer", "Get ready, breakfast, commute"],
    [8.5, 8.5, "work", "Leave by 5:00 for TKD"],
    [17, 1, "buffer", "Drive to dojang (40 min) + change"],
    [18, 3, "tkd", "Two back-to-back classes · Ends 9 PM"],
    [21, 0.75, "buffer", "Drive home (40 min) + shower"],
    [21.75, 0.25, "bible", "Bible + prayer (brief)"],
    [22, 8, "sleep", ""],
  ],
  Wed: [
    [6, 0.5, "morning", "Wake 6:00 · Prayer & meditation"],
    [6.5, 2, "buffer", "Get ready, breakfast, commute"],
    [8.5, 9, "work", ""],
    [17.5, 1.75, "buffer", "Commute home, eat, drive to dojang + change"],
    [19.25, 1.25, "tkd", "7:15–8:30 PM class"],
    [20.5, 0.5, "buffer", "Transition to Orthodoxy"],
    [21, 1.5, "orthodoxy", "9:00–10:30 PM course"],
    [22.5, 0.5, "buffer", "Commute home"],
    [23, 7, "sleep", "⚠ Late night — 7h sleep"],
  ],
  Thu: [
    [6.5, 0.5, "morning", "Wake 6:30 · Recovery from Wed"],
    [7, 1.5, "buffer", "Get ready, breakfast, commute"],
    [8.5, 8.5, "work", ""],
    [17, 0.5, "buffer", "Commute home"],
    [17.5, 2.5, "reading", "Deep reading — book + articles"],
    [20, 0.5, "bible", "Bible reading + evening prayer"],
    [20.5, 1, "self_time", "Journal, reflect"],
    [21.5, 0.5, "buffer", "Wind down"],
    [22, 8.5, "sleep", "Extended 8.5h recovery sleep"],
  ],
  Fri: [
    [6, 0.5, "morning", "Wake 6:00 · Prayer & meditation"],
    [6.5, 2, "buffer", "Get ready, breakfast, commute"],
    [8.5, 8.5, "work", ""],
    [17, 0.5, "buffer", "Commute home"],
    [17.5, 0.5, "tkd", "Solo forms practice at home"],
    [18, 1, "financial", "Budget, investing, systems"],
    [19, 1, "admin", "Life admin, errands"],
    [20, 0.5, "bible", "Bible reading + evening prayer"],
    [20.5, 1, "self_time", "Friday wind-down, social"],
    [21.5, 0.5, "buffer", "Wind down"],
    [22, 8, "sleep", ""],
  ],
  Sat: [
    [6, 0.5, "morning", "Wake 6:00 · Prayer & meditation"],
    [6.5, 1, "buffer", "Breakfast, morning routine"],
    [7.5, 4, "job_search", "Deep work: apps, interviews, networking"],
    [11.5, 0.5, "buffer", "Break, lunch"],
    [12, 3.5, "phd", "Research, papers, programs"],
    [15.5, 0.5, "buffer", "Transition"],
    [16, 2, "swimming", "Lesson + practice"],
    [18, 0.5, "buffer", "Shower, transition"],
    [18.5, 0.5, "bible", "Bible reading + evening prayer"],
    [19, 2.5, "self_time", "Rest, social, hobbies"],
    [21.5, 0.5, "buffer", "Wind down — early bed for 5:30"],
    [22, 7.5, "sleep", "7.5h — Sunday 5:30 wake"],
  ],
  Sun: [
    [5.5, 0.5, "morning", "Wake 5:30 · Quick prayer, get ready"],
    [6, 0.25, "buffer", "Drive to church"],
    [6.25, 4, "church", "Divine Liturgy · ~6:15–10:15 AM"],
    [10.25, 0.5, "buffer", "Drive home, change"],
    [10.75, 3.5, "orthodoxy", "Orthodoxy study at home"],
    [14.25, 0.5, "buffer", "Break, lunch"],
    [14.75, 3, "meal_prep", "Cook + prep meals for the week"],
    [17.75, 0.75, "admin", "WEEKLY REVIEW — plan next week"],
    [18.5, 0.5, "bible", "Bible reading + evening prayer"],
    [19, 1, "self_time", "Rest, call family"],
    [20, 2, "buffer", "Wind down, prep for Monday"],
    [22, 8, "sleep", "Full 8h reset"],
  ],
};

const DEFAULT_CUSTOM_ACTIVITIES = {};

const hourToTime = (h) => {
  const hr = Math.floor(h % 24);
  const min = Math.round((h % 1) * 60);
  const ampm = hr >= 12 ? "PM" : "AM";
  const hr12 = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr;
  return `${hr12}:${String(min).padStart(2, "0")} ${ampm}`;
};

const shortTime = (h) => {
  const hr = Math.floor(h % 24);
  const min = Math.round((h % 1) * 60);
  const ampm = hr >= 12 ? "P" : "A";
  const hr12 = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr;
  return min === 0 ? `${hr12}${ampm}` : `${hr12}:${String(min).padStart(2, "0")}${ampm}`;
};

const parseTimeInput = (val) => {
  const clean = val.replace(/[^0-9:.apmAPM\s]/g, "").trim();
  const match = clean.match(/^(\d{1,2}):?(\d{2})?\s*(am|pm|a|p)?$/i);
  if (!match) return null;
  let hr = parseInt(match[1]);
  const min = parseInt(match[2] || "0");
  const period = (match[3] || "").toLowerCase();
  if (period.startsWith("p") && hr < 12) hr += 12;
  if (period.startsWith("a") && hr === 12) hr = 0;
  if (!period && hr < 6) hr += 12;
  return hr + min / 60;
};

const ALERTS = {
  Tue: { type: "info", icon: "𓃭", text: "Sacrifice day — work shortened, zero self-time. Two TKD classes for black belt prep." },
  Wed: { type: "warn", icon: "⚠", text: "Hardest day. TKD 7:15–8:30 → Orthodoxy 9:00–10:30 → home ~11 PM. Only 7h sleep." },
  Thu: { type: "good", icon: "𓋹", text: "Recovery day. Wake 6:30. Extended 8.5h sleep to recharge from Wednesday." },
  Sat: { type: "info", icon: "𓁹", text: "Career power day. Bed by 10 PM for Sunday 5:30 wake — 7.5h sleep." },
  Sun: { type: "info", icon: "⛪", text: "Liturgy at 6:15 AM. Orthodoxy study + meal prep + weekly review. Spiritual anchor." },
};

const START_HOUR = 5.5;
const END_HOUR = 23.5;
const PX_PER_HOUR = 55;

function getActivity(key, customActivities) {
  return customActivities[key] || ACTIVITY_PRESETS[key] || ACTIVITY_PRESETS.custom;
}

// ─── Login Screen ───
function LoginScreen({ onLogin }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);

  const handleSubmit = () => {
    if (pin === PIN) {
      onLogin(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  };

  if (viewOnly) {
    onLogin(false);
    return null;
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(170deg, #FAF8F2 0%, #F0EBE0 60%, #EDE6D8 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz@9..40;wght@300;400;500;600;700&family=Cormorant+Garamond:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ textAlign: "center", maxWidth: 360, padding: 40 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>𓂀</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: "#2C2A4A", marginBottom: 4 }}>Book of Hours</div>
        <div style={{ fontSize: 11, opacity: 0.4, letterSpacing: 3, textTransform: "uppercase", marginBottom: 32 }}>Weekly Time Architecture</div>
        <div style={{ height: 2, background: "linear-gradient(90deg, transparent, #C49B1A, transparent)", marginBottom: 32, opacity: 0.3 }} />
        <div style={{ marginBottom: 8, fontSize: 13, opacity: 0.6 }}>Enter PIN to edit</div>
        <input
          value={pin}
          onChange={e => setPin(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          type="password"
          maxLength={8}
          placeholder="••••"
          style={{ width: 160, padding: "10px 16px", borderRadius: 10, border: error ? "2px solid #C0392B" : "1px solid rgba(44,42,74,0.15)", fontSize: 18, textAlign: "center", fontFamily: "'DM Sans', sans-serif", color: "#2C2A4A", outline: "none", background: error ? "#FFF5F5" : "#fff", letterSpacing: 6, transition: "all 0.2s" }}
        />
        <div style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "center" }}>
          <button onClick={handleSubmit} style={{ padding: "8px 24px", borderRadius: 8, border: "none", background: "#7B6CB5", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Enter</button>
          <button onClick={() => setViewOnly(true)} style={{ padding: "8px 24px", borderRadius: 8, border: "1px solid rgba(44,42,74,0.12)", background: "none", color: "#2C2A4A", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", opacity: 0.6 }}>View Only</button>
        </div>
        {error && <div style={{ marginTop: 12, fontSize: 12, color: "#C0392B" }}>Incorrect PIN</div>}
      </div>
    </div>
  );
}

// ─── Add Block Modal ───
function AddBlockModal({ day, onAdd, onClose, customActivities }) {
  const allActs = { ...ACTIVITY_PRESETS, ...customActivities };
  const [actKey, setActKey] = useState("custom");
  const [customLabel, setCustomLabel] = useState("");
  const [customIcon, setCustomIcon] = useState("◆");
  const [colorIdx, setColorIdx] = useState(0);
  const [startTime, setStartTime] = useState("6:00 PM");
  const [duration, setDuration] = useState("1");
  const [note, setNote] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  const handleAdd = () => {
    const start = parseTimeInput(startTime);
    const dur = parseFloat(duration);
    if (start === null || isNaN(dur) || dur <= 0) return;
    let finalKey = actKey;
    let newCustom = null;
    if (isCustom && customLabel.trim()) {
      finalKey = "custom_" + Date.now();
      newCustom = { key: finalKey, act: { label: customLabel.trim(), icon: customIcon || "◆", color: COLOR_OPTIONS[colorIdx].color, text: COLOR_OPTIONS[colorIdx].text, lightBg: COLOR_OPTIONS[colorIdx].lightBg } };
    }
    onAdd(day, [start, dur, finalKey, note], newCustom);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(44,42,74,0.3)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#FDFCF8", borderRadius: 20, padding: 28, width: 400, maxWidth: "90vw", maxHeight: "85vh", overflow: "auto", boxShadow: "0 16px 48px rgba(44,42,74,0.15)" }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, color: "#2C2A4A", marginBottom: 16 }}>Add Block — {day}</div>

        {/* Toggle: existing vs custom */}
        <div style={{ display: "flex", gap: 4, marginBottom: 16, background: "rgba(44,42,74,0.04)", borderRadius: 8, padding: 3 }}>
          <button onClick={() => setIsCustom(false)} style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, background: !isCustom ? "#7B6CB5" : "transparent", color: !isCustom ? "#fff" : "#2C2A4A" }}>Existing Activity</button>
          <button onClick={() => setIsCustom(true)} style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, background: isCustom ? "#7B6CB5" : "transparent", color: isCustom ? "#fff" : "#2C2A4A" }}>New Custom</button>
        </div>

        {!isCustom ? (
          <div style={{ marginBottom: 16 }}>
            <label style={labelS}>Activity Type</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
              {Object.entries(allActs).filter(([k]) => k !== "custom").map(([k, a]) => (
                <button key={k} onClick={() => setActKey(k)} style={{ padding: "4px 10px", borderRadius: 6, border: actKey === k ? `2px solid ${a.color}` : "1px solid rgba(44,42,74,0.1)", background: actKey === k ? a.lightBg : "#fff", fontSize: 11, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", color: a.text, fontWeight: actKey === k ? 700 : 400 }}>
                  {a.icon} {a.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={labelS}>Label</label>
                <input value={customLabel} onChange={e => setCustomLabel(e.target.value)} placeholder="e.g. Venture Work" style={inputS} />
              </div>
              <div style={{ width: 70 }}>
                <label style={labelS}>Icon</label>
                <input value={customIcon} onChange={e => setCustomIcon(e.target.value)} style={{ ...inputS, textAlign: "center" }} maxLength={2} />
              </div>
            </div>
            <label style={labelS}>Color</label>
            <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
              {COLOR_OPTIONS.map((c, i) => (
                <button key={i} onClick={() => setColorIdx(i)} style={{ width: 28, height: 28, borderRadius: 6, background: c.lightBg, border: colorIdx === i ? `2px solid ${c.color}` : "1px solid rgba(44,42,74,0.08)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: c.color }} />
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1 }}><label style={labelS}>Start Time</label><input value={startTime} onChange={e => setStartTime(e.target.value)} style={inputS} placeholder="e.g. 6:30 PM" /></div>
          <div style={{ width: 90 }}><label style={labelS}>Hours</label><input value={duration} onChange={e => setDuration(e.target.value)} type="number" step="0.25" min="0.25" style={inputS} /></div>
        </div>
        <div style={{ marginBottom: 16 }}><label style={labelS}>Note (optional)</label><input value={note} onChange={e => setNote(e.target.value)} style={inputS} placeholder="Description..." /></div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid rgba(44,42,74,0.12)", background: "none", color: "#2C2A4A", fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
          <button onClick={handleAdd} style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "#7B6CB5", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Add Block</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ───
export default function App() {
  const [authed, setAuthed] = useState(null);
  const [canEdit, setCanEdit] = useState(false);
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [customActivities, setCustomActivities] = useState(DEFAULT_CUSTOM_ACTIVITIES);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showRecs, setShowRecs] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [addingTo, setAddingTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(STORAGE_KEY);
        if (r?.value) {
          const parsed = JSON.parse(r.value);
          if (parsed.schedule) setSchedule(parsed.schedule);
          if (parsed.customActivities) setCustomActivities(parsed.customActivities);
        }
        const auth = await window.storage.get(AUTH_KEY);
        if (auth?.value === "true") { setAuthed(true); setCanEdit(true); }
      } catch (e) {}
      setLoading(false);
    })();
  }, []);

  const persist = useCallback(async (s, ca) => {
    setSchedule(s);
    setCustomActivities(ca);
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify({ schedule: s, customActivities: ca }));
      setSaved(true);
      setTimeout(() => setSaved(false), 1200);
    } catch (e) {}
  }, []);

  const handleLogin = async (isEditor) => {
    setAuthed(true);
    setCanEdit(isEditor);
    if (isEditor) {
      try { await window.storage.set(AUTH_KEY, "true"); } catch (e) {}
    }
  };

  const handleLogout = async () => {
    setCanEdit(false);
    try { await window.storage.set(AUTH_KEY, "false"); } catch (e) {}
  };

  const startEdit = (day, idx) => {
    if (!canEdit) return;
    const block = schedule[day][idx];
    const act = getActivity(block[2], customActivities);
    setEditing({ day, idx });
    setEditValues({ start: hourToTime(block[0]), dur: block[1].toString(), note: block[3] || "", label: act.label, icon: act.icon });
  };

  const saveEdit = () => {
    if (!editing) return;
    const { day, idx } = editing;
    const ns = parseTimeInput(editValues.start);
    const nd = parseFloat(editValues.dur);
    if (ns === null || isNaN(nd) || nd <= 0) return;
    const newSched = { ...schedule, [day]: [...schedule[day]] };
    const block = newSched[day][idx];
    const actKey = block[2];
    newSched[day][idx] = [ns, nd, actKey, editValues.note];
    const newCA = { ...customActivities };
    const oldAct = getActivity(actKey, customActivities);
    if (editValues.label !== oldAct.label || editValues.icon !== oldAct.icon) {
      newCA[actKey] = { ...oldAct, label: editValues.label, icon: editValues.icon };
    }
    persist(newSched, newCA);
    setEditing(null);
  };

  const deleteBlock = (day, idx) => {
    const newSched = { ...schedule, [day]: schedule[day].filter((_, i) => i !== idx) };
    persist(newSched, customActivities);
    setConfirmDelete(null);
    setEditing(null);
  };

  const addBlock = (day, block, newCustom) => {
    const newSched = { ...schedule, [day]: [...schedule[day], block].sort((a, b) => a[0] - b[0]) };
    const newCA = { ...customActivities };
    if (newCustom) newCA[newCustom.key] = newCustom.act;
    persist(newSched, newCA);
    setAddingTo(null);
  };

  const resetAll = () => {
    persist(DEFAULT_SCHEDULE, DEFAULT_CUSTOM_ACTIVITIES);
    setEditing(null);
  };

  const getVisible = (day) => (schedule[day] || []).filter(b => b[2] !== "sleep");
  const weeklyTotals = {};
  Object.values(schedule).forEach(day => day.forEach(([, d, k]) => { if (k !== "sleep") weeklyTotals[k] = (weeklyTotals[k] || 0) + d; }));
  const detail = selectedDay !== null;
  const dDay = detail ? DAYS[selectedDay] : null;

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#FAF8F2", fontFamily: "'Cormorant Garamond', serif" }}>
      <div style={{ textAlign: "center", color: "#2C2A4A" }}><div style={{ fontSize: 56, marginBottom: 8 }}>𓂀</div><div style={{ fontSize: 16, opacity: 0.5, letterSpacing: 3 }}>LOADING</div></div>
    </div>
  );

  if (authed === null) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(170deg, #FAF8F2 0%, #F5F0E6 30%, #F0EBE0 60%, #EDE6D8 100%)", color: "#2C2A4A", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz@9..40;wght@300;400;500;600;700&family=Cormorant+Garamond:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        .kb:hover { transform: scale(1.015); box-shadow: 0 2px 10px rgba(44,42,74,0.07); }
        .kc:hover { background: rgba(123,108,181,0.03); }
      `}</style>

      {/* Header */}
      <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(44,42,74,0.07)", position: "sticky", top: 0, zIndex: 100, background: "rgba(250,248,242,0.94)", backdropFilter: "blur(16px)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 30, lineHeight: 1 }}>𓂀</div>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, color: "#2C2A4A", letterSpacing: 1 }}>Book of Hours</div>
              <div style={{ fontSize: 10, opacity: 0.35, letterSpacing: 3, textTransform: "uppercase" }}>Weekly Architecture · {canEdit ? "✏️ Edit Mode" : "👁 View Only"}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            {saved && <span style={{ fontSize: 11, color: "#27AE60", fontWeight: 600 }}>✓ Saved</span>}
            {detail && <button onClick={() => { setSelectedDay(null); setEditing(null); }} style={btn("#7B6CB5")}>← Week</button>}
            <button onClick={() => setShowRecs(!showRecs)} style={btn("#B8860B")}>{showRecs ? "✕" : "𓁹"} Guidance</button>
            {canEdit && <button onClick={resetAll} style={btn("#95A5A6")}>↺ Reset</button>}
            {canEdit ? (
              <button onClick={handleLogout} style={btn("#C0392B")}>🔒 Lock</button>
            ) : (
              <button onClick={() => setAuthed(null)} style={btn("#7B6CB5")}>✏️ Edit</button>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "14px 12px 80px" }}>
        <div style={{ height: 2, background: "linear-gradient(90deg, transparent, #C49B1A, #B8860B, #C49B1A, transparent)", borderRadius: 2, marginBottom: 16, opacity: 0.35 }} />

        {showRecs && (
          <div style={{ marginBottom: 20, background: "rgba(184,134,11,0.04)", border: "1px solid rgba(184,134,11,0.1)", borderRadius: 16, padding: "18px 22px", animation: "fadeIn 0.2s ease" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, color: "#B8860B", marginBottom: 14 }}>𓂀 Guidance</div>
            {[
              { icon: "𓃭", title: "Tuesday — warrior's sacrifice", text: "Work cut to 8.5h. Two TKD classes 6–9 PM. Zero self-time. Worth it for March belt test." },
              { icon: "⚠️", title: "Wednesday — the crucible", text: "TKD 7:15–8:30 → Orthodoxy 9–10:30 → home ~11 PM. Only 7h sleep. Thursday compensates with 6:30 wake + 8.5h sleep." },
              { icon: "𓋹", title: "Thursday — recovery", text: "Wake 6:30. Extended 8.5h sleep. Light evening: reading + self-time. Mid-week exhale." },
              { icon: "⛪", title: "Sunday — the anchor", text: "5:30 wake for 6:15 liturgy. Saturday bedtime 10 PM. Church → study → meal prep → weekly review." },
              { icon: "☽", title: "Sleep budget", text: "Mon 8h · Tue 8h · Wed 7h · Thu 8.5h · Fri 8h · Sat 7.5h · Sun 8h. Avg 7.9h. Protect the 8h nights." },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: i < 4 ? "1px solid rgba(44,42,74,0.04)" : "none" }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{r.icon}</span>
                <div><div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{r.title}</div><div style={{ fontSize: 12, opacity: 0.5, lineHeight: 1.5 }}>{r.text}</div></div>
              </div>
            ))}
          </div>
        )}

        {/* Weekly totals */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 16, padding: "10px 14px", background: "rgba(44,42,74,0.02)", borderRadius: 12, border: "1px solid rgba(44,42,74,0.04)" }}>
          {Object.entries(weeklyTotals).sort((a, b) => b[1] - a[1]).filter(([k]) => !["buffer", "morning", "bible"].includes(k)).map(([key, hours]) => {
            const act = getActivity(key, customActivities);
            return <div key={key} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 8, background: act.lightBg, fontSize: 10, fontWeight: 600, color: act.text, whiteSpace: "nowrap", border: `1px solid ${act.color}18` }}>{act.icon} {act.label} <span style={{ opacity: 0.55 }}>{Math.round(hours * 10) / 10}h</span></div>;
          })}
        </div>

        {/* ═══ WEEK VIEW ═══ */}
        {!detail && (
          <div style={{ display: "flex", gap: 0 }}>
            <div style={{ width: 50, flexShrink: 0, paddingTop: 38 }}>
              {Array.from({ length: Math.ceil(END_HOUR - START_HOUR) + 1 }, (_, i) => {
                const hr = START_HOUR + i; if (hr > END_HOUR) return null;
                return <div key={hr} style={{ height: PX_PER_HOUR, position: "relative" }}><span style={{ position: "absolute", top: -7, right: 6, fontSize: 9, opacity: 0.28, fontWeight: 500, whiteSpace: "nowrap" }}>{hourToTime(hr)}</span></div>;
              })}
            </div>
            {DAYS.map((day, di) => {
              const al = ALERTS[day]; const isWE = di >= 5;
              return (
                <div key={day} className="kc" onClick={() => setSelectedDay(di)} style={{ flex: 1, minWidth: 105, cursor: "pointer", borderRadius: 8, transition: "background 0.15s", padding: "0 1px" }}>
                  <div style={{ textAlign: "center", padding: "6px 0", marginBottom: 4, borderRadius: 8, background: isWE ? "rgba(123,108,181,0.07)" : "rgba(44,42,74,0.025)", position: "relative" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: isWE ? "#7B6CB5" : "#2C2A4A" }}>{day}</div>
                    {al?.type === "warn" && <span style={{ position: "absolute", top: 2, right: 4, fontSize: 9 }}>⚠️</span>}
                  </div>
                  <div style={{ position: "relative", height: (END_HOUR - START_HOUR) * PX_PER_HOUR }}>
                    {Array.from({ length: Math.ceil(END_HOUR - START_HOUR) + 1 }, (_, i) => <div key={i} style={{ position: "absolute", top: i * PX_PER_HOUR, left: 0, right: 0, height: 1, background: "rgba(44,42,74,0.035)" }} />)}
                    {getVisible(day).map((block, bi) => {
                      const [start, dur, actKey] = block;
                      const act = getActivity(actKey, customActivities);
                      const top = (start - START_HOUR) * PX_PER_HOUR;
                      const h = Math.max(dur * PX_PER_HOUR - 2, 15);
                      const endH = start + dur;
                      return (
                        <div key={bi} className="kb" style={{ position: "absolute", top, left: 2, right: 2, height: h, background: act.lightBg, borderRadius: 5, padding: "2px 4px", overflow: "hidden", borderLeft: `3px solid ${act.color}`, display: "flex", flexDirection: "column", justifyContent: "center", transition: "all 0.12s" }}>
                          {h > 18 && <div style={{ fontSize: 11, fontWeight: 700, color: act.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.15 }}>{act.icon} {dur >= 0.5 ? act.label : ""}</div>}
                          {h > 33 && <div style={{ fontSize: 10, color: act.text, opacity: 0.55, marginTop: 1, fontWeight: 500 }}>{shortTime(start)}–{shortTime(endH)}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ DAY DETAIL ═══ */}
        {detail && dDay && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700 }}>{FULL_DAYS[selectedDay]}</div>
              {canEdit && <div style={{ fontSize: 11, opacity: 0.4, marginTop: 2 }}>Tap any block to edit · ✏️ names, times, notes</div>}
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 10 }}>
                {selectedDay > 0 && <button onClick={() => { setSelectedDay(selectedDay - 1); setEditing(null); }} style={navS}>← {DAYS[selectedDay - 1]}</button>}
                {canEdit && <button onClick={() => setAddingTo(dDay)} style={{ ...navS, background: "#7B6CB5", color: "#fff", border: "none", fontWeight: 600 }}>+ Add Block</button>}
                {selectedDay < 6 && <button onClick={() => { setSelectedDay(selectedDay + 1); setEditing(null); }} style={navS}>{DAYS[selectedDay + 1]} →</button>}
              </div>
            </div>

            {ALERTS[dDay] && (
              <div style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 12, fontSize: 12, lineHeight: 1.5, background: ALERTS[dDay].type === "warn" ? "rgba(192,57,43,0.05)" : ALERTS[dDay].type === "good" ? "rgba(39,174,96,0.05)" : "rgba(123,108,181,0.05)", border: `1px solid ${ALERTS[dDay].type === "warn" ? "rgba(192,57,43,0.1)" : ALERTS[dDay].type === "good" ? "rgba(39,174,96,0.1)" : "rgba(123,108,181,0.1)"}` }}>
                {ALERTS[dDay].icon} {ALERTS[dDay].text}
              </div>
            )}

            <div style={{ display: "flex", gap: 20 }}>
              <div style={{ flex: 1 }}>
                {schedule[dDay].map((block, i) => {
                  const [start, dur, actKey, note] = block;
                  const act = getActivity(actKey, customActivities);
                  const mH = Math.max(dur * 40, 44);
                  const isEd = editing?.day === dDay && editing?.idx === i;
                  const isDel = confirmDelete?.day === dDay && confirmDelete?.idx === i;

                  return (
                    <div key={i} style={{ display: "flex", gap: 12, marginBottom: 3 }}>
                      <div style={{ width: 66, textAlign: "right", paddingTop: 10, flexShrink: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.6 }}>{hourToTime(start)}</div>
                        <div style={{ fontSize: 9, opacity: 0.25 }}>{dur >= 1 ? `${dur}h` : `${Math.round(dur * 60)}m`}</div>
                      </div>
                      <div style={{ width: 16, display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                        <div style={{ width: 9, height: 9, borderRadius: "50%", background: act.lightBg, border: `2px solid ${act.color}`, marginTop: 12, flexShrink: 0 }} />
                        <div style={{ width: 2, flex: 1, background: `${act.color}20` }} />
                      </div>
                      <div onClick={() => !isEd && canEdit && startEdit(dDay, i)} style={{ flex: 1, minHeight: mH, background: isEd ? "#fff" : act.lightBg, borderRadius: 12, padding: "10px 14px", borderLeft: `3px solid ${act.color}`, display: "flex", flexDirection: "column", justifyContent: "center", cursor: canEdit && !isEd ? "pointer" : "default", transition: "all 0.15s", boxShadow: isEd ? "0 2px 16px rgba(44,42,74,0.1)" : "none" }}>
                        {isEd ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <div style={{ display: "flex", gap: 8 }}>
                              <div style={{ width: 48 }}><label style={labelS}>Icon</label><input value={editValues.icon} onChange={e => setEditValues({ ...editValues, icon: e.target.value })} style={{ ...fInputS, textAlign: "center" }} maxLength={2} /></div>
                              <div style={{ flex: 1 }}><label style={labelS}>Name</label><input value={editValues.label} onChange={e => setEditValues({ ...editValues, label: e.target.value })} style={fInputS} /></div>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                              <div style={{ flex: 1 }}><label style={labelS}>Start</label><input value={editValues.start} onChange={e => setEditValues({ ...editValues, start: e.target.value })} style={fInputS} /></div>
                              <div style={{ width: 80 }}><label style={labelS}>Hours</label><input value={editValues.dur} onChange={e => setEditValues({ ...editValues, dur: e.target.value })} type="number" step="0.25" min="0.25" style={fInputS} /></div>
                            </div>
                            <div><label style={labelS}>Note</label><input value={editValues.note} onChange={e => setEditValues({ ...editValues, note: e.target.value })} style={{ ...fInputS, width: "100%" }} placeholder="Optional note..." /></div>
                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                              <button onClick={saveEdit} style={{ padding: "5px 14px", borderRadius: 6, border: "none", background: "#7B6CB5", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Save</button>
                              <button onClick={() => setEditing(null)} style={{ padding: "5px 14px", borderRadius: 6, border: "1px solid rgba(44,42,74,0.12)", background: "none", fontSize: 11, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", color: "#2C2A4A" }}>Cancel</button>
                              <div style={{ flex: 1 }} />
                              {!isDel ? (
                                <button onClick={() => setConfirmDelete({ day: dDay, idx: i })} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid rgba(192,57,43,0.2)", background: "none", fontSize: 10, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", color: "#C0392B" }}>Delete</button>
                              ) : (
                                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                                  <span style={{ fontSize: 10, color: "#C0392B" }}>Sure?</span>
                                  <button onClick={() => deleteBlock(dDay, i)} style={{ padding: "4px 10px", borderRadius: 5, border: "none", background: "#C0392B", color: "#fff", fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Yes</button>
                                  <button onClick={() => setConfirmDelete(null)} style={{ padding: "4px 10px", borderRadius: 5, border: "1px solid rgba(44,42,74,0.12)", background: "none", fontSize: 10, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>No</button>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <>
                            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                              <span style={{ fontSize: 16 }}>{act.icon}</span>
                              <span style={{ fontSize: 14, fontWeight: 700, color: act.text }}>{act.label}</span>
                              <span style={{ fontSize: 11, opacity: 0.35, marginLeft: "auto" }}>{hourToTime(start)} – {hourToTime(start + dur)}</span>
                              {canEdit && <span style={{ fontSize: 10, opacity: 0.2, marginLeft: 2 }}>✏️</span>}
                            </div>
                            {note && <div style={{ fontSize: 11, opacity: 0.5, marginTop: 3, marginLeft: 23, lineHeight: 1.35 }}>{note}</div>}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sidebar */}
              <div style={{ width: 200, flexShrink: 0 }}>
                <div style={{ background: "rgba(44,42,74,0.02)", borderRadius: 14, padding: 14, border: "1px solid rgba(44,42,74,0.05)", position: "sticky", top: 68 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, fontWeight: 700, marginBottom: 10, opacity: 0.6 }}>Breakdown</div>
                  {(() => {
                    const t = {}; schedule[dDay].forEach(([, d, k]) => { t[k] = (t[k] || 0) + d; });
                    return Object.entries(t).sort((a, b) => b[1] - a[1]).map(([k, h]) => {
                      const a = getActivity(k, customActivities); const p = (h / 24) * 100;
                      return (<div key={k} style={{ marginBottom: 6 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span style={{ fontSize: 10, color: a.text }}>{a.icon} {a.label}</span><span style={{ fontSize: 10, fontWeight: 700, color: a.text }}>{h}h</span></div><div style={{ height: 3, borderRadius: 2, background: "rgba(44,42,74,0.05)", overflow: "hidden" }}><div style={{ height: "100%", width: `${p}%`, background: a.color, borderRadius: 2, opacity: 0.65 }} /></div></div>);
                    });
                  })()}
                  {(() => {
                    const sb = schedule[dDay].find(b => b[2] === "sleep"); const sh = sb ? sb[1] : 0;
                    const c = sh >= 8 ? "#27AE60" : sh >= 7.5 ? "#C49B1A" : "#C0392B";
                    return (<div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(44,42,74,0.05)", textAlign: "center" }}><div style={{ fontSize: 9, opacity: 0.3, textTransform: "uppercase", letterSpacing: 2 }}>Sleep</div><div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Cormorant Garamond', serif", color: c }}>{sh}h</div><div style={{ fontSize: 9, opacity: 0.3 }}>{sh >= 8 ? "✓ Optimal" : sh >= 7.5 ? "~ Adequate" : "⚠ Below target"}</div></div>);
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ height: 2, background: "linear-gradient(90deg, transparent, #C49B1A, #B8860B, #C49B1A, transparent)", borderRadius: 2, marginTop: 24, marginBottom: 12, opacity: 0.25 }} />
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", padding: "8px 12px", alignItems: "center" }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 11, opacity: 0.25, fontWeight: 600, marginRight: 6 }}>LEGEND</span>
          {Object.entries({ ...ACTIVITY_PRESETS, ...customActivities }).filter(([k]) => !["sleep", "buffer", "morning", "custom"].includes(k)).map(([k, a]) => (
            <div key={k} style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 8px", borderRadius: 5, background: a.lightBg, fontSize: 9, color: a.text, border: `1px solid ${a.color}12` }}>{a.icon} {a.label}</div>
          ))}
        </div>
      </div>

      {/* Add Block Modal */}
      {addingTo && <AddBlockModal day={addingTo} onAdd={addBlock} onClose={() => setAddingTo(null)} customActivities={customActivities} />}
    </div>
  );
}

const btn = (c) => ({ background: "rgba(44,42,74,0.03)", border: `1px solid ${c}28`, borderRadius: 8, padding: "6px 14px", color: c, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" });
const navS = { background: "rgba(44,42,74,0.03)", border: "1px solid rgba(44,42,74,0.1)", borderRadius: 8, padding: "6px 16px", color: "#2C2A4A", fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" };
const labelS = { fontSize: 10, opacity: 0.45, display: "block", marginBottom: 3, fontWeight: 600 };
const inputS = { width: "100%", padding: "7px 10px", borderRadius: 8, border: "1px solid rgba(44,42,74,0.12)", fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: "#2C2A4A", outline: "none", background: "#fff", boxSizing: "border-box" };
const fInputS = { padding: "5px 8px", borderRadius: 6, border: "1px solid rgba(44,42,74,0.12)", fontSize: 12, fontFamily: "'DM Sans', sans-serif", color: "#2C2A4A", outline: "none", width: "100%", background: "rgba(44,42,74,0.02)", boxSizing: "border-box" };
