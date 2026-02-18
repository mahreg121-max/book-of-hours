import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "medusa-schedule-kemetic-v1";

const ACTIVITIES = {
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
};

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

const hourToTime = (h) => {
  const hr = Math.floor(h % 24);
  const min = Math.round((h % 1) * 60);
  const ampm = hr >= 12 ? "PM" : "AM";
  const hr12 = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr;
  return `${hr12}:${String(min).padStart(2, "0")} ${ampm}`;
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
const PX_PER_HOUR = 52;

export default function WeeklySchedule() {
  const [selectedDay, setSelectedDay] = useState(null);
  const [showRecs, setShowRecs] = useState(false);
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [editing, setEditing] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(STORAGE_KEY);
        if (r?.value) setSchedule(JSON.parse(r.value));
      } catch (e) {}
      setLoading(false);
    })();
  }, []);

  const save = useCallback(async (s) => {
    setSchedule(s);
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify(s));
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (e) {}
  }, []);

  const startEdit = (day, idx) => {
    const block = schedule[day][idx];
    setEditing({ day, idx });
    setEditValues({ start: hourToTime(block[0]), dur: block[1].toString(), note: block[3] || "" });
  };

  const saveEdit = () => {
    if (!editing) return;
    const { day, idx } = editing;
    const newStart = parseTimeInput(editValues.start);
    const newDur = parseFloat(editValues.dur);
    if (newStart === null || isNaN(newDur) || newDur <= 0) return;
    const newSched = { ...schedule };
    newSched[day] = [...newSched[day]];
    newSched[day][idx] = [newStart, newDur, newSched[day][idx][2], editValues.note];
    save(newSched);
    setEditing(null);
  };

  const resetSchedule = async () => {
    save(DEFAULT_SCHEDULE);
    setEditing(null);
  };

  const getVisible = (day) => schedule[day].filter(b => b[2] !== "sleep");
  const weeklyTotals = {};
  Object.values(schedule).forEach(day => day.forEach(([, d, k]) => { if (k !== "sleep") weeklyTotals[k] = (weeklyTotals[k] || 0) + d; }));
  const detail = selectedDay !== null;
  const dDay = detail ? DAYS[selectedDay] : null;

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#FAF8F2", fontFamily: "'Cormorant Garamond', serif" }}>
      <div style={{ textAlign: "center", color: "#2C2A4A" }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>𓂀</div>
        <div style={{ fontSize: 16, opacity: 0.5, letterSpacing: 3 }}>LOADING YOUR PATH</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(170deg, #FAF8F2 0%, #F5F0E6 30%, #F0EBE0 60%, #EDE6D8 100%)", color: "#2C2A4A", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz@9..40;wght@300;400;500;600;700&family=Cormorant+Garamond:wght@400;500;600;700&display=swap" rel="stylesheet" />
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
        .kemetic-block:hover { transform: scale(1.015); box-shadow: 0 2px 12px rgba(44,42,74,0.08); }
        .kemetic-col:hover { background: rgba(123,108,181,0.03); }
      `}</style>

      {/* Header */}
      <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(44,42,74,0.08)", position: "sticky", top: 0, zIndex: 100, background: "rgba(250,248,242,0.94)", backdropFilter: "blur(16px)" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 32, lineHeight: 1 }}>𓂀</div>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: "#2C2A4A", letterSpacing: 1 }}>The Book of Hours</div>
              <div style={{ fontSize: 10, opacity: 0.4, letterSpacing: 3, textTransform: "uppercase" }}>Weekly Architecture · 2026</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            {saved && <span style={{ fontSize: 11, color: "#27AE60", animation: "pulse 1s" }}>✓ Saved</span>}
            {detail && <button onClick={() => { setSelectedDay(null); setEditing(null); }} style={btn("#7B6CB5")}>← Week View</button>}
            <button onClick={() => setShowRecs(!showRecs)} style={btn("#C0392B")}>{showRecs ? "✕" : "𓁹"} Guidance</button>
            <button onClick={resetSchedule} style={btn("#95A5A6")}>↺ Reset</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "16px 12px 80px" }}>

        {/* Kemetic border accent */}
        <div style={{ height: 3, background: "linear-gradient(90deg, transparent, #C49B1A, #B8860B, #C49B1A, transparent)", borderRadius: 2, marginBottom: 16, opacity: 0.4 }} />

        {showRecs && (
          <div style={{ marginBottom: 20, background: "rgba(184,134,11,0.04)", border: "1px solid rgba(184,134,11,0.12)", borderRadius: 16, padding: "18px 22px", animation: "fadeIn 0.25s ease" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, color: "#B8860B", marginBottom: 14, letterSpacing: 1 }}>𓂀 Guidance for the Journey</div>
            {[
              { icon: "𓃭", title: "Tuesday — the warrior's sacrifice", text: "Work cut to 8.5h, leave by 5:00 for TKD. Two classes 6–9 PM. Zero self-time. The cost of doubling up for your March test." },
              { icon: "⚠️", title: "Wednesday — the crucible", text: "Leave work at ~4:30, drive to TKD 7:15–8:30, then Orthodoxy 9–10:30. Home by ~11 PM. Only 7h sleep. Thursday compensates with 6:30 wake + 8.5h sleep." },
              { icon: "𓋹", title: "Thursday — the recovery", text: "Wake 6:30 (extra 30 min). Extended 8.5h sleep. Light evening with deep reading + self-time. Your mid-week exhale." },
              { icon: "⛪", title: "Sunday — the anchor", text: "5:30 wake for 6:15 liturgy. Saturday bedtime 10 PM (7.5h sleep). Church → Orthodoxy study → meal prep → weekly review. Done by 7 PM." },
              { icon: "☽", title: "Sleep across the week", text: "Mon 8h · Tue 8h · Wed 7h · Thu 8.5h · Fri 8h · Sat 7.5h · Sun 8h. Average 7.9h. Wednesday is the weak link — protect all other nights." },
              { icon: "✏️", title: "Editing times", text: "Click any day, then tap a time block to adjust start time, duration, or notes. Changes save automatically and persist between visits." },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: i < 5 ? "1px solid rgba(44,42,74,0.05)" : "none" }}>
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 2 }}>{r.icon}</span>
                <div><div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{r.title}</div><div style={{ fontSize: 12, opacity: 0.55, lineHeight: 1.55 }}>{r.text}</div></div>
              </div>
            ))}
          </div>
        )}

        {/* Weekly totals */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 16, padding: "10px 14px", background: "rgba(44,42,74,0.02)", borderRadius: 12, border: "1px solid rgba(44,42,74,0.05)" }}>
          {Object.entries(weeklyTotals).sort((a, b) => b[1] - a[1]).filter(([k]) => !["buffer", "morning", "bible"].includes(k)).map(([key, hours]) => {
            const act = ACTIVITIES[key]; return (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 8, background: act.lightBg, fontSize: 10, fontWeight: 600, color: act.text, whiteSpace: "nowrap", border: `1px solid ${act.color}20` }}>{act.icon} {act.label} <span style={{ opacity: 0.6 }}>{hours}h</span></div>
            );
          })}
        </div>

        {/* WEEK VIEW */}
        {!detail && (
          <div style={{ display: "flex", gap: 0 }}>
            <div style={{ width: 50, flexShrink: 0, paddingTop: 36 }}>
              {Array.from({ length: Math.ceil(END_HOUR - START_HOUR) + 1 }, (_, i) => {
                const hr = START_HOUR + i; if (hr > END_HOUR) return null;
                return <div key={hr} style={{ height: PX_PER_HOUR, position: "relative" }}><span style={{ position: "absolute", top: -7, right: 6, fontSize: 9, opacity: 0.3, fontWeight: 500, whiteSpace: "nowrap", color: "#2C2A4A" }}>{hourToTime(hr)}</span></div>;
              })}
            </div>
            {DAYS.map((day, di) => {
              const al = ALERTS[day]; const isWE = di >= 5;
              return (
                <div key={day} className="kemetic-col" onClick={() => setSelectedDay(di)} style={{ flex: 1, minWidth: 100, cursor: "pointer", borderRadius: 8, transition: "background 0.15s", padding: "0 1px" }}>
                  <div style={{ textAlign: "center", padding: "6px 0", marginBottom: 4, borderRadius: 8, background: isWE ? "rgba(123,108,181,0.08)" : "rgba(44,42,74,0.03)", position: "relative" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: isWE ? "#7B6CB5" : "#2C2A4A" }}>{day}</div>
                    {al?.type === "warn" && <span style={{ position: "absolute", top: 2, right: 4, fontSize: 9 }}>⚠️</span>}
                  </div>
                  <div style={{ position: "relative", height: (END_HOUR - START_HOUR) * PX_PER_HOUR }}>
                    {Array.from({ length: Math.ceil(END_HOUR - START_HOUR) + 1 }, (_, i) => <div key={i} style={{ position: "absolute", top: i * PX_PER_HOUR, left: 0, right: 0, height: 1, background: "rgba(44,42,74,0.04)" }} />)}
                    {getVisible(day).map((block, bi) => {
                      const [start, dur, actKey] = block; const act = ACTIVITIES[actKey];
                      const top = (start - START_HOUR) * PX_PER_HOUR; const h = Math.max(dur * PX_PER_HOUR - 2, 14);
                      return (
                        <div key={bi} className="kemetic-block" style={{ position: "absolute", top, left: 2, right: 2, height: h, background: act.lightBg, borderRadius: 5, padding: "2px 4px", overflow: "hidden", borderLeft: `3px solid ${act.color}`, display: "flex", flexDirection: "column", justifyContent: "center", transition: "all 0.12s", cursor: "pointer" }}>
                          {h > 16 && <div style={{ fontSize: 9, fontWeight: 700, color: act.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.1 }}>{act.icon} {dur >= 0.75 ? act.label : ""}</div>}
                          {h > 30 && <div style={{ fontSize: 8, color: act.text, opacity: 0.5, marginTop: 1 }}>{hourToTime(start)}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* DAY DETAIL */}
        {detail && dDay && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: "#2C2A4A" }}>{FULL_DAYS[selectedDay]}</div>
              <div style={{ fontSize: 11, opacity: 0.4, marginTop: 2 }}>Tap any block to edit times</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 10 }}>
                {selectedDay > 0 && <button onClick={() => { setSelectedDay(selectedDay - 1); setEditing(null); }} style={navStyle}>← {DAYS[selectedDay - 1]}</button>}
                {selectedDay < 6 && <button onClick={() => { setSelectedDay(selectedDay + 1); setEditing(null); }} style={navStyle}>{DAYS[selectedDay + 1]} →</button>}
              </div>
            </div>

            {ALERTS[dDay] && (
              <div style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 12, fontSize: 12, lineHeight: 1.5, background: ALERTS[dDay].type === "warn" ? "rgba(192,57,43,0.06)" : ALERTS[dDay].type === "good" ? "rgba(39,174,96,0.06)" : "rgba(123,108,181,0.06)", border: `1px solid ${ALERTS[dDay].type === "warn" ? "rgba(192,57,43,0.12)" : ALERTS[dDay].type === "good" ? "rgba(39,174,96,0.12)" : "rgba(123,108,181,0.12)"}` }}>
                <span style={{ marginRight: 6 }}>{ALERTS[dDay].icon}</span>{ALERTS[dDay].text}
              </div>
            )}

            <div style={{ display: "flex", gap: 20 }}>
              <div style={{ flex: 1 }}>
                {schedule[dDay].map((block, i) => {
                  const [start, dur, actKey, note] = block;
                  const act = ACTIVITIES[actKey];
                  const mH = Math.max(dur * 40, 40);
                  const isEditing = editing?.day === dDay && editing?.idx === i;

                  return (
                    <div key={i} style={{ display: "flex", gap: 12, marginBottom: 3 }}>
                      <div style={{ width: 62, textAlign: "right", paddingTop: 9, flexShrink: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.6 }}>{hourToTime(start)}</div>
                        <div style={{ fontSize: 9, opacity: 0.25 }}>{dur >= 1 ? `${dur}h` : `${Math.round(dur * 60)}m`}</div>
                      </div>
                      <div style={{ width: 16, display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                        <div style={{ width: 9, height: 9, borderRadius: "50%", background: act.lightBg, border: `2px solid ${act.color}`, marginTop: 11, flexShrink: 0 }} />
                        <div style={{ width: 2, flex: 1, background: `${act.color}25` }} />
                      </div>
                      <div onClick={() => !isEditing && startEdit(dDay, i)} style={{ flex: 1, minHeight: mH, background: isEditing ? "#fff" : act.lightBg, borderRadius: 12, padding: "10px 14px", borderLeft: `3px solid ${act.color}`, display: "flex", flexDirection: "column", justifyContent: "center", cursor: isEditing ? "default" : "pointer", transition: "all 0.15s", boxShadow: isEditing ? "0 2px 16px rgba(44,42,74,0.1)" : "none" }}>
                        {isEditing ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 16 }}>{act.icon}</span>
                              <span style={{ fontSize: 14, fontWeight: 700, color: act.text }}>{act.label}</span>
                            </div>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              <div>
                                <label style={{ fontSize: 10, opacity: 0.5, display: "block", marginBottom: 2 }}>Start</label>
                                <input value={editValues.start} onChange={e => setEditValues({ ...editValues, start: e.target.value })} style={inputStyle} placeholder="e.g. 6:30 PM" />
                              </div>
                              <div>
                                <label style={{ fontSize: 10, opacity: 0.5, display: "block", marginBottom: 2 }}>Hours</label>
                                <input value={editValues.dur} onChange={e => setEditValues({ ...editValues, dur: e.target.value })} type="number" step="0.25" min="0.25" style={{ ...inputStyle, width: 64 }} />
                              </div>
                            </div>
                            <div>
                              <label style={{ fontSize: 10, opacity: 0.5, display: "block", marginBottom: 2 }}>Note</label>
                              <input value={editValues.note} onChange={e => setEditValues({ ...editValues, note: e.target.value })} style={{ ...inputStyle, width: "100%" }} placeholder="Optional note..." />
                            </div>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button onClick={saveEdit} style={{ padding: "5px 14px", borderRadius: 6, border: "none", background: "#7B6CB5", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Save</button>
                              <button onClick={() => setEditing(null)} style={{ padding: "5px 14px", borderRadius: 6, border: "1px solid rgba(44,42,74,0.15)", background: "none", color: "#2C2A4A", fontSize: 11, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 15 }}>{act.icon}</span>
                              <span style={{ fontSize: 13, fontWeight: 700, color: act.text }}>{act.label}</span>
                              <span style={{ fontSize: 10, opacity: 0.3, marginLeft: "auto" }}>{hourToTime(start)} – {hourToTime(start + dur)}</span>
                              <span style={{ fontSize: 9, opacity: 0.2, marginLeft: 4 }}>✏️</span>
                            </div>
                            {note && <div style={{ fontSize: 11, opacity: 0.5, marginTop: 3, marginLeft: 21, lineHeight: 1.35 }}>{note}</div>}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sidebar */}
              <div style={{ width: 200, flexShrink: 0 }}>
                <div style={{ background: "rgba(44,42,74,0.02)", borderRadius: 14, padding: 14, border: "1px solid rgba(44,42,74,0.06)", position: "sticky", top: 68 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, fontWeight: 700, marginBottom: 10, opacity: 0.6 }}>Breakdown</div>
                  {(() => {
                    const t = {}; schedule[dDay].forEach(([, d, k]) => { t[k] = (t[k] || 0) + d; });
                    return Object.entries(t).sort((a, b) => b[1] - a[1]).map(([k, h]) => {
                      const a = ACTIVITIES[k]; const p = (h / 24) * 100;
                      return (<div key={k} style={{ marginBottom: 6 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span style={{ fontSize: 10, color: a.text }}>{a.icon} {a.label}</span><span style={{ fontSize: 10, fontWeight: 700, color: a.text }}>{h}h</span></div><div style={{ height: 3, borderRadius: 2, background: "rgba(44,42,74,0.06)", overflow: "hidden" }}><div style={{ height: "100%", width: `${p}%`, background: a.color, borderRadius: 2, opacity: 0.7 }} /></div></div>);
                    });
                  })()}
                  {(() => {
                    const sb = schedule[dDay].find(b => b[2] === "sleep"); const sh = sb ? sb[1] : 0;
                    const c = sh >= 8 ? "#27AE60" : sh >= 7.5 ? "#C49B1A" : "#C0392B";
                    return (<div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(44,42,74,0.06)", textAlign: "center" }}><div style={{ fontSize: 9, opacity: 0.35, textTransform: "uppercase", letterSpacing: 2 }}>Sleep</div><div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Cormorant Garamond', serif", color: c }}>{sh}h</div><div style={{ fontSize: 9, opacity: 0.35 }}>{sh >= 8 ? "✓ Optimal" : sh >= 7.5 ? "~ Adequate" : "⚠ Below target"}</div></div>);
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Kemetic border */}
        <div style={{ height: 2, background: "linear-gradient(90deg, transparent, #C49B1A, #B8860B, #C49B1A, transparent)", borderRadius: 2, marginTop: 24, marginBottom: 12, opacity: 0.3 }} />

        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", padding: "8px 12px", alignItems: "center" }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 11, opacity: 0.3, fontWeight: 600, marginRight: 6 }}>LEGEND</span>
          {Object.entries(ACTIVITIES).filter(([k]) => !["sleep", "buffer", "morning"].includes(k)).map(([k, a]) => (
            <div key={k} style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 8px", borderRadius: 5, background: a.lightBg, fontSize: 9, color: a.text, border: `1px solid ${a.color}15` }}>{a.icon} {a.label}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

const btn = (c) => ({ background: "rgba(44,42,74,0.04)", border: `1px solid ${c}30`, borderRadius: 8, padding: "6px 14px", color: c, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s" });
const navStyle = { background: "rgba(44,42,74,0.03)", border: "1px solid rgba(44,42,74,0.1)", borderRadius: 8, padding: "5px 14px", color: "#2C2A4A", fontSize: 11, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" };
const inputStyle = { padding: "5px 8px", borderRadius: 6, border: "1px solid rgba(44,42,74,0.15)", fontSize: 12, fontFamily: "'DM Sans', sans-serif", color: "#2C2A4A", outline: "none", width: 100, background: "rgba(44,42,74,0.02)" };
