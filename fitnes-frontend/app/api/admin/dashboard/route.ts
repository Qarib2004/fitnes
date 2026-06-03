import { NextResponse } from "next/server";
import { backendAuthGet } from "@/lib/api/auth-server";
import { getApiErrorMessage } from "@/lib/api/server";
import type { AdminDashboardSummary } from "@/features/admin/types";

export async function GET() {
  try {
    const { data } =
      await backendAuthGet<AdminDashboardSummary>("/admin/dashboard");

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: getApiErrorMessage(error) },
      { status: 400 },
    );
  }
}
