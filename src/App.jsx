import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Bell,
  BookOpen,
  Crown,
  Database,
  Home,
  Lock,
  LogOut,
  Radio,
  Search,
  Send,
  ShieldCheck,
  Signal,
  Sparkles,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";
import { supabase } from "./supabaseClient";
import TradingViewChart from "./TradingViewChart";

const ADMIN_EMAIL = "munashealexandershitto@gmail.com";

const BRAND = {
  name: "INFINITY X TRADERS",
  subtitle: "Omnichannel Trading Community and Market Intelligence Platform",
};

const navByRole = {
  Public: ["Home", "Market Preview", "Education", "Community", "Pricing", "Notifications"],
  "Free Member": ["Dashboard", "Free Outlook", "Beginner Education", "Community Hub", "Upgrade", "Notifications"],
  "VIP Elite": [
    "VIP Dashboard",
    "Market Matrix",
    "Signal Hub",
    "Community Hub",
    "Tool Repository",
    "Coaching and Education",
    "Events and Webinars",
    "Elite Circle",
    "Notifications",
  ],
  Admin: [
  "Admin Command Centre",
  "Market Matrix",
  "Signal Manager",
  "Subscription Manager",
  "Broadcast Centre",
  "Results Manager",
  "Community Manager",
  "Content Manager",
  "Tools Manager",
  "Partnerships",
  "Notifications",
],
};

const iconByNav = {
  Home,
  Dashboard: Activity,
  "VIP Dashboard": Activity,
  "Market Preview": Activity,
  "Free Outlook": Activity,
  Education: BookOpen,
  "Beginner Education": BookOpen,
  Community: Users,
  Pricing: Wallet,
  Upgrade: Crown,
  Notifications: Bell,
  "Community Hub": Users,
  "Market Matrix": Activity,
  "Signal Hub": Signal,
  "Tool Repository": Database,
  "Coaching and Education": BookOpen,
  "Events and Webinars": BookOpen,
  "Elite Circle": Sparkles,
  "Admin Command Centre": ShieldCheck,
  "Signal Manager": Radio,
  "Subscription Manager": Wallet,
  "Broadcast Centre": Send,
  "Results Manager": Trophy,
  "Community Manager": Users,
  "Content Manager": BookOpen,
  "Tools Manager": Database,
  Partnerships: Users,
};

const sampleSignals = [
  {
    id: "sample-1",
    symbol: "XAUUSD",
    direction: "BUY",
    status: "active",
    entry: 2332.5,
    stop_loss: 2318,
    tp1: 2340,
    tp2: 2350,
    tp3: 2360,
    confidence: 84,
    summary: "Bullish reclaim from manipulation zone.",
    is_vip_only: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "sample-2",
    symbol: "EURUSD",
    direction: "BUY",
    status: "active",
    entry: 1.0875,
    stop_loss: 1.082,
    tp1: 1.096,
    confidence: 72,
    summary: "Public sample signal preview.",
    is_vip_only: false,
    created_at: new Date().toISOString(),
  },
];

const communityCards = [
  ["Main Hub", "Announcements, onboarding, rules, and support."],
  ["Market Matrix", "Liquidity map, session bias, fakeout probability."],
  ["Inner Mastery Team", "Advanced research and premium reviews."],
  ["Arbitrage Traders", "Leg1, Leg2, Flow3 opportunity watchlists."],
  ["Indicators and EA Group", "TradingView scripts, MT5 tools, and automation."],
  ["Education Groups", "Beginner, intermediate, and advanced paths."],
  ["Elite Circle", "Private live breakdowns and early forecast zones."],
  ["Beta Testers", "New dashboard features and tool feedback."],
];

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function isActiveSubscription(profile) {
  if (!profile) return false;
  if (profile.role === "admin") return true;
  if (profile.role !== "vip_elite") return false;

  if (!profile.subscription_expires_at) {
    return profile.subscription_status === "active";
  }

  return (
    profile.subscription_status === "active" &&
    new Date(profile.subscription_expires_at) > new Date()
  );
}

function getAllowedRole(profile, session) {
  const email = (profile?.email || session?.user?.email || "").toLowerCase().trim();

  if (email === ADMIN_EMAIL) return "Admin";
  if (!profile && session?.user?.email) return "Free Member";
  if (!profile) return "Public";
  if (profile.role === "admin") return "Admin";
  if (profile.role === "vip_elite" && isActiveSubscription(profile)) return "VIP Elite";

  return "Free Member";
}

function displayValue(value) {
  if (value === null || value === undefined || value === "") return "Pending";
  return String(value);
}

function Card({ children, className = "" }) {
  return (
    <div
      className={cx(
        "rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/30",
        className
      )}
    >
      {children}
    </div>
  );
}

function Button({
  children,
  onClick,
  type = "button",
  disabled = false,
  variant = "solid",
  className = "",
}) {
  const solid = "bg-[#58ff45] text-black hover:bg-[#9bff8f]";
  const ghost = "border border-[#58ff45]/30 bg-[#58ff45]/10 text-[#b8ffb0] hover:bg-[#58ff45]/20";
  const danger = "border border-rose-400/30 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "rounded-2xl px-4 py-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "solid" ? solid : variant === "danger" ? danger : ghost,
        className
      )}
    >
      {children}
    </button>
  );
}

function LogoMark({ small = false }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cx(
          "flex items-center justify-center rounded-2xl border border-[#58ff45]/40 bg-[#58ff45]/10 text-[#58ff45]",
          small ? "h-10 w-10" : "h-14 w-14"
        )}
      >
        <span className="text-2xl font-black">∞</span>
      </div>

      {!small ? (
        <div>
          <h1 className="text-2xl font-black tracking-wide text-white">
            INFINITY <span className="text-[#58ff45]">X</span> TRADERS
          </h1>
          <p className="text-sm text-slate-400">{BRAND.subtitle}</p>
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value, icon: Icon }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <h3 className="mt-2 text-3xl font-black text-white">{value}</h3>
        </div>
        <div className="rounded-2xl bg-[#58ff45]/10 p-3 text-[#58ff45]">
          <Icon size={22} />
        </div>
      </div>
    </Card>
  );
}

function TextInput({ value, onChange, placeholder, type = "text", required = false }) {
  return (
    <input
      value={value}
      type={type}
      required={required}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
    />
  );
}

