import { NextResponse } from "next/server";

export async function POST(request) {
	const payload = await request.json().catch(() => null);
	if (!payload) {
		return NextResponse.json({ message: "Send full name, email, and profession as JSON." }, { status: 400 });
	}
	const api = process.env.BETA_API_URL || "http://127.0.0.1:3111";
	try {
		const response = await fetch(`${api}/api/beta/signup`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
			cache: "no-store"
		});
		const data = await response.json().catch(() => ({ message: "Could not join the beta list right now." }));
		return NextResponse.json(data, { status: response.status });
	} catch {
		return NextResponse.json({ message: "Could not reach SparkDB beta right now." }, { status: 502 });
	}
}
