"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
	ArrowRight,
	BadgeCheck,
	BriefcaseBusiness,
	Check,
	Code2,
	Database,
	Gem,
	LockKeyhole,
	Mail,
	Menu,
	Moon,
	Rocket,
	Shield,
	Sun,
	Target,
	Users,
	X,
	Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const nav = [
	{ label: "Benefits", href: "#benefits" },
	{ label: "Rules", href: "#rules" },
	{ label: "FAQ", href: "#faq" }
];

const professions = [
	"Backend Engineer",
	"Frontend Engineer",
	"Full-stack Engineer",
	"Student",
	"Founder",
	"Indie Hacker",
	"Data Engineer",
	"Product Builder"
];

const benefits = [
	{ icon: Gem, title: "Beta Premium indefinitely", text: "Selected testers keep premium access while the beta programme runs." },
	{ icon: Zap, title: "Use SparkDB early", text: "Spin up real isolated databases before the public rollout opens wider." },
	{ icon: Users, title: "Build close to the team", text: "Your feedback shapes the editor, dashboard, APIs, and deploy flow." }
];

const faqs = [
	["Who should apply?", "Builders who can test SparkDB in a real project and send useful feedback."],
	["How many testers?", "We are starting small, with 10 serious beta testers."],
	["When does beta start?", "The beta date and next steps will be sent by email."]
];

