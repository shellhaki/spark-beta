"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Menu, Moon, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const nav = [
	{ label: "apply", href: "#apply" },
	{ label: "rules", href: "#rules" },
	{ label: "faq", href: "#faq" }
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

const notes = [
	"Selected testers keep beta premium access while the programme runs.",
	"You will be expected to build one real project with a SparkDB database.",
	"We are looking for clear feedback, rough edges, bugs, and missing workflows."
];

const faqs = [
	["who should apply?", "Builders who can test SparkDB in a real project and send practical feedback."],
	["how many testers?", "The first round is capped at 10 testers."],
	["when does it start?", "The beta date and next steps will be sent by email."]
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
		<main className="min-h-screen w-full overflow-x-hidden px-3 py-3 text-[var(--ink)] sm:px-5 sm:py-5">
			<div className="mx-auto w-full max-w-5xl">
				<header className="panel sticky top-3 z-40 flex items-center justify-between rounded-lg px-3 py-3 sm:px-4">
					<a href="#" className="flex min-w-0 items-center gap-2" aria-label="SparkDB Beta home">
						<Image src="/spark.png" alt="" width={28} height={28} priority />
						<span className="truncate text-base font-bold tracking-[-0.04em] sm:text-lg">SparkDB / beta</span>
					</a>
					<nav className="hidden items-center gap-1 md:flex">
						{nav.map((item) => (
							<a key={item.href} href={item.href} className="rounded-md px-3 py-2 text-sm text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--ink)]">
								{item.label}
							</a>
						))}
						<ThemeButton theme={theme} toggleTheme={toggleTheme} />
					</nav>
					<div className="flex items-center gap-2 md:hidden">
						<ThemeButton theme={theme} toggleTheme={toggleTheme} />
						<button type="button" className="grid h-9 w-9 place-items-center rounded-md border border-[var(--line)] bg-[var(--panel)]" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle navigation">
							{menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
						</button>
					</div>
				</header>

				{menuOpen && (
					<div className="panel mt-2 rounded-lg p-2 md:hidden">
						{nav.map((item) => (
							<a key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="block rounded-md px-3 py-2 text-sm text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--ink)]">
								{item.label}
							</a>
						))}
					</div>
				)}

				<section className="grid gap-4 py-5 sm:py-8 lg:grid-cols-[0.82fr_1fr] lg:gap-5">
					<div className="panel rounded-lg p-4 sm:p-6">
						<p className="text-xs uppercase tracking-[0.18em] text-[var(--soft)]">beta programme</p>
						<h1 className="mt-5 max-w-xl text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.08em] sm:text-5xl lg:text-6xl">
							build with SparkDB before everyone else.
						</h1>
						<p className="mt-5 max-w-lg text-sm leading-7 text-[var(--muted)] sm:text-base">
							We are opening a small beta for builders who can test real database workflows and tell us what breaks, what feels slow, and what should exist next.
						</p>
						<div className="mt-6 grid grid-cols-2 gap-2 text-sm sm:max-w-md">
							<Stat label="slots" value={`${slots.remaining}/${slots.total}`} />
							<Stat label="status" value={slots.remaining > 0 ? "open" : "full"} />
						</div>
					</div>

					<section id="apply" className="panel-strong rounded-lg p-4 sm:p-6">
						<div className="mb-5 flex items-start justify-between gap-4">
							<div>
								<p className="text-xs uppercase tracking-[0.18em] text-[var(--soft)]">application</p>
								<h2 className="mt-2 text-2xl font-semibold tracking-[-0.06em]">Apply for beta</h2>
							</div>
							<span className="shrink-0 rounded-md border border-[var(--line)] px-2 py-1 text-xs text-[var(--muted)]">{slots.remaining} left</span>
						</div>
						<form onSubmit={submit} className="space-y-4">
							<Field label="full name">
								<Input value={form.full_name} onChange={(event) => setForm((draft) => ({ ...draft, full_name: event.target.value }))} placeholder="Maxwell Excel" required minLength={2} maxLength={80} />
							</Field>
							<Field label="email address">
								<Input value={form.email} onChange={(event) => setForm((draft) => ({ ...draft, email: event.target.value }))} placeholder="you@company.com" type="email" required maxLength={254} />
							</Field>
							<Field label="role">
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
							<Button className="w-full" disabled={submitting || slots.remaining <= 0}>
								{submitting ? "submitting" : slots.remaining <= 0 ? "beta list full" : "submit application"}
								<ArrowRight className="h-4 w-4" />
							</Button>
							{status.message && (
								<div className="rounded-md border border-[var(--danger)]/25 px-3 py-2 text-sm text-[var(--danger)]">
									{status.message}
								</div>
							)}
						</form>
					</section>
				</section>

				<section id="rules" className="grid gap-4 pb-4 lg:grid-cols-2">
					<div className="panel rounded-lg p-4 sm:p-6">
						<h2 className="text-lg font-semibold tracking-[-0.04em]">rules</h2>
						<div className="mt-5 space-y-3">
							<Line text="Build one project using a SparkDB database." />
							<Line text="Send honest feedback while you build." />
							<Line text="Report bugs, missing pieces, and confusing flows." />
							<Line text="No fake signups. One application per email." />
						</div>
					</div>
					<div className="panel rounded-lg p-4 sm:p-6">
						<h2 className="text-lg font-semibold tracking-[-0.04em]">extra info</h2>
						<div className="mt-5 space-y-3">
							{notes.map((note) => <Line key={note} text={note} />)}
						</div>
					</div>
				</section>

				<section id="faq" className="panel rounded-lg p-4 sm:p-6">
					<h2 className="text-lg font-semibold tracking-[-0.04em]">faq</h2>
					<div className="mt-5 grid gap-3 md:grid-cols-3">
						{faqs.map(([question, answer]) => (
							<div key={question} className="rounded-md border border-[var(--line)] p-3">
								<h3 className="text-sm font-semibold">{question}</h3>
								<p className="mt-2 text-sm leading-6 text-[var(--muted)]">{answer}</p>
							</div>
						))}
					</div>
				</section>

				<footer className="flex flex-col gap-2 py-5 text-xs text-[var(--soft)] sm:flex-row sm:items-center sm:justify-between">
					<span>© 2026 SparkDB</span>
					<span>build early. ship clean.</span>
				</footer>
			</div>

			{successOpen && <SuccessModal slots={slots} close={() => setSuccessOpen(false)} />}
		</main>
	);
}

