import { NextResponse } from "next/server";
import { backendApi, getApiErrorMessage } from "@/lib/api/server";
import type { AdminPackage } from "@/features/admin/types";

export async function GET() {
  try {
    const { data } = await backendApi.get<AdminPackage[]>("/packages");

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: getApiErrorMessage(error) },
      { status: 400 },
    );
  }
}
