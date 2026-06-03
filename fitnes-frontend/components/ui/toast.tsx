"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useAtomValue, useSetAtom } from "jotai";
import { X } from "lucide-react";
import { clearToastAtom, toastAtom } from "@/store/ui";

const toneClass = {
  success: "toast-success",
  error: "toast-error",
  info: "toast-info",
};

export function Toast() {
  const toast = useAtomValue(toastAtom);
  const clearToast = useSetAtom(clearToastAtom);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className={`app-toast ${toneClass[toast.tone]}`}
          exit={{ opacity: 0, y: 10 }}
          initial={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.18 }}
        >
          <span>{toast.text}</span>
          <button aria-label="Close notification" type="button" onClick={clearToast}>
            <X className="h-4 w-4" aria-hidden />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
