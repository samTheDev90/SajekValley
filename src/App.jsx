import React, { useState, useEffect, useRef } from "react";
import {
  Mountain, Cloud, Sun, Moon, Sunrise, Sunset, Bus, Car, UtensilsCrossed,
  BedDouble, Package, Users, Wallet, PiggyBank, TrendingUp, TrendingDown,
  Plus, Trash2, Pencil, Upload, Download, FileSpreadsheet, MapPin, Clock,
  AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, X, Info, Star,
  LayoutDashboard, CalendarDays, Compass, Loader2, FileJson, Home, Leaf,
  RotateCcw, ArrowRight, Link2, Check,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RTooltip,
} from "recharts";
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
  pine: "#1C3B2E",
  mist: "#EAF1EC",
  cloud: "#8FB8D9",
  ember: "#C1531F",
  dusk: "#362A4D",
  bamboo: "#B98A2E",
};

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
:root{
  --pine:${BRAND.pine}; --mist:${BRAND.mist}; --cloud-sea:${BRAND.cloud};
  --ember:${BRAND.ember}; --dusk:${BRAND.dusk}; --bamboo:${BRAND.bamboo};
}
*{box-sizing:border-box;}
.font-display{font-family:'Fraunces',ui-serif,Georgia,serif;}
.font-body{font-family:'Manrope',ui-sans-serif,system-ui,sans-serif;}
.font-num{font-family:'IBM Plex Mono',ui-monospace,SFMono-Regular,monospace;}
input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
input[type=number]{-moz-appearance:textfield;}
.field{transition:box-shadow .15s ease, background-color .15s ease;}
.field:focus{outline:none; box-shadow:0 0 0 2px ${BRAND.cloud}; background-color:#fff;}
button:focus-visible, a:focus-visible, [tabindex]:focus-visible{outline:2px solid ${BRAND.cloud}; outline-offset:2px;}
::selection{background:${BRAND.ember}; color:#fff;}
@keyframes drift{0%{transform:translateX(0)}50%{transform:translateX(-3%)}100%{transform:translateX(0)}}
.mist-drift{animation:drift 48s ease-in-out infinite;}
@keyframes riseIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.rise-in{animation:riseIn .35s ease-out both;}
@media (prefers-reduced-motion: reduce){
  .mist-drift{animation:none;}
  .rise-in{animation:none;}
}
.no-scrollbar::-webkit-scrollbar{display:none;}
.no-scrollbar{-ms-overflow-style:none; scrollbar-width:none;}
.tab-scroll{scroll-snap-type:x proximity;}
`;

const PIE_COLORS = [BRAND.pine, BRAND.ember, BRAND.cloud, BRAND.bamboo, BRAND.dusk, "#5B8266", "#9C6B3E"];

const CATEGORY_ICONS = { bus: Bus, car: Car, food: UtensilsCrossed, hotel: BedDouble, other: Package };
const PERIOD_ICONS = {
  Night: Moon, "Early Morning": Sunrise, Morning: Sunrise, Midday: Sun,
  Afternoon: Sun, Evening: Sunset,
};
const SPOT_ICONS = { Viewpoint: Mountain, Village: Home, Nature: Leaf, Landmark: MapPin, Food: UtensilsCrossed };
const PRIORITY_TONE = { High: BRAND.ember, Medium: BRAND.bamboo, Low: BRAND.cloud };

/* ============================== UTIL ============================== */

let uidCounter = 0;
function uid(prefix) {
  uidCounter += 1;
  return prefix + "_" + Date.now().toString(36) + uidCounter;
}

function fmt(n) {
  const v = Number(n) || 0;
  const sign = v < 0 ? "-" : "";
  return sign + "৳" + Math.abs(Math.round(v)).toLocaleString("en-US");
}

function num(n) {
  return Number.isFinite(n) ? n : 0;
}

function clampText(s, max) {
  const str = String(s || "");
  return str.length > max ? str.slice(0, max) + "…" : str;
}

/* ============================== DEFAULT DATA ==============================
   Seeded directly from Sajek_Valley_Budget_Breakdown_Sep-2026.xlsx:
   - 10 travelers, ৳6,000 contribution each (total ৳60,000)
   - Bus ৳1,600/person, CG (Chander Gari) fixed ৳12,000, Food ৳1,400/person
     (Nasta ৳200 + Lunch ৳600 + Dinner ৳600), Others fixed ৳2,000, Hotel fixed ৳12,000
   - Emergency reserve = Total Collected − Total Planned Expense
   Itinerary and spots are seeded with real, verified Sajek Valley details
   (Konglak Hill, Ruilui Para, the Helipad, the army-escorted convoy system)
   so the app opens already useful — every field is fully editable.
============================================================================ */

const DEFAULT_DATA = {
  meta: {
    title: "Sajek Valley",
    tagline: "মেঘের রাজ্য — Land of Clouds",
    dateRange: "September 2026",
    duration: "2 Days · 1 Night",
    notes: "",
  },
  participants: [
    { id: "p1", name: "Sadid", contribution: 6000 },
    { id: "p2", name: "Farhan", contribution: 6000 },
    { id: "p3", name: "Talha", contribution: 6000 },
    { id: "p4", name: "Rifat", contribution: 6000 },
    { id: "p5", name: "Shoaib", contribution: 6000 },
    { id: "p6", name: "Riz", contribution: 6000 },
    { id: "p7", name: "Shifat", contribution: 6000 },
    { id: "p8", name: "Redwan", contribution: 6000 },
    { id: "p9", name: "Other1", contribution: 6000 },
    { id: "p10", name: "Other2", contribution: 6000 },
  ],
  categories: [
    { id: "c1", name: "Bus", icon: "bus", mode: "per-person", rate: 1600, fixed: 0, useFoodRate: false, note: "Dhaka ↔ Khagrachari / Dighinala coach, per seat" },
    { id: "c2", name: "Chander Gari (CG)", icon: "car", mode: "fixed", rate: 0, fixed: 12000, useFoodRate: false, note: "Shared jeep, fixed group rate — doesn't change with headcount" },
    { id: "c3", name: "Food", icon: "food", mode: "per-person", rate: 0, fixed: 0, useFoodRate: true, note: "Per person, per the breakdown below" },
    { id: "c4", name: "Others", icon: "other", mode: "fixed", rate: 0, fixed: 2000, useFoodRate: false, note: "Misc / buffer spend" },
    { id: "c5", name: "Hotel", icon: "hotel", mode: "fixed", rate: 0, fixed: 12000, useFoodRate: false, note: "Resort / cottage booking, fixed group rate" },
  ],
  foodItems: [
    { id: "f1", name: "Nasta (Breakfast / Snacks)", amount: 200 },
    { id: "f2", name: "Lunch", amount: 600 },
    { id: "f3", name: "Dinner", amount: 600 },
  ],
  allocationRule: "contribution",
  itinerary: [
    { id: "i1", day: 1, period: "Night", time: "22:00", title: "Depart Dhaka", location: "Gabtali / Kalabagan counter → Khagrachari or Dighinala", notes: "Overnight coach — book seats ahead, Sajek-bound buses fill up on weekends.", risk: "" },
    { id: "i2", day: 1, period: "Early Morning", time: "06:30", title: "Arrive Khagrachari / Dighinala", location: "Dighinala Bus Stand", notes: "Freshen up and grab breakfast near the counter before the jeep stand.", risk: "" },
    { id: "i3", day: 1, period: "Morning", time: "09:00", title: "Board Chander Gari, register at checkpoint", location: "Dighinala → Baghaihat Army Camp", notes: "Register the group at Baghaihat for security clearance before entering Sajek.", risk: "Only two army-escorted convoys run per day, roughly mid-morning and mid-afternoon. Miss the morning one and you wait hours — confirm the exact time locally the day before." },
    { id: "i4", day: 1, period: "Morning", time: "11:00", title: "Convoy into Sajek", location: "Baghaihat → Ruilui Para", notes: "Winding hill road, roughly 1.5–3 hrs depending on start point.", risk: "" },
    { id: "i5", day: 1, period: "Afternoon", time: "13:30", title: "Check in & lunch", location: "Resort, Ruilui Para", notes: "Drop bags, freshen up, then lunch at a local restaurant.", risk: "" },
    { id: "i6", day: 1, period: "Afternoon", time: "15:30", title: "Explore Ruilui Para & Stone Garden", location: "Ruilui Para", notes: "Wander the main village, browse handmade tribal crafts.", risk: "" },
    { id: "i7", day: 1, period: "Evening", time: "17:30", title: "Sunset at the Helipad", location: "Sajek Helipad", notes: "The easiest, most popular sunset spot — open ground, no trekking.", risk: "" },
    { id: "i8", day: 1, period: "Night", time: "20:30", title: "Dinner — try bamboo chicken", location: "Local restaurant, Ruilui Para", notes: "Pre-order if you want bamboo chicken, it needs prep time.", risk: "" },
    { id: "i9", day: 2, period: "Early Morning", time: "05:15", title: "Sunrise over the cloud sea", location: "Helipad or Konglak Hill", notes: "The whole reason to come — head up in the dark to catch the clouds turning gold.", risk: "Weather-dependent — heavy rain can hide the cloud sea entirely. Keep the morning loose." },
    { id: "i10", day: 2, period: "Morning", time: "07:00", title: "Trek to Konglak Para", location: "Ruilui Para → Konglak Hill (~35–45 min walk)", notes: "Sajek's highest point — Lusai village, orange groves, views into India.", risk: "" },
    { id: "i11", day: 2, period: "Morning", time: "09:00", title: "Breakfast", location: "Local restaurant, Ruilui Para", notes: "", risk: "" },
    { id: "i12", day: 2, period: "Midday", time: "11:30", title: "Check out, catch return convoy", location: "Ruilui Para → Baghaihat", notes: "Pack up in time for the midday escorted convoy back.", risk: "Same convoy-timing risk as the way in — don't plan a tight bus connection in Dhaka." },
    { id: "i13", day: 2, period: "Afternoon", time: "15:00", title: "Return to Khagrachari / Dighinala", location: "Baghaihat → Dighinala", notes: "Early dinner before the overnight bus.", risk: "" },
    { id: "i14", day: 2, period: "Night", time: "21:30", title: "Overnight bus back to Dhaka", location: "Dighinala / Khagrachari → Dhaka", notes: "", risk: "" },
  ],
  spots: [
    { id: "s1", name: "Konglak Hill (Konglak Para)", category: "Viewpoint", priority: "High", time: "~1.5–2 hrs round trip", cost: 0, status: "planned", notes: "Sajek's highest point (~1,800 ft). Best sunrise in the valley; gets crowded at golden hour." },
    { id: "s2", name: "Sajek Helipad", category: "Viewpoint", priority: "High", time: "~45 min", cost: 0, status: "planned", notes: "Flat open ground — the easiest sunset/sunrise spot, no trekking needed." },
    { id: "s3", name: "Ruilui Para", category: "Village", priority: "Medium", time: "~1–2 hrs", cost: 0, status: "planned", notes: "Main village — most resorts, restaurants, and handmade tribal crafts." },
    { id: "s4", name: "Stone Garden", category: "Landmark", priority: "Medium", time: "~30–45 min", cost: 0, status: "planned", notes: "Landscaped rock garden a short walk from Ruilui Para." },
    { id: "s5", name: "Kamalak Fountain (Padam Toisha Jharna)", category: "Nature", priority: "Low", time: "~3–4 hrs round trip", cost: 0, status: "planned", notes: "A longer trek to a waterfall — only if the group wants extra hiking." },
    { id: "s6", name: "Bamboo chicken dinner", category: "Food", priority: "High", time: "~1 hr", cost: 600, status: "planned", notes: "Indigenous specialty — order ahead, it takes time to prepare." },
  ],
};

/* ============================== CALCULATIONS ============================== */

function foodPerPersonRate(data) {
  return data.foodItems.reduce((s, i) => s + num(Number(i.amount)), 0);
}

function categoryTotal(cat, headcount, data) {
  if (cat.mode === "fixed") return num(Number(cat.fixed));
  const rate = cat.useFoodRate ? foodPerPersonRate(data) : num(Number(cat.rate));
  return rate * headcount;
}

function computeTotals(data) {
  const headcount = data.participants.length;
  const totalContribution = data.participants.reduce((s, p) => s + num(Number(p.contribution)), 0);
  const catTotals = data.categories.map((c) => ({ ...c, total: categoryTotal(c, headcount, data) }));
  const totalExpense = catTotals.reduce((s, c) => s + c.total, 0);
  const reserve = totalContribution - totalExpense;
  const perPersonAvg = headcount > 0 ? totalExpense / headcount : 0;
  const foodRate = foodPerPersonRate(data);
  return { headcount, totalContribution, catTotals, totalExpense, reserve, perPersonAvg, foodRate };
}

function personCategoryShare(person, cat, totals, data) {
  if (data.allocationRule === "equal") {
    return totals.headcount > 0 ? cat.total / totals.headcount : 0;
  }
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
  bus: ["bus"],
  cg: ["cg", "chandergari", "chandergarhi", "jeep", "transport"],
  food: ["food", "meal", "meals"],
  others: ["others", "other", "misc"],
  hotel: ["hotel", "resort", "room", "stay"],
};
function normalizeHeader(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}
function guessField(header) {
  const h = normalizeHeader(header);
  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    if (aliases.some((a) => h.includes(normalizeHeader(a)))) return field;
  }
  return "ignore";
}

/* ============================== SHARED SYNC (Firebase) ==============================
   Everyone who opens the deployed link reads and writes the SAME record, so an edit
   from any one traveler shows up for the rest within about half a second. See
   src/firebaseConfig.js for the one-time setup this depends on.
======================================================================================= */

const TRIP_PATH = "sajekTrip"; // one shared record for the whole group

function useTripData() {
  const [data, setDataLocal] = useState(DEFAULT_DATA);
  const [status, setStatus] = useState("loading"); // loading | saving | saved | error
  const loadedRef = useRef(false);
  const authedRef = useRef(false);
  const saveTimer = useRef(null);

  useEffect(() => {
    let unsubDb = null;
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) return;
      authedRef.current = true;
      const tripRef = ref(db, TRIP_PATH);
      unsubDb = onValue(
        tripRef,
        (snapshot) => {
          const val = snapshot.val();
          if (val) {
            setDataLocal(val);
          } else if (!loadedRef.current) {
            // Nothing saved yet anywhere — this is the first person to open the
            // freshly-deployed link, so seed the shared record from the defaults.
            dbSet(tripRef, DEFAULT_DATA);
          }
          loadedRef.current = true;
          setStatus("saved");
        },
        () => setStatus("error")
      );
    });
    signInAnonymously(auth).catch(() => setStatus("error"));
    return () => {
      unsubAuth();
      if (unsubDb) unsubDb();
    };
  }, []);

  const setData = (updater) => {
    setDataLocal((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (authedRef.current) {
        setStatus("saving");
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
          dbSet(ref(db, TRIP_PATH), next)
            .then(() => setStatus("saved"))
            .catch(() => setStatus("error"));
        }, 500);
      }
      return next;
    });
  };

  return [data, setData, status];
}

/* ============================== SHARED UI ============================== */

function CountUp({ value, prefix = "" }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  useEffect(() => {
    const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setDisplay(value); prevRef.current = value; return; }
    const start = prevRef.current;
    const end = value;
    const startTime = performance.now();
    const duration = 500;
    let raf;
    function tick(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(start + (end - start) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else prevRef.current = end;
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span>{prefix}{Math.round(display).toLocaleString("en-US")}</span>;
}

function Ridgeline({ height = 150, glow = true }) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl" style={{ height, background: `linear-gradient(180deg, ${BRAND.dusk} 0%, ${BRAND.pine} 100%)` }}>
      <svg viewBox="0 0 400 130" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <path d="M0,80 Q50,40 100,65 T200,55 T300,72 T400,50 L400,130 L0,130 Z" fill="#EAF1EC" opacity="0.14" />
        <path d="M0,96 Q60,58 120,80 T240,76 T400,88 L400,130 L0,130 Z" fill="#EAF1EC" opacity="0.20" />
        <path d="M0,112 Q80,86 160,102 T320,96 T400,108 L400,130 L0,130 Z" fill="#EAF1EC" opacity="0.30" />
      </svg>
      {glow && (
        <div
          className="mist-drift absolute inset-x-0 top-1/3 h-1/3"
          style={{ background: "radial-gradient(ellipse at center, rgba(234,241,236,0.5), transparent 70%)" }}
        />
      )}
    </div>
  );
}

function Card({ children, className = "", style = {} }) {
  return (
    <div className={"rise-in rounded-2xl border border-stone-100 bg-white shadow-sm " + className} style={style}>
      {children}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, tone = "pine", isCurrency = true }) {
  const color = BRAND[tone] || BRAND.pine;
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">{label}</span>
        {Icon && <Icon size={16} color={color} />}
      </div>
      <div className="font-num mt-1 text-2xl font-semibold" style={{ color }}>
        {typeof value === "number" ? <CountUp value={value} prefix={isCurrency ? "৳" : ""} /> : value}
      </div>
      {sub && <div className="mt-1 text-xs text-stone-500">{sub}</div>}
    </Card>
  );
}

function Segmented({ options, value, onChange, small = false }) {
  return (
    <div className="inline-flex gap-1 rounded-xl p-1" style={{ background: "#E3E9E4" }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={"rounded-lg font-medium transition-colors " + (small ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm") + (value === opt.value ? " text-white" : " text-stone-600 hover:text-stone-800")}
          style={value === opt.value ? { background: BRAND.pine } : {}}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function IconBtn({ icon: Icon, onClick, label, tone = "stone", size = 16 }) {
  const toneMap = { stone: "#78716c", ember: BRAND.ember, pine: BRAND.pine };
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="rounded-lg p-1.5 hover:bg-stone-100"
    >
      <Icon size={size} color={toneMap[tone] || toneMap.stone} />
    </button>
  );
}

function TextInput({ value, onChange, placeholder = "", className = "" }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={"field w-full rounded-lg bg-transparent px-2 py-1.5 text-sm " + className}
    />
  );
}

function NumberInput({ value, onChange, placeholder = "", className = "", disabled = false }) {
  return (
    <input
      type="number"
      inputMode="decimal"
      value={Number.isFinite(value) ? value : 0}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))}
      placeholder={placeholder}
      className={"field font-num w-full rounded-lg bg-transparent px-2 py-1.5 text-sm " + (disabled ? "text-stone-400" : "") + " " + className}
    />
  );
}

function TextArea({ value, onChange, placeholder = "", rows = 2 }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="field w-full rounded-lg bg-transparent px-2 py-1.5 text-sm"
    />
  );
}

function Tooltip({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        aria-label="More info"
        className="rounded-full text-stone-400 hover:text-stone-600"
      >
        <Info size={13} />
      </button>
      {open && (
        <span className="absolute bottom-full left-1/2 z-20 mb-2 w-52 -translate-x-1/2 rounded-lg p-2 text-xs text-white shadow-lg" style={{ background: BRAND.pine }}>
          {text}
        </span>
      )}
    </span>
  );
}

function EmptyState({ icon: Icon, title, message }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-stone-300 px-6 py-10 text-center">
      <Icon size={26} color={BRAND.cloud} />
      <p className="font-display mt-3 text-base font-semibold" style={{ color: BRAND.pine }}>{title}</p>
      <p className="mt-1 max-w-xs text-sm text-stone-500">{message}</p>
    </div>
  );
}

function SectionHeading({ eyebrow, title, action }) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <div>
        {eyebrow && <div className="text-xs font-semibold uppercase tracking-wide text-stone-400">{eyebrow}</div>}
        <h2 className="font-display text-xl font-semibold" style={{ color: BRAND.pine }}>{title}</h2>
      </div>
      {action}
    </div>
  );
}

function ConfirmDialog({ state, onClose }) {
  if (!state || !state.open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(28,59,46,0.45)" }}
      onClick={onClose}
    >
      <div className="rise-in w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full p-2" style={{ background: "#FBEAE0" }}>
            <AlertTriangle size={18} color={BRAND.ember} />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-lg font-semibold" style={{ color: BRAND.pine }}>{state.title}</h3>
            <p className="mt-1 text-sm text-stone-600">{state.message}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100">
            Cancel
          </button>
          <button
            onClick={() => { state.onConfirm(); onClose(); }}
            className="rounded-xl px-4 py-2 text-sm font-medium text-white"
            style={{ background: BRAND.ember }}
          >
            {state.confirmLabel || "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================== DASHBOARD ============================== */

function Dashboard({ data, setData, totals, goTo }) {
  const updateMeta = (patch) => setData((d) => ({ ...d, meta: { ...d.meta, ...patch } }));
  const pieData = totals.catTotals.filter((c) => c.total > 0);
  const nextItem = data.itinerary[0];
  const spentPct = totals.totalContribution > 0 ? Math.min(100, (totals.totalExpense / totals.totalContribution) * 100) : 0;

  return (
    <div className="space-y-5">
      <div className="relative">
        <Ridgeline height={172} />
        <div className="absolute inset-0 flex flex-col justify-end p-5">
          <input
            value={data.meta.title}
            onChange={(e) => updateMeta({ title: e.target.value })}
            className="font-display field w-full max-w-xs bg-transparent text-3xl font-semibold text-white placeholder-white/50"
            placeholder="Trip name"
          />
          <input
            value={data.meta.tagline}
            onChange={(e) => updateMeta({ tagline: e.target.value })}
            className="field mt-1 w-full max-w-xs bg-transparent text-sm text-white/80 placeholder-white/50"
            placeholder="Tagline"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs text-white">
              <Users size={12} className="mr-1 inline" /> {totals.headcount} travelers
            </span>
            <input
              value={data.meta.dateRange}
              onChange={(e) => updateMeta({ dateRange: e.target.value })}
              className="field rounded-full bg-white/15 px-3 py-1 text-xs text-white placeholder-white/60"
              style={{ width: 130 }}
            />
            <input
              value={data.meta.duration}
              onChange={(e) => updateMeta({ duration: e.target.value })}
              className="field rounded-full bg-white/15 px-3 py-1 text-xs text-white placeholder-white/60"
              style={{ width: 130 }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={PiggyBank} label="Collected" value={totals.totalContribution} tone="pine" />
        <StatCard icon={Wallet} label="Planned Spend" value={totals.totalExpense} tone="dusk" />
        <StatCard
          icon={totals.reserve >= 0 ? TrendingUp : TrendingDown}
          label={totals.reserve >= 0 ? "Emergency Reserve" : "Deficit"}
          value={totals.reserve}
          tone={totals.reserve >= 0 ? "bamboo" : "ember"}
        />
        <StatCard icon={Users} label="Per Person (avg)" value={totals.perPersonAvg} tone="cloud" />
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between text-xs text-stone-500">
          <span>Collected</span>
          <span>Planned spend vs. pool</span>
        </div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-stone-100">
          <div
            className="h-full rounded-full"
            style={{ width: spentPct + "%", background: totals.reserve >= 0 ? BRAND.pine : BRAND.ember }}
          />
        </div>
        <div className="mt-2 flex items-center gap-1 text-xs text-stone-500">
          <Info size={12} />
          <span>
            {totals.reserve >= 0
              ? fmt(totals.reserve) + " left over as your emergency reserve."
              : "Expenses exceed contributions by " + fmt(Math.abs(totals.reserve)) + " — top up or trim a category."}
          </span>
        </div>
      </Card>

      <Card className="p-4">
        <SectionHeading eyebrow="Where the money goes" title="Expense mix" />
        {pieData.length === 0 ? (
          <EmptyState icon={Wallet} title="No expenses yet" message="Add a category in Budget to see the breakdown." />
        ) : (
          <div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="total" nameKey="name" innerRadius={52} outerRadius={82} paddingAngle={2}>
                    {pieData.map((entry, idx) => (
                      <Cell key={entry.id} fill={PIE_COLORS[idx % PIE_COLORS.length]} stroke="#fff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <RTooltip formatter={(v) => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
              {pieData.map((c, idx) => (
                <div key={c.id} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 truncate text-stone-600">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                    {clampText(c.name, 16)}
                  </span>
                  <span className="font-num shrink-0 text-stone-700">{fmt(c.total)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card className="p-4">
        <SectionHeading
          eyebrow={totals.headcount + " travelers"}
          title="Who's in"
          action={
            <button onClick={() => goTo("budget")} className="flex items-center gap-1 text-xs font-medium" style={{ color: BRAND.cloud }}>
              Manage <ArrowRight size={12} />
            </button>
          }
        />
        <div className="flex flex-wrap gap-2">
          {data.participants.slice(0, 8).map((p) => (
            <span key={p.id} className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600">
              {p.name || "Unnamed"}
            </span>
          ))}
          {data.participants.length > 8 && (
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-500">+{data.participants.length - 8} more</span>
          )}
          {data.participants.length === 0 && <span className="text-sm text-stone-400">No travelers yet.</span>}
        </div>
      </Card>

      <Card className="p-4">
        <SectionHeading
          eyebrow="Next up"
          title={nextItem ? nextItem.title : "No plan yet"}
          action={
            <button onClick={() => goTo("itinerary")} className="flex items-center gap-1 text-xs font-medium" style={{ color: BRAND.cloud }}>
              Full itinerary <ArrowRight size={12} />
            </button>
          }
        />
        {nextItem ? (
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <Clock size={14} color={BRAND.bamboo} />
            <span>Day {nextItem.day} · {nextItem.period}{nextItem.time ? " · " + nextItem.time : ""}</span>
          </div>
        ) : (
          <p className="text-sm text-stone-500">Add your first stop in the Itinerary tab.</p>
        )}
      </Card>

      <Card className="p-4">
        <SectionHeading eyebrow="Keep track" title="Trip notes" />
        <TextArea
          value={data.meta.notes}
          onChange={(v) => updateMeta({ notes: v })}
          placeholder="Anything the group should remember — who's bringing what, contact numbers, packing list…"
          rows={4}
        />
      </Card>
    </div>
  );
}

/* ============================== BUDGET ============================== */

function Budget({ data, setData, totals, confirmAction }) {
  const [showMatrix, setShowMatrix] = useState(false);

  const updateParticipant = (id, patch) =>
    setData((d) => ({ ...d, participants: d.participants.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
  const addParticipant = () =>
    setData((d) => ({ ...d, participants: [...d.participants, { id: uid("p"), name: "New Traveler", contribution: 0 }] }));
  const removeParticipant = (id, name) =>
    confirmAction({
      title: "Remove traveler?",
      message: (name || "This traveler") + " will be removed and every total will recalculate.",
      confirmLabel: "Remove",
      onConfirm: () => setData((d) => ({ ...d, participants: d.participants.filter((p) => p.id !== id) })),
    });

  const updateCategory = (id, patch) =>
    setData((d) => ({ ...d, categories: d.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  const addCategory = () =>
    setData((d) => ({
      ...d,
      categories: [...d.categories, { id: uid("c"), name: "New Category", icon: "other", mode: "fixed", rate: 0, fixed: 0, useFoodRate: false, note: "" }],
    }));
  const removeCategory = (id, name) =>
    confirmAction({
      title: "Remove category?",
      message: '"' + name + '" and its cost will be removed from every traveler\'s share.',
      confirmLabel: "Remove",
      onConfirm: () => setData((d) => ({ ...d, categories: d.categories.filter((c) => c.id !== id) })),
    });

  const updateFoodItem = (id, patch) =>
    setData((d) => ({ ...d, foodItems: d.foodItems.map((f) => (f.id === id ? { ...f, ...patch } : f)) }));
  const addFoodItem = () =>
    setData((d) => ({ ...d, foodItems: [...d.foodItems, { id: uid("f"), name: "New item", amount: 0 }] }));
  const removeFoodItem = (id) =>
    setData((d) => ({ ...d, foodItems: d.foodItems.filter((f) => f.id !== id) }));

  const linkedCategoryNames = data.categories.filter((c) => c.mode === "per-person" && c.useFoodRate).map((c) => c.name);

  return (
    <div className="space-y-5">
      <Card className="p-4">
        <SectionHeading
          eyebrow={fmt(totals.totalContribution) + " collected"}
          title="Participants"
          action={<IconBtn icon={Plus} onClick={addParticipant} label="Add traveler" tone="pine" />}
        />
        {data.participants.length === 0 ? (
          <EmptyState icon={Users} title="No travelers yet" message="Add everyone chipping in — contributions and shares update automatically." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm" style={{ minWidth: 420 }}>
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-stone-400">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Contribution</th>
                  <th className="pb-2 font-medium">Share</th>
                  <th className="pb-2 font-medium">Balance</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {data.participants.map((p) => {
                  const share = personTotalShare(p, totals, data);
                  const balance = num(Number(p.contribution)) - share;
                  return (
                    <tr key={p.id} className="border-t border-stone-100">
                      <td className="py-1 pr-2">
                        <TextInput value={p.name} onChange={(v) => updateParticipant(p.id, { name: v })} placeholder="Name" />
                      </td>
                      <td className="py-1 pr-2">
                        <NumberInput value={p.contribution} onChange={(v) => updateParticipant(p.id, { contribution: v })} />
                      </td>
                      <td className="font-num py-1 pr-2 text-stone-600">{fmt(share)}</td>
                      <td className="font-num py-1 pr-2" style={{ color: balance < -1 ? BRAND.ember : BRAND.pine }}>
                        {Math.abs(balance) < 1 ? "Settled" : fmt(balance)}
                      </td>
                      <td className="py-1 text-right">
                        <IconBtn icon={Trash2} onClick={() => removeParticipant(p.id, p.name)} label="Remove traveler" tone="ember" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-stone-200 font-medium">
                  <td className="pt-2">Total</td>
                  <td className="font-num pt-2">{fmt(totals.totalContribution)}</td>
                  <td className="font-num pt-2">{fmt(totals.totalExpense)}</td>
                  <td className="font-num pt-2" style={{ color: totals.reserve < 0 ? BRAND.ember : BRAND.pine }}>{fmt(totals.reserve)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>

      <Card className="p-4">
        <SectionHeading title="How costs are split" />
        <Segmented
          value={data.allocationRule}
          onChange={(v) => setData((d) => ({ ...d, allocationRule: v }))}
          options={[
            { value: "contribution", label: "By contribution ratio" },
            { value: "equal", label: "Equal split" },
          ]}
        />
        <p className="mt-2 text-xs text-stone-500">
          {data.allocationRule === "contribution"
            ? "Matches your original sheet: each traveler's share of every cost equals their share of the total pool."
            : "Every cost divides evenly across all travelers, regardless of who contributed what — useful once contributions differ."}
        </p>
      </Card>

      <Card className="p-4">
        <SectionHeading
          eyebrow={fmt(totals.totalExpense) + " planned"}
          title="Expense categories"
          action={<IconBtn icon={Plus} onClick={addCategory} label="Add category" tone="pine" />}
        />
        <div className="space-y-3">
          {totals.catTotals.map((c) => {
            const Icon = CATEGORY_ICONS[c.icon] || Package;
            return (
              <div key={c.id} className="rounded-xl border border-stone-100 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-1 items-center gap-2">
                    <Icon size={16} color={BRAND.pine} />
                    <TextInput value={c.name} onChange={(v) => updateCategory(c.id, { name: v })} className="font-medium" />
                  </div>
                  <IconBtn icon={Trash2} onClick={() => removeCategory(c.id, c.name)} label="Remove category" tone="ember" />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Segmented
                    small
                    value={c.mode}
                    onChange={(v) => updateCategory(c.id, { mode: v })}
                    options={[{ value: "fixed", label: "Fixed" }, { value: "per-person", label: "Per person" }]}
                  />
                  {c.mode === "fixed" ? (
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-stone-400">Total</span>
                      <NumberInput value={c.fixed} onChange={(v) => updateCategory(c.id, { fixed: v })} className="w-24" />
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-stone-400">Rate/person</span>
                        <NumberInput
                          value={c.useFoodRate ? totals.foodRate : c.rate}
                          onChange={(v) => updateCategory(c.id, { rate: v })}
                          disabled={c.useFoodRate}
                          className="w-20"
                        />
                      </div>
                      <button
                        onClick={() => updateCategory(c.id, { useFoodRate: !c.useFoodRate })}
                        className={"flex items-center gap-1 rounded-full px-2 py-1 text-xs " + (c.useFoodRate ? "text-white" : "text-stone-500 hover:bg-stone-100")}
                        style={c.useFoodRate ? { background: BRAND.bamboo } : {}}
                      >
                        <Link2 size={11} /> Food breakdown
                      </button>
                      <span className="font-num text-sm text-stone-500">&times; {totals.headcount} = {fmt(c.total)}</span>
                    </div>
                  )}
                </div>
                {c.note && <p className="mt-1.5 text-xs text-stone-400">{c.note}</p>}
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-4">
        <SectionHeading eyebrow={fmt(totals.foodRate) + " / person"} title="Food breakdown" />
        <p className="mb-2 text-xs text-stone-500">
          {linkedCategoryNames.length > 0
            ? "Powers: " + linkedCategoryNames.join(", ")
            : 'Not linked to a category yet — toggle "Food breakdown" on a per-person category above to use this total.'}
        </p>
        <div className="space-y-2">
          {data.foodItems.map((f) => (
            <div key={f.id} className="flex items-center gap-2">
              <TextInput value={f.name} onChange={(v) => updateFoodItem(f.id, { name: v })} className="flex-1" />
              <NumberInput value={f.amount} onChange={(v) => updateFoodItem(f.id, { amount: v })} className="w-24" />
              <IconBtn icon={Trash2} onClick={() => removeFoodItem(f.id)} label="Remove item" tone="ember" />
            </div>
          ))}
        </div>
        <button onClick={addFoodItem} className="mt-2 flex items-center gap-1 text-sm font-medium" style={{ color: BRAND.pine }}>
          <Plus size={14} /> Add meal item
        </button>
      </Card>

      <Card className="p-4">
        <button onClick={() => setShowMatrix((s) => !s)} className="flex w-full items-center justify-between">
          <SectionHeading eyebrow="Audit view" title="Cost-share matrix" />
          {showMatrix ? <ChevronUp size={18} color={BRAND.pine} /> : <ChevronDown size={18} color={BRAND.pine} />}
        </button>
        {showMatrix && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs" style={{ minWidth: 560 }}>
              <thead>
                <tr className="text-left uppercase tracking-wide text-stone-400">
                  <th className="pb-2 pr-3 font-medium">Name</th>
                  <th className="pb-2 pr-3 font-medium">Contribution</th>
                  {totals.catTotals.map((c) => (
                    <th key={c.id} className="pb-2 pr-3 font-medium">{clampText(c.name, 10)}</th>
                  ))}
                  <th className="pb-2 pr-3 font-medium">Total share</th>
                </tr>
              </thead>
              <tbody>
                {data.participants.map((p) => (
                  <tr key={p.id} className="font-num border-t border-stone-100">
                    <td className="py-1.5 pr-3 font-sans">{p.name}</td>
                    <td className="py-1.5 pr-3">{fmt(p.contribution)}</td>
                    {totals.catTotals.map((c) => (
                      <td key={c.id} className="py-1.5 pr-3 text-stone-600">{fmt(personCategoryShare(p, c, totals, data))}</td>
                    ))}
                    <td className="py-1.5 pr-3 font-semibold">{fmt(personTotalShare(p, totals, data))}</td>
                  </tr>
                ))}
                <tr className="font-num border-t-2 border-stone-200 font-semibold">
                  <td className="py-1.5 pr-3 font-sans">Total</td>
                  <td className="py-1.5 pr-3">{fmt(totals.totalContribution)}</td>
                  {totals.catTotals.map((c) => (
                    <td key={c.id} className="py-1.5 pr-3">{fmt(c.total)}</td>
                  ))}
                  <td className="py-1.5 pr-3">{fmt(totals.totalExpense)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ============================== ITINERARY ============================== */

const PERIOD_OPTIONS = ["Early Morning", "Morning", "Midday", "Afternoon", "Evening", "Night"];

function Itinerary({ data, setData, confirmAction }) {
  const days = Array.from(new Set(data.itinerary.map((i) => i.day))).sort((a, b) => a - b);
  const maxDay = days.length ? Math.max.apply(null, days) : 0;

  const updateItem = (id, patch) =>
    setData((d) => ({ ...d, itinerary: d.itinerary.map((i) => (i.id === id ? { ...i, ...patch } : i)) }));
  const addItem = (day) =>
    setData((d) => ({
      ...d,
      itinerary: [...d.itinerary, { id: uid("i"), day: day, period: "Morning", time: "", title: "New stop", location: "", notes: "", risk: "" }],
    }));
  const removeItem = (id, title) =>
    confirmAction({
      title: "Remove itinerary item?",
      message: '"' + (title || "This item") + '" will be removed from the plan.',
      confirmLabel: "Remove",
      onConfirm: () => setData((d) => ({ ...d, itinerary: d.itinerary.filter((i) => i.id !== id) })),
    });
  const addDay = () =>
    setData((d) => ({
      ...d,
      itinerary: [...d.itinerary, { id: uid("i"), day: maxDay + 1, period: "Morning", time: "", title: "New stop", location: "", notes: "", risk: "" }],
    }));
  const removeDay = (day) =>
    confirmAction({
      title: "Remove Day " + day + "?",
      message: "Every item planned for this day will be removed too.",
      confirmLabel: "Remove day",
      onConfirm: () => setData((d) => ({ ...d, itinerary: d.itinerary.filter((i) => i.day !== day) })),
    });

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
    <div className="space-y-5">
      {days.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No plan yet" message="Add your first day and start dropping in stops." />
      ) : (
        days.map((day) => {
          const items = data.itinerary.filter((i) => i.day === day);
          return (
            <Card key={day} className="p-4">
              <SectionHeading
                eyebrow={items.length + " stops"}
                title={"Day " + day}
                action={<IconBtn icon={Trash2} onClick={() => removeDay(day)} label={"Remove day " + day} tone="ember" />}
              />
              <div className="space-y-3">
                {items.map((item) => {
                  const PIcon = PERIOD_ICONS[item.period] || Sun;
                  return (
                    <div key={item.id} className="rounded-xl border border-stone-100 p-3">
                      <div className="flex items-start gap-2">
                        <div className="mt-1 flex flex-col items-center gap-1">
                          <IconBtn icon={ChevronUp} onClick={() => moveItem(item.id, "up")} label="Move earlier" size={13} />
                          <PIcon size={16} color={BRAND.bamboo} />
                          <IconBtn icon={ChevronDown} onClick={() => moveItem(item.id, "down")} label="Move later" size={13} />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <select
                              value={item.period}
                              onChange={(e) => updateItem(item.id, { period: e.target.value })}
                              className="field rounded-lg px-2 py-1 text-xs"
                            >
                              {PERIOD_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <input
                              type="time"
                              value={item.time}
                              onChange={(e) => updateItem(item.id, { time: e.target.value })}
                              className="field rounded-lg px-2 py-1 text-xs"
                            />
                            <div className="ml-auto">
                              <IconBtn icon={Trash2} onClick={() => removeItem(item.id, item.title)} label="Remove stop" tone="ember" />
                            </div>
                          </div>
                          <TextInput value={item.title} onChange={(v) => updateItem(item.id, { title: v })} placeholder="What's happening" className="font-medium" />
                          <div className="flex items-center gap-1.5">
                            <MapPin size={13} color="#a8a29e" />
                            <TextInput value={item.location} onChange={(v) => updateItem(item.id, { location: v })} placeholder="Location" />
                          </div>
                          <TextArea value={item.notes} onChange={(v) => updateItem(item.id, { notes: v })} placeholder="Notes" rows={1} />
                          <div className="flex items-start gap-1.5">
                            <AlertTriangle size={13} color={item.risk ? BRAND.ember : "#a8a29e"} className="mt-1.5 shrink-0" />
                            <TextArea value={item.risk} onChange={(v) => updateItem(item.id, { risk: v })} placeholder="Backup plan / risk (optional)" rows={1} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button onClick={() => addItem(day)} className="mt-3 flex items-center gap-1 text-sm font-medium" style={{ color: BRAND.pine }}>
                <Plus size={14} /> Add stop
              </button>
            </Card>
          );
        })
      )}
      <button
        onClick={addDay}
        className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-stone-300 py-3 text-sm font-medium text-stone-500 hover:border-stone-400 hover:text-stone-700"
      >
        <Plus size={15} /> Add day {maxDay + 1}
      </button>
    </div>
  );
}

/* ============================== SPOTS ============================== */

const SPOT_CATEGORIES = ["Viewpoint", "Village", "Nature", "Landmark", "Food"];
const PRIORITIES = ["High", "Medium", "Low"];

function Spots({ data, setData, confirmAction }) {
  const [filter, setFilter] = useState("all");

  const updateSpot = (id, patch) => setData((d) => ({ ...d, spots: d.spots.map((s) => (s.id === id ? { ...s, ...patch } : s)) }));
  const addSpot = () =>
    setData((d) => ({
      ...d,
      spots: [...d.spots, { id: uid("s"), name: "New spot", category: "Viewpoint", priority: "Medium", time: "", cost: 0, status: "planned", notes: "" }],
    }));
  const removeSpot = (id, name) =>
    confirmAction({
      title: "Remove spot?",
      message: '"' + (name || "This spot") + '" will be removed from your plan.',
      confirmLabel: "Remove",
      onConfirm: () => setData((d) => ({ ...d, spots: d.spots.filter((s) => s.id !== id) })),
    });

  const visible = data.spots.filter((s) => filter === "all" || s.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Segmented
          small
          value={filter}
          onChange={setFilter}
          options={[{ value: "all", label: "All" }, { value: "planned", label: "Planned" }, { value: "visited", label: "Visited" }]}
        />
        <IconBtn icon={Plus} onClick={addSpot} label="Add spot" tone="pine" />
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={Compass} title="Nothing here yet" message="Add viewpoints, food stops, or resorts to build your Sajek shortlist." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {visible.map((s) => {
            const Icon = SPOT_ICONS[s.category] || Compass;
            const visited = s.status === "visited";
            return (
              <Card key={s.id} className="p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-1 items-center gap-2">
                    <div className="rounded-lg p-1.5" style={{ background: "#EAF1EC" }}>
                      <Icon size={15} color={BRAND.pine} />
                    </div>
                    <TextInput value={s.name} onChange={(v) => updateSpot(s.id, { name: v })} className="font-medium" />
                  </div>
                  <IconBtn icon={Trash2} onClick={() => removeSpot(s.id, s.name)} label="Remove spot" tone="ember" />
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <select value={s.category} onChange={(e) => updateSpot(s.id, { category: e.target.value })} className="field rounded-lg px-2 py-1 text-xs">
                    {SPOT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select
                    value={s.priority}
                    onChange={(e) => updateSpot(s.id, { priority: e.target.value })}
                    className="field rounded-full px-2 py-1 text-xs font-medium"
                    style={{ background: PRIORITY_TONE[s.priority] + "22", color: PRIORITY_TONE[s.priority] }}
                  >
                    {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <button
                    onClick={() => updateSpot(s.id, { status: visited ? "planned" : "visited" })}
                    className={"flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium " + (visited ? "text-white" : "text-stone-500")}
                    style={visited ? { background: BRAND.pine } : { background: "#F0F0EE" }}
                  >
                    {visited ? <CheckCircle2 size={12} /> : <Star size={12} />} {visited ? "Visited" : "Planned"}
                  </button>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1">
                    <Clock size={12} color="#a8a29e" />
                    <TextInput value={s.time} onChange={(v) => updateSpot(s.id, { time: v })} placeholder="Time needed" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-num text-xs text-stone-400">৳</span>
                    <NumberInput value={s.cost} onChange={(v) => updateSpot(s.id, { cost: v })} placeholder="Est. cost" />
                  </div>
                </div>
                <TextArea value={s.notes} onChange={(v) => updateSpot(s.id, { notes: v })} placeholder="Notes" rows={2} />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============================== DATA: IMPORT / EXPORT ============================== */

function DataTab({ data, setData, confirmAction }) {
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
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const ext = file.name.split(".").pop().toLowerCase();
      let parsedRows = [];
      if (ext === "csv") {
        const text = await file.text();
        const res = Papa.parse(text, { header: true, skipEmptyLines: true });
        parsedRows = res.data;
      } else if (ext === "xlsx" || ext === "xls") {
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        parsedRows = XLSX.utils.sheet_to_json(ws, { defval: "" });
      } else if (ext === "json") {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          parsedRows = parsed;
        } else if (parsed && parsed.participants) {
          setData((d) => ({ ...d, ...parsed }));
          setBusy(false);
          setFileName(file.name);
          return;
        }
      } else {
        setError("Unsupported file type. Use CSV, XLSX, or JSON.");
        setBusy(false);
        return;
      }
      if (!parsedRows.length) {
        setError("Couldn't find any rows in that file.");
        setBusy(false);
        return;
      }
      const hdrs = Object.keys(parsedRows[0]);
      const guessed = {};
      hdrs.forEach((h) => { guessed[h] = guessField(h); });
      setHeaders(hdrs);
      setMapping(guessed);
      setRows(parsedRows);
      setFileName(file.name);
    } catch (e) {
      setError("Couldn't read that file — double check the format.");
    }
    setBusy(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    handleFile(file);
  };

  const nameCol = Object.keys(mapping).find((h) => mapping[h] === "name");
  const contribCol = Object.keys(mapping).find((h) => mapping[h] === "contribution");

  const runImport = (mode) => {
    if (!rows || !nameCol) return;
    const incoming = rows
      .map((r) => ({
        name: String(r[nameCol] || "").trim(),
        contribution: contribCol ? (parseFloat(r[contribCol]) || 0) : 0,
      }))
      .filter((r) => r.name);

    const doImport = () => {
      setData((d) => {
        if (mode === "replace") {
          return { ...d, participants: incoming.map((r) => ({ id: uid("p"), name: r.name, contribution: r.contribution })) };
        }
        const existing = d.participants.map((p) => ({ ...p }));
        incoming.forEach((r) => {
          const match = existing.find((p) => p.name.trim().toLowerCase() === r.name.toLowerCase());
          if (match) { match.contribution = r.contribution; }
          else { existing.push({ id: uid("p"), name: r.name, contribution: r.contribution }); }
        });
        return { ...d, participants: existing };
      });
      resetImport();
    };

    if (mode === "replace") {
      confirmAction({
        title: "Replace participant list?",
        message: "This overwrites every current traveler with the imported list.",
        confirmLabel: "Replace",
        onConfirm: doImport,
      });
    } else {
      doImport();
    }
  };

  const exportExcel = () => {
    const t = computeTotals(data);
    const wb = XLSX.utils.book_new();
    const participantsSheet = data.participants.map((p) => ({
      Name: p.name,
      Contribution: p.contribution,
      "Total Share": Math.round(personTotalShare(p, t, data)),
      Balance: Math.round(num(p.contribution) - personTotalShare(p, t, data)),
    }));
    const expenseSheet = t.catTotals.map((c) => ({ Category: c.name, Mode: c.mode, Total: Math.round(c.total), Notes: c.note || "" }));
    const foodSheet = data.foodItems.map((f) => ({ Item: f.name, "Amount / Person": f.amount }));
    const itinerarySheet = data.itinerary.map((i) => ({ Day: i.day, Period: i.period, Time: i.time, Activity: i.title, Location: i.location, Notes: i.notes, Risk: i.risk }));
    const spotsSheet = data.spots.map((s) => ({ Name: s.name, Category: s.category, Priority: s.priority, "Time Needed": s.time, "Est. Cost": s.cost, Status: s.status, Notes: s.notes }));
    const summarySheet = [
      { Metric: "Total Collected", Value: t.totalContribution },
      { Metric: "Total Planned Expense", Value: t.totalExpense },
      { Metric: "Emergency Reserve", Value: t.reserve },
      { Metric: "Per Person (avg)", Value: Math.round(t.perPersonAvg) },
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summarySheet), "Summary");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(participantsSheet), "Participants");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expenseSheet), "Expenses");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(foodSheet), "Food Breakdown");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(itinerarySheet), "Itinerary");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(spotsSheet), "Spots");
    XLSX.writeFile(wb, "sajek-valley-trip.xlsx");
  };

  const downloadBlob = (content, filename, type) => {
    const blob = new Blob([content], { type: type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    const t = computeTotals(data);
    const csv = Papa.unparse(
      data.participants.map((p) => ({
        Name: p.name,
        Contribution: p.contribution,
        "Total Share": Math.round(personTotalShare(p, t, data)),
        Balance: Math.round(num(p.contribution) - personTotalShare(p, t, data)),
      }))
    );
    downloadBlob(csv, "sajek-participants.csv", "text/csv");
  };

  const exportJson = () => downloadBlob(JSON.stringify(data, null, 2), "sajek-trip-backup.json", "application/json");

  const MAPPING_FIELDS = [
    { value: "ignore", label: "Ignore" },
    { value: "name", label: "Traveler name" },
    { value: "contribution", label: "Contribution" },
    { value: "bus", label: "Bus (info only)" },
    { value: "cg", label: "CG (info only)" },
    { value: "food", label: "Food (info only)" },
    { value: "others", label: "Others (info only)" },
    { value: "hotel", label: "Hotel (info only)" },
  ];

  return (
    <div className="space-y-5">
      <Card className="p-4">
        <SectionHeading eyebrow="Bring in data" title="Import" />
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current && fileRef.current.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center"
          style={{ borderColor: dragOver ? BRAND.cloud : "#d6d3d1", background: dragOver ? "#EAF1EC" : "transparent" }}
        >
          {busy ? <Loader2 size={22} className="animate-spin" color={BRAND.pine} /> : <Upload size={22} color={BRAND.pine} />}
          <p className="mt-2 text-sm font-medium" style={{ color: BRAND.pine }}>Drop a file or tap to browse</p>
          <p className="mt-0.5 text-xs text-stone-400">CSV, XLSX, or JSON — a name + contribution column works best</p>
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.json" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
        </div>
        {error && <p className="mt-2 text-xs" style={{ color: BRAND.ember }}>{error}</p>}

        {rows && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs text-stone-500">
              <FileSpreadsheet size={13} /> {fileName} · {rows.length} rows
            </div>
            <div className="overflow-x-auto rounded-xl border border-stone-100">
              <table className="w-full text-xs" style={{ minWidth: 420 }}>
                <thead>
                  <tr className="bg-stone-50 text-left text-stone-500">
                    {headers.map((h) => (
                      <th key={h} className="p-2 font-medium">
                        <div>{h}</div>
                        <select
                          value={mapping[h]}
                          onChange={(e) => setMapping((m) => ({ ...m, [h]: e.target.value }))}
                          className="field mt-1 rounded-md px-1 py-0.5 text-xs"
                        >
                          {MAPPING_FIELDS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                        </select>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 5).map((r, i) => (
                    <tr key={i} className="border-t border-stone-100">
                      {headers.map((h) => <td key={h} className="p-2 text-stone-600">{String(r[h])}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!nameCol ? (
              <p className="text-xs" style={{ color: BRAND.ember }}>Map at least one column to "Traveler name" to import.</p>
            ) : (
              <p className="text-xs text-stone-400">Bus / CG / Food / Others / Hotel are calculated in this app, so those columns are shown for reference only and won't be imported directly.</p>
            )}
            <div className="flex flex-wrap gap-2">
              <button disabled={!nameCol} onClick={() => runImport("merge")} className="rounded-xl px-4 py-2 text-sm font-medium text-white disabled:opacity-40" style={{ background: BRAND.pine }}>
                Merge into current list
              </button>
              <button disabled={!nameCol} onClick={() => runImport("replace")} className="rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-40" style={{ color: BRAND.ember, border: "1px solid " + BRAND.ember }}>
                Replace list
              </button>
              <button onClick={resetImport} className="rounded-xl px-4 py-2 text-sm font-medium text-stone-500 hover:bg-stone-100">
                Cancel
              </button>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-4">
        <SectionHeading eyebrow="Take it with you" title="Export" />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button onClick={exportExcel} className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white" style={{ background: BRAND.pine }}>
            <FileSpreadsheet size={15} /> Excel (.xlsx)
          </button>
          <button onClick={exportCsv} className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white" style={{ background: BRAND.dusk }}>
            <Download size={15} /> CSV
          </button>
          <button onClick={exportJson} className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white" style={{ background: BRAND.bamboo }}>
            <FileJson size={15} /> JSON backup
          </button>
        </div>
        <p className="mt-2 text-xs text-stone-400">Excel includes every sheet — participants, expenses, food, itinerary, and spots. JSON is a full backup you can re-import later.</p>
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
  const [data, setData, status] = useTripData();
  const [tab, setTab] = useState("dashboard");
  const [confirmState, setConfirmState] = useState({ open: false });

  const totals = computeTotals(data);
  const askConfirm = (cfg) => setConfirmState(Object.assign({ open: true }, cfg));
  const closeConfirm = () => setConfirmState({ open: false });

  const resetAll = () =>
    askConfirm({
      title: "Reset for everyone?",
      message: "This replaces the shared trip data with the original spreadsheet defaults — for every traveler using this link, not just you.",
      confirmLabel: "Reset for everyone",
      onConfirm: () => setData(DEFAULT_DATA),
    });

  return (
    <div className="font-body min-h-screen" style={{ background: BRAND.mist, color: BRAND.pine }}>
      <style>{GLOBAL_CSS}</style>

      <div className="sticky top-0 z-30 border-b border-stone-200" style={{ background: BRAND.mist }}>
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Mountain size={18} color={BRAND.pine} />
            <span className="font-display text-base font-semibold">{data.meta.title || "Sajek Valley"}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-stone-400">
              {status === "saving" && <Loader2 size={12} className="animate-spin" />}
              {status === "saved" && <Check size={12} color={BRAND.pine} />}
              {status === "saving" ? "Syncing…" : status === "saved" ? "Synced" : status === "error" ? "Sync error" : "Connecting…"}
            </span>
            <IconBtn icon={RotateCcw} onClick={resetAll} label="Reset shared trip to spreadsheet defaults" />
          </div>
        </div>
        <div className="no-scrollbar tab-scroll mx-auto flex max-w-3xl gap-1 overflow-x-auto px-4 pb-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={"flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium " + (active ? "text-white" : "text-stone-500 hover:bg-white")}
                style={active ? { background: BRAND.pine } : {}}
              >
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {status === "error" && (
        <div className="mx-auto max-w-3xl px-4 pt-3">
          <div className="flex items-start gap-2 rounded-xl p-3 text-sm" style={{ background: "#FBEAE0", color: BRAND.ember }}>
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>Can't reach the shared trip database right now. If you just deployed this, double-check src/firebaseConfig.js and that Anonymous sign-in is enabled in Firebase Authentication.</span>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-3xl px-4 py-4">
        {tab === "dashboard" && <Dashboard data={data} setData={setData} totals={totals} goTo={setTab} />}
        {tab === "budget" && <Budget data={data} setData={setData} totals={totals} confirmAction={askConfirm} />}
        {tab === "itinerary" && <Itinerary data={data} setData={setData} confirmAction={askConfirm} />}
        {tab === "spots" && <Spots data={data} setData={setData} confirmAction={askConfirm} />}
        {tab === "data" && <DataTab data={data} setData={setData} confirmAction={askConfirm} />}
      </main>

      <footer className="mx-auto max-w-3xl px-4 pb-8 pt-2 text-center text-xs text-stone-400">
        Shared live with everyone on this link · {data.meta.duration}
      </footer>

      <ConfirmDialog state={confirmState} onClose={closeConfirm} />
    </div>
  );
}
