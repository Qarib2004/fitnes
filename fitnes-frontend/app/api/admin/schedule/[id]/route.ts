import { NextResponse } from "next/server";
import { backendAuthDelete, backendAuthPatch } from "@/lib/api/auth-server";
import { getApiErrorMessage } from "@/lib/api/server";
import type { ScheduleSlot } from "@/features/schedule/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { data } = await backendAuthPatch<ScheduleSlot>(
      `/admin/schedule/${id}`,
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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const { data } = await backendAuthDelete<ScheduleSlot>(
      `/admin/schedule/${id}`,
    );
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: getApiErrorMessage(error) },
      { status: 400 },
    );
  }
}
