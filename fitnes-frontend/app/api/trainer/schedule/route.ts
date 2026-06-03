import { NextResponse } from "next/server";
import { backendAuthGet } from "@/lib/api/auth-server";
import { getApiErrorMessage } from "@/lib/api/server";
import type { TrainerScheduleSlot } from "@/features/trainer/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    const { data } = await backendAuthGet<TrainerScheduleSlot[]>(
      "/trainer/schedule",
      {
        weekStart: searchParams.get("weekStart"),
        classId: searchParams.get("classId") || undefined,
      },
    );

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: getApiErrorMessage(error) },
      { status: 400 },
    );
  }
}
