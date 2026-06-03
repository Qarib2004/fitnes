import { atom } from "jotai";
import type { AuthUser } from "@/lib/auth/types";

export const authUserAtom = atom<AuthUser | null>(null);
