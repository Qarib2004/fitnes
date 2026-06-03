import { NextResponse } from "next/server";
import { backendAuthGet } from "@/lib/api/auth-server";
import { getApiErrorMessage } from "@/lib/api/server";
import type { ScheduleSlot } from "@/features/schedule/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    const { data } = await backendAuthGet<ScheduleSlot[]>("/schedule", {
      weekStart: searchParams.get("weekStart"),
      trainerId: searchParams.get("trainerId") || undefined,
      classId: searchParams.get("classId") || undefined,
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: getApiErrorMessage(error) },
      { status: 400 },
    );
  }
}