export default function Home() {
	const [menuOpen, setMenuOpen] = useState(false);
	const [theme, setTheme] = useState("light");
	const [form, setForm] = useState({ full_name: "", email: "", profession: "" });
	const [slots, setSlots] = useState({ total: 10, taken: 0, remaining: 10 });
	const [status, setStatus] = useState({ type: "", message: "" });
	const [successOpen, setSuccessOpen] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		const saved = localStorage.getItem("spark-beta-theme") || "light";
		setTheme(saved);
		document.documentElement.dataset.theme = saved;
		fetchSlots();
		const timer = window.setInterval(fetchSlots, 12000);
		return () => window.clearInterval(timer);
	}, []);

	function toggleTheme() {
		const next = theme === "dark" ? "light" : "dark";
		setTheme(next);
		localStorage.setItem("spark-beta-theme", next);
		document.documentElement.dataset.theme = next;
	}

	async function fetchSlots() {
		try {
			const response = await fetch("/api/beta/slots", { cache: "no-store" });
			const data = await response.json();
			if (response.ok) {
				setSlots(data);
			}
		} catch {}
	}

	async function submit(event) {
		event.preventDefault();
		setSubmitting(true);
		setStatus({ type: "", message: "" });
		try {
			const response = await fetch("/api/beta/signup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form)
			});
			const data = await response.json();
			if (!response.ok) {
				setStatus({ type: "error", message: data.message || "Could not join the beta list right now." });
				return;
			}
			setSlots(data.slots || slots);
			setSuccessOpen(true);
			setForm({ full_name: "", email: "", profession: "" });
			fetchSlots();
		} catch {
			setStatus({ type: "error", message: "Could not reach SparkDB beta right now." });
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<main className="min-h-screen overflow-hidden text-[var(--ink)]">
			<header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--surface)] backdrop-blur-2xl">
				<div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
					<a href="#" className="flex items-center gap-3" aria-label="SparkDB Beta home">
						<span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--wash)] ring-1 ring-[var(--line)]">
							<Image src="/spark.png" alt="" width={30} height={30} priority />
						</span>
						<span className="text-2xl font-black tracking-[-0.03em]">Spark<span className="text-[var(--violet)]">DB</span></span>
					</a>
					<nav className="hidden items-center gap-7 md:flex">
						{nav.map((item) => (
							<a key={item.href} href={item.href} className="text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--ink)]">
								{item.label}
							</a>
						))}
						<ThemeButton theme={theme} toggleTheme={toggleTheme} />
						<Button asChild>
							<a href="#apply">Apply for Beta</a>
						</Button>
					</nav>
					<div className="flex items-center gap-2 md:hidden">
						<ThemeButton theme={theme} toggleTheme={toggleTheme} />
						<button type="button" className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--line)] bg-[var(--surface-strong)]" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle navigation">
							{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
						</button>
					</div>
				</div>
				{menuOpen && (
					<div className="glass mx-5 mb-4 rounded-2xl p-3 md:hidden">
						{nav.map((item) => (
							<a key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-semibold text-[var(--muted)] hover:bg-[var(--wash)]">
								{item.label}
							</a>
						))}
						<a href="#apply" onClick={() => setMenuOpen(false)} className="mt-2 flex h-12 items-center justify-center rounded-xl bg-[var(--violet)] text-sm font-bold text-white">
							Apply for Beta
						</a>
					</div>
				)}
			</header>

			<section className="mx-auto grid max-w-7xl gap-12 px-4 pb-6 pt-8 sm:px-8 sm:pb-10 sm:pt-14 lg:grid-cols-[.9fr_1.1fr] lg:px-10 lg:pb-16 lg:pt-20">
				<div className="flex flex-col justify-center">
					<div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--violet)] backdrop-blur-xl sm:mb-7">
						<Zap className="h-4 w-4" />
						Beta programme
					</div>
					<h1 className="max-w-3xl text-balance text-[2.65rem] font-black leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
						Help shape the future of <span className="text-[var(--violet)]">instant databases</span>
					</h1>
					<p className="mt-5 max-w-xl text-base leading-7 text-[var(--muted)] sm:mt-7 sm:text-lg sm:leading-8">
						SparkDB gives you isolated databases in seconds, with less infrastructure work and more shipping energy.
					</p>
					<div className="mt-6 grid max-w-xl grid-cols-1 gap-3 sm:mt-9 sm:grid-cols-3">
						<Mini icon={Zap} label="Instant" />
						<Mini icon={Shield} label="Isolated" />
						<Mini icon={Code2} label="Just code" />
					</div>
				</div>
				<HeroVisual />
			</section>

			<section id="apply" className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-10">
				<div className="glass grid gap-5 rounded-2xl p-3 sm:gap-7 sm:p-7 lg:grid-cols-[1.3fr_.8fr] lg:p-8">
					<form onSubmit={submit} className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 backdrop-blur-xl sm:rounded-2xl sm:p-7">
						<div className="mb-7 flex items-center gap-4">
							<span className="grid h-[52px] w-[52px] place-items-center rounded-xl bg-[var(--wash)] text-[var(--violet)] ring-1 ring-[var(--line)]">
								<Users className="h-7 w-7" />
							</span>
							<div>
								<h2 className="text-xl font-black tracking-[-0.03em] sm:text-2xl">Apply for SparkDB Beta</h2>
								<p className="mt-1 text-sm text-[var(--muted)]">Be one of {slots.total} developers to get early access.</p>
							</div>
						</div>
						<div className="space-y-5">
							<Field label="Full Name" icon={Users}>
								<Input value={form.full_name} onChange={(event) => setForm((draft) => ({ ...draft, full_name: event.target.value }))} placeholder="Enter your full name" required minLength={2} maxLength={80} />
							</Field>
							<Field label="Email Address" icon={Mail}>
								<Input value={form.email} onChange={(event) => setForm((draft) => ({ ...draft, email: event.target.value }))} placeholder="Enter your email address" type="email" required maxLength={254} />
							</Field>
							<Field label="Profession / Role" icon={BriefcaseBusiness}>
								<Select value={form.profession} onValueChange={(value) => setForm((draft) => ({ ...draft, profession: value }))}>
									<SelectTrigger>
										<SelectValue placeholder="Choose your role" />
									</SelectTrigger>
									<SelectContent>
										{professions.map((role) => (
											<SelectItem key={role} value={role}>{role}</SelectItem>
										))}
									</SelectContent>
								</Select>
							</Field>
						</div>
						<Button className="mt-6 h-[52px] w-full text-base" disabled={submitting || slots.remaining <= 0}>
							{submitting ? "Submitting..." : slots.remaining <= 0 ? "Beta list is full" : "Submit Application"}
							{submitting ? <Rocket className="h-5 w-5 animate-pulse" /> : <ArrowRight className="h-5 w-5" />}
						</Button>
						{status.message && (
							<div className="mt-5 rounded-xl border border-red-500/15 bg-red-500/8 px-4 py-3 text-sm font-semibold text-[var(--danger)]">
								{status.message}
							</div>
						)}
						<div className="mt-5 flex flex-wrap gap-5 text-sm text-[var(--soft)]">
							<span className="inline-flex items-center gap-2"><LockKeyhole className="h-4 w-4" /> Takes less than 1 minute.</span>
							<span className="inline-flex items-center gap-2"><BadgeCheck className="h-4 w-4" /> You will hear back if selected.</span>
						</div>
					</form>
					<SlotPanel slots={slots} />
				</div>
			</section>

			<section id="benefits" className="mx-auto grid max-w-7xl gap-5 px-5 py-10 sm:px-8 lg:grid-cols-2 lg:px-10">
				<div className="glass rounded-2xl p-5 sm:p-8">
					<h2 className="text-2xl font-black tracking-[-0.03em]">Benefits of the <span className="text-[var(--violet)]">@sparkdb_space</span> beta</h2>
					<div className="mt-8 space-y-6">
						{benefits.map((item) => <Benefit key={item.title} {...item} />)}
					</div>
				</div>
				<div id="rules" className="glass rounded-2xl p-5 sm:p-8">
					<div className="mb-7 flex items-center gap-4">
						<span className="grid h-12 w-12 place-items-center rounded-xl bg-[var(--wash)] text-[var(--violet)] ring-1 ring-[var(--line)]">
							<Shield className="h-6 w-6" />
						</span>
						<h2 className="text-2xl font-black tracking-[-0.03em]">Rules</h2>
					</div>
					<div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6">
						<div className="flex gap-5">
							<Target className="mt-1 h-14 w-14 shrink-0 text-[var(--violet)]" />
							<p className="text-lg font-semibold leading-8">You must build one project with a database from SparkDB. Use AI if you like, just make the feedback real.</p>
						</div>
					</div>
					<div className="mt-5 rounded-xl border border-[var(--line)] bg-[var(--wash)] px-5 py-4 font-black text-[var(--violet)]">
						{slots.remaining} of {slots.total} slots remaining
					</div>
				</div>
			</section>

			<section id="faq" className="mx-auto max-w-7xl px-5 pb-8 sm:px-8 lg:px-10">
				<div className="glass rounded-2xl p-5 sm:p-8">
					<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
						<div>
							<p className="text-sm font-black uppercase tracking-[0.14em] text-[var(--violet)]">FAQ</p>
							<h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">Before you apply</h2>
						</div>
						<Button variant="secondary" asChild>
							<a href="#apply">Apply now</a>
						</Button>
					</div>
					<div className="mt-7 grid gap-4 md:grid-cols-3">
						{faqs.map(([q, a]) => (
							<div key={q} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
								<h3 className="font-black">{q}</h3>
								<p className="mt-3 text-sm leading-6 text-[var(--muted)]">{a}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<footer className="mx-auto flex max-w-7xl flex-col gap-4 px-5 pb-8 pt-2 text-sm text-[var(--soft)] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
				<div className="flex items-center gap-3">
					<Image src="/spark.png" alt="" width={28} height={28} />
					<span>Build early. Ship faster. Make an impact.</span>
				</div>
				<span>© 2026 SparkDB</span>
			</footer>

			{successOpen && <SuccessModal slots={slots} close={() => setSuccessOpen(false)} />}
		</main>
	);
}

function ThemeButton({ theme, toggleTheme }) {
	return (
		<button type="button" onClick={toggleTheme} className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] text-[var(--ink)]" aria-label="Toggle theme">
			{theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
		</button>
	);
}

function Mini({ icon: Icon, label }) {
	return (
		<div className="glass flex items-center gap-3 rounded-xl px-4 py-3">
			<span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--wash)] text-[var(--violet)]">
				<Icon className="h-4 w-4" />
			</span>
			<span className="text-sm font-black">{label}</span>
		</div>
	);
}

