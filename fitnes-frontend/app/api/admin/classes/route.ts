import { NextResponse } from "next/server";
import { backendAuthGet, backendAuthPost } from "@/lib/api/auth-server";
import { getApiErrorMessage } from "@/lib/api/server";
import type { AdminClass } from "@/features/admin/types";

export async function GET() {
  try {
    const { data } = await backendAuthGet<AdminClass[]>("/classes");
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
    const { data } = await backendAuthPost<AdminClass>("/admin/classes", body);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: getApiErrorMessage(error) },
      { status: 400 },
    );
  }
}
