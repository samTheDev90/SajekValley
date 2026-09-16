import React, { useState, useEffect, useRef } from "react";
import {
  Mountain, Cloud, Sun, Moon, Sunrise, Sunset, Bus, Car, UtensilsCrossed,
  BedDouble, Package, Users, Wallet, PiggyBank, TrendingUp, TrendingDown,
  Plus, Trash2, Upload, Download, FileSpreadsheet, MapPin, Clock,
  AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  X, Info, Star, LayoutDashboard, CalendarDays, Compass, Loader2, FileJson,
  Home, Leaf, RotateCcw, ArrowRight, Link2, Check, Settings, UserCircle,
  Camera, Receipt, Image as ImageIcon, ZoomIn, Edit3, Quote, Sparkles,
  History, Lightbulb, Award, MessageSquare, FileText,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RTooltip } from "recharts";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set as dbSet } from "firebase/database";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import firebaseConfig from "./firebaseConfig.js";

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getDatabase(firebaseApp);

/* ============================== THEME ============================== */

const BRAND = {
  bg: "#07090D", bgElevated: "#0D1117", card: "#12171F", cardElevated: "#171E28",
  cardHover: "#1A2230", border: "#1E2734", borderLight: "#2A3645", borderStrong: "#3A475A",
  text: "#E6EDF5", textMuted: "#8B97A8", textDim: "#5C6878",
  accent: "#F97316", accentSoft: "#FB923C", accentDim: "#7C3A0F",
  success: "#22C55E", successSoft: "#4ADE80",
  danger: "#EF4444", dangerSoft: "#F87171",
  warning: "#F59E0B", info: "#3B82F6",
  pine: "#10B981", ember: "#F97316", cloud: "#60A5FA", bamboo: "#F59E0B", dusk: "#8B5CF6",
};

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
*{box-sizing:border-box;}
html,body{margin:0;padding:0;background:${BRAND.bg};color:${BRAND.text};}
.font-display{font-family:'Fraunces',ui-serif,Georgia,serif;}
.font-body{font-family:'Manrope',ui-sans-serif,system-ui,sans-serif;}
.font-num{font-family:'IBM Plex Mono',ui-monospace,SFMono-Regular,monospace;font-feature-settings:"tnum";}
input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
input[type=number]{-moz-appearance:textfield;}
input,textarea,select{color-scheme:dark;}
.field{transition:box-shadow .15s ease, border-color .15s ease, background-color .15s ease;}
.field:focus{outline:none; border-color:${BRAND.accent}; box-shadow:0 0 0 3px ${BRAND.accent}22;}
button:focus-visible, a:focus-visible, [tabindex]:focus-visible{outline:2px solid ${BRAND.accent}; outline-offset:2px;}
::selection{background:${BRAND.accent}; color:#fff;}
@keyframes cloudDrift1{0%{transform:translateX(-8%)}100%{transform:translateX(8%)}}
@keyframes cloudDrift2{0%{transform:translateX(6%)}100%{transform:translateX(-6%)}}
@keyframes mistRise{0%{transform:translateY(6%);opacity:.4}50%{transform:translateY(-2%);opacity:.7}100%{transform:translateY(6%);opacity:.4}}
@keyframes riseIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.rise-in{animation:riseIn .35s ease-out both;}
@keyframes pulseLight{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
.pulse-on-change{animation:pulseLight .4s ease-out;}
@keyframes subtleZoom{from{transform:scale(1)}to{transform:scale(1.06)}}
.cloud-drift-1{animation:cloudDrift1 32s ease-in-out infinite alternate;}
.cloud-drift-2{animation:cloudDrift2 42s ease-in-out infinite alternate;}
.mist-rise{animation:mistRise 18s ease-in-out infinite;}
.hero-zoom{animation:subtleZoom 20s ease-in-out infinite alternate;}
@media (prefers-reduced-motion: reduce){
  .rise-in,.pulse-on-change,.hero-zoom{animation:none;}
  .cloud-drift-1,.cloud-drift-2,.mist-rise{animation:none;}
}
.no-scrollbar::-webkit-scrollbar{display:none;}
.no-scrollbar{-ms-overflow-style:none; scrollbar-width:none;}
.tab-scroll{scroll-snap-type:x proximity;}
.transition-width{transition:width .4s cubic-bezier(.4,0,.2,1);}
select option{background:${BRAND.card}; color:${BRAND.text};}
.glow-accent{box-shadow:0 0 0 1px ${BRAND.accent}33, 0 0 24px ${BRAND.accent}22;}
.line-clamp-2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
`;

const PIE_COLORS = ["#F97316","#3B82F6","#10B981","#8B5CF6","#F59E0B","#EC4899","#06B6D4"];
const CATEGORY_ICONS = { bus: Bus, car: Car, food: UtensilsCrossed, hotel: BedDouble, other: Package };
const PERIOD_ICONS = { Night: Moon, "Early Morning": Sunrise, Morning: Sunrise, Midday: Sun, Afternoon: Sun, Evening: Sunset };
const SPOT_ICONS = { Viewpoint: Mountain, Village: Home, Nature: Leaf, Landmark: MapPin, Food: UtensilsCrossed };
const PRIORITY_TONE = { High: BRAND.danger, Medium: BRAND.warning, Low: BRAND.info };
const SPOT_CATEGORIES = ["Viewpoint", "Village", "Nature", "Landmark", "Food"];
const PRIORITIES = ["High", "Medium", "Low"];

/* ============================== UTIL ============================== */

let uidCounter = 0;
function uid(prefix) { uidCounter += 1; return prefix + "_" + Date.now().toString(36) + uidCounter; }
function fmt(n) { const v = Number(n) || 0; return (v < 0 ? "-" : "") + "৳" + Math.abs(Math.round(v)).toLocaleString("en-US"); }
function num(n) { return Number.isFinite(n) ? n : 0; }
function clampText(s, max) { const str = String(s || ""); return str.length > max ? str.slice(0, max) + "…" : str; }
function initials(name) {
  const s = String(name || "?").trim(); if (!s) return "?";
  const parts = s.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
function avatarColor(name) {
  const palette = ["#F97316","#3B82F6","#10B981","#8B5CF6","#F59E0B","#EC4899","#06B6D4","#EF4444"];
  const s = String(name || ""); let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}
function readTimeOf(text) {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
function makeEmptySpot(id) {
  return {
    id: id || uid("s"),
    name: "New spot",
    category: "Viewpoint",
    priority: "Medium",
    time: "",
    cost: 0,
    status: "planned",
    notes: "",
    image: "",
    bestTime: "",
    description: "",
    specialty: "",
    originStory: "",
    history: "",
    tips: "",
    gallery: [],
  };
}

/* ============================== DEFAULT DATA ============================== */

const DEFAULT_DATA = {
  meta: { title: "Sajek Valley", tagline: "মেঘের রাজ্য — Land of Clouds", dateRange: "September 2026", duration: "2 Days · 1 Night", notes: "" },
  participants: [
    { id: "p1", name: "Sadid", contribution: 6000, avatar: "", paid: 0, payments: [] },
    { id: "p2", name: "Farhan", contribution: 6000, avatar: "", paid: 0, payments: [] },
    { id: "p3", name: "Talha", contribution: 6000, avatar: "", paid: 0, payments: [] },
    { id: "p4", name: "Rifat", contribution: 6000, avatar: "", paid: 0, payments: [] },
    { id: "p5", name: "Shoaib", contribution: 6000, avatar: "", paid: 0, payments: [] },
    { id: "p6", name: "Riz", contribution: 6000, avatar: "", paid: 0, payments: [] },
    { id: "p7", name: "Shifat", contribution: 6000, avatar: "", paid: 0, payments: [] },
    { id: "p8", name: "Redwan", contribution: 6000, avatar: "", paid: 0, payments: [] },
    { id: "p9", name: "Other1", contribution: 6000, avatar: "", paid: 0, payments: [] },
    { id: "p10", name: "Other2", contribution: 6000, avatar: "", paid: 0, payments: [] },
  ],
  categories: [
    { id: "c1", name: "Bus", icon: "bus", mode: "per-person", rate: 1600, fixed: 0, useFoodRate: false, note: "Dhaka ↔ Khagrachari / Dighinala coach, per seat", paidAmount: 0 },
    { id: "c2", name: "Chander Gari (CG)", icon: "car", mode: "fixed", rate: 0, fixed: 12000, useFoodRate: false, note: "Shared jeep, fixed group rate", paidAmount: 0 },
    { id: "c3", name: "Food", icon: "food", mode: "per-person", rate: 0, fixed: 0, useFoodRate: true, note: "Per person, per the breakdown below", paidAmount: 0 },
    { id: "c4", name: "Others", icon: "other", mode: "fixed", rate: 0, fixed: 2000, useFoodRate: false, note: "Misc / buffer spend", paidAmount: 0 },
    { id: "c5", name: "Hotel", icon: "hotel", mode: "fixed", rate: 0, fixed: 12000, useFoodRate: false, note: "Resort / cottage booking", paidAmount: 0 },
  ],
  foodItems: [
    { id: "f1", name: "Nasta (Breakfast / Snacks)", amount: 200 },
    { id: "f2", name: "Lunch", amount: 600 },
    { id: "f3", name: "Dinner", amount: 600 },
  ],
  allocationRule: "contribution",
  itinerary: [
    { id: "i1", day: 0, period: "Night", time: "20:30", title: "Meet up", location: "Meeting point", notes: "Assemble the group.", risk: "", image: "" },
    { id: "i2", day: 0, period: "Night", time: "22:00", title: "Depart Dhaka", location: "Gabtali / Kalabagan → Khagrachari / Dighinala", notes: "Overnight coach.", risk: "", image: "" },
    { id: "i3", day: 1, period: "Early Morning", time: "06:30", title: "Arrive Khagrachari / Dighinala", location: "Dighinala Bus Stand", notes: "Freshen up and breakfast.", risk: "", image: "" },
    { id: "i4", day: 1, period: "Morning", time: "09:00", title: "Board Chander Gari, register at checkpoint", location: "Dighinala → Baghaihat Army Camp", notes: "Register at Baghaihat.", risk: "Two convoys per day.", image: "" },
    { id: "i5", day: 1, period: "Afternoon", time: "13:30", title: "Check in & lunch", location: "Resort, Ruilui Para", notes: "", risk: "", image: "" },
    { id: "i6", day: 2, period: "Early Morning", time: "05:15", title: "Sunrise over the cloud sea", location: "Helipad or Konglak Hill", notes: "", risk: "Weather-dependent.", image: "" },
  ],
  spots: [
    { id: "s1", name: "Konglak Hill (Konglak PARA)", category: "Viewpoint", priority: "High", time: "~1.5–2 hrs round trip", cost: 0, status: "planned", image: "", notes: "Sajek's highest point (~1,800 ft). Best sunrise in the valley.", bestTime: "Sunrise", description: "Stand at Sajek's very zenith — around 1,800 feet above sea level. A panoramic wonderland where time stands still. Experience the true magic of a Golden Hour sunrise, when the valley below is an endless sea of cotton-wool clouds.", specialty: "The single best spot in the entire valley to witness the famous 'sea of clouds' at dawn. On a clear morning, the sunrise here is the reason people travel to Sajek at all.", originStory: "The hill takes its name from the Konglak Para — a small indigenous village perched on the slope of the mountain. For generations, the people of this PARA have lived above the cloud line.", history: "The PARA community here has inhabited the Sajek range for centuries, long before the region became a tourist destination.", tips: "Wake up by 4:45 AM — the whole point is to be up before first light.\nWear warm clothes: it is significantly colder up here than in Ruilui Para.\nBring a flashlight for the walk up in the dark.\nStay 20–30 minutes after sunrise.", gallery: [] },
    { id: "s2", name: "Sajek Helipad", category: "Viewpoint", priority: "High", time: "~45 min", cost: 0, status: "planned", image: "", notes: "Flat open ground — the easiest sunset/sunrise spot.", bestTime: "Sunset", description: "Your grand sunset viewing platform. Just step from the helipad for an expansive, easy view across the vastness. Watch as the sun dips below the infinite sea of clouds, painting the sky in fiery oranges and deep purples.", specialty: "The flattest, most accessible viewpoint in Sajek — no trekking required.", originStory: "The helipad was originally built as a landing pad for helicopters serving the hill region.", history: "Built during the period when Sajek was being developed as a strategic hill area.", tips: "Arrive 30–45 minutes before sunset to get a good spot.\nBring a light jacket.\nThe flat ground is safe for young children.\nPhotograph both east and west.", gallery: [] },
    { id: "s3", name: "Ruilui Para", category: "Village", priority: "Medium", time: "~1–2 hrs", cost: 0, status: "planned", image: "", notes: "Main village — resorts, restaurants, handmade tribal crafts.", bestTime: "Morning", description: "The cultural heart of Sajek — a living village where the PARA community continues its traditions alongside the travellers who come to visit.", specialty: "Genuine handmade crafts, traditional stilt houses, and a warm community.", originStory: "Ruilui is one of the oldest PARA settlements in the Sajek range.", history: "The PARA people have lived on these ridges for many generations.", tips: "Ask before photographing people.\nBuy directly from the artisans.\nTry the local tea.", gallery: [] },
    { id: "s4", name: "Stone Garden", category: "Landmark", priority: "Medium", time: "~30–45 min", cost: 0, status: "planned", image: "", notes: "Landscaped rock garden a short walk from Ruilui Para.", bestTime: "Afternoon", description: "A quietly beautiful, landscaped rock garden perched along the ridge.", specialty: "A sculpted, deliberate garden that contrasts with the wild hills around it.", originStory: "", history: "", tips: "Great for a slow afternoon.\nWear shoes with grip.", gallery: [] },
    { id: "s5", name: "Kamalak Fountain (Padam Toisha Jharna)", category: "Nature", priority: "Low", time: "~3–4 hrs round trip", cost: 0, status: "planned", image: "", notes: "A longer trek to a waterfall — only if the group wants extra hiking.", bestTime: "Monsoon", description: "A serious hillside trek to a waterfall deep in the forest.", specialty: "One of the few waterfall treks accessible from Sajek.", originStory: "", history: "", tips: "Only attempt with a local guide.\nSkip it if there has been heavy rain.", gallery: [] },
    { id: "s6", name: "Bamboo Chicken Dinner", category: "Food", priority: "High", time: "~1 hr", cost: 600, status: "planned", image: "", notes: "Indigenous specialty — order ahead, it takes time to prepare.", bestTime: "Dinner", description: "The signature dish of the Sajek hills — chicken slow-cooked inside a bamboo tube over an open fire.", specialty: "Not just a meal — a cooking method inherited from the local PARA community.", originStory: "Cooked this way long before restaurants arrived in the valley.", history: "Bamboo cooking is a technique common across many hill communities in Southeast Asia.", tips: "Order 1–2 hours in advance.\nConfirm the spice level.\nBest eaten hot.", gallery: [] },
  ],
};

/* ============================== CALCULATIONS ============================== */

function foodPerPersonRate(data) { return data.foodItems.reduce((s, i) => s + num(Number(i.amount)), 0); }
function categoryTotal(cat, headcount, data) {
  if (cat.mode === "fixed") return num(Number(cat.fixed));
  const rate = cat.useFoodRate ? foodPerPersonRate(data) : num(Number(cat.rate));
  return rate * headcount;
}
function computeTotals(data) {
  const headcount = data.participants.length;
  const totalContribution = data.participants.reduce((s, p) => s + num(Number(p.contribution)), 0);
  const totalPaid = data.participants.reduce((s, p) => s + num(Number(p.paid)), 0);
  const catTotals = data.categories.map((c) => ({ ...c, total: categoryTotal(c, headcount, data) }));
  const totalExpense = catTotals.reduce((s, c) => s + c.total, 0);
  const totalExpensePaid = catTotals.reduce((s, c) => s + num(Number(c.paidAmount)), 0);
  const reserve = totalContribution - totalExpense;
  const perPersonAvg = headcount > 0 ? totalExpense / headcount : 0;
  const foodRate = foodPerPersonRate(data);
  return { headcount, totalContribution, totalPaid, catTotals, totalExpense, totalExpensePaid, reserve, perPersonAvg, foodRate };
}
function personCategoryShare(person, cat, totals, data) {
  if (data.allocationRule === "equal") return totals.headcount > 0 ? cat.total / totals.headcount : 0;
  if (totals.totalContribution <= 0) return 0;
  return (num(Number(person.contribution)) / totals.totalContribution) * cat.total;
}
function personTotalShare(person, totals, data) {
  return totals.catTotals.reduce((s, c) => s + personCategoryShare(person, c, totals, data), 0);
}

/* ============================== IMPORT HELPERS ============================== */

const FIELD_ALIASES = {
  name: ["name", "traveler", "participant", "member", "person"],
  contribution: ["contribution", "cont", "paid", "amount", "payment", "contrib"],
  bus: ["bus"], cg: ["cg", "chandergari", "jeep", "transport"],
  food: ["food", "meal", "meals"], others: ["others", "other", "misc"],
  hotel: ["hotel", "resort", "room", "stay"],
};
function normalizeHeader(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9]/g, ""); }
function guessField(header) {
  const h = normalizeHeader(header);
  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    if (aliases.some((a) => h.includes(normalizeHeader(a)))) return field;
  }
  return "ignore";
}

/* ============================== FIREBASE SYNC ============================== */

const TRIP_PATH = "sajekTrip";

function useTripData(writable = true) {
  const [data, setDataLocal] = useState(DEFAULT_DATA);
  const [status, setStatus] = useState("loading");
  const loadedRef = useRef(false);
  const authedRef = useRef(false);
  const saveTimer = useRef(null);

  useEffect(() => {
    let unsubDb = null;
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) return;
      authedRef.current = true;
      const tripRef = ref(db, TRIP_PATH);
      unsubDb = onValue(tripRef, (snapshot) => {
        const val = snapshot.val();
        if (val) setDataLocal(val);
        else if (!loadedRef.current) dbSet(tripRef, DEFAULT_DATA);
        loadedRef.current = true;
        setStatus("saved");
      }, () => setStatus("error"));
    });
    signInAnonymously(auth).catch(() => setStatus("error"));
    return () => { unsubAuth(); if (unsubDb) unsubDb(); };
  }, []);

  const setData = (updater) => {
    if (!writable) return;
    setDataLocal((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (authedRef.current) {
        setStatus("saving");
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
          dbSet(ref(db, TRIP_PATH), next).then(() => setStatus("saved")).catch(() => setStatus("error"));
        }, 500);
      }
      return next;
    });
  };
  return [data, setData, status];
}

const DEFAULT_CREDENTIALS = { adminPw: "admin2026", memberCreds: {}, adminMembers: [] };

function useSystemCredentials() {
  const [creds, setCredsLocal] = useState(DEFAULT_CREDENTIALS);
  const [status, setStatus] = useState("loading");
  const authedRef = useRef(false);
  const firstLoad = useRef(true);

  useEffect(() => {
    let unsub = null;
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) return;
      authedRef.current = true;
      const credRef = ref(db, "system/credentials");
      unsub = onValue(credRef, (snapshot) => {
        const val = snapshot.val();
        if (val) {
          setCredsLocal({
            adminPw: val.adminPw || DEFAULT_CREDENTIALS.adminPw,
            memberCreds: val.memberCreds || {},
            adminMembers: val.adminMembers || [],
          });
        } else if (firstLoad.current) {
          dbSet(credRef, DEFAULT_CREDENTIALS);
          setCredsLocal(DEFAULT_CREDENTIALS);
        }
        firstLoad.current = false;
        setStatus("saved");
      }, () => setStatus("error"));
    });
    signInAnonymously(auth).catch(() => setStatus("error"));
    return () => { unsubAuth(); if (unsub) unsub(); };
  }, []);

  const setCredentials = (updater) => {
    if (!authedRef.current) return;
    setCredsLocal((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      dbSet(ref(db, "system/credentials"), next).catch(() => {});
      return next;
    });
  };
  return {
    adminPw: creds.adminPw,
    setAdminPw: (pw) => setCredentials((prev) => ({ ...prev, adminPw: pw })),
    memberCreds: creds.memberCreds,
    setMemberCreds: (c) => setCredentials((prev) => ({ ...prev, memberCreds: c })),
    adminMembers: creds.adminMembers,
    setAdminMembers: (ids) => setCredentials((prev) => ({ ...prev, adminMembers: ids })),
    credentialsStatus: status,
  };
}

/* ============================== SHARED UI ============================== */

function CountUp({ value, prefix = "" }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  useEffect(() => {
    const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setDisplay(value); prevRef.current = value; return; }
    const start = prevRef.current, end = value, startTime = performance.now(), duration = 500;
    let raf;
    function tick(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(start + (end - start) * eased);
      if (t < 1) raf = requestAnimationFrame(tick); else prevRef.current = end;
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span>{prefix}{Math.round(display).toLocaleString("en-US")}</span>;
}

function Ridgeline({ height = 190 }) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl" style={{ height, background: "#0B0A14" }}>
      <svg viewBox="0 0 500 240" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#0A0D20" />
            <stop offset="35%" stopColor="#1A1435" />
            <stop offset="65%" stopColor="#3D1F3E" />
            <stop offset="85%" stopColor="#7C2D12" />
            <stop offset="100%" stopColor="#C2410C" />
          </linearGradient>
          <radialGradient id="sunGlow" cx="0.7" cy="0.68" r="0.45">
            <stop offset="0%" stopColor="#FED7AA" stopOpacity="0.9" />
            <stop offset="30%" stopColor="#FB923C" stopOpacity="0.55" />
            <stop offset="70%" stopColor="#EA580C" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
          </radialGradient>
          <filter id="softBlur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4" /></filter>
          <filter id="softBlurStrong" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7" /></filter>
          <filter id="mistBlur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="10" /></filter>
          <linearGradient id="bottomFade" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#07090D" stopOpacity="0" />
            <stop offset="100%" stopColor="#07090D" stopOpacity="0.95" />
          </linearGradient>
        </defs>
        <rect width="500" height="240" fill="url(#sky)" />
        <ellipse cx="340" cy="155" rx="120" ry="90" fill="url(#sunGlow)" />
        <path d="M0,150 L40,120 L80,135 L120,105 L160,128 L210,100 L260,125 L310,108 L360,130 L410,115 L460,138 L500,120 L500,240 L0,240 Z" fill="#1F1636" opacity="0.55" />
        <ellipse cx="250" cy="145" rx="280" ry="18" fill="#FED7AA" opacity="0.18" filter="url(#softBlurStrong)" />
        <path d="M0,175 L60,150 L110,168 L160,142 L220,165 L280,145 L340,170 L400,152 L450,172 L500,158 L500,240 L0,240 Z" fill="#150E24" opacity="0.9" />
        <g className="cloud-drift-1" filter="url(#softBlur)">
          <ellipse cx="90" cy="160" rx="55" ry="10" fill="#FED7AA" opacity="0.55" />
          <ellipse cx="140" cy="163" rx="45" ry="8" fill="#FED7AA" opacity="0.45" />
          <ellipse cx="60" cy="166" rx="40" ry="7" fill="#FEF3C7" opacity="0.35" />
        </g>
        <g className="cloud-drift-2" filter="url(#softBlur)">
          <ellipse cx="380" cy="168" rx="60" ry="11" fill="#FDBA74" opacity="0.5" />
          <ellipse cx="440" cy="172" rx="50" ry="9" fill="#FED7AA" opacity="0.4" />
          <ellipse cx="320" cy="174" rx="35" ry="7" fill="#FEF3C7" opacity="0.3" />
        </g>
        <ellipse cx="250" cy="180" rx="300" ry="6" fill="#FED7AA" opacity="0.25" filter="url(#softBlurStrong)" />
        <path d="M0,205 L50,190 L100,200 L160,180 L210,198 L270,182 L330,200 L390,188 L450,204 L500,192 L500,240 L0,240 Z" fill="#0C0817" />
        <ellipse cx="250" cy="205" rx="320" ry="14" fill="#FDBA74" opacity="0.20" filter="url(#mistBlur)" />
        <rect y="140" width="500" height="100" fill="url(#bottomFade)" />
      </svg>
      <div className="mist-rise absolute inset-x-0 bottom-0 h-1/3 pointer-events-none" style={{ background: "radial-gradient(ellipse at center bottom, rgba(251,146,60,0.20), transparent 70%)" }} />
    </div>
  );
}

function Card({ children, className = "", style = {}, hover = false, onClick }) {
  const [isHover, setIsHover] = useState(false);
  return (
    <div
      className={"rise-in rounded-2xl border " + className}
      onClick={onClick}
      onMouseEnter={hover ? () => setIsHover(true) : undefined}
      onMouseLeave={hover ? () => setIsHover(false) : undefined}
      style={{
        background: isHover ? BRAND.cardElevated : BRAND.card,
        borderColor: isHover ? BRAND.borderLight : BRAND.border,
        transition: "background-color .2s ease, border-color .2s ease",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function PulseOnChange({ value, children }) {
  const [pulse, setPulse] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current !== value) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 400);
      prev.current = value;
      return () => clearTimeout(t);
    }
  }, [value]);
  return <span className={pulse ? "pulse-on-change inline-block" : "inline-block"}>{children}</span>;
}

function StatCard({ icon: Icon, label, value, sub, tone = "accent", isCurrency = true }) {
  const colorMap = { accent: BRAND.accent, success: BRAND.success, danger: BRAND.danger, info: BRAND.info, warning: BRAND.warning, purple: BRAND.dusk, pine: BRAND.pine, bamboo: BRAND.bamboo, cloud: BRAND.cloud, dusk: BRAND.dusk, ember: BRAND.ember };
  const color = colorMap[tone] || BRAND.accent;
  return (
    <Card className="p-3.5 sm:p-4" hover>
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: BRAND.textMuted }}>{label}</span>
        {Icon && <div className="rounded-lg p-1.5 shrink-0" style={{ background: color + "18" }}><Icon size={14} color={color} /></div>}
      </div>
      <div className="font-num mt-2 text-xl sm:text-2xl font-bold tabular-nums" style={{ color: BRAND.text }}>
        <PulseOnChange value={value}>
          {typeof value === "number" ? <CountUp value={value} prefix={isCurrency ? "৳" : ""} /> : value}
        </PulseOnChange>
      </div>
      {sub && <div className="mt-1 text-[11px]" style={{ color: BRAND.textDim }}>{sub}</div>}
    </Card>
  );
}

function Segmented({ options, value, onChange, small = false, disabled = false }) {
  return (
    <div className="inline-flex gap-1 rounded-xl p-1 border" style={{ background: BRAND.bgElevated, borderColor: BRAND.border, opacity: disabled ? 0.6 : 1 }}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button key={opt.value} onClick={() => !disabled && onChange(opt.value)} disabled={disabled}
            className={"rounded-lg font-semibold transition-all " + (small ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm") + (disabled ? " cursor-not-allowed" : "")}
            style={active ? { background: `linear-gradient(135deg, ${BRAND.accent} 0%, ${BRAND.accentSoft} 100%)`, color: "#fff", boxShadow: `0 4px 12px ${BRAND.accent}44` } : { color: BRAND.textMuted }}>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function IconBtn({ icon: Icon, onClick, label, tone = "stone", size = 16, disabled = false }) {
  const toneMap = { stone: BRAND.textMuted, ember: BRAND.danger, danger: BRAND.danger, pine: BRAND.accent, accent: BRAND.accent, success: BRAND.success };
  const color = disabled ? BRAND.textDim : (toneMap[tone] || toneMap.stone);
  return (
    <button onClick={disabled ? undefined : onClick} aria-label={label} title={label} disabled={disabled}
      className={"rounded-lg p-1.5 transition-colors " + (disabled ? "opacity-40 cursor-not-allowed" : "")}
      style={{ background: "transparent" }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = BRAND.cardHover; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
      <Icon size={size} color={color} />
    </button>
  );
}

function TextInput({ value, onChange, placeholder = "", className = "", disabled = false }) {
  const [local, setLocal] = useState(value);
  const inputRef = useRef(null);
  useEffect(() => { if (document.activeElement !== inputRef.current) setLocal(value); }, [value]);
  const handleChange = (e) => { const n = e.target.value; setLocal(n); if (onChange) onChange(n); };
  return (
    <input ref={inputRef} type="text" value={local} onChange={disabled ? undefined : handleChange} placeholder={placeholder} disabled={disabled}
      className={"field w-full rounded-lg bg-transparent px-2 py-1.5 text-sm border " + className}
      style={{ color: disabled ? BRAND.textDim : BRAND.text, borderColor: BRAND.border, background: disabled ? "transparent" : BRAND.bgElevated, cursor: disabled ? "not-allowed" : "text" }} />
  );
}

function NumberInput({ value, onChange, placeholder = "", className = "", disabled = false }) {
  const [local, setLocal] = useState(String(value));
  const inputRef = useRef(null);
  useEffect(() => { if (document.activeElement !== inputRef.current) setLocal(String(value)); }, [value]);
  const handleChange = (e) => {
    const raw = e.target.value; setLocal(raw);
    if (onChange) { const p = parseFloat(raw); if (!isNaN(p)) onChange(p); else if (raw === "" || raw === "-") onChange(0); }
  };
  return (
    <input ref={inputRef} type="number" inputMode="decimal" value={local} disabled={disabled} onChange={disabled ? undefined : handleChange} placeholder={placeholder}
      className={"field font-num w-full rounded-lg bg-transparent px-2 py-1.5 text-sm border tabular-nums " + className}
      style={{ color: disabled ? BRAND.textDim : BRAND.text, borderColor: BRAND.border, background: disabled ? "transparent" : BRAND.bgElevated, cursor: disabled ? "not-allowed" : "text" }} />
  );
}

function TextArea({ value, onChange, placeholder = "", rows = 2, disabled = false }) {
  const [local, setLocal] = useState(value);
  const inputRef = useRef(null);
  useEffect(() => { if (document.activeElement !== inputRef.current) setLocal(value); }, [value]);
  const handleChange = (e) => { const n = e.target.value; setLocal(n); if (onChange) onChange(n); };
  return (
    <textarea ref={inputRef} value={local} onChange={disabled ? undefined : handleChange} placeholder={placeholder} disabled={disabled} rows={rows}
      className="field w-full rounded-lg bg-transparent px-2 py-1.5 text-sm border resize-none"
      style={{ color: disabled ? BRAND.textDim : BRAND.text, borderColor: BRAND.border, background: disabled ? "transparent" : BRAND.bgElevated, cursor: disabled ? "not-allowed" : "text" }} />
  );
}

function EmptyState({ icon: Icon, title, message }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed px-6 py-10 text-center" style={{ borderColor: BRAND.borderLight }}>
      <div className="rounded-full p-3" style={{ background: BRAND.cardElevated }}><Icon size={22} color={BRAND.accent} /></div>
      <p className="font-display mt-3 text-base font-semibold" style={{ color: BRAND.text }}>{title}</p>
      <p className="mt-1 max-w-xs text-sm" style={{ color: BRAND.textMuted }}>{message}</p>
    </div>
  );
}

function SectionHeading({ eyebrow, title, action }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && <div className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: BRAND.textDim }}>{eyebrow}</div>}
        <h2 className="font-display text-lg sm:text-xl font-semibold truncate" style={{ color: BRAND.text }}>{title}</h2>
      </div>
      {action}
    </div>
  );
}

function ConfirmDialog({ state, onClose }) {
  if (!state || !state.open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="rise-in w-full max-w-sm rounded-2xl p-5 border" style={{ background: BRAND.cardElevated, borderColor: BRAND.borderLight, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full p-2" style={{ background: BRAND.danger + "22" }}><AlertTriangle size={18} color={BRAND.danger} /></div>
          <div className="flex-1">
            <h3 className="font-display text-lg font-semibold" style={{ color: BRAND.text }}>{state.title}</h3>
            <p className="mt-1 text-sm" style={{ color: BRAND.textMuted }}>{state.message}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-semibold" style={{ color: BRAND.textMuted, background: BRAND.bgElevated, border: `1px solid ${BRAND.border}` }}>Cancel</button>
          <button onClick={() => { state.onConfirm(); onClose(); }} className="rounded-xl px-4 py-2 text-sm font-semibold text-white" style={{ background: `linear-gradient(135deg, ${BRAND.danger} 0%, #DC2626 100%)` }}>{state.confirmLabel || "Remove"}</button>
        </div>
      </div>
    </div>
  );
}

function PaymentDialog({ open, person, onClose, onSave }) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  useEffect(() => { if (open) { setAmount(""); setNote(""); setDate(new Date().toISOString().slice(0, 10)); } }, [open]);
  if (!open || !person) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="rise-in w-full max-w-md rounded-2xl p-5 border" style={{ background: BRAND.cardElevated, borderColor: BRAND.borderLight, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="font-display text-lg font-semibold" style={{ color: BRAND.text }}>Record payment</h3>
            <p className="text-xs" style={{ color: BRAND.textMuted }}>For {person.name} · Already paid {fmt(person.paid)}</p>
          </div>
          <IconBtn icon={X} onClick={onClose} label="Close" />
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: BRAND.textDim }}>Amount</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="field font-num w-full rounded-lg px-3 py-2.5 text-sm border mt-1.5 tabular-nums" style={{ background: BRAND.bgElevated, color: BRAND.text, borderColor: BRAND.border }} />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: BRAND.textDim }}>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="field w-full rounded-lg px-3 py-2.5 text-sm border mt-1.5" style={{ background: BRAND.bgElevated, color: BRAND.text, borderColor: BRAND.border }} />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: BRAND.textDim }}>Note (optional)</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Cash, bKash" className="field w-full rounded-lg px-3 py-2.5 text-sm border mt-1.5" style={{ background: BRAND.bgElevated, color: BRAND.text, borderColor: BRAND.border }} />
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-semibold" style={{ color: BRAND.textMuted, background: BRAND.bgElevated, border: `1px solid ${BRAND.border}` }}>Cancel</button>
          <button onClick={() => { const amt = parseFloat(amount); if (isNaN(amt) || amt <= 0) return; onSave(amt, note.trim(), date); onClose(); }} className="rounded-xl px-4 py-2 text-sm font-semibold text-white" style={{ background: `linear-gradient(135deg, ${BRAND.accent} 0%, ${BRAND.accentSoft} 100%)` }}>Save payment</button>
        </div>
        {person.payments && person.payments.length > 0 && (
          <div className="mt-5 pt-3 border-t" style={{ borderColor: BRAND.border }}>
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2" style={{ color: BRAND.textDim }}>History</div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {person.payments.map((pay) => (
                <div key={pay.id} className="flex items-center justify-between text-xs">
                  <span className="font-num tabular-nums font-semibold" style={{ color: BRAND.accent }}>{fmt(pay.amount)}</span>
                  <span style={{ color: BRAND.textDim }}>{pay.date} {pay.note ? "· " + pay.note : ""}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RingProgress({ value, max, size = 60, stroke = 6, color = BRAND.accent }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={BRAND.border} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset .5s ease" }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-num text-xs font-bold tabular-nums" style={{ color: BRAND.text }}>{Math.round(pct)}%</span>
      </div>
    </div>
  );
}

function Avatar({ name, src, size = 32 }) {
  const [err, setErr] = useState(false);
  return (
    <div className="rounded-full overflow-hidden shrink-0 flex items-center justify-center font-bold"
      style={{ width: size, height: size, background: src && !err ? "transparent" : avatarColor(name), color: "#fff", fontSize: size * 0.36 }}>
      {src && !err ? <img src={src} alt={name} className="w-full h-full object-cover" onError={() => setErr(true)} /> : initials(name)}
    </div>
  );
}

function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.05 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: `opacity .65s cubic-bezier(.4,0,.2,1) ${delay}ms, transform .65s cubic-bezier(.4,0,.2,1) ${delay}ms` }}>
      {children}
    </div>
  );
}

