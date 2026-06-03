import { NextResponse } from "next/server";
import { getApiErrorMessage, backendApi } from "@/lib/api/server";
import { setAuthCookies } from "@/lib/auth/cookies";
import { getRoleHome } from "@/lib/auth/routes";
import type { LoginResponse } from "@/lib/auth/types";
import { loginSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  const payload = loginSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json(
      { message: payload.error.issues[0]?.message ?? "Invalid login data" },
      { status: 400 },
    );
  }

  try {
    const { data } = await backendApi.post<LoginResponse>(
      "/auth/login",
      payload.data,
    );

    await setAuthCookies(data.user, data.session);

    return NextResponse.json({
      user: data.user,
      redirectTo: getRoleHome(data.user.role),
    });
  } catch (error) {
    return NextResponse.json(
      { message: getApiErrorMessage(error) },
      { status: 401 },
    );
  }
}
