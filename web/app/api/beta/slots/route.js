import { NextResponse } from "next/server";

export async function GET() {
	const api = process.env.BETA_API_URL || "http://127.0.0.1:3111";
	try {
		const response = await fetch(`${api}/api/beta/slots`, { cache: "no-store" });
		const data = await response.json().catch(() => ({ total: 10, taken: 0, remaining: 10 }));
		return NextResponse.json(data, { status: response.status });
	} catch {
		return NextResponse.json({ total: 10, taken: 0, remaining: 10 }, { status: 200 });
	}
}
