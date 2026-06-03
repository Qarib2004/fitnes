import { NextResponse } from "next/server";
import { getApiErrorMessage, backendApi } from "@/lib/api/server";
import { setAuthCookies } from "@/lib/auth/cookies";
import { getRoleHome } from "@/lib/auth/routes";
import type { LoginResponse, RegisterResponse } from "@/lib/auth/types";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  const payload = registerSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json(
      { message: payload.error.issues[0]?.message ?? "Invalid register data" },
      { status: 400 },
    );
  }

  try {
    await backendApi.post<RegisterResponse>("/auth/register", payload.data);

    const { data } = await backendApi.post<LoginResponse>("/auth/login", {
      email: payload.data.email,
      password: payload.data.password,
    });

    await setAuthCookies(data.user, data.session);

    return NextResponse.json({
      user: data.user,
      redirectTo: getRoleHome(data.user.role),
    });
  } catch (error) {
    return NextResponse.json(
      { message: getApiErrorMessage(error) },
      { status: 400 },
    );
  }
}
