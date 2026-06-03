import { Suspense } from "react";
import { TrainerAttendance } from "@/features/trainer/trainer-attendance";

export default function TrainerAttendancePage() {
  return (
    <Suspense>
      <TrainerAttendance />
    </Suspense>
  );
}