function Lightbox({ images, index, onClose, onPrev, onNext }) {
  useEffect(() => {
    if (index === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onPrev();
      else if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [index, onClose, onPrev, onNext]);
  if (index === null || !images || !images[index]) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.94)", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 rounded-full p-2 bg-white/10 hover:bg-white/20 transition" aria-label="Close"><X size={20} color="#fff" /></button>
      {images.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-2 sm:left-6 rounded-full p-2 sm:p-3 bg-white/10 hover:bg-white/20 transition" aria-label="Previous"><ChevronLeft size={22} color="#fff" /></button>
          <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-2 sm:right-6 rounded-full p-2 sm:p-3 bg-white/10 hover:bg-white/20 transition" aria-label="Next"><ChevronRight size={22} color="#fff" /></button>
        </>
      )}
      <img src={images[index]} alt="" className="max-w-[92vw] max-h-[88vh] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}>{index + 1} / {images.length}</div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="font-body flex min-h-screen items-center justify-center" style={{ background: BRAND.bg }}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full blur-xl opacity-50" style={{ background: BRAND.accent }} />
          <Loader2 size={36} className="animate-spin relative" color={BRAND.accent} />
        </div>
        <p className="font-display text-sm font-medium" style={{ color: BRAND.textMuted }}>Loading trip data…</p>
      </div>
    </div>
  );
}

