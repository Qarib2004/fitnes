import { NextResponse } from "next/server";
import { backendAuthDelete, backendAuthPatch } from "@/lib/api/auth-server";
import { getApiErrorMessage } from "@/lib/api/server";
import type { AdminPackage } from "@/features/admin/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { data } = await backendAuthPatch<AdminPackage>(
      `/admin/packages/${id}`,
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
    const { data } = await backendAuthDelete<AdminPackage>(
      `/admin/packages/${id}`,
    );

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: getApiErrorMessage(error) },
      { status: 400 },
    );
  }
}
