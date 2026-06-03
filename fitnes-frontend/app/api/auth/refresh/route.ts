import { NextResponse } from "next/server";
import { refreshAccessToken } from "@/lib/api/auth-server";

export async function POST() {
  const token = await refreshAccessToken();

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
