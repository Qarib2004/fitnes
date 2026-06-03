import { NextResponse } from "next/server";
import { backendAuthPost } from "@/lib/api/auth-server";
import { getApiErrorMessage } from "@/lib/api/server";
import type { ScheduleSlot } from "@/features/schedule/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data } = await backendAuthPost<ScheduleSlot>(
      "/admin/schedule",
      body,
    );
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: getApiErrorMessage(error) },
      { status: 400 },
    );
  }
}