function ThemeButton({ theme, toggleTheme }) {
	return (
		<button type="button" onClick={toggleTheme} className="grid h-9 w-9 place-items-center rounded-md border border-[var(--line)] bg-[var(--panel)]" aria-label="Toggle theme">
			{theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
		</button>
	);
}

function Field({ label, children }) {
	return (
		<label className="block">
			<span className="mb-2 block text-xs uppercase tracking-[0.12em] text-[var(--soft)]">{label}</span>
			{children}
		</label>
	);
}

function Stat({ label, value }) {
	return (
		<div className="rounded-md border border-[var(--line)] bg-[var(--field)] p-3">
			<p className="text-xs uppercase tracking-[0.12em] text-[var(--soft)]">{label}</p>
			<p className="mt-2 text-lg font-semibold">{value}</p>
		</div>
	);
}

function Line({ text }) {
	return (
		<div className="flex gap-3 text-sm leading-6 text-[var(--muted)]">
			<Check className="mt-1 h-4 w-4 shrink-0 text-[var(--accent)]" />
			<span>{text}</span>
		</div>
	);
}

function SuccessModal({ slots, close }) {
	return (
		<div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-3 backdrop-blur-sm" role="dialog" aria-modal="true">
			<div className="panel-strong w-full max-w-sm rounded-lg p-5">
				<p className="text-xs uppercase tracking-[0.18em] text-[var(--soft)]">submitted</p>
				<h2 className="mt-3 text-2xl font-semibold tracking-[-0.06em]">you are on the SparkDB beta list.</h2>
				<p className="mt-3 text-sm leading-6 text-[var(--muted)]">Your spot has been saved. We will email the beta date and next steps soon.</p>
				<p className="mt-4 rounded-md border border-[var(--line)] px-3 py-2 text-sm text-[var(--muted)]">{slots.remaining} slots remaining</p>
				<Button className="mt-4 w-full" onClick={close}>done</Button>
			</div>
		</div>
	);
}
