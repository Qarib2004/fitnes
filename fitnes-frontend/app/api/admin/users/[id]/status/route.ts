import { NextResponse } from "next/server";
import { backendAuthPatch } from "@/lib/api/auth-server";
import { getApiErrorMessage } from "@/lib/api/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { data } = await backendAuthPatch(`/admin/users/${id}/status`, body);

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: getApiErrorMessage(error) },
      { status: 400 },
    );
  }
}