function AuthScreen({ onAuthSuccess, authError }) {
  const [mode, setMode] = useState("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState(authError || "");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();

    setBusy(true);
    setMessage("");
    setErrorMessage("");

    function timeoutAfter(ms) {
      return new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error("Login timed out. Check Supabase URL/key or internet connection."));
        }, ms);
      });
    }

    try {
      if (mode === "signin") {
        const loginRequest = supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        const { data, error } = await Promise.race([loginRequest, timeoutAfter(15000)]);

        if (error) throw error;
        if (!data?.session) throw new Error("Login succeeded but no session was returned.");

        setMessage("Login successful. Opening dashboard...");
        await onAuthSuccess(data.session);
      } else {
        const signupRequest = supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              full_name: fullName || email.split("@")[0],
            },
          },
        });

        const { error } = await Promise.race([signupRequest, timeoutAfter(15000)]);

        if (error) throw error;

        setMessage("Account created. Switch to Sign in and login.");
      }
    } catch (error) {
      setErrorMessage(error.message || "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#020403] px-6 py-10 text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-7xl items-center gap-8 lg:grid-cols-[1.1fr_.9fr]">
        <section>
          <LogoMark />

          <div className="mt-8 inline-flex rounded-full border border-[#58ff45]/30 bg-[#58ff45]/10 px-4 py-2 text-sm font-bold text-[#b8ffb0]">
            Secure Member Access
          </div>

          <h2 className="mt-6 max-w-3xl text-5xl font-black leading-tight text-white md:text-7xl">
            Access Your Trading Intelligence Hub.
          </h2>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Sign in to access your trading dashboard, signals, education, tools, and community based on your membership level.
          </p>
        </section>

        <Card className="mx-auto w-full max-w-md border-[#58ff45]/25 bg-black/50">
          <div className="flex rounded-2xl border border-white/10 bg-black/30 p-1">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={cx(
                "flex-1 rounded-xl px-4 py-3 text-sm font-black",
                mode === "signin" ? "bg-[#58ff45] text-black" : "text-slate-400"
              )}
            >
              Sign in
            </button>

            <button
              type="button"
              onClick={() => setMode("signup")}
              className={cx(
                "flex-1 rounded-xl px-4 py-3 text-sm font-black",
                mode === "signup" ? "bg-[#58ff45] text-black" : "text-slate-400"
              )}
            >
              Create account
            </button>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "signup" ? (
              <TextInput value={fullName} onChange={setFullName} placeholder="Full name" />
            ) : null}

            <TextInput value={email} onChange={setEmail} placeholder="Email" type="email" required />
            <TextInput value={password} onChange={setPassword} placeholder="Password" type="password" required />

            {errorMessage ? (
              <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">
                {errorMessage}
              </div>
            ) : null}

            {message ? (
              <div className="rounded-2xl border border-[#58ff45]/30 bg-[#58ff45]/10 p-3 text-sm text-[#b8ffb0]">
                {message}
              </div>
            ) : null}

            <Button type="submit" disabled={busy} className="w-full">
              {busy ? "Please wait..." : mode === "signin" ? "Sign in securely" : "Create account"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

function Shell({ role, profile, active, setActive, onSignOut, children, notificationsCount = 0 }) {
  const nav = navByRole[role] || navByRole.Public;

  return (
    <div className="min-h-screen bg-[#020403] text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-black/50 p-4 xl:block">
          <LogoMark />

          <Card className="mt-6">
            <p className="text-xs uppercase tracking-widest text-slate-500">Role Access</p>

            <div className="mt-3 space-y-2">
              {["Public", "Free Member", "VIP Elite", "Admin"].map((item) => (
                <div
                  key={item}
                  className={cx(
                    "flex items-center justify-between rounded-2xl px-3 py-2 text-sm",
                    item === role ? "bg-[#58ff45] text-black" : "bg-white/[0.03] text-slate-500"
                  )}
                >
                  <span>{item}</span>
                  {item === role ? <ShieldCheck size={15} /> : <Lock size={15} />}
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-3">
              <p className="text-xs text-slate-500">Signed in as</p>
              <p className="truncate text-sm font-bold text-white">{profile?.email}</p>

              <button
                type="button"
                onClick={onSignOut}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#58ff45]/30 bg-[#58ff45]/10 px-3 py-2 text-xs font-bold text-[#b8ffb0]"
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          </Card>

          <nav className="mt-6 space-y-2">
            <p className="px-3 text-xs uppercase tracking-widest text-slate-600">Platform</p>

            {nav.map((item) => {
              const Icon = iconByNav[item] || Home;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setActive(item)}
                  className={cx(
                    "flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm transition",
                    active === item
                      ? "bg-[#58ff45]/15 text-[#b8ffb0] ring-1 ring-[#58ff45]/35"
                      : "text-slate-300 hover:bg-white/10"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Icon size={17} /> {item}
                  </span>
                  <span>›</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-[#020403]/90 px-5 py-4 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white">{active}</h2>
                <p className="text-sm text-slate-500">Unified platform - {role} access</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 md:flex md:w-96">
                  <Search size={17} className="text-slate-500" />
                  <span className="text-sm text-slate-500">Search markets, signals, tools...</span>
                </div>

                <div className="rounded-2xl border border-[#58ff45]/25 bg-[#58ff45]/10 px-4 py-3 text-sm font-semibold text-[#b8ffb0]">
                  {role}
                </div>

                <button
                  type="button"
                  onClick={() => setActive("Notifications")}
                  className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-3"
                >
                  <Bell size={18} />

                  {notificationsCount > 0 ? (
                    <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                      {notificationsCount}
                    </span>
                  ) : null}
                </button>

                <Button
                  onClick={() =>
                    setActive(
                      role === "Admin"
                        ? "Admin Command Centre"
                        : role === "VIP Elite"
                        ? "VIP Dashboard"
                        : role === "Free Member"
                        ? "Dashboard"
                        : "Home"
                    )
                  }
                >
                  Launch App
                </Button>
              </div>
            </div>
          </header>

          <section className="p-5">{children}</section>
        </main>
      </div>
    </div>
  );
}

function Dashboard({ role, locked = false, signals = sampleSignals, setActive }) {
  const activeSignals = useMemo(() => {
    return signals.filter((signal) => signal.status !== "closed");
  }, [signals]);

  const closedSignals = useMemo(() => {
    return signals.filter((signal) => signal.status === "closed");
  }, [signals]);

  const wins = useMemo(() => {
    return closedSignals.filter((signal) =>
      ["tp1", "tp2", "tp3"].includes(signal.result)
    ).length;
  }, [closedSignals]);

  const losses = useMemo(() => {
    return closedSignals.filter((signal) => signal.result === "sl").length;
  }, [closedSignals]);

  const breakevens = useMemo(() => {
    return closedSignals.filter((signal) => signal.result === "be").length;
  }, [closedSignals]);

  const totalCompleted = wins + losses;
  const winRate =
    totalCompleted > 0 ? Math.round((wins / totalCompleted) * 100) : 0;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <Stat label="Active Signals" value={String(activeSignals.length || 0)} icon={Signal} />
        <Stat label="Closed Signals" value={String(closedSignals.length || 0)} icon={Radio} />
        <Stat label="Wins" value={String(wins)} icon={Trophy} />
        <Stat label="Losses" value={String(losses)} icon={Activity} />
        <Stat label="Breakevens" value={String(breakevens)} icon={ShieldCheck} />
        <Stat label="Win Rate" value={`${winRate}%`} icon={Trophy} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <Card>
          <p className="text-sm font-bold uppercase tracking-widest text-[#58ff45]">Welcome back</p>

          <h1 className="mt-3 text-4xl font-black text-white">
            Trade Smarter. Grow Together. Win Consistently.
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Real-time market intelligence, community, tools, and signal workflow for {role}.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={() => setActive?.("Signal Hub")}>Open Signal Hub</Button>
            <Button variant="ghost" onClick={() => setActive?.("Community Hub")}>
              Open Community
            </Button>
            {locked ? (
              <Button variant="ghost" onClick={() => setActive?.("Upgrade")}>
                Upgrade
              </Button>
            ) : null}
          </div>

          {locked ? (
            <div className="mt-5 rounded-2xl border border-yellow-400/30 bg-yellow-500/10 p-4 text-yellow-100">
              Some entries are locked because this account is Free Member access.
            </div>
          ) : null}
        </Card>

        <Card>
          <h3 className="text-xl font-black text-white">XAUUSD Market Bias</h3>
          <p className="mt-3 text-4xl font-black text-[#58ff45]">2345.67</p>
          <p className="mt-2 text-sm text-[#8fff80]">Bullish reclaim +0.79%</p>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[78%] rounded-full bg-[#58ff45]" />
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-2xl font-black text-white">Active Signals</h3>
        <p className="mt-1 text-sm text-slate-400">Signals that are still running.</p>
        <div className="mt-5">
          <SignalHub
            locked={locked}
            signals={activeSignals}
            setActive={setActive}
            showSamples={false}
            emptyMessage="No active signals right now."
          />
        </div>
      </Card>

      <Card>
        <h3 className="text-2xl font-black text-white">Signal History</h3>
        <p className="mt-1 text-sm text-slate-400">Closed trades and recorded results.</p>
        <div className="mt-5">
          <SignalHub
            locked={locked}
            signals={closedSignals}
            setActive={setActive}
            showSamples={false}
            emptyMessage="No closed signals yet."
          />
        </div>
      </Card>
    </div>
  );
}

function SignalHub({
  locked = false,
  signals = sampleSignals,
  setActive,
  isAdmin = false,
  onCloseSignal,
  onReopenSignal,
  showSamples = true,
  emptyMessage = "No signals found.",
}) {
  const rows = showSamples ? (signals.length > 0 ? signals : sampleSignals) : signals;

  function formatSignalResult(result) {
    if (result === "tp1") return "TP1 Hit";
    if (result === "tp2") return "TP2 Hit";
    if (result === "tp3") return "TP3 Hit";
    if (result === "sl") return "SL Hit";
    if (result === "be") return "Breakeven";
    return "Closed";
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-black/30 p-5 text-sm text-slate-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-3">
      {rows.map((signal) => {
        const isVipOnly = signal.is_vip_only === true;
        const isLocked = locked && isVipOnly;
        const isClosed = signal.status === "closed";

        return (
          <Card key={signal.id}>
            <div className="flex items-center justify-between">
              <span
                className={cx(
                  "rounded-full px-3 py-1 text-xs font-black",
                  signal.direction === "BUY"
                    ? "bg-[#58ff45]/15 text-[#8fff80]"
                    : "bg-rose-500/15 text-rose-300"
                )}
              >
                {signal.direction || "BUY"}
              </span>

              <span className="text-2xl font-black text-white">
                {isLocked ? "--" : `${signal.confidence ?? 50}%`}
              </span>
            </div>

            <h3 className="mt-4 text-xl font-black text-white">{signal.symbol || "XAUUSD"}</h3>

            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={cx(
                  "inline-flex rounded-full border px-3 py-1 text-xs font-bold",
                  isVipOnly
                    ? "border-[#58ff45]/30 bg-[#58ff45]/10 text-[#b8ffb0]"
                    : "border-white/10 bg-white/10 text-slate-300"
                )}
              >
                {isVipOnly ? "VIP Signal" : "Free Preview"}
              </span>

              {isLocked ? (
                <span className="inline-flex rounded-full border border-yellow-400/30 bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-100">
                  VIP Locked
                </span>
              ) : isClosed ? (
                <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-slate-200">
                  {formatSignalResult(signal.result)}
                </span>
              ) : (
                <span className="inline-flex rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-100">
  {signal.result ? `Active · ${formatSignalResult(signal.result)}` : "Active"}
</span>
              )}
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              {isLocked
                ? "This is a VIP-only setup. Upgrade to VIP Elite to unlock entry, stop loss, take profit and full logic."
                : signal.summary || "Signal details ready."}
            </p>

            <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-2xl bg-black/30 p-3">
                <p className="text-slate-500">Entry</p>
                <p className="font-bold text-white">
                  {isLocked ? "Locked" : displayValue(signal.entry)}
                </p>
              </div>

              <div className="rounded-2xl bg-black/30 p-3">
                <p className="text-slate-500">SL</p>
                <p className="font-bold text-white">
                  {isLocked ? "Locked" : displayValue(signal.stop_loss)}
                </p>
              </div>

              <div className="rounded-2xl bg-black/30 p-3">
                <p className="text-slate-500">TP1</p>
                <p className="font-bold text-white">
                  {isLocked ? "Locked" : displayValue(signal.tp1)}
                </p>
              </div>
            </div>

            {!isLocked ? (
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-black/30 p-3">
                  <p className="text-slate-500">TP2</p>
                  <p className="font-bold text-white">{displayValue(signal.tp2)}</p>
                </div>

                <div className="rounded-2xl bg-black/30 p-3">
                  <p className="text-slate-500">TP3</p>
                  <p className="font-bold text-white">{displayValue(signal.tp3)}</p>
                </div>
              </div>
            ) : null}

            {signal.closed_at && !isLocked ? (
              <p className="mt-3 text-xs text-slate-500">
                Closed: {new Date(signal.closed_at).toLocaleString()}
              </p>
            ) : null}

            {isLocked ? (
              <Button className="mt-5 w-full" onClick={() => setActive?.("Upgrade")}>
                Upgrade to VIP Elite
              </Button>
            ) : null}

            {isAdmin && !isClosed ? (
              <div className="mt-5 flex flex-wrap gap-2">
                <Button onClick={() => onCloseSignal?.(signal.id, "tp1")}>TP1 Hit</Button>
                <Button onClick={() => onCloseSignal?.(signal.id, "tp2")}>TP2 Hit</Button>
                <Button onClick={() => onCloseSignal?.(signal.id, "tp3")}>TP3 Hit</Button>
                <Button variant="danger" onClick={() => onCloseSignal?.(signal.id, "sl")}>
                  SL Hit
                </Button>
                <Button variant="ghost" onClick={() => onCloseSignal?.(signal.id, "be")}>
                  Breakeven
                </Button>
              </div>
            ) : null}

            {isAdmin && isClosed ? (
              <Button className="mt-5 w-full" variant="ghost" onClick={() => onReopenSignal?.(signal.id)}>
                Reopen Signal
              </Button>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}

function CommunityHub() {
  return (
    <Card>
      <h3 className="text-2xl font-black text-white">Community Hub</h3>
      <p className="mt-1 text-slate-400">
        Main Hub, Market Matrix, sub-communities, exclusive groups, and recognition.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {communityCards.map(([title, note]) => (
          <div key={title} className="rounded-3xl border border-white/10 bg-black/30 p-5">
            <Users className="text-[#58ff45]" size={22} />
            <h4 className="mt-4 font-black text-white">{title}</h4>
            <p className="mt-2 text-sm leading-6 text-slate-400">{note}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function AdminSignalForm({ onCreated }) {
  const [form, setForm] = useState({
    symbol: "XAUUSD",
    direction: "BUY",
    status: "active",
    session: "New York",
    entry: "",
    stop_loss: "",
    tp1: "",
    tp2: "",
    tp3: "",
    confidence: "75",
    summary: "",
    logic: "",
    is_vip_only: true,
  });

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function toNumber(value) {
    if (value === "" || value === null || value === undefined) return null;
    return Number(value);
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setErrorMessage("");

    try {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user) {
        throw new Error("You must be signed in as admin to create signals.");
      }

      const payload = {
        symbol: form.symbol.toUpperCase(),
        direction: form.direction,
        status: form.status,
        session: form.session,
        entry: toNumber(form.entry),
        stop_loss: toNumber(form.stop_loss),
        tp1: toNumber(form.tp1),
        tp2: toNumber(form.tp2),
        tp3: toNumber(form.tp3),
        confidence: Number(form.confidence),
        summary: form.summary,
        logic: form.logic,
        is_vip_only: form.is_vip_only,
        result: null,
        closed_at: null,
        close_note: null,
        created_by: userData.user.id,
        published_at: new Date().toISOString(),
      };

      const { data: createdSignal, error } = await supabase
        .from("signals")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      const { error: notificationError } = await supabase.from("notifications").insert({
        user_id: null,
        audience: form.is_vip_only ? "vip_elite" : "all",
        title: `${form.is_vip_only ? "New VIP Signal" : "New Signal"}: ${form.symbol.toUpperCase()} ${form.direction}`,
        body: `Entry: ${form.entry || "Pending"} | SL: ${form.stop_loss || "Pending"} | TP1: ${form.tp1 || "Pending"}`,
        channel: "in_app",
        status: "pending",
        metadata: {
          signal_id: createdSignal?.id,
          symbol: form.symbol.toUpperCase(),
          direction: form.direction,
        },
      });

      if (notificationError) {
        console.error("Notification creation error:", notificationError);
      }

      setMessage("Signal created successfully. Notification created.");

      setForm((current) => ({
        ...current,
        entry: "",
        stop_loss: "",
        tp1: "",
        tp2: "",
        tp3: "",
        summary: "",
        logic: "",
      }));

      await onCreated?.();
    } catch (error) {
      setErrorMessage(error.message || "Could not create signal.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="border-[#58ff45]/25">
      <h3 className="text-2xl font-black text-white">Create New Signal</h3>
      <p className="mt-1 text-sm text-slate-400">
        Admin-created signals are saved into Supabase and create in-app notifications.
      </p>

      <form onSubmit={submit} className="mt-6 grid gap-4 md:grid-cols-2">
        <TextInput value={form.symbol} onChange={(value) => updateField("symbol", value)} placeholder="Symbol e.g. XAUUSD" />

        <select
          value={form.direction}
          onChange={(event) => updateField("direction", event.target.value)}
          className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
        >
          <option value="BUY">BUY</option>
          <option value="SELL">SELL</option>
        </select>

        <select
          value={form.status}
          onChange={(event) => updateField("status", event.target.value)}
          className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
        >
          <option value="active">active</option>
          <option value="closed">closed</option>
        </select>

        <TextInput value={form.session} onChange={(value) => updateField("session", value)} placeholder="Session e.g. London" />
        <TextInput value={form.entry} onChange={(value) => updateField("entry", value)} placeholder="Entry" />
        <TextInput value={form.stop_loss} onChange={(value) => updateField("stop_loss", value)} placeholder="Stop Loss" />
        <TextInput value={form.tp1} onChange={(value) => updateField("tp1", value)} placeholder="TP1" />
        <TextInput value={form.tp2} onChange={(value) => updateField("tp2", value)} placeholder="TP2" />
        <TextInput value={form.tp3} onChange={(value) => updateField("tp3", value)} placeholder="TP3" />
        <TextInput value={form.confidence} onChange={(value) => updateField("confidence", value)} placeholder="Confidence 0-100" />

        <textarea
          value={form.summary}
          onChange={(event) => updateField("summary", event.target.value)}
          className="min-h-28 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none md:col-span-2"
          placeholder="Signal summary"
        />

        <textarea
          value={form.logic}
          onChange={(event) => updateField("logic", event.target.value)}
          className="min-h-28 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none md:col-span-2"
          placeholder="Full signal logic"
        />

        <label className="flex items-center gap-3 text-sm text-slate-300 md:col-span-2">
          <input
            type="checkbox"
            checked={form.is_vip_only}
            onChange={(event) => updateField("is_vip_only", event.target.checked)}
          />
          VIP-only signal
        </label>

        {errorMessage ? (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200 md:col-span-2">
            {errorMessage}
          </div>
        ) : null}

        {message ? (
          <div className="rounded-2xl border border-[#58ff45]/30 bg-[#58ff45]/10 p-3 text-sm text-[#b8ffb0] md:col-span-2">
            {message}
          </div>
        ) : null}

        <div className="md:col-span-2">
          <Button type="submit" disabled={busy}>
            {busy ? "Creating..." : "Create Signal"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function UserRoleManager({ users = [], onUpdated }) {
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function vipExpiryDate() {
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  }

  async function updateMembership(user, action) {
    setBusyId(user.id);
    setMessage("");
    setErrorMessage("");

    const payloads = {
      free: {
        role: "free",
        subscription_status: "inactive",
        subscription_plan: "free",
        subscription_expires_at: null,
      },
      vip: {
        role: "vip_elite",
        subscription_status: "active",
        subscription_plan: "vip_elite",
        subscription_expires_at: vipExpiryDate(),
      },
      expire: {
        role: "vip_elite",
        subscription_status: "expired",
        subscription_plan: "vip_elite",
        subscription_expires_at: new Date(Date.now() - 86400000).toISOString(),
      },
      admin: {
        role: "admin",
        subscription_status: "active",
        subscription_plan: "admin",
        subscription_expires_at: null,
      },
    };

    try {
      const { error } = await supabase.from("profiles").update(payloads[action]).eq("id", user.id);

      if (error) throw error;

      setMessage(`Updated ${user.email} successfully.`);
      await onUpdated?.();
    } catch (error) {
      setErrorMessage(error.message || "Could not update user.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <Card className="border-[#58ff45]/25">
      <h3 className="text-2xl font-black text-white">User Membership Manager</h3>
      <p className="mt-1 text-sm text-slate-400">
        Upgrade users to VIP Elite, expire access, or assign admin permissions.
      </p>

      {errorMessage ? (
        <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">
          {errorMessage}
        </div>
      ) : null}

      {message ? (
        <div className="mt-4 rounded-2xl border border-[#58ff45]/30 bg-[#58ff45]/10 p-3 text-sm text-[#b8ffb0]">
          {message}
        </div>
      ) : null}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.04] text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-3">Email</th>
              <th className="px-3 py-3">Role</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Plan</th>
              <th className="px-3 py-3">Expires</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-white/5">
                <td className="px-3 py-3 font-semibold text-white">{user.email}</td>
                <td className="px-3 py-3 text-slate-300">{user.role}</td>
                <td className="px-3 py-3 text-slate-300">{user.subscription_status}</td>
                <td className="px-3 py-3 text-slate-300">{user.subscription_plan}</td>
                <td className="px-3 py-3 text-slate-400">
                  {user.subscription_expires_at
                    ? new Date(user.subscription_expires_at).toLocaleDateString()
                    : "None"}
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="ghost" disabled={busyId === user.id} onClick={() => updateMembership(user, "free")}>
                      Free
                    </Button>
                    <Button disabled={busyId === user.id} onClick={() => updateMembership(user, "vip")}>
                      VIP Elite
                    </Button>
                    <Button variant="ghost" disabled={busyId === user.id} onClick={() => updateMembership(user, "expire")}>
                      Expire
                    </Button>
                    <Button variant="danger" disabled={busyId === user.id} onClick={() => updateMembership(user, "admin")}>
                      Admin
                    </Button>
                  </div>
                </td>
              </tr>
            ))}

            {users.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-center text-slate-500" colSpan={6}>
                  No users loaded yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function PaymentRequestPanel({ profile, onSubmitted }) {
  const [amount, setAmount] = useState("49");
  const [reference, setReference] = useState("");
  const [provider, setProvider] = useState("Manual / EcoCash / Bank Transfer");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setErrorMessage("");

    try {
      if (!profile?.id) throw new Error("Profile missing. Sign out and sign in again.");

      const payload = {
        user_id: profile.id,
        amount: Number(amount),
        currency: "USD",
        provider,
        reference,
        status: "pending",
      };

      const { error } = await supabase.from("payments").insert(payload);

      if (error) throw error;

      setMessage("Payment request submitted. Admin will review and activate VIP access.");
      setReference("");
      await onSubmitted?.();
    } catch (error) {
      setErrorMessage(error.message || "Could not submit payment request.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="border-[#58ff45]/25">
      <h3 className="text-2xl font-black text-white">Manual Payment Request</h3>
      <p className="mt-1 text-sm text-slate-400">Submit payment details for VIP Elite activation.</p>

      <form onSubmit={submit} className="mt-6 grid gap-4 md:grid-cols-2">
        <TextInput value={amount} onChange={setAmount} placeholder="Amount e.g. 49" />
        <TextInput value={provider} onChange={setProvider} placeholder="Provider" />

        <input
          value={reference}
          onChange={(event) => setReference(event.target.value)}
          required
          className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none md:col-span-2"
          placeholder="Payment reference / transaction ID"
        />

        {errorMessage ? (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200 md:col-span-2">
            {errorMessage}
          </div>
        ) : null}

        {message ? (
          <div className="rounded-2xl border border-[#58ff45]/30 bg-[#58ff45]/10 p-3 text-sm text-[#b8ffb0] md:col-span-2">
            {message}
          </div>
        ) : null}

        <div className="md:col-span-2">
          <Button type="submit" disabled={busy}>
            {busy ? "Submitting..." : "Submit Payment Request"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function PaymentManager({ payments = [], onApproved }) {
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [busyId, setBusyId] = useState("");

  async function approvePayment(payment) {
    setBusyId(payment.id);
    setMessage("");
    setErrorMessage("");

    try {
      const { error: paymentError } = await supabase
        .from("payments")
        .update({ status: "paid" })
        .eq("id", payment.id);

      if (paymentError) throw paymentError;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          role: "vip_elite",
          subscription_status: "active",
          subscription_plan: "vip_elite",
          subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq("id", payment.user_id);

      if (profileError) throw profileError;

      setMessage("Payment approved and VIP access activated.");
      await onApproved?.();
    } catch (error) {
      setErrorMessage(error.message || "Could not approve payment.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <Card className="border-[#58ff45]/25">
      <h3 className="text-2xl font-black text-white">Payment Approval Manager</h3>
      <p className="mt-1 text-sm text-slate-400">
        Approve pending manual payments and activate VIP access.
      </p>

      {errorMessage ? (
        <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">
          {errorMessage}
        </div>
      ) : null}

      {message ? (
        <div className="mt-4 rounded-2xl border border-[#58ff45]/30 bg-[#58ff45]/10 p-3 text-sm text-[#b8ffb0]">
          {message}
        </div>
      ) : null}

      <div className="mt-6 space-y-3">
        {payments.map((payment) => (
          <div key={payment.id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-black text-white">
                  {payment.currency} {payment.amount}
                </p>
                <p className="text-sm text-slate-400">Ref: {payment.reference || "No reference"}</p>
                <p className="text-xs text-slate-500">Status: {payment.status}</p>
              </div>

              {payment.status === "pending" ? (
                <Button disabled={busyId === payment.id} onClick={() => approvePayment(payment)}>
                  Approve VIP
                </Button>
              ) : (
                <span className="rounded-full border border-[#58ff45]/30 bg-[#58ff45]/10 px-3 py-1 text-xs font-bold text-[#b8ffb0]">
                  Approved
                </span>
              )}
            </div>
          </div>
        ))}

        {payments.length === 0 ? (
          <p className="text-sm text-slate-500">No payment requests yet.</p>
        ) : null}
      </div>
    </Card>
  );
}

function NotificationCenter({ notifications = [], onRefresh }) {
  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-3xl font-black text-white">Notifications</h3>
            <p className="mt-2 text-slate-400">
              In-app alerts for signals, payments, community updates, and admin broadcasts.
            </p>
          </div>

          <Button variant="ghost" onClick={onRefresh}>
            Refresh
          </Button>
        </div>
      </Card>

      <div className="grid gap-4">
        {notifications.map((item) => (
          <Card key={item.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="inline-flex rounded-full border border-[#58ff45]/30 bg-[#58ff45]/10 px-3 py-1 text-xs font-bold text-[#b8ffb0]">
                  {item.audience || "all"} · {item.channel || "in_app"}
                </div>

                <h4 className="mt-3 text-xl font-black text-white">{item.title}</h4>
                <p className="mt-2 text-sm leading-6 text-slate-400">{item.body}</p>
                <p className="mt-3 text-xs text-slate-600">
                  {item.created_at ? new Date(item.created_at).toLocaleString() : ""}
                </p>
              </div>

              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-slate-300">
                {item.status}
              </span>
            </div>
          </Card>
        ))}

        {notifications.length === 0 ? (
          <Card>
            <p className="text-slate-400">No notifications yet.</p>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

function AdminPanel({
  title,
  signals = sampleSignals,
  onSignalCreated,
  onCloseSignal,
  onReopenSignal,
  users = [],
  onUsersUpdated,
  payments = [],
  onPaymentsUpdated,
  setActive,
}) {
  const activeSignals = useMemo(() => {
    return signals.filter((signal) => signal.status !== "closed");
  }, [signals]);

  const closedSignals = useMemo(() => {
    return signals.filter((signal) => signal.status === "closed");
  }, [signals]);

  const wins = useMemo(() => {
    return closedSignals.filter((signal) =>
      ["tp1", "tp2", "tp3"].includes(signal.result)
    ).length;
  }, [closedSignals]);

  const losses = useMemo(() => {
    return closedSignals.filter((signal) => signal.result === "sl").length;
  }, [closedSignals]);

  const breakevens = useMemo(() => {
    return closedSignals.filter((signal) => signal.result === "be").length;
  }, [closedSignals]);

  const totalCompleted = wins + losses;
  const winRate =
    totalCompleted > 0 ? Math.round((wins / totalCompleted) * 100) : 0;

  const cards = [
    {
      heading: "Create Signals",
      note: "Create active signals and manage closed outcomes.",
      page: "Signal Manager",
    },
    {
      heading: "Manage Subscriptions",
      note: "Upgrade users to VIP Elite or expire access.",
      page: "Subscription Manager",
    },
    {
      heading: "Broadcast Alerts",
      note: "Prepare Telegram, WhatsApp, email, and in-app alerts.",
      page: "Broadcast Centre",
    },
    {
      heading: "Results Manager",
      note: "Mark TP, SL, BE, or cancelled outcomes.",
      page: "Results Manager",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <Stat label="Total Users" value={String(users.length || 0)} icon={Users} />
        <Stat
          label="VIP Members"
          value={String(users.filter((user) => user.role === "vip_elite").length || 0)}
          icon={Crown}
        />
        <Stat label="Active Signals" value={String(activeSignals.length || 0)} icon={Radio} />
        <Stat label="Closed Signals" value={String(closedSignals.length || 0)} icon={Trophy} />
        <Stat label="Win Rate" value={`${winRate}%`} icon={Activity} />
        <Stat label="Payments" value={String(payments.length || 0)} icon={Wallet} />
      </div>

      {title === "Signal Manager" ? <AdminSignalForm onCreated={onSignalCreated} /> : null}
      {title === "Subscription Manager" ? (
        <UserRoleManager users={users} onUpdated={onUsersUpdated} />
      ) : null}
      {title === "Subscription Manager" ? (
        <PaymentManager payments={payments} onApproved={onPaymentsUpdated} />
      ) : null}

      <Card>
        <h3 className="text-2xl font-black text-white">{title}</h3>
        <p className="mt-1 text-slate-400">
          Admin command centre foundation is active. Use Results Manager to close signals as TP1, TP2, TP3, SL, or BE.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {cards.map((card) => (
            <button
              key={card.heading}
              type="button"
              onClick={() => setActive(card.page)}
              className="rounded-3xl border border-white/10 bg-black/30 p-5 text-left transition hover:border-[#58ff45]/40 hover:bg-[#58ff45]/10"
            >
              <h4 className="font-black text-white">{card.heading}</h4>
              <p className="mt-2 text-sm text-slate-400">{card.note}</p>
            </button>
          ))}
        </div>
      </Card>

      {title === "Results Manager" ? (
        <>
          <Card>
            <h3 className="text-2xl font-black text-white">Active Signals</h3>
            <p className="mt-1 text-sm text-slate-400">Close running signals when TP, SL, or BE is reached.</p>
            <div className="mt-5">
              <SignalHub
                signals={activeSignals}
                setActive={setActive}
                isAdmin
                onCloseSignal={onCloseSignal}
                onReopenSignal={onReopenSignal}
                showSamples={false}
                emptyMessage="No active signals right now."
              />
            </div>
          </Card>

          <Card>
            <h3 className="text-2xl font-black text-white">Signal History</h3>
            <p className="mt-1 text-sm text-slate-400">
              Closed signals, outcomes, and reopen controls.
            </p>
            <div className="mt-5">
              <SignalHub
                signals={closedSignals}
                setActive={setActive}
                isAdmin
                onCloseSignal={onCloseSignal}
                onReopenSignal={onReopenSignal}
                showSamples={false}
                emptyMessage="No closed signals yet."
              />
            </div>
          </Card>
        </>
      ) : (
        <Card>
          <h3 className="text-2xl font-black text-white">Live Supabase Signals</h3>
          <div className="mt-5">
            <SignalHub
              signals={signals}
              setActive={setActive}
              isAdmin
              onCloseSignal={onCloseSignal}
              onReopenSignal={onReopenSignal}
              showSamples={false}
              emptyMessage="No signals created yet."
            />
          </div>
        </Card>
      )}

      <Card>
        <h3 className="text-2xl font-black text-white">Performance Summary</h3>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl bg-black/30 p-4">
            <p className="text-sm text-slate-500">Wins</p>
            <p className="mt-1 text-2xl font-black text-[#58ff45]">{wins}</p>
          </div>
          <div className="rounded-2xl bg-black/30 p-4">
            <p className="text-sm text-slate-500">Losses</p>
            <p className="mt-1 text-2xl font-black text-rose-300">{losses}</p>
          </div>
          <div className="rounded-2xl bg-black/30 p-4">
            <p className="text-sm text-slate-500">Breakevens</p>
            <p className="mt-1 text-2xl font-black text-white">{breakevens}</p>
          </div>
          <div className="rounded-2xl bg-black/30 p-4">
            <p className="text-sm text-slate-500">Win Rate</p>
            <p className="mt-1 text-2xl font-black text-white">{winRate}%</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function SimplePage({ title, description, children }) {
  return (
    <div className="space-y-5">
      <Card>
        <h3 className="text-3xl font-black text-white">{title}</h3>
        <p className="mt-3 max-w-3xl text-slate-400">{description}</p>
      </Card>
      {children}
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [active, setActive] = useState(() => {
  return localStorage.getItem("ixt_active_page") || "Home";
});
  const [authError, setAuthError] = useState("");
  const [signals, setSignals] = useState([]);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const role = useMemo(() => getAllowedRole(profile, session), [profile, session]);
  useEffect(() => {
  if (active) {
    localStorage.setItem("ixt_active_page", active);
  }
}, [active]);

  async function loadProfile(user) {
    const userEmail = (user.email || "").toLowerCase().trim();

    let result = await supabase
      .from("profiles")
      .select("id,email,full_name,role,subscription_status,subscription_plan,subscription_expires_at,created_at")
      .eq("id", user.id)
      .maybeSingle();

    if (result.error) console.error("Profile load by id error:", result.error);
    if (result.data) return result.data;

    result = await supabase
      .from("profiles")
      .select("id,email,full_name,role,subscription_status,subscription_plan,subscription_expires_at,created_at")
      .eq("email", userEmail)
      .maybeSingle();

    if (result.error) console.error("Profile load by email error:", result.error);
    if (result.data) return result.data;

    if (userEmail === ADMIN_EMAIL) {
      return {
        id: user.id,
        email: userEmail,
        full_name: "Munashe Alexander Shitto",
        role: "admin",
        subscription_status: "active",
        subscription_plan: "admin",
        subscription_expires_at: null,
      };
    }

    return {
      id: user.id,
      email: userEmail,
      full_name: userEmail.split("@")[0],
      role: "free",
      subscription_status: "inactive",
      subscription_plan: "free",
      subscription_expires_at: null,
    };
  }

  async function loadSignals() {
    const { data, error } = await supabase
      .from("signals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Signal loading error:", error);
      setSignals([]);
      return [];
    }

    setSignals(data || []);
    return data || [];
  }

  async function closeSignal(signalId, result) {
  const shouldCloseTrade = ["tp3", "sl"].includes(result);

  const updatePayload = shouldCloseTrade
    ? {
        status: "closed",
        result,
        closed_at: new Date().toISOString(),
      }
    : {
        status: "active",
        result,
        closed_at: null,
      };

  const { error } = await supabase
    .from("signals")
    .update(updatePayload)
    .eq("id", signalId);

  if (error) {
    alert("Failed to update signal: " + error.message);
    return;
  }

  await loadSignals();
}

  async function reopenSignal(signalId) {
    const { error } = await supabase
      .from("signals")
      .update({
        status: "active",
        result: null,
        closed_at: null,
        close_note: null,
      })
      .eq("id", signalId);

    if (error) {
      alert("Failed to reopen signal: " + error.message);
      return;
    }

    await loadSignals();
  }

  async function loadUsers() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id,email,full_name,role,subscription_status,subscription_plan,subscription_expires_at,created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Users load error:", error);
      setUsers([]);
      return [];
    }

    setUsers(data || []);
    return data || [];
  }

  async function loadPayments() {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Payments load error:", error);
      setPayments([]);
      return [];
    }

    setPayments(data || []);
    return data || [];
  }

  async function loadNotifications() {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Notifications load error:", error);
      setNotifications([]);
      return [];
    }

    setNotifications(data || []);
    return data || [];
  }

  async function refreshForRole(currentProfile) {
    await loadSignals();
    await loadNotifications();

    if (currentProfile?.role === "admin" || currentProfile?.email === ADMIN_EMAIL) {
      await loadUsers();
      await loadPayments();
    }
  }

  async function handleAuthSuccess(newSession) {
    const user = newSession?.user;

    if (!user) {
      setAuthError("No user returned from Supabase login.");
      return;
    }

    const email = (user.email || "").toLowerCase().trim();

    const fallbackProfile = {
      id: user.id,
      email,
      full_name: email.split("@")[0],
      role: email === ADMIN_EMAIL ? "admin" : "free",
      subscription_status: email === ADMIN_EMAIL ? "active" : "inactive",
      subscription_plan: email === ADMIN_EMAIL ? "admin" : "free",
      subscription_expires_at: null,
    };

    setSession(newSession);
    setProfile(fallbackProfile);
    setAuthError("");

    const fallbackRole = getAllowedRole(fallbackProfile, newSession);

    setActive(
      fallbackRole === "Admin"
        ? "Admin Command Centre"
        : fallbackRole === "VIP Elite"
        ? "VIP Dashboard"
        : "Dashboard"
    );

    try {
      const currentProfile = await Promise.race([
        loadProfile(user),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Profile loading timed out, using temporary access.")), 8000)
        ),
      ]);

      setProfile(currentProfile);

      const nextRole = getAllowedRole(currentProfile, newSession);

      setActive(
        nextRole === "Admin"
          ? "Admin Command Centre"
          : nextRole === "VIP Elite"
          ? "VIP Dashboard"
          : "Dashboard"
      );

      await refreshForRole(currentProfile);
    } catch (error) {
      console.error("Post-login loading error:", error);
      setAuthError(error.message || "Logged in, but some dashboard data could not load.");

      try {
        await loadSignals();
        await loadNotifications();
      } catch (loadError) {
        console.error("Post-login fallback loading failed:", loadError);
      }
    }
  }

  useEffect(() => {
    let mounted = true;

    async function start() {
      try {
        const { data } = await supabase.auth.getSession();
        const currentSession = data?.session || null;

        if (!mounted) return;

        if (!currentSession?.user) {
          setSession(null);
          setProfile(null);
          setActive("Home");
          return;
        }

        const currentProfile = await loadProfile(currentSession.user);

        if (!mounted) return;

        setSession(currentSession);
        setProfile(currentProfile);

        const nextRole = getAllowedRole(currentProfile, currentSession);

        setActive(
          nextRole === "Admin"
            ? "Admin Command Centre"
            : nextRole === "VIP Elite"
            ? "VIP Dashboard"
            : "Dashboard"
        );

        await refreshForRole(currentProfile);
      } catch (error) {
        console.error("Startup error:", error);
        if (mounted) setAuthError(error.message || "Could not start app.");
      }
    }

    start();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!nextSession?.user) {
        setSession(null);
        setProfile(null);
        setSignals([]);
        setUsers([]);
        setPayments([]);
        setNotifications([]);
        setActive("Home");
        return;
      }

      await handleAuthSuccess(nextSession);
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const allowedNav = navByRole[role] || navByRole.Public;

    if (!allowedNav.includes(active)) {
      setActive(allowedNav[0]);
    }
  }, [role, active]);

  async function handleSignOut() {
  setSession(null);
  setProfile(null);
  setSignals([]);
  setUsers([]);
  setPayments([]);
  setNotifications([]);
  setAuthError("");
  setActive("Home");

  localStorage.removeItem("ixt_active_page");

  Object.keys(localStorage).forEach((key) => {
    if (
      key.startsWith("sb-") ||
      key.toLowerCase().includes("supabase") ||
      key.toLowerCase().includes("auth")
    ) {
      localStorage.removeItem(key);
    }
  });

  sessionStorage.clear();

  try {
    await Promise.race([
      supabase.auth.signOut(),
      new Promise((resolve) => setTimeout(resolve, 2500)),
    ]);
  } catch (error) {
    console.error("Sign out error:", error);
  }

  window.location.reload();
}

  const content = useMemo(() => {
    if (active === "Notifications") {
      return <NotificationCenter notifications={notifications} onRefresh={loadNotifications} />;
    }

    if (role === "Admin") {
      const adminProps = {
        signals,
        onSignalCreated: async () => {
          await loadSignals();
          await loadNotifications();
        },
        onCloseSignal: closeSignal,
        onReopenSignal: reopenSignal,
        users,
        onUsersUpdated: loadUsers,
        payments,
        onPaymentsUpdated: async () => {
          await loadPayments();
          await loadUsers();
        },
        setActive,
      };

      if (active === "Community Manager") return <CommunityHub />;
      if (active === "Signal Manager") return <AdminPanel title="Signal Manager" {...adminProps} />;
      if (active === "Subscription Manager") return <AdminPanel title="Subscription Manager" {...adminProps} />;
      if (active === "Broadcast Centre") return <AdminPanel title="Broadcast Centre" {...adminProps} />;
      if (active === "Results Manager") return <AdminPanel title="Results Manager" {...adminProps} />;

      if (active === "Content Manager") {
        return <SimplePage title="Content Manager" description="Manage education, courses, and lessons." />;
      }

      if (active === "Tools Manager") {
        return <SimplePage title="Tools Manager" description="Manage indicators, EA tools, scripts, and files." />;
      }

      if (active === "Partnerships") {
        return <SimplePage title="Partnerships" description="Manage prop firms, liquidity partners, and growth campaigns." />;
      }

      return <AdminPanel title="Admin Command Centre" {...adminProps} />;
    }

    if (role === "VIP Elite") {
      if (active === "Community Hub") return <CommunityHub />;
      if (active === "Signal Hub") return <SignalHub signals={signals} setActive={setActive} />;
      if (active === "Market Matrix") {
  return (
    <SimplePage
      title="Market Matrix"
      description="Live chart workspace for XAUUSD, forex pairs, and market structure review."
    >
      <TradingViewChart symbol="OANDA:XAUUSD" />
    </SimplePage>
  );
}
      if (active === "Tool Repository") return <SimplePage title="Tool Repository" description="VIP tools and downloads." />;
      if (active === "Coaching and Education") return <SimplePage title="Coaching and Education" description="VIP education modules." />;
      if (active === "Events and Webinars") return <SimplePage title="Events and Webinars" description="Live sessions and workshops." />;
      if (active === "Elite Circle") return <SimplePage title="Elite Circle" description="Private elite member room." />;

      return <Dashboard role={role} signals={signals} setActive={setActive} />;
    }

    if (role === "Free Member") {
      if (active === "Community Hub") return <CommunityHub />;
      if (active === "Beginner Education") return <SimplePage title="Beginner Education" description="Free learning path." />;

      if (active === "Upgrade") {
        return (
          <SimplePage title="Upgrade to VIP Elite" description="Submit a manual payment request for admin approval.">
            <PaymentRequestPanel profile={profile} onSubmitted={loadPayments} />
          </SimplePage>
        );
      }

      return <Dashboard role={role} locked signals={signals} setActive={setActive} />;
    }

    if (active === "Community") return <CommunityHub />;
    if (active === "Pricing") return <SimplePage title="Pricing" description="Free, VIP Monthly, and VIP Elite plans." />;
    if (active === "Education") return <SimplePage title="Education" description="Beginner public education." />;
    if (active === "Market Preview") return <Dashboard role="Public" locked signals={signals} setActive={setActive} />;

    return <SimplePage title="Home" description="Welcome to INFINITY X TRADERS." />;
  }, [role, active, signals, users, payments, notifications, profile]);

  if (!session) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} authError={authError} />;
  }

  const unreadCount = notifications.filter((item) => item.status === "pending").length;

  return (
    <Shell
      role={role}
      profile={profile}
      active={active}
      setActive={setActive}
      onSignOut={handleSignOut}
      notificationsCount={unreadCount}
    >
      {authError ? (
        <div className="mb-5 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200">
          {authError}
        </div>
      ) : null}

      {content}
    </Shell>
  );
}
