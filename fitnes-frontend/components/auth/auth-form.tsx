"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Dumbbell, Eye, EyeOff, Loader2, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  loginSchema,
  registerSchema,
  type LoginFormValues,
  type RegisterFormValues,
} from "@/lib/validations/auth";

type AuthMode = "login" | "register";
type AuthFormValues = LoginFormValues | RegisterFormValues;

type AuthFormProps = {
  mode: AuthMode;
};

const modeConfig = {
  login: {
    title: "Login to Fitnes",
    subtitle: "Sign in to open your dashboard.",
    button: "Login",
    endpoint: "/api/auth/login",
    icon: LogIn,
    switchText: "No account yet?",
    switchHref: "/register",
    switchLabel: "Register",
  },
  register: {
    title: "Create Account",
    subtitle: "Create a client account and start booking classes.",
    button: "Create account",
    endpoint: "/api/auth/register",
    icon: UserPlus,
    switchText: "Already have an account?",
    switchHref: "/login",
    switchLabel: "Login",
  },
} as const;

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState("");
  const schema = mode === "login" ? loginSchema : registerSchema;
  const config = modeConfig[mode];
  const Icon = config.icon;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(schema),
    defaultValues:
      mode === "login"
        ? { email: "", password: "" }
        : { name: "", email: "", password: "" },
  });

  async function onSubmit(values: AuthFormValues) {
    setServerError("");

    try {
      const { data } = await axios.post<{ redirectTo: string }>(
        config.endpoint,
        values,
      );

      router.replace(data.redirectTo);
      router.refresh();
    } catch (error) {
      if (axios.isAxiosError<{ message?: string }>(error)) {
        setServerError(error.response?.data?.message ?? error.message);
        return;
      }

      setServerError("Request failed");
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7f6] text-[#18211d]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-5 py-8">
        <section className="grid w-full gap-10 lg:grid-cols-[1fr_440px] lg:items-center">
          <div className="max-w-2xl">
            <div className="mb-8 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#16251f] text-white">
              <Dumbbell className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="text-4xl font-semibold leading-tight text-[#121a16] sm:text-5xl">
              Fitness club management for clients, trainers, and admins.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#59645f]">
              After login, the app sends each user to the right dashboard for
              their account role.
            </p>
          </div>

          <div className="rounded-lg border border-[#dde4e0] bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-7">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#e9f1ed] text-[#1c3b2f]">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-semibold">{config.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#68736e]">
                {config.subtitle}
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              {mode === "register" && (
                <Field
                  label="Name"
                  error={
                    (errors as Record<string, { message?: string }>).name
                      ?.message
                  }
                >
                  <input
                    className="field-input"
                    placeholder="For example, Garib"
                    {...register("name" as keyof RegisterFormValues)}
                  />
                </Field>
              )}

              <Field label="Email" error={errors.email?.message}>
                <input
                  className="field-input"
                  placeholder="you@example.com"
                  type="email"
                  {...register("email")}
                />
              </Field>

              <Field label="Password" error={errors.password?.message}>
                <div className="relative">
                  <input
                    className="field-input pr-12"
                    placeholder="At least 6 characters"
                    type={isPasswordVisible ? "text" : "password"}
                    {...register("password")}
                  />
                  <button
                    aria-label={
                      isPasswordVisible ? "Hide password" : "Show password"
                    }
                    className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-[#68736e] hover:bg-[#f0f4f2]"
                    type="button"
                    onClick={() => setIsPasswordVisible((value) => !value)}
                  >
                    {isPasswordVisible ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </Field>

              {serverError && (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {serverError}
                </p>
              )}

              <button
                className="primary-button"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Icon className="h-4 w-4" aria-hidden="true" />
                )}
                {config.button}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#68736e]">
              {config.switchText}{" "}
              <Link
                className="font-medium text-[#173c2f] hover:underline"
                href={config.switchHref}
              >
                {config.switchLabel}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({
  children,
  error,
  label,
}: {
  children: React.ReactNode;
  error?: string;
  label: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[#28352f]">
        {label}
      </span>
      {children}
      {error && (
        <span className="mt-2 block text-sm text-red-600">{error}</span>
      )}
    </label>
  );
}
