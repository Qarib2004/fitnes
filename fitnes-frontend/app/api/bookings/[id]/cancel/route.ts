import { NextResponse } from "next/server";
import { backendAuthPatch } from "@/lib/api/auth-server";
import { getApiErrorMessage } from "@/lib/api/server";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const { data } = await backendAuthPatch(`/bookings/${id}/cancel`);

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: getApiErrorMessage(error) },
      { status: 400 },
    );
  }
}
