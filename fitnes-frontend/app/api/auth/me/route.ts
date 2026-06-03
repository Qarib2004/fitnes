import { NextResponse } from "next/server";
import { backendAuthGet } from "@/lib/api/auth-server";
import { getApiErrorMessage } from "@/lib/api/server";
import type { AuthUser } from "@/lib/auth/types";

export async function GET() {
  try {
    const { data } = await backendAuthGet<{ user: AuthUser }>("/auth/me");

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: getApiErrorMessage(error) },
      { status: 401 },
    );
  }
}