function Field({ label, icon: Icon, children }) {
	return (
		<label className="block">
			<span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{label}</span>
			<span className="relative block">
				<Icon className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-[var(--soft)]" />
				<span className="block [&_button]:pl-12 [&_input]:pl-12">{children}</span>
			</span>
		</label>
	);
}

function SlotPanel({ slots }) {
	return (
		<div className="hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 backdrop-blur-xl sm:p-8 lg:block">
			<div className="grid h-20 w-20 place-items-center rounded-2xl bg-[var(--surface-strong)] text-[var(--violet)] shadow-xl shadow-violet-950/10 ring-1 ring-[var(--line)]">
				<Target className="h-10 w-10" />
			</div>
			<h3 className="mt-8 text-2xl font-black tracking-[-0.03em] text-[var(--violet)]">
				{slots.remaining} of {slots.total} slots remaining
			</h3>
			<p className="mt-2 text-[var(--muted)]">Quality over quantity. We want people who can actually test the product in motion.</p>
			<div className="my-8 h-px bg-[var(--line)]" />
			<h4 className="font-black">What we are looking for:</h4>
			<div className="mt-5 space-y-4">
				<CheckLine text="Builders who can ship fast" />
				<CheckLine text="People willing to test and give feedback" />
				<CheckLine text="Developers who can build one real project" />
			</div>
		</div>
	);
}

function CheckLine({ text }) {
	return (
		<div className="flex gap-3 text-[var(--muted)]">
			<span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--violet)] text-white">
				<Check className="h-4 w-4" />
			</span>
			<span>{text}</span>
		</div>
	);
}

function Benefit({ icon: Icon, title, text }) {
	return (
		<div className="flex gap-5">
			<span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[var(--wash)] text-[var(--violet)] ring-1 ring-[var(--line)]">
				<Icon className="h-7 w-7" />
			</span>
			<div>
				<h3 className="font-black">{title}</h3>
				<p className="mt-1 leading-7 text-[var(--muted)]">{text}</p>
			</div>
		</div>
	);
}