/* ============================== ADMIN SETTINGS ============================== */

function AdminSettings({ adminPw, setAdminPw, memberCreds, setMemberCreds, adminMembers, setAdminMembers, participants, confirmAction }) {
  const [localAdminPw, setLocalAdminPw] = useState(adminPw);
  const [localCreds, setLocalCreds] = useState({ ...memberCreds });
  const [localAdminIds, setLocalAdminIds] = useState([...adminMembers]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const updated = { ...localCreds };
    participants.forEach((p) => { if (!updated[p.id]) updated[p.id] = { username: p.name.toLowerCase().replace(/\s+/g, ""), password: "pass1234" }; });
    setLocalCreds(updated);
    // eslint-disable-next-line
  }, [participants]);

  const handleSave = () => {
    setAdminPw(localAdminPw);
    setMemberCreds({ ...localCreds });
    setAdminMembers([...localAdminIds]);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    confirmAction({
      title: "Reset all credentials?",
      message: "Admin password, all member usernames, passwords, and admin statuses will be reset.",
      confirmLabel: "Reset",
      onConfirm: () => {
        setAdminPw("admin2026"); setLocalAdminPw("admin2026");
        const def = {};
        participants.forEach((p) => { def[p.id] = { username: p.name.toLowerCase().replace(/\s+/g, ""), password: "pass1234" }; });
        setMemberCreds(def); setLocalCreds(def); setAdminMembers([]); setLocalAdminIds([]);
      },
    });
  };

  const toggleAdmin = (id) => setLocalAdminIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  return (
    <div className="space-y-5">
      <Card className="p-4">
        <SectionHeading eyebrow="Admin only" title="Manage credentials" />
        <p className="text-sm mb-4" style={{ color: BRAND.textMuted }}>These settings are stored in Firebase and shared across all devices.</p>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: BRAND.textDim }}>Admin Password</label>
            <input type="text" value={localAdminPw} onChange={(e) => setLocalAdminPw(e.target.value)} className="field w-full rounded-lg px-3 py-2.5 text-sm border mt-1.5" style={{ background: BRAND.bgElevated, color: BRAND.text, borderColor: BRAND.border }} />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2 block" style={{ color: BRAND.textDim }}>Member Credentials & Admin Access</label>
            <div className="overflow-x-auto rounded-xl border" style={{ borderColor: BRAND.border }}>
              <table className="w-full text-xs border-collapse" style={{ minWidth: 520 }}>
                <thead><tr style={{ background: BRAND.bgElevated }}>{["Traveler", "Username", "Password", "Admin?"].map((h) => (<th key={h} className="text-left px-3 py-2 font-bold uppercase tracking-[0.1em] text-[10px]" style={{ color: BRAND.textDim }}>{h}</th>))}</tr></thead>
                <tbody>
                  {participants.map((p) => {
                    const cred = localCreds[p.id] || { username: "", password: "" };
                    const isAdmin = localAdminIds.includes(p.id);
                    return (
                      <tr key={p.id} className="border-t" style={{ borderColor: BRAND.border }}>
                        <td className="px-3 py-2 whitespace-nowrap" style={{ color: BRAND.text }}>{p.name}</td>
                        <td className="px-3 py-2"><input type="text" value={cred.username} onChange={(e) => setLocalCreds((prev) => ({ ...prev, [p.id]: { ...prev[p.id], username: e.target.value } }))} className="w-full rounded bg-transparent px-1.5 py-1 text-xs border" style={{ color: BRAND.text, borderColor: BRAND.border, background: BRAND.bgElevated }} /></td>
                        <td className="px-3 py-2"><input type="text" value={cred.password} onChange={(e) => setLocalCreds((prev) => ({ ...prev, [p.id]: { ...prev[p.id], password: e.target.value } }))} className="w-full rounded bg-transparent px-1.5 py-1 text-xs border" style={{ color: BRAND.text, borderColor: BRAND.border, background: BRAND.bgElevated }} /></td>
                        <td className="px-3 py-2 text-center"><input type="checkbox" checked={isAdmin} onChange={() => toggleAdmin(p.id)} className="h-4 w-4 cursor-pointer" style={{ accentColor: BRAND.accent }} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <button onClick={handleSave} className="rounded-xl px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ background: `linear-gradient(135deg, ${BRAND.accent} 0%, ${BRAND.accentSoft} 100%)` }}>{saved ? "Saved ✓" : "Save changes"}</button>
            <button onClick={handleReset} className="rounded-xl px-5 py-2 text-sm font-semibold" style={{ color: BRAND.danger, border: `1px solid ${BRAND.danger}44` }}>Reset to defaults</button>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ============================== MEMBER PROFILE ============================== */

function MemberProfile({ memberId, data, totals }) {
  const person = data.participants.find((p) => p.id === memberId);
  if (!person) return <EmptyState icon={UserCircle} title="Profile not found" message="Your traveler profile may have been removed." />;
  const share = personTotalShare(person, totals, data);
  const paid = num(Number(person.paid));
  const remaining = num(Number(person.contribution)) - paid;
  const balance = num(Number(person.contribution)) - share;
  const [nickname, setNickname] = useState(person.name);
  const [avatar, setAvatar] = useState(person.avatar || "");
  const [avatarPreview, setAvatarPreview] = useState(person.avatar || null);
  const fileInputRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => { setNickname(person.name); setAvatar(person.avatar || ""); setAvatarPreview(person.avatar || ""); }, [person.id]);

  const handleSaveProfile = async () => {
    setSaving(true); setSaveMsg("");
    try {
      const idx = data.participants.findIndex((p) => p.id === memberId);
      if (idx === -1) return;
      await dbSet(ref(db, TRIP_PATH + "/participants/" + idx), { ...data.participants[idx], name: nickname, avatar });
      setSaveMsg("Saved ✓"); setTimeout(() => setSaveMsg(""), 2000);
    } catch { setSaveMsg("Error"); } finally { setSaving(false); }
  };

  const handleAvatarFile = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setAvatar(reader.result); setAvatarPreview(reader.result); };
    reader.readAsDataURL(file);
  };

  const sortedPayments = [...(person.payments || [])].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  const pieData = totals.catTotals.filter((c) => c.total > 0);
  const nextItems = data.itinerary.slice(0, 2);
  const taglineParts = String(data.meta.tagline || "").split("—");
  const bengaliTitle = (taglineParts[0] || "").trim();
  const englishSubtitle = (taglineParts[1] || taglineParts[0] || "").trim();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-1 space-y-4">
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="rounded-full p-[2px]" style={{ background: `linear-gradient(135deg, ${BRAND.accent} 0%, ${BRAND.accentSoft} 100%)` }}>
                <div className="rounded-full p-[2px]" style={{ background: BRAND.card }}><Avatar name={nickname} src={avatarPreview} size={80} /></div>
              </div>
              <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 rounded-full p-1.5 shadow-lg transition-transform hover:scale-110" style={{ background: BRAND.cardElevated, border: `2px solid ${BRAND.card}` }}><Camera size={11} color={BRAND.accent} /></button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
            </div>
            <div className="min-w-0 flex-1">
              <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} className="font-display text-2xl font-bold bg-transparent outline-none w-full truncate" style={{ color: BRAND.text }} />
              <p className="text-xs mt-1 truncate" style={{ color: BRAND.textMuted }}>Traveler · Sajek Valley Trip</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <RingProgress value={paid} max={num(Number(person.contribution)) || 1} size={54} stroke={5} color={BRAND.accent} />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: BRAND.textDim }}>Trip Completion</div>
              <div className="text-sm font-bold" style={{ color: BRAND.text }}>{Math.round(num(Number(person.contribution)) > 0 ? (paid / num(Number(person.contribution))) * 100 : 0)}% · {remaining <= 0 ? "Paid" : "In Progress"}</div>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <input type="text" value={avatar || ""} onChange={(e) => { setAvatar(e.target.value); setAvatarPreview(e.target.value); }} placeholder="Paste image URL" className="field w-full rounded-lg px-3 py-2 text-xs border" style={{ background: BRAND.bgElevated, color: BRAND.text, borderColor: BRAND.border }} />
            <button onClick={handleSaveProfile} disabled={saving} className="rounded-xl px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 w-full" style={{ background: `linear-gradient(135deg, ${BRAND.accent} 0%, ${BRAND.accentSoft} 100%)` }}>{saving ? "Saving…" : saveMsg || "Save profile"}</button>
          </div>
        </Card>
        <Card className="p-4">
          <div className="grid grid-cols-3 gap-x-3 gap-y-3">
            {[["Role", "Traveler"], ["Status", remaining <= 0 ? "Fully Paid" : paid > 0 ? "Partial" : "Pending"], ["Contribution", fmt(person.contribution)], ["Paid", fmt(paid)], ["Remaining", fmt(remaining)], ["Payments", String(sortedPayments.length)]].map(([l, v]) => (
              <div key={l} className="min-w-0">
                <div className="text-[9px] font-bold uppercase tracking-[0.12em] truncate" style={{ color: BRAND.textDim }}>{l}</div>
                <div className="text-xs font-bold mt-0.5 truncate" style={{ color: BRAND.text }}>{v}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="overflow-hidden">
          <div className="relative h-48" style={{ background: `linear-gradient(180deg, #0A0D20 0%, #1A1435 45%, #7C2D12 85%, #C2410C 100%)` }}>
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, rgba(7,9,13,0.85) 100%)" }} />
            <div className="absolute inset-0 p-4 flex flex-col justify-between">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "#FDBA74" }}>Destination</div>
              <div>
                <div className="font-display text-xl font-bold text-white truncate">{data.meta.title || "Sajek Valley"}</div>
                {bengaliTitle && <div className="text-xs text-white/80 mt-0.5 truncate">{bengaliTitle}</div>}
                {englishSubtitle && <div className="text-[11px] text-white/60 truncate">{englishSubtitle}</div>}
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-bold text-white flex items-center gap-1"><Wallet size={10} /> {fmt(totals.totalExpense)}</span>
                  <span className="rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-bold text-white flex items-center gap-1"><CalendarDays size={10} /> {data.meta.dateRange}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={PiggyBank} label="Collected" value={totals.totalContribution} tone="accent" />
          <StatCard icon={CheckCircle2} label="Received" value={totals.totalPaid} tone="success" />
          <StatCard icon={Wallet} label="Planned" value={totals.totalExpense} tone="info" />
          <StatCard icon={totals.reserve >= 0 ? TrendingUp : TrendingDown} label={totals.reserve >= 0 ? "Reserve" : "Deficit"} value={totals.reserve} tone={totals.reserve >= 0 ? "success" : "danger"} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card className="p-4">
            <SectionHeading eyebrow={`${totals.headcount} travelers`} title="Who's in" />
            <div className="flex flex-wrap gap-2">
              {data.participants.slice(0, 7).map((p) => (
                <div key={p.id} className="flex flex-col items-center gap-1 min-w-[52px]">
                  <Avatar name={p.name} src={p.avatar} size={44} />
                  <span className="text-[10px] font-semibold truncate max-w-[56px] text-center" style={{ color: BRAND.textMuted }}>{p.name || "Unnamed"}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-4">
            <SectionHeading eyebrow="Breakdown" title="Expense mix" />
            {pieData.length === 0 ? <p className="text-sm" style={{ color: BRAND.textMuted }}>No expenses yet.</p> : (
              <div className="flex items-center gap-3">
                <div className="h-32 w-32 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="total" nameKey="name" innerRadius={34} outerRadius={58} paddingAngle={2}>
                        {pieData.map((entry, idx) => <Cell key={entry.id} fill={PIE_COLORS[idx % PIE_COLORS.length]} stroke={BRAND.card} strokeWidth={2} />)}
                      </Pie>
                      <RTooltip contentStyle={{ background: BRAND.cardElevated, border: `1px solid ${BRAND.borderLight}`, borderRadius: 12, color: BRAND.text, fontSize: 12 }} formatter={(v) => fmt(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  {pieData.slice(0, 6).map((c, idx) => (
                    <div key={c.id} className="flex items-center justify-between text-[11px] gap-2">
                      <span className="flex items-center gap-1.5 truncate" style={{ color: BRAND.textMuted }}>
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                        {clampText(c.name, 12)}
                      </span>
                      <span className="font-num shrink-0 tabular-nums font-semibold" style={{ color: BRAND.text }}>{fmt(c.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
        <Card className="p-4">
          <SectionHeading eyebrow="Keep track" title="Trip notes" />
          <p className="text-sm rounded-lg p-3 border" style={{ color: BRAND.textMuted, background: BRAND.bgElevated, borderColor: BRAND.border }}>{data.meta.notes?.trim() || "Anything the group should remember…"}</p>
        </Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {nextItems.map((item, idx) => (
            <Card key={item.id} className="p-4" hover>
              <div className="flex items-center gap-3">
                <div className="rounded-xl p-2.5 shrink-0" style={{ background: BRAND.accent + "18" }}><MapPin size={16} color={BRAND.accent} /></div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: BRAND.textDim }}>{idx === 0 ? "Next up" : "Later"}</div>
                  <div className="font-display text-sm font-bold truncate" style={{ color: BRAND.text }}>Day {item.day}: {item.title}</div>
                </div>
                <ArrowRight size={14} color={BRAND.textDim} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================== DASHBOARD ============================== */

function Dashboard({ data, setData, totals, goTo, readOnly }) {
  const updateMeta = (patch) => setData((d) => ({ ...d, meta: { ...d.meta, ...patch } }));
  const pieData = totals.catTotals.filter((c) => c.total > 0);
  const nextItem = data.itinerary[0];
  const spentPct = totals.totalContribution > 0 ? Math.min(100, (totals.totalExpense / totals.totalContribution) * 100) : 0;
  const paidPct = totals.totalContribution > 0 ? Math.min(100, (totals.totalPaid / totals.totalContribution) * 100) : 0;

  return (
    <div className="space-y-5">
      <div className="relative">
        <Ridgeline height={210} />
        <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
          <input value={data.meta.title} onChange={readOnly ? undefined : (e) => updateMeta({ title: e.target.value })} disabled={readOnly} className="font-display field w-full max-w-xs bg-transparent text-2xl sm:text-3xl font-bold text-white placeholder-white/50" placeholder="Trip name" />
          <input value={data.meta.tagline} onChange={readOnly ? undefined : (e) => updateMeta({ tagline: e.target.value })} disabled={readOnly} className="field mt-1 w-full max-w-xs bg-transparent text-xs sm:text-sm text-white/80 placeholder-white/50" placeholder="Tagline" />
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/10 backdrop-blur px-3 py-1 text-xs text-white border border-white/10 flex items-center gap-1"><Users size={11} /> {totals.headcount} travelers</span>
            <input value={data.meta.dateRange} onChange={readOnly ? undefined : (e) => updateMeta({ dateRange: e.target.value })} disabled={readOnly} className="field rounded-full bg-white/10 backdrop-blur px-3 py-1 text-xs text-white placeholder-white/60 border border-white/10" style={{ width: 130 }} />
            <input value={data.meta.duration} onChange={readOnly ? undefined : (e) => updateMeta({ duration: e.target.value })} disabled={readOnly} className="field rounded-full bg-white/10 backdrop-blur px-3 py-1 text-xs text-white placeholder-white/60 border border-white/10" style={{ width: 130 }} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={PiggyBank} label="Collected" value={totals.totalContribution} tone="accent" />
        <StatCard icon={CheckCircle2} label="Received" value={totals.totalPaid} tone="success" />
        <StatCard icon={Wallet} label="Planned" value={totals.totalExpense} tone="info" />
        <StatCard icon={totals.reserve >= 0 ? TrendingUp : TrendingDown} label={totals.reserve >= 0 ? "Reserve" : "Deficit"} value={totals.reserve} tone={totals.reserve >= 0 ? "success" : "danger"} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: BRAND.textDim }}><span>Received</span><span>{Math.round(paidPct)}%</span></div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full" style={{ background: BRAND.border }}><div className="h-full rounded-full transition-width" style={{ width: paidPct + "%", background: `linear-gradient(90deg, ${BRAND.accent}, ${BRAND.accentSoft})` }} /></div>
          <div className="mt-2 text-xs" style={{ color: BRAND.textMuted }}>{fmt(totals.totalPaid)} received · {fmt(Math.max(0, totals.totalContribution - totals.totalPaid))} pending</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: BRAND.textDim }}><span>Spend</span><span>{Math.round(spentPct)}%</span></div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full" style={{ background: BRAND.border }}><div className="h-full rounded-full transition-width" style={{ width: spentPct + "%", background: totals.reserve >= 0 ? `linear-gradient(90deg, ${BRAND.info}, #60A5FA)` : `linear-gradient(90deg, ${BRAND.danger}, #F87171)` }} /></div>
          <div className="mt-2 text-xs" style={{ color: BRAND.textMuted }}>{totals.reserve >= 0 ? `${fmt(totals.reserve)} reserve left` : `Over budget by ${fmt(Math.abs(totals.reserve))}`}</div>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <Card className="p-4 lg:col-span-3">
          <SectionHeading eyebrow="Breakdown" title="Expense mix" />
          {pieData.length === 0 ? <EmptyState icon={Wallet} title="No expenses yet" message="Add a category in Budget." /> : (
            <div key={totals.totalExpense} className="flex flex-col sm:flex-row items-center gap-4">
              <div className="h-44 w-44 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="total" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={2}>
                      {pieData.map((entry, idx) => <Cell key={entry.id} fill={PIE_COLORS[idx % PIE_COLORS.length]} stroke={BRAND.card} strokeWidth={3} />)}
                    </Pie>
                    <RTooltip contentStyle={{ background: BRAND.cardElevated, border: `1px solid ${BRAND.borderLight}`, borderRadius: 12, color: BRAND.text, fontSize: 12 }} formatter={(v) => fmt(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 w-full space-y-1.5">
                {pieData.map((c, idx) => (
                  <div key={c.id} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 truncate" style={{ color: BRAND.textMuted }}>
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                      {clampText(c.name, 18)}
                    </span>
                    <span className="font-num shrink-0 tabular-nums font-semibold" style={{ color: BRAND.text }}>{fmt(c.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
        <Card className="p-4 lg:col-span-2">
          <SectionHeading eyebrow={`${totals.headcount} travelers`} title="Who's in" action={<button onClick={() => goTo("budget")} className="flex items-center gap-1 text-xs font-semibold" style={{ color: BRAND.accent }}>Manage <ArrowRight size={11} /></button>} />
          <div className="flex flex-wrap gap-2">
            {data.participants.slice(0, 8).map((p) => (
              <div key={p.id} className="flex items-center gap-1.5 rounded-full border pl-0.5 pr-2.5 py-0.5" style={{ borderColor: BRAND.border, background: BRAND.bgElevated }}>
                <Avatar name={p.name} src={p.avatar} size={22} />
                <span className="text-[11px] font-medium truncate max-w-[70px]" style={{ color: BRAND.text }}>{p.name || "Unnamed"}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="p-4">
          <SectionHeading eyebrow="Next up" title={nextItem ? nextItem.title : "No plan yet"} />
          {nextItem ? (
            <div className="flex items-center gap-2 text-sm" style={{ color: BRAND.textMuted }}>
              <div className="rounded-lg p-1.5" style={{ background: BRAND.accent + "18" }}><Clock size={13} color={BRAND.accent} /></div>
              <span>Day {nextItem.day} · {nextItem.period}{nextItem.time ? " · " + nextItem.time : ""}</span>
            </div>
          ) : <p className="text-sm" style={{ color: BRAND.textMuted }}>Add your first stop in Itinerary.</p>}
        </Card>
        <Card className="p-4">
          <SectionHeading eyebrow="Keep track" title="Trip notes" />
          <TextArea value={data.meta.notes} onChange={readOnly ? undefined : (v) => updateMeta({ notes: v })} placeholder="Anything the group should remember…" rows={3} disabled={readOnly} />
        </Card>
      </div>
    </div>
  );
}

/* ============================== BUDGET ============================== */

function Budget({ data, setData, totals, confirmAction, readOnly }) {
  const [showMatrix, setShowMatrix] = useState(false);
  const [paymentFor, setPaymentFor] = useState(null);

  const updateParticipant = (id, patch) => setData((d) => ({ ...d, participants: d.participants.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
  const addParticipant = () => setData((d) => ({ ...d, participants: [...d.participants, { id: uid("p"), name: "New Traveler", contribution: 0, avatar: "", paid: 0, payments: [] }] }));
  const removeParticipant = (id, name) => confirmAction({ title: "Remove traveler?", message: (name || "This traveler") + " will be removed.", confirmLabel: "Remove", onConfirm: () => setData((d) => ({ ...d, participants: d.participants.filter((p) => p.id !== id) })) });
  const recordPayment = (participantId, amount, note, date) => {
    setData((d) => ({
      ...d,
      participants: d.participants.map((p) => {
        if (p.id !== participantId) return p;
        const payments = [...(p.payments || []), { id: uid("pay"), amount, note, date }];
        return { ...p, paid: num(Number(p.paid)) + amount, payments };
      }),
    }));
  };
  const updateCategory = (id, patch) => setData((d) => ({ ...d, categories: d.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  const addCategory = () => setData((d) => ({ ...d, categories: [...d.categories, { id: uid("c"), name: "New Category", icon: "other", mode: "fixed", rate: 0, fixed: 0, useFoodRate: false, note: "", paidAmount: 0 }] }));
  const removeCategory = (id, name) => confirmAction({ title: "Remove category?", message: '"' + name + '" and its cost will be removed.', confirmLabel: "Remove", onConfirm: () => setData((d) => ({ ...d, categories: d.categories.filter((c) => c.id !== id) })) });
  const updateFoodItem = (id, patch) => setData((d) => ({ ...d, foodItems: d.foodItems.map((f) => (f.id === id ? { ...f, ...patch } : f)) }));
  const addFoodItem = () => setData((d) => ({ ...d, foodItems: [...d.foodItems, { id: uid("f"), name: "New item", amount: 0 }] }));
  const removeFoodItem = (id) => setData((d) => ({ ...d, foodItems: d.foodItems.filter((f) => f.id !== id) }));

  const linkedCategoryNames = data.categories.filter((c) => c.mode === "per-person" && c.useFoodRate).map((c) => c.name);
  const totalRemainingToPay = data.participants.reduce((s, p) => s + Math.max(0, num(Number(p.contribution)) - num(Number(p.paid))), 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Card className="p-3 sm:p-4"><div className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: BRAND.textDim }}>Collected</div><div className="font-num mt-1 text-lg sm:text-xl font-bold tabular-nums" style={{ color: BRAND.text }}><CountUp value={totals.totalContribution} prefix="৳" /></div></Card>
        <Card className="p-3 sm:p-4"><div className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: BRAND.textDim }}>Received</div><div className="font-num mt-1 text-lg sm:text-xl font-bold tabular-nums" style={{ color: BRAND.success }}><CountUp value={totals.totalPaid} prefix="৳" /></div></Card>
        <Card className="p-3 sm:p-4"><div className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: BRAND.textDim }}>Pending</div><div className="font-num mt-1 text-lg sm:text-xl font-bold tabular-nums" style={{ color: totalRemainingToPay > 0 ? BRAND.danger : BRAND.success }}><CountUp value={totalRemainingToPay} prefix="৳" /></div></Card>
      </div>
      <Card className="p-3 sm:p-4">
        <SectionHeading eyebrow={`${data.participants.length} travelers`} title="Participants" action={!readOnly && <IconBtn icon={Plus} onClick={addParticipant} label="Add traveler" tone="accent" />} />
        {data.participants.length === 0 ? <EmptyState icon={Users} title="No travelers yet" message="Add everyone chipping in." /> : (
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: BRAND.border }}>
            <table className="w-full border-collapse text-[13px]">
              <thead><tr style={{ background: BRAND.bgElevated }}>
                <th className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: BRAND.textDim }}>Name</th>
                <th className="text-right px-2 py-2 text-[10px] font-bold uppercase tracking-[0.1em] w-[90px]" style={{ color: BRAND.textDim }}>Contrib</th>
                <th className="text-right px-2 py-2 text-[10px] font-bold uppercase tracking-[0.1em] w-[90px]" style={{ color: BRAND.textDim }}>Paid</th>
                <th className="text-right px-2 py-2 text-[10px] font-bold uppercase tracking-[0.1em] w-[90px]" style={{ color: BRAND.textDim }}>Remaining</th>
                <th className="text-right px-2 py-2 text-[10px] font-bold uppercase tracking-[0.1em] w-[80px] hidden sm:table-cell" style={{ color: BRAND.textDim }}>Share</th>
                <th className="text-right px-2 py-2 text-[10px] font-bold uppercase tracking-[0.1em] w-[80px] hidden sm:table-cell" style={{ color: BRAND.textDim }}>Balance</th>
                <th className="w-[70px]"></th>
              </tr></thead>
              <tbody>
                {data.participants.map((p) => {
                  const share = personTotalShare(p, totals, data);
                  const balance = num(Number(p.contribution)) - share;
                  const paid = num(Number(p.paid));
                  const remaining = num(Number(p.contribution)) - paid;
                  return (
                    <tr key={p.id} className="border-t" style={{ borderColor: BRAND.border }}>
                      <td className="px-3 py-1.5"><div className="flex items-center gap-2 min-w-0"><Avatar name={p.name} src={p.avatar} size={22} /><div className="min-w-0 flex-1"><TextInput value={p.name} onChange={(v) => updateParticipant(p.id, { name: v })} placeholder="Name" disabled={readOnly} className="!text-[13px] !py-1 !px-1.5" /></div></div></td>
                      <td className="px-2 py-1.5"><NumberInput value={p.contribution} onChange={(v) => updateParticipant(p.id, { contribution: v })} disabled={readOnly} className="!text-[13px] !py-1 !px-1.5 !w-full text-right" /></td>
                      <td className="px-2 py-1.5"><NumberInput value={paid} onChange={(v) => updateParticipant(p.id, { paid: v })} disabled={readOnly} className="!text-[13px] !py-1 !px-1.5 !w-full text-right" /></td>
                      <td className="px-2 py-1.5 text-right"><span className="font-num tabular-nums text-[13px] font-semibold" style={{ color: remaining > 0 ? BRAND.danger : BRAND.success }}>{fmt(remaining)}</span></td>
                      <td className="px-2 py-1.5 text-right hidden sm:table-cell"><span className="font-num tabular-nums text-[13px]" style={{ color: BRAND.textMuted }}>{fmt(share)}</span></td>
                      <td className="px-2 py-1.5 text-right hidden sm:table-cell"><span className="font-num tabular-nums text-[13px] font-semibold" style={{ color: balance < -1 ? BRAND.danger : BRAND.success }}>{Math.abs(balance) < 1 ? "Settled" : fmt(balance)}</span></td>
                      <td className="px-1.5 py-1.5"><div className="flex items-center justify-end gap-0">{!readOnly && <IconBtn icon={Receipt} onClick={() => setPaymentFor(p.id)} label="Record payment" tone="accent" size={14} />}{!readOnly && <IconBtn icon={Trash2} onClick={() => removeParticipant(p.id, p.name)} label="Remove traveler" tone="danger" size={14} />}</div></td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: BRAND.bgElevated }}>
                  <td className="px-3 py-2 text-[10px] font-bold uppercase" style={{ color: BRAND.textDim }}>Total</td>
                  <td className="font-num px-2 py-2 text-right tabular-nums text-[13px] font-bold" style={{ color: BRAND.text }}>{fmt(totals.totalContribution)}</td>
                  <td className="font-num px-2 py-2 text-right tabular-nums text-[13px] font-bold" style={{ color: BRAND.success }}>{fmt(totals.totalPaid)}</td>
                  <td className="font-num px-2 py-2 text-right tabular-nums text-[13px] font-bold" style={{ color: totalRemainingToPay > 0 ? BRAND.danger : BRAND.success }}>{fmt(totalRemainingToPay)}</td>
                  <td className="font-num px-2 py-2 text-right tabular-nums text-[13px] font-bold hidden sm:table-cell" style={{ color: BRAND.textMuted }}>{fmt(totals.totalExpense)}</td>
                  <td className="font-num px-2 py-2 text-right tabular-nums text-[13px] font-bold hidden sm:table-cell" style={{ color: totals.reserve < 0 ? BRAND.danger : BRAND.success }}>{fmt(totals.reserve)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>
      <Card className="p-4">
        <SectionHeading title="How costs are split" />
        {readOnly ? <p className="text-sm" style={{ color: BRAND.textMuted }}>{data.allocationRule === "contribution" ? "By contribution ratio" : "Equal split"}</p> : (
          <><Segmented value={data.allocationRule} onChange={(v) => setData((d) => ({ ...d, allocationRule: v }))} options={[{ value: "contribution", label: "By contribution ratio" }, { value: "equal", label: "Equal split" }]} /><p className="mt-2 text-xs" style={{ color: BRAND.textMuted }}>{data.allocationRule === "contribution" ? "Each traveler's share of every cost equals their share of the total pool." : "Every cost divides evenly across all travelers."}</p></>
        )}
      </Card>
      <Card className="p-4">
        <SectionHeading eyebrow={`${fmt(totals.totalExpense)} planned`} title="Expense categories" action={!readOnly && <IconBtn icon={Plus} onClick={addCategory} label="Add category" tone="accent" />} />
        <div className="space-y-3">
          {totals.catTotals.map((c) => {
            const Icon = CATEGORY_ICONS[c.icon] || Package;
            const catPaid = num(Number(c.paidAmount));
            const catRemaining = c.total - catPaid;
            const catPct = c.total > 0 ? (catPaid / c.total) * 100 : 0;
            return (
              <div key={c.id} className="rounded-xl p-3.5 border" style={{ borderColor: BRAND.border, background: BRAND.bgElevated }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-1 items-center gap-2.5 min-w-0"><div className="rounded-lg p-1.5 shrink-0" style={{ background: BRAND.accent + "18" }}><Icon size={14} color={BRAND.accent} /></div><TextInput value={c.name} onChange={(v) => updateCategory(c.id, { name: v })} className="font-semibold" disabled={readOnly} /></div>
                  {!readOnly && <IconBtn icon={Trash2} onClick={() => removeCategory(c.id, c.name)} label="Remove category" tone="danger" />}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {readOnly ? <span className="text-xs" style={{ color: BRAND.textMuted }}>{c.mode === "fixed" ? "Fixed" : "Per person"}</span> : <Segmented small value={c.mode} onChange={(v) => updateCategory(c.id, { mode: v })} options={[{ value: "fixed", label: "Fixed" }, { value: "per-person", label: "Per person" }]} />}
                  {c.mode === "fixed" ? (
                    <div className="flex items-center gap-1.5 text-sm"><span className="text-xs" style={{ color: BRAND.textDim }}>Total</span><NumberInput value={c.fixed} onChange={(v) => updateCategory(c.id, { fixed: v })} className="w-24" disabled={readOnly} /></div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5 text-sm"><span className="text-xs" style={{ color: BRAND.textDim }}>Rate</span><NumberInput value={c.useFoodRate ? totals.foodRate : c.rate} onChange={(v) => updateCategory(c.id, { rate: v })} disabled={readOnly || c.useFoodRate} className="w-20" /></div>
                      {!readOnly && <button onClick={() => updateCategory(c.id, { useFoodRate: !c.useFoodRate })} className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider" style={c.useFoodRate ? { background: BRAND.warning + "22", color: BRAND.warning } : { background: BRAND.border, color: BRAND.textMuted }}><Link2 size={10} /> Food link</button>}
                      <span className="font-num text-xs tabular-nums" style={{ color: BRAND.textMuted }}>× {totals.headcount} = {fmt(c.total)}</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3 items-end">
                  <div><div className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: BRAND.textDim }}>Total</div><div className="font-num text-sm font-bold mt-0.5 tabular-nums" style={{ color: BRAND.text }}>{fmt(c.total)}</div></div>
                  <div><div className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: BRAND.textDim }}>Paid</div><NumberInput value={catPaid} onChange={(v) => updateCategory(c.id, { paidAmount: v })} className="mt-0.5" disabled={readOnly} /></div>
                  <div><div className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: BRAND.textDim }}>Remaining</div><div className="font-num text-sm font-bold mt-0.5 tabular-nums" style={{ color: catRemaining > 0 ? BRAND.danger : BRAND.success }}>{fmt(catRemaining)}</div></div>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full" style={{ background: BRAND.border }}><div className="h-full rounded-full transition-width" style={{ width: catPct + "%", background: catRemaining > 0 ? `linear-gradient(90deg, ${BRAND.accent}, ${BRAND.accentSoft})` : `linear-gradient(90deg, ${BRAND.success}, ${BRAND.successSoft})` }} /></div>
                {c.note && <p className="mt-2 text-xs" style={{ color: BRAND.textDim }}>{c.note}</p>}
              </div>
            );
          })}
        </div>
      </Card>
      <Card className="p-4">
        <SectionHeading eyebrow={`${fmt(totals.foodRate)} / person`} title="Food breakdown" />
        <p className="mb-3 text-xs" style={{ color: BRAND.textMuted }}>{linkedCategoryNames.length > 0 ? "Powers: " + linkedCategoryNames.join(", ") : 'Not linked to a category yet.'}</p>
        <div className="space-y-2">
          {data.foodItems.map((f) => (
            <div key={f.id} className="flex items-center gap-2">
              <TextInput value={f.name} onChange={(v) => updateFoodItem(f.id, { name: v })} className="flex-1" disabled={readOnly} />
              <NumberInput value={f.amount} onChange={(v) => updateFoodItem(f.id, { amount: v })} className="w-24" disabled={readOnly} />
              {!readOnly && <IconBtn icon={Trash2} onClick={() => removeFoodItem(f.id)} label="Remove item" tone="danger" />}
            </div>
          ))}
        </div>
        {!readOnly && <button onClick={addFoodItem} className="mt-3 flex items-center gap-1.5 text-sm font-semibold" style={{ color: BRAND.accent }}><Plus size={14} /> Add meal item</button>}
      </Card>
      <Card className="p-4">
        <button onClick={() => setShowMatrix((s) => !s)} className="flex w-full items-center justify-between">
          <SectionHeading eyebrow="Audit view" title="Cost-share matrix" />
          {showMatrix ? <ChevronUp size={18} color={BRAND.accent} /> : <ChevronDown size={18} color={BRAND.accent} />}
        </button>
        {showMatrix && (
          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full border-collapse text-xs" style={{ minWidth: 560 }}>
              <thead><tr>{["Name", "Contribution", ...totals.catTotals.map((c) => clampText(c.name, 10)), "Total share"].map((h, i) => (<th key={h + i} className={"pb-2 pr-3 font-bold uppercase tracking-[0.1em] text-[10px] whitespace-nowrap " + (i === 0 ? "text-left" : "text-right")} style={{ color: BRAND.textDim }}>{h}</th>))}</tr></thead>
              <tbody>
                {data.participants.map((p) => (
                  <tr key={p.id} className="font-num border-t tabular-nums" style={{ borderColor: BRAND.border }}>
                    <td className="py-2 pr-3 font-body text-left" style={{ color: BRAND.text }}>{p.name}</td>
                    <td className="py-2 pr-3 text-right" style={{ color: BRAND.text }}>{fmt(p.contribution)}</td>
                    {totals.catTotals.map((c) => <td key={c.id} className="py-2 pr-3 text-right" style={{ color: BRAND.textMuted }}>{fmt(personCategoryShare(p, c, totals, data))}</td>)}
                    <td className="py-2 pr-3 font-semibold text-right" style={{ color: BRAND.text }}>{fmt(personTotalShare(p, totals, data))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <PaymentDialog open={!!paymentFor} person={paymentFor ? data.participants.find((p) => p.id === paymentFor) : null} onClose={() => setPaymentFor(null)} onSave={(amount, note, date) => recordPayment(paymentFor, amount, note, date)} />
    </div>
  );
}

/* ============================== ITINERARY ============================== */

const PERIOD_OPTIONS = ["Early Morning", "Morning", "Midday", "Afternoon", "Evening", "Night"];

function Itinerary({ data, setData, confirmAction, readOnly }) {
  const days = Array.from(new Set(data.itinerary.map((i) => i.day))).sort((a, b) => a - b);
  const maxDay = days.length ? Math.max.apply(null, days) : 0;
  const updateItem = (id, patch) => setData((d) => ({ ...d, itinerary: d.itinerary.map((i) => (i.id === id ? { ...i, ...patch } : i)) }));
  const handleImageUpload = (id, e) => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => updateItem(id, { image: reader.result }); reader.readAsDataURL(file); };
  const addItem = (day) => setData((d) => ({ ...d, itinerary: [...d.itinerary, { id: uid("i"), day, period: "Morning", time: "", title: "New stop", location: "", notes: "", risk: "", image: "" }] }));
  const removeItem = (id, title) => confirmAction({ title: "Remove itinerary item?", message: '"' + (title || "This item") + '" will be removed.', confirmLabel: "Remove", onConfirm: () => setData((d) => ({ ...d, itinerary: d.itinerary.filter((i) => i.id !== id) })) });
  const addDay = () => setData((d) => ({ ...d, itinerary: [...d.itinerary, { id: uid("i"), day: maxDay + 1, period: "Morning", time: "", title: "New stop", location: "", notes: "", risk: "", image: "" }] }));
  const removeDay = (day) => confirmAction({ title: "Remove Day " + day + "?", message: "Every item for this day will be removed too.", confirmLabel: "Remove day", onConfirm: () => setData((d) => ({ ...d, itinerary: d.itinerary.filter((i) => i.day !== day) })) });
  const moveItem = (id, direction) => {
    setData((d) => {
      const list = d.itinerary.slice();
      const idx = list.findIndex((i) => i.id === id);
      const sameDay = [];
      list.forEach((it, i) => { if (it.day === list[idx].day) sameDay.push(i); });
      const pos = sameDay.indexOf(idx);
      const targetPos = direction === "up" ? pos - 1 : pos + 1;
      if (targetPos < 0 || targetPos >= sameDay.length) return d;
      const targetIdx = sameDay[targetPos];
      const tmp = list[idx];
      list[idx] = list[targetIdx];
      list[targetIdx] = tmp;
      return { ...d, itinerary: list };
    });
  };

  return (
    <div className="space-y-8">
      {days.length === 0 ? <EmptyState icon={CalendarDays} title="No plan yet" message="Add your first day and start dropping in stops." /> : (
        days.map((day) => {
          const items = data.itinerary.filter((i) => i.day === day);
          return (
            <div key={day} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="rounded-full px-4 py-1.5 text-sm font-bold text-white shadow-lg whitespace-nowrap" style={{ background: `linear-gradient(135deg, ${BRAND.accent} 0%, ${BRAND.accentSoft} 100%)` }}>Day {day}</div>
                <div className="h-px flex-1" style={{ background: BRAND.border }} />
                <span className="text-[10px] uppercase tracking-[0.15em] font-bold whitespace-nowrap" style={{ color: BRAND.textDim }}>{items.length} {items.length === 1 ? "stop" : "stops"}</span>
                {!readOnly && <IconBtn icon={Trash2} onClick={() => removeDay(day)} label={"Remove day " + day} tone="danger" />}
              </div>
              <div className="space-y-3">
                {items.map((item) => {
                  const PIcon = PERIOD_ICONS[item.period] || Sun;
                  return (
                    <Card key={item.id} className="overflow-hidden">
                      <div className="flex flex-col sm:flex-row">
                        <div className="flex-1 p-4 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            {readOnly ? <span className="font-num rounded-lg px-2.5 py-1 text-xs font-bold tracking-wider text-white tabular-nums" style={{ background: `linear-gradient(135deg, ${BRAND.accent} 0%, ${BRAND.accentSoft} 100%)` }}>{item.time || "—"}</span> : <input type="time" value={item.time} onChange={(e) => updateItem(item.id, { time: e.target.value })} className="field font-num rounded-lg px-2 py-1 text-xs font-bold tabular-nums border" style={{ color: BRAND.accent, background: BRAND.bgElevated, borderColor: BRAND.border }} />}
                            {readOnly ? <span className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap" style={{ background: BRAND.bgElevated, color: BRAND.textMuted, border: `1px solid ${BRAND.border}` }}><PIcon size={11} /> {item.period}</span> : (
                              <div className="flex items-center gap-1">
                                <PIcon size={12} color={BRAND.accent} />
                                <select value={item.period} onChange={(e) => updateItem(item.id, { period: e.target.value })} className="field rounded-lg px-2 py-1 text-xs font-medium border" style={{ color: BRAND.text, background: BRAND.bgElevated, borderColor: BRAND.border }}>{PERIOD_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}</select>
                              </div>
                            )}
                            {!readOnly && (
                              <div className="ml-auto flex items-center gap-0.5">
                                <IconBtn icon={ChevronUp} onClick={() => moveItem(item.id, "up")} label="Move earlier" size={14} />
                                <IconBtn icon={ChevronDown} onClick={() => moveItem(item.id, "down")} label="Move later" size={14} />
                                <label className="rounded-lg p-1.5 cursor-pointer" title="Upload image"><Camera size={14} color={BRAND.accent} /><input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(item.id, e)} /></label>
                                <IconBtn icon={Trash2} onClick={() => removeItem(item.id, item.title)} label="Remove stop" tone="danger" />
                              </div>
                            )}
                          </div>
                          {readOnly ? <h3 className="font-display text-base sm:text-lg font-bold leading-snug break-words" style={{ color: BRAND.text }}>{item.title || "Untitled stop"}</h3> : <TextInput value={item.title} onChange={(v) => updateItem(item.id, { title: v })} placeholder="What's happening" className="font-display font-semibold text-lg" />}
                          <div className="mt-1.5 flex items-start gap-1.5 text-sm">
                            <MapPin size={13} className="mt-0.5 shrink-0" color={BRAND.bamboo} />
                            {readOnly ? <span className="break-words min-w-0 flex-1" style={{ color: BRAND.textMuted }}>{item.location || "—"}</span> : <TextInput value={item.location} onChange={(v) => updateItem(item.id, { location: v })} placeholder="Location" />}
                          </div>
                          {(item.notes || !readOnly) && (
                            <div className="mt-3 pt-3 border-t" style={{ borderColor: BRAND.border }}>
                              <div className="text-[10px] uppercase tracking-[0.15em] font-bold mb-1.5" style={{ color: BRAND.textDim }}>Details</div>
                              {readOnly ? <p className="text-sm whitespace-pre-line break-words leading-relaxed" style={{ color: BRAND.textMuted }}>{item.notes || "—"}</p> : <TextArea value={item.notes} onChange={(v) => updateItem(item.id, { notes: v })} placeholder="Details..." rows={2} />}
                            </div>
                          )}
                          {(item.risk || !readOnly) && (
                            <div className="mt-3 rounded-lg p-2.5 border" style={{ background: item.risk ? BRAND.danger + "10" : BRAND.bgElevated, borderColor: item.risk ? BRAND.danger + "33" : BRAND.border }}>
                              <div className="flex items-start gap-2">
                                <AlertTriangle size={13} className="mt-0.5 shrink-0" color={item.risk ? BRAND.danger : BRAND.textDim} />
                                <div className="flex-1 min-w-0">
                                  <div className="text-[10px] uppercase tracking-[0.15em] font-bold mb-0.5" style={{ color: item.risk ? BRAND.danger : BRAND.textDim }}>Backup plan / risk</div>
                                  {readOnly ? <p className="text-xs break-words leading-relaxed" style={{ color: item.risk ? BRAND.dangerSoft : BRAND.textDim }}>{item.risk || "—"}</p> : <TextArea value={item.risk} onChange={(v) => updateItem(item.id, { risk: v })} placeholder="Backup plan..." rows={1} />}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        {item.image && <div className="sm:w-44 shrink-0 relative" style={{ minHeight: 140, background: BRAND.bgElevated }}><img src={item.image} alt={item.title} className="w-full h-full sm:h-auto sm:absolute sm:inset-0 object-cover" /></div>}
                      </div>
                    </Card>
                  );
                })}
              </div>
              {!readOnly && <button onClick={() => addItem(day)} className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed py-2.5 text-sm font-semibold" style={{ borderColor: BRAND.borderLight, color: BRAND.textMuted }}><Plus size={14} /> Add stop to Day {day}</button>}
            </div>
          );
        })
      )}
      {!readOnly && <button onClick={addDay} className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed py-3 text-sm font-semibold" style={{ borderColor: BRAND.borderLight, color: BRAND.textMuted }}><Plus size={15} /> Add day {maxDay + 1}</button>}
    </div>
  );
}

/* ============================== SPOT DETAIL ============================== */

function SpotDetail({ spot, updateSpot, onBack, readOnly, editMode, setEditMode, openLightbox, confirmAction }) {
  const Icon = SPOT_ICONS[spot.category] || Compass;
  const priColor = PRIORITY_TONE[spot.priority] || BRAND.textMuted;
  const gallery = Array.isArray(spot.gallery) ? spot.gallery : [];
  const heroImage = spot.image || gallery[0] || "";
  const readMin = readTimeOf([spot.description, spot.specialty, spot.originStory, spot.history, spot.tips].filter(Boolean).join(" "));
  const allImages = [heroImage, ...gallery.filter((g) => g !== heroImage)].filter(Boolean);

  const handleCoverUpload = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateSpot(spot.id, { image: reader.result });
    reader.readAsDataURL(file);
  };

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        updateSpot(spot.id, (prev) => ({ gallery: [...(prev.gallery || []), reader.result] }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeGalleryImage = (idx) => {
    confirmAction({
      title: "Remove this photo?",
      message: "It will be permanently removed from the gallery.",
      confirmLabel: "Remove",
      onConfirm: () => {
        const next = [...(spot.gallery || [])];
        next.splice(idx, 1);
        updateSpot(spot.id, { gallery: next });
      },
    });
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center justify-between gap-3">
        <button onClick={onBack} className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold" style={{ background: BRAND.bgElevated, color: BRAND.text, border: `1px solid ${BRAND.border}` }}>
          <ChevronLeft size={14} /> All spots
        </button>
        {!readOnly && (
          <button onClick={() => setEditMode(!editMode)} className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold"
            style={editMode ? { background: `linear-gradient(135deg, ${BRAND.accent} 0%, ${BRAND.accentSoft} 100%)`, color: "#fff" } : { background: BRAND.bgElevated, color: BRAND.textMuted, border: `1px solid ${BRAND.border}` }}>
            {editMode ? <><Check size={13} /> Done editing</> : <><Edit3 size={13} /> Edit article</>}
          </button>
        )}
      </div>

      <div className="relative w-full overflow-hidden rounded-2xl" style={{ minHeight: 340 }}>
        {heroImage ? (
          <>
            <img src={heroImage} alt={spot.name} className="absolute inset-0 w-full h-full object-cover hero-zoom" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(7,9,13,0.15) 0%, rgba(7,9,13,0.55) 45%, rgba(7,9,13,0.95) 100%)" }} />
          </>
        ) : (
          <>
            <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #0A0D20 0%, #1A1435 45%, #7C2D12 85%, #C2410C 100%)` }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(7,9,13,0.05) 0%, rgba(7,9,13,0.35) 45%, rgba(7,9,13,0.95) 100%)" }} />
          </>
        )}
        <div className="relative z-10 flex flex-col justify-end min-h-[340px] p-5 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ background: "rgba(255,255,255,0.12)", color: "#fff", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)" }}>
              <Icon size={11} /> {spot.category}
            </span>
            <span className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ background: priColor + "33", color: "#fff", border: `1px solid ${priColor}66` }}>{spot.priority} priority</span>
            {spot.status === "visited" && (
              <span className="flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ background: BRAND.success + "33", color: "#fff", border: `1px solid ${BRAND.success}66` }}><CheckCircle2 size={10} /> Visited</span>
            )}
          </div>
          {editMode ? (
            <TextInput value={spot.name} onChange={(v) => updateSpot(spot.id, { name: v })} className="font-display font-bold !text-3xl sm:!text-4xl !px-3 !py-2 !bg-white/10 !border-white/20" />
          ) : (
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">{spot.name || "Unnamed spot"}</h1>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-white/75">
            <span className="flex items-center gap-1.5"><MapPin size={12} /> Sajek Valley</span>
            <span className="flex items-center gap-1.5"><Clock size={12} /> {readMin} min read</span>
            <span className="flex items-center gap-1.5"><Sparkles size={12} /> By Sajek Editorial</span>
          </div>
          {!readOnly && (
            <div className="mt-4 flex flex-wrap gap-2">
              <label className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold cursor-pointer" style={{ background: `linear-gradient(135deg, ${BRAND.accent} 0%, ${BRAND.accentSoft} 100%)`, color: "#fff" }}>
                <Camera size={12} /> {heroImage ? "Change cover" : "Add cover image"}
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
              </label>
              {heroImage && (
                <button onClick={() => openLightbox(allImages, 0)} className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold" style={{ background: "rgba(255,255,255,0.14)", color: "#fff", border: "1px solid rgba(255,255,255,0.18)" }}>
                  <ZoomIn size={12} /> View full
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <Reveal>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <FactPill icon={CalendarDays} label="Best time" value={spot.bestTime || "Anytime"} />
          <FactPill icon={Clock} label="Time needed" value={spot.time || "—"} />
          <FactPill icon={Wallet} label="Est. cost" value={spot.cost ? fmt(spot.cost) : "Free"} />
          <FactPill icon={CheckCircle2} label="Status" value={spot.status === "visited" ? "Visited" : "Planned"} />
        </div>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-6">
          <Reveal>
            <ArticleSection icon={FileText} eyebrow="Overview" title="About this place">
              {editMode ? (
                <TextArea value={spot.description || ""} onChange={(v) => updateSpot(spot.id, { description: v })} placeholder="A short overview..." rows={5} />
              ) : (
                <p className="text-[15px] leading-relaxed whitespace-pre-line" style={{ color: BRAND.text }}>{spot.description || "No description added yet."}</p>
              )}
            </ArticleSection>
          </Reveal>
          <Reveal delay={60}>
            <ArticleSection icon={Award} eyebrow="What makes it special" title="Specialty & highlights" accent>
              {editMode ? (
                <TextArea value={spot.specialty || ""} onChange={(v) => updateSpot(spot.id, { specialty: v })} placeholder="What makes this place unique..." rows={4} />
              ) : spot.specialty ? (
                <div className="rounded-xl p-4 border glow-accent" style={{ background: BRAND.cardElevated, borderColor: BRAND.accent + "33" }}>
                  <p className="text-[15px] leading-relaxed whitespace-pre-line" style={{ color: BRAND.text }}>{spot.specialty}</p>
                </div>
              ) : <p className="text-sm" style={{ color: BRAND.textDim }}>No specialty added yet.</p>}
            </ArticleSection>
          </Reveal>
          <Reveal delay={120}>
            <ArticleSection icon={Sparkles} eyebrow="The story" title="Origin story">
              {editMode ? (
                <TextArea value={spot.originStory || ""} onChange={(v) => updateSpot(spot.id, { originStory: v })} placeholder="The origin story..." rows={5} />
              ) : spot.originStory ? (
                <blockquote className="relative pl-6 py-2 my-2" style={{ borderLeft: `3px solid ${BRAND.accent}` }}>
                  <Quote size={28} className="absolute -left-1 -top-2 opacity-20" color={BRAND.accent} />
                  <p className="font-display italic text-lg leading-relaxed whitespace-pre-line" style={{ color: BRAND.text }}>{spot.originStory}</p>
                </blockquote>
              ) : <p className="text-sm" style={{ color: BRAND.textDim }}>No origin story added yet.</p>}
            </ArticleSection>
          </Reveal>
          <Reveal delay={180}>
            <ArticleSection icon={History} eyebrow="Background" title="History">
              {editMode ? (
                <TextArea value={spot.history || ""} onChange={(v) => updateSpot(spot.id, { history: v })} placeholder="Historical background..." rows={4} />
              ) : (
                <p className="text-[15px] leading-relaxed whitespace-pre-line" style={{ color: BRAND.text }}>{spot.history || "No history added yet."}</p>
              )}
            </ArticleSection>
          </Reveal>
        </div>

        <div className="space-y-4">
          <Reveal delay={100}>
            <Card className="p-4" style={{ borderColor: BRAND.warning + "33" }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="rounded-lg p-1.5" style={{ background: BRAND.warning + "18" }}><Lightbulb size={14} color={BRAND.warning} /></div>
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: BRAND.textDim }}>Visiting tips</div>
                  <div className="text-sm font-bold" style={{ color: BRAND.text }}>Good to know</div>
                </div>
              </div>
              {editMode ? (
                <TextArea value={spot.tips || ""} onChange={(v) => updateSpot(spot.id, { tips: v })} placeholder="One tip per line..." rows={5} />
              ) : spot.tips ? (
                <ul className="space-y-2">
                  {spot.tips.split("\n").filter(Boolean).map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13px] leading-relaxed" style={{ color: BRAND.textMuted }}>
                      <span className="mt-1.5 h-1 w-1 rounded-full shrink-0" style={{ background: BRAND.warning }} />
                      <span className="min-w-0">{t}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-xs" style={{ color: BRAND.textDim }}>No tips added yet.</p>}
            </Card>
          </Reveal>

          {!readOnly && editMode && (
            <Reveal delay={140}>
              <Card className="p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3" style={{ color: BRAND.textDim }}>Edit fields</div>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: BRAND.textDim }}>Best time</label>
                    <TextInput value={spot.bestTime || ""} onChange={(v) => updateSpot(spot.id, { bestTime: v })} placeholder="e.g. Sunrise" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: BRAND.textDim }}>Category</label>
                    <select value={spot.category} onChange={(e) => updateSpot(spot.id, { category: e.target.value })} className="field w-full rounded-lg px-2 py-1.5 text-sm border mt-1" style={{ color: BRAND.text, background: BRAND.bgElevated, borderColor: BRAND.border }}>
                      {SPOT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: BRAND.textDim }}>Priority</label>
                    <select value={spot.priority} onChange={(e) => updateSpot(spot.id, { priority: e.target.value })} className="field w-full rounded-lg px-2 py-1.5 text-sm border mt-1" style={{ color: BRAND.text, background: BRAND.bgElevated, borderColor: BRAND.border }}>
                      {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: BRAND.textDim }}>Time needed</label>
                    <TextInput value={spot.time || ""} onChange={(v) => updateSpot(spot.id, { time: v })} placeholder="e.g. ~1-2 hrs" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: BRAND.textDim }}>Est. cost</label>
                    <NumberInput value={spot.cost || 0} onChange={(v) => updateSpot(spot.id, { cost: v })} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: BRAND.textDim }}>Short note (card teaser)</label>
                    <TextArea value={spot.notes || ""} onChange={(v) => updateSpot(spot.id, { notes: v })} rows={2} className="mt-1" />
                  </div>
                  <button onClick={() => updateSpot(spot.id, { status: spot.status === "visited" ? "planned" : "visited" })} className="w-full rounded-xl px-4 py-2 text-xs font-bold" style={{ background: spot.status === "visited" ? BRAND.success + "22" : BRAND.bgElevated, color: spot.status === "visited" ? BRAND.success : BRAND.textMuted, border: `1px solid ${spot.status === "visited" ? BRAND.success + "44" : BRAND.border}` }}>
                    {spot.status === "visited" ? "✓ Marked as Visited" : "Mark as Visited"}
                  </button>
                </div>
              </Card>
            </Reveal>
          )}
        </div>
      </div>

      <Reveal delay={80}>
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: BRAND.textDim }}>Gallery</div>
              <div className="font-display text-lg font-semibold" style={{ color: BRAND.text }}>{gallery.length} {gallery.length === 1 ? "photo" : "photos"}</div>
            </div>
            {!readOnly && editMode && (
              <label className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold cursor-pointer" style={{ background: BRAND.accent + "22", color: BRAND.accent, border: `1px solid ${BRAND.accent}44` }}>
                <Plus size={12} /> Add photos
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />
              </label>
            )}
          </div>
          {gallery.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-8 text-center" style={{ borderColor: BRAND.borderLight }}>
              <ImageIcon size={26} color={BRAND.textDim} className="mx-auto" />
              <p className="mt-2 text-sm" style={{ color: BRAND.textMuted }}>No gallery photos yet.</p>
              {!readOnly && editMode && (
                <label className="mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold cursor-pointer" style={{ background: `linear-gradient(135deg, ${BRAND.accent} 0%, ${BRAND.accentSoft} 100%)`, color: "#fff" }}>
                  <Plus size={12} /> Add your first photo
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />
                </label>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {gallery.map((g, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden aspect-square" style={{ background: BRAND.bgElevated, border: `1px solid ${BRAND.border}` }}>
                  <img src={g} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-105" onClick={() => openLightbox(allImages, i + (heroImage ? 1 : 0))} />
                  {!readOnly && editMode && (
                    <button onClick={(e) => { e.stopPropagation(); removeGalleryImage(i); }} className="absolute top-2 right-2 rounded-full p-1.5 opacity-0 group-hover:opacity-100" style={{ background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.15)" }}>
                      <Trash2 size={12} color={BRAND.danger} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div className="flex items-center justify-center pt-4">
          <button onClick={onBack} className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold" style={{ background: BRAND.bgElevated, color: BRAND.text, border: `1px solid ${BRAND.border}` }}>
            <ChevronLeft size={16} /> Back to all spots
          </button>
        </div>
      </Reveal>
    </div>
  );
}

function FactPill({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl px-3.5 py-3 border" style={{ background: BRAND.card, borderColor: BRAND.border }}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={11} color={BRAND.accent} />
        <span className="text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: BRAND.textDim }}>{label}</span>
      </div>
      <div className="text-sm font-bold truncate" style={{ color: BRAND.text }}>{value}</div>
    </div>
  );
}

function ArticleSection({ icon: Icon, eyebrow, title, accent = false, children }) {
  return (
    <section>
      <div className="flex items-center gap-2.5 mb-3">
        <div className="rounded-lg p-2" style={{ background: accent ? BRAND.accent + "22" : BRAND.bgElevated }}><Icon size={14} color={BRAND.accent} /></div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: BRAND.textDim }}>{eyebrow}</div>
          <h2 className="font-display text-xl font-bold" style={{ color: BRAND.text }}>{title}</h2>
        </div>
      </div>
      <div>{children}</div>
    </section>
  );
}

/* ============================== SPOTS LIST ============================== */

function Spots({ data, setData, confirmAction, readOnly }) {
  const [filter, setFilter] = useState("all");
  const [activeSpotId, setActiveSpotId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [lightboxState, setLightboxState] = useState({ images: [], index: null });

  const updateSpot = (id, patchOrFn) => setData((d) => ({
    ...d,
    spots: d.spots.map((s) => {
      if (s.id !== id) return s;
      const patch = typeof patchOrFn === "function" ? patchOrFn(s) : patchOrFn;
      return { ...s, ...patch };
    }),
  }));

  const removeSpot = (id, name) => confirmAction({
    title: "Remove spot?",
    message: '"' + (name || "This spot") + '" will be removed from your plan.',
    confirmLabel: "Remove",
    onConfirm: () => setData((d) => ({ ...d, spots: d.spots.filter((s) => s.id !== id) })),
  });

  const addSpot = () => setData((d) => ({ ...d, spots: [...d.spots, makeEmptySpot()] }));

  const openLightbox = (images, index) => setLightboxState({ images, index });
  const closeLightbox = () => setLightboxState({ images: [], index: null });
  const prevLightbox = () => setLightboxState((s) => ({ ...s, index: (s.index - 1 + s.images.length) % s.images.length }));
  const nextLightbox = () => setLightboxState((s) => ({ ...s, index: (s.index + 1) % s.images.length }));

  const activeSpot = activeSpotId ? data.spots.find((s) => s.id === activeSpotId) : null;

  if (activeSpot) {
    return (
      <>
        <SpotDetail
          spot={activeSpot}
          data={data}
          updateSpot={updateSpot}
          onBack={() => { setActiveSpotId(null); setEditMode(false); }}
          readOnly={readOnly}
          editMode={editMode}
          setEditMode={setEditMode}
          openLightbox={openLightbox}
          confirmAction={confirmAction}
        />
        <Lightbox images={lightboxState.images} index={lightboxState.index} onClose={closeLightbox} onPrev={prevLightbox} onNext={nextLightbox} />
      </>
    );
  }

  const visible = data.spots.filter((s) => filter === "all" || s.status === filter);
  const priorityColors = { High: BRAND.danger, Medium: BRAND.warning, Low: BRAND.info };

  const handleCardClick = (e, spotId) => {
    if (e.target.closest("button, input, select, textarea, label, a")) return;
    setActiveSpotId(spotId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Segmented small value={filter} onChange={setFilter} options={[{ value: "all", label: "All" }, { value: "planned", label: "Planned" }, { value: "visited", label: "Visited" }]} />
        {!readOnly && <IconBtn icon={Plus} onClick={addSpot} label="Add spot" tone="accent" />}
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={Compass} title="Nothing here yet" message="Add viewpoints, food stops, or resorts to build your Sajek shortlist." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {visible.map((s) => {
            const Icon = SPOT_ICONS[s.category] || Compass;
            const visited = s.status === "visited";
            const priColor = priorityColors[s.priority] || BRAND.textMuted;
            return (
              <Card key={s.id} className="overflow-hidden flex flex-col cursor-pointer transition-transform hover:scale-[1.01]" hover onClick={(e) => handleCardClick(e, s.id)}>
                <div className="relative w-full h-44 shrink-0" style={{ background: BRAND.bgElevated }}>
                  {s.image ? <img src={s.image} alt={s.name} className="w-full h-full object-cover" /> : (
                    <div className="w-full h-full flex flex-col items-center justify-center" style={{ color: BRAND.textDim }}>
                      <ImageIcon size={32} />
                      {!readOnly && <span className="mt-1 text-[10px] uppercase tracking-[0.15em] font-bold">No image yet</span>}
                    </div>
                  )}
                  <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, transparent 60%, rgba(7,9,13,0.65) 100%)" }} />
                  {!readOnly && (
                    <label className="absolute top-2 right-2 rounded-full p-2 cursor-pointer z-10" style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)" }} onClick={(e) => e.stopPropagation()}>
                      <Camera size={13} color={BRAND.accent} />
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => updateSpot(s.id, { image: reader.result }); reader.readAsDataURL(file); }} />
                    </label>
                  )}
                  {visited && (
                    <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white z-10" style={{ background: "rgba(34,197,94,0.9)" }}><CheckCircle2 size={10} /> Visited</span>
                  )}
                  <div className="absolute bottom-2 right-2 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/90" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }}>Read article →</div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-start gap-2">
                    <div className="rounded-lg p-1.5 shrink-0" style={{ background: BRAND.accent + "18" }}><Icon size={13} color={BRAND.accent} /></div>
                    {readOnly ? <h3 className="font-display font-bold text-base leading-snug break-words min-w-0 flex-1" style={{ color: BRAND.text }}>{s.name || "Unnamed spot"}</h3> : (
                      <div className="min-w-0 flex-1" onClick={(e) => e.stopPropagation()}>
                        <TextInput value={s.name} onChange={(v) => updateSpot(s.id, { name: v })} className="font-semibold text-base" />
                      </div>
                    )}
                    {!readOnly && <div onClick={(e) => e.stopPropagation()}><IconBtn icon={Trash2} onClick={() => removeSpot(s.id, s.name)} label="Remove spot" tone="danger" /></div>}
                  </div>
                  {s.notes && <p className="mt-2 text-xs leading-relaxed line-clamp-2" style={{ color: BRAND.textMuted }}>{s.notes}</p>}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {readOnly ? (
                      <>
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ background: BRAND.bgElevated, color: BRAND.textMuted, border: `1px solid ${BRAND.border}` }}>{s.category}</span>
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ background: priColor + "22", color: priColor }}>{s.priority}</span>
                      </>
                    ) : (
                      <>
                        <select value={s.category} onChange={(e) => updateSpot(s.id, { category: e.target.value })} className="field rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border" style={{ color: BRAND.textMuted, background: BRAND.bgElevated, borderColor: BRAND.border }}>
                          {SPOT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select value={s.priority} onChange={(e) => updateSpot(s.id, { priority: e.target.value })} className="field rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border-0" style={{ background: priColor + "22", color: priColor }}>
                          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <button onClick={() => updateSpot(s.id, { status: visited ? "planned" : "visited" })} className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={visited ? { background: BRAND.success, color: "#fff" } : { background: BRAND.bgElevated, color: BRAND.textMuted, border: `1px solid ${BRAND.border}` }}>
                          {visited ? <CheckCircle2 size={10} /> : <Star size={10} />} {visited ? "Visited" : "Planned"}
                        </button>
                      </>
                    )}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 min-w-0 border" style={{ background: BRAND.bgElevated, borderColor: BRAND.border }}>
                      <Clock size={12} className="shrink-0" color={BRAND.bamboo} />
                      {readOnly ? <span className="truncate" style={{ color: BRAND.textMuted }}>{s.time || "—"}</span> : <TextInput value={s.time} onChange={(v) => updateSpot(s.id, { time: v })} placeholder="Time needed" />}
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 min-w-0 border" style={{ background: BRAND.bgElevated, borderColor: BRAND.border }}>
                      <span className="font-num text-xs shrink-0 tabular-nums" style={{ color: BRAND.textDim }}>৳</span>
                      {readOnly ? <span className="truncate" style={{ color: BRAND.textMuted }}>{s.cost ? fmt(s.cost) : "Free"}</span> : <NumberInput value={s.cost} onChange={(v) => updateSpot(s.id, { cost: v })} placeholder="Est. cost" />}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============================== DATA TAB ============================== */

function DataTab({ data, setData, confirmAction, readOnly }) {
  const [rows, setRows] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const resetImport = () => { setRows(null); setHeaders([]); setMapping({}); setFileName(""); setError(""); };

  const handleFile = async (file) => {
    if (!file) return; setBusy(true); setError("");
    try {
      const ext = file.name.split(".").pop().toLowerCase();
      let parsedRows = [];
      if (ext === "csv") { const text = await file.text(); const res = Papa.parse(text, { header: true, skipEmptyLines: true }); parsedRows = res.data; }
      else if (ext === "xlsx" || ext === "xls") { const buf = await file.arrayBuffer(); const wb = XLSX.read(buf, { type: "array" }); const ws = wb.Sheets[wb.SheetNames[0]]; parsedRows = XLSX.utils.sheet_to_json(ws, { defval: "" }); }
      else if (ext === "json") { const text = await file.text(); const parsed = JSON.parse(text); if (Array.isArray(parsed)) parsedRows = parsed; else if (parsed && parsed.participants) { setData((d) => ({ ...d, ...parsed })); setBusy(false); setFileName(file.name); return; } }
      else { setError("Unsupported file type."); setBusy(false); return; }
      if (!parsedRows.length) { setError("Couldn't find any rows."); setBusy(false); return; }
      const hdrs = Object.keys(parsedRows[0]);
      const guessed = {}; hdrs.forEach((h) => { guessed[h] = guessField(h); });
      setHeaders(hdrs); setMapping(guessed); setRows(parsedRows); setFileName(file.name);
    } catch (e) { setError("Couldn't read that file."); }
    setBusy(false);
  };

  const onDrop = (e) => { e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files && e.dataTransfer.files[0]; handleFile(file); };
  const nameCol = Object.keys(mapping).find((h) => mapping[h] === "name");
  const contribCol = Object.keys(mapping).find((h) => mapping[h] === "contribution");

  const runImport = (mode) => {
    if (!rows || !nameCol) return;
    const incoming = rows.map((r) => ({ name: String(r[nameCol] || "").trim(), contribution: contribCol ? parseFloat(r[contribCol]) || 0 : 0 })).filter((r) => r.name);
    const doImport = () => {
      setData((d) => {
        if (mode === "replace") return { ...d, participants: incoming.map((r) => ({ id: uid("p"), name: r.name, contribution: r.contribution, avatar: "", paid: 0, payments: [] })) };
        const existing = d.participants.map((p) => ({ ...p }));
        incoming.forEach((r) => {
          const match = existing.find((p) => p.name.trim().toLowerCase() === r.name.toLowerCase());
          if (match) match.contribution = r.contribution;
          else existing.push({ id: uid("p"), name: r.name, contribution: r.contribution, avatar: "", paid: 0, payments: [] });
        });
        return { ...d, participants: existing };
      });
      resetImport();
    };
    if (mode === "replace") confirmAction({ title: "Replace participant list?", message: "This overwrites every current traveler.", confirmLabel: "Replace", onConfirm: doImport });
    else doImport();
  };

  const exportExcel = () => {
    const t = computeTotals(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ Metric: "Total Collected", Value: t.totalContribution }, { Metric: "Total Received", Value: t.totalPaid }, { Metric: "Total Planned Expense", Value: t.totalExpense }, { Metric: "Total Expense Paid", Value: t.totalExpensePaid }, { Metric: "Emergency Reserve", Value: t.reserve }]), "Summary");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.participants.map((p) => ({ Name: p.name, Contribution: p.contribution, Paid: num(Number(p.paid)) }))), "Participants");
    XLSX.writeFile(wb, "sajek-valley-trip.xlsx");
  };

  const downloadBlob = (content, filename, type) => {
    const blob = new Blob([content], { type: type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportJson = () => downloadBlob(JSON.stringify(data, null, 2), "sajek-trip-backup.json", "application/json");

  const MAPPING_FIELDS = [
    { value: "ignore", label: "Ignore" },
    { value: "name", label: "Traveler name" },
    { value: "contribution", label: "Contribution" },
  ];

  return (
    <div className="space-y-5">
      {!readOnly && (
        <Card className="p-4">
          <SectionHeading eyebrow="Bring in data" title="Import" />
          <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={onDrop} onClick={() => fileRef.current && fileRef.current.click()} className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center" style={{ borderColor: dragOver ? BRAND.accent : BRAND.borderLight, background: dragOver ? BRAND.accent + "10" : "transparent" }}>
            {busy ? <Loader2 size={22} className="animate-spin" color={BRAND.accent} /> : <Upload size={22} color={BRAND.accent} />}
            <p className="mt-2 text-sm font-semibold" style={{ color: BRAND.text }}>Drop a file or tap to browse</p>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.json" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
          </div>
          {error && <p className="mt-2 text-xs" style={{ color: BRAND.danger }}>{error}</p>}
          {rows && (
            <div className="mt-4 space-y-3">
              <div className="text-xs" style={{ color: BRAND.textMuted }}>{fileName} · {rows.length} rows</div>
              <div className="flex flex-wrap gap-2">
                <button disabled={!nameCol} onClick={() => runImport("merge")} className="rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-40" style={{ background: `linear-gradient(135deg, ${BRAND.accent} 0%, ${BRAND.accentSoft} 100%)` }}>Merge</button>
                <button disabled={!nameCol} onClick={() => runImport("replace")} className="rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-40" style={{ color: BRAND.danger, border: "1px solid " + BRAND.danger + "44" }}>Replace</button>
                <button onClick={resetImport} className="rounded-xl px-4 py-2 text-sm font-semibold" style={{ color: BRAND.textMuted, border: `1px solid ${BRAND.border}` }}>Cancel</button>
              </div>
            </div>
          )}
        </Card>
      )}
      <Card className="p-4">
        <SectionHeading eyebrow="Take it with you" title="Export" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button onClick={exportExcel} className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white" style={{ background: `linear-gradient(135deg, ${BRAND.success} 0%, #16A34A 100%)` }}><FileSpreadsheet size={15} /> Excel (.xlsx)</button>
          <button onClick={exportJson} className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white" style={{ background: `linear-gradient(135deg, ${BRAND.dusk} 0%, #7C3AED 100%)` }}><FileJson size={15} /> JSON backup</button>
        </div>
      </Card>
    </div>
  );
}

/* ============================== APP ROOT ============================== */

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "budget", label: "Budget", icon: Wallet },
  { id: "itinerary", label: "Itinerary", icon: CalendarDays },
  { id: "spots", label: "Spots", icon: Compass },
  { id: "data", label: "Data", icon: FileSpreadsheet },
];

export default function App() {
  const { adminPw, setAdminPw, memberCreds, setMemberCreds, adminMembers, setAdminMembers, credentialsStatus } = useSystemCredentials();
  const [role, setRole] = useState(() => { try { return localStorage.getItem("trip_role"); } catch { return null; } });
  const [loggedInMemberId, setLoggedInMemberId] = useState(() => { try { return localStorage.getItem("trip_member_id") || null; } catch { return null; } });
  const [loginError, setLoginError] = useState("");

  const isAdmin = role === "admin" || (role === "member" && adminMembers.includes(loggedInMemberId));
  const readOnly = !isAdmin;

  const [data, setDataRaw, tripStatus] = useTripData(!readOnly);
  const setData = readOnly ? () => {} : setDataRaw;
  const [tab, setTab] = useState("dashboard");
  const [confirmState, setConfirmState] = useState({ open: false });

  const totals = computeTotals(data);
  const askConfirm = (cfg) => setConfirmState(Object.assign({ open: true }, cfg));
  const closeConfirm = () => setConfirmState({ open: false });
  const resetAll = () => askConfirm({ title: "Reset for everyone?", message: "This replaces the shared trip data with the original defaults.", confirmLabel: "Reset", onConfirm: () => setData(DEFAULT_DATA) });

  if (tripStatus === "loading" || credentialsStatus === "loading") return <LoadingScreen />;

  if (!role) {
    return (
      <div className="font-body flex min-h-screen items-center justify-center p-4" style={{ background: BRAND.bg }}>
        <style>{GLOBAL_CSS}</style>
        <div className="w-full max-w-sm rounded-2xl p-6 sm:p-8 border" style={{ background: BRAND.card, borderColor: BRAND.border, boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 60px ${BRAND.accent}10` }}>
          <div className="flex flex-col items-center">
            <div className="rounded-2xl p-3 mb-3" style={{ background: `linear-gradient(135deg, ${BRAND.accent} 0%, ${BRAND.accentSoft} 100%)`, boxShadow: `0 8px 24px ${BRAND.accent}44` }}><Mountain size={26} color="#fff" /></div>
            <h1 className="font-display text-2xl font-bold text-center" style={{ color: BRAND.text }}>{data.meta?.title || "Sajek Valley"}</h1>
            <p className="text-xs mt-1" style={{ color: BRAND.textMuted }}>Log in to continue</p>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            const form = e.target;
            const username = form.username.value.trim();
            const password = form.password.value.trim();
            if (username === "admin" && password === adminPw) {
              setRole("admin"); setLoggedInMemberId(null);
              try { localStorage.setItem("trip_role", "admin"); localStorage.removeItem("trip_member_id"); } catch {}
              setLoginError(""); return;
            }
            for (const [id, cred] of Object.entries(memberCreds)) {
              if (cred.username === username && cred.password === password) {
                setRole("member"); setLoggedInMemberId(id);
                try { localStorage.setItem("trip_role", "member"); localStorage.setItem("trip_member_id", id); } catch {}
                setLoginError(""); return;
              }
            }
            setLoginError("Wrong username or password.");
          }} className="mt-6 space-y-3">
            <input name="username" type="text" placeholder="Username" required className="field w-full rounded-xl px-4 py-2.5 text-sm border" style={{ background: BRAND.bgElevated, color: BRAND.text, borderColor: BRAND.border }} />
            <input name="password" type="password" placeholder="Password" required className="field w-full rounded-xl px-4 py-2.5 text-sm border" style={{ background: BRAND.bgElevated, color: BRAND.text, borderColor: BRAND.border }} />
            {loginError && <p className="text-xs" style={{ color: BRAND.danger }}>{loginError}</p>}
            <button type="submit" className="w-full rounded-xl px-4 py-2.5 text-sm font-bold text-white" style={{ background: `linear-gradient(135deg, ${BRAND.accent} 0%, ${BRAND.accentSoft} 100%)` }}>Log in</button>
          </form>
          <p className="mt-4 text-center text-xs" style={{ color: BRAND.textDim }}>Shared credentials — ask your trip organiser.</p>
        </div>
      </div>
    );
  }

  let tabsForRole = [];
  if (isAdmin) tabsForRole = [...TABS, { id: "settings", label: "Admin", icon: Settings }];
  else tabsForRole = [{ id: "profile", label: "Profile", icon: UserCircle }, ...TABS];

  return (
    <div className="font-body min-h-screen" style={{ background: BRAND.bg, color: BRAND.text }}>
      <style>{GLOBAL_CSS}</style>

      <div className="sticky top-0 z-30 border-b" style={{ background: BRAND.bg + "F2", borderColor: BRAND.border, backdropFilter: "blur(12px)" }}>
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="rounded-lg p-1.5 shrink-0" style={{ background: `linear-gradient(135deg, ${BRAND.accent} 0%, ${BRAND.accentSoft} 100%)` }}><Mountain size={14} color="#fff" /></div>
            <span className="font-display text-sm sm:text-base font-bold truncate" style={{ color: BRAND.text }}>{data.meta.title || "Sajek Valley"}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: BRAND.textDim }}>
              {tripStatus === "saving" && <Loader2 size={11} className="animate-spin" />}
              {tripStatus === "saved" && <div className="h-1.5 w-1.5 rounded-full" style={{ background: BRAND.success, boxShadow: `0 0 6px ${BRAND.success}` }} />}
              {tripStatus === "saving" ? "Syncing" : tripStatus === "saved" ? "Synced" : tripStatus === "error" ? "Offline" : "Connecting"}
            </span>
            <div className="flex items-center gap-1">
              {!readOnly && <IconBtn icon={RotateCcw} onClick={resetAll} label="Reset shared trip" />}
              <button onClick={() => { setRole(null); setLoggedInMemberId(null); try { localStorage.removeItem("trip_role"); localStorage.removeItem("trip_member_id"); } catch {} }} className="rounded-lg px-3 py-1.5 text-xs font-semibold" style={{ color: BRAND.textMuted, background: BRAND.bgElevated, border: `1px solid ${BRAND.border}` }}>Log out</button>
            </div>
          </div>
        </div>
        <div className="no-scrollbar tab-scroll mx-auto flex max-w-3xl gap-1 overflow-x-auto px-4 pb-2.5">
          {tabsForRole.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className="flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-bold transition-all"
                style={active ? { background: `linear-gradient(135deg, ${BRAND.accent} 0%, ${BRAND.accentSoft} 100%)`, color: "#fff", boxShadow: `0 4px 14px ${BRAND.accent}44` } : { color: BRAND.textMuted, background: BRAND.bgElevated, border: `1px solid ${BRAND.border}` }}>
                <Icon size={13} /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {tripStatus === "error" && (
        <div className="mx-auto max-w-3xl px-4 pt-3">
          <div className="flex items-start gap-2 rounded-xl p-3 text-sm border" style={{ background: BRAND.danger + "10", borderColor: BRAND.danger + "33", color: BRAND.dangerSoft }}>
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>Can't reach the shared trip database right now.</span>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-3xl px-4 py-5">
        {tab === "dashboard" && <Dashboard data={data} setData={setData} totals={totals} goTo={setTab} readOnly={readOnly} />}
        {tab === "budget" && <Budget data={data} setData={setData} totals={totals} confirmAction={askConfirm} readOnly={readOnly} />}
        {tab === "itinerary" && <Itinerary data={data} setData={setData} confirmAction={askConfirm} readOnly={readOnly} />}
        {tab === "spots" && <Spots data={data} setData={setData} confirmAction={askConfirm} readOnly={readOnly} />}
        {tab === "data" && <DataTab data={data} setData={setData} confirmAction={askConfirm} readOnly={readOnly} />}
        {tab === "settings" && isAdmin && <AdminSettings adminPw={adminPw} setAdminPw={setAdminPw} memberCreds={memberCreds} setMemberCreds={setMemberCreds} adminMembers={adminMembers} setAdminMembers={setAdminMembers} participants={data.participants} confirmAction={askConfirm} />}
        {tab === "profile" && !isAdmin && role === "member" && <MemberProfile memberId={loggedInMemberId} data={data} totals={totals} />}
      </main>

      <footer className="mx-auto max-w-3xl px-4 pb-8 pt-2 text-center text-xs" style={{ color: BRAND.textDim }}>
        Shared live with everyone on this link · {data.meta.duration}
      </footer>

      <ConfirmDialog state={confirmState} onClose={closeConfirm} />
    </div>
  );
}
