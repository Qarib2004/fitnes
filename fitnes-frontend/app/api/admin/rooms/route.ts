import { NextResponse } from "next/server";
import { backendAuthGet, backendAuthPost } from "@/lib/api/auth-server";
import { getApiErrorMessage } from "@/lib/api/server";
import type { AdminRoom } from "@/features/admin/types";

export async function GET() {
  try {
    const { data } = await backendAuthGet<AdminRoom[]>("/rooms");
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: getApiErrorMessage(error) },
      { status: 400 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data } = await backendAuthPost<AdminRoom>("/admin/rooms", body);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: getApiErrorMessage(error) },
      { status: 400 },
    );
  }
}
