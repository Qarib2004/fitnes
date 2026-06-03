import { NextResponse } from "next/server";
import { backendAuthGet } from "@/lib/api/auth-server";
import { getApiErrorMessage } from "@/lib/api/server";
import type { TrainerSlotBooking } from "@/features/trainer/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const { data } = await backendAuthGet<TrainerSlotBooking[]>(
      `/trainer/schedule/${id}/bookings`,
    );

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: getApiErrorMessage(error) },
      { status: 400 },
    );
  }
}