function SuccessModal({ slots, close }) {
	return (
		<div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-5 backdrop-blur-sm" role="dialog" aria-modal="true">
			<div className="glass-strong w-full max-w-md rounded-2xl p-6 text-center">
				<div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[var(--wash)] text-[var(--violet)] ring-1 ring-[var(--line)]">
					<BadgeCheck className="h-9 w-9" />
				</div>
				<h2 className="mt-5 text-2xl font-black tracking-[-0.03em]">You are on the SparkDB beta list</h2>
				<p className="mt-3 leading-7 text-[var(--muted)]">Your spot has been saved. We will email the beta date and next steps soon.</p>
				<div className="mt-5 rounded-xl border border-[var(--line)] bg-[var(--wash)] px-4 py-3 text-sm font-bold text-[var(--violet)]">
					{slots.remaining} slots remaining
				</div>
				<Button className="mt-6 w-full" onClick={close}>Done</Button>
			</div>
		</div>
	);
}

function HeroVisual() {
	const rows = [
		["kaima", "Postgres", "Active"],
		["haki", "Postgres", "Paused"],
		["prod_db", "Mongodb", "Active"]
	];
	return (
		<div className="relative hidden min-h-[440px] lg:block lg:min-h-[520px]">
			<div className="absolute left-[7%] top-[7%] h-[72%] w-[80%] rounded-[40px] border border-dashed border-[var(--line)]" />
			<div className="glass-strong absolute right-0 top-8 w-full max-w-[620px] overflow-hidden rounded-2xl">
				<div className="flex h-14 items-center justify-between border-b border-[var(--line)] bg-[linear-gradient(90deg,rgba(45,11,116,.92),rgba(100,40,234,.86))] px-5 text-white">
					<div className="flex items-center gap-3">
						<Image src="/spark.png" alt="" width={28} height={28} />
						<span className="font-black">SparkDB</span>
					</div>
					<div className="flex gap-2">
						<span className="h-8 w-20 rounded-lg bg-white/14" />
						<span className="h-8 w-8 rounded-lg bg-white/14" />
					</div>
				</div>
				<div className="grid grid-cols-[92px_1fr]">
					<div className="space-y-4 border-r border-[var(--line)] bg-[var(--wash)] p-4">
						{[Database, Shield, Code2, Users].map((Icon, index) => (
							<div key={index} className="flex items-center gap-3">
								<Icon className="h-5 w-5 text-[var(--violet)]" />
								<div className="h-2 w-8 rounded-full bg-[var(--line)]" />
							</div>
						))}
					</div>
					<div className="p-5">
						<div className="mb-4 flex items-center justify-between">
							<h3 className="font-black">Databases</h3>
							<div className="flex overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs font-bold">
								<span className="bg-[var(--violet)] px-3 py-2 text-white">Overview</span>
								<span className="px-3 py-2 text-[var(--muted)]">Editor</span>
								<span className="px-3 py-2 text-[var(--muted)]">SDK</span>
							</div>
						</div>
						<div className="grid grid-cols-3 gap-3">
							{["Total 3", "Active 2", "Paused 1"].map((item) => (
								<div key={item} className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 text-sm font-black">{item}</div>
							))}
						</div>
						<div className="mt-4 overflow-hidden rounded-xl border border-[var(--line)]">
							<div className="grid grid-cols-[1.1fr_.9fr_.8fr] bg-[var(--wash)] px-4 py-3 text-xs font-black uppercase tracking-[0.08em] text-[var(--soft)]">
								<span>Database</span>
								<span>Type</span>
								<span>Status</span>
							</div>
							{rows.map(([name, type, state]) => (
								<div key={name} className="grid grid-cols-[1.1fr_.9fr_.8fr] items-center border-t border-[var(--line)] px-4 py-4 text-sm">
									<span className="flex items-center gap-3 font-black">
										<span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--wash)] text-[var(--violet)]"><Database className="h-4 w-4" /></span>
										{name}
									</span>
									<span>{type}</span>
									<span className={state === "Active" ? "text-[var(--success)]" : "text-amber-500"}>{state}</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
			<div className="glass-strong absolute bottom-8 right-2 w-[78%] max-w-[350px] rounded-2xl p-5 sm:right-8">
				<div className="flex items-center justify-between gap-4">
					<div>
						<p className="font-black">db_beta_launch</p>
						<p className="mt-1 flex items-center gap-2 text-sm text-[var(--muted)]">
							<span className="h-3 w-3 rounded-full bg-[var(--success)]" />
							Connected
						</p>
					</div>
					<span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--wash)] text-[var(--violet)]">
						<Code2 className="h-5 w-5" />
					</span>
				</div>
			</div>
		</div>
	);
}
