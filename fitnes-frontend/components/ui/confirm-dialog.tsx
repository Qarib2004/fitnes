"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Loader2, X } from "lucide-react";

export function ConfirmDialog({
  confirmLabel = "Delete",
  description,
  isOpen,
  isPending,
  onClose,
  onConfirm,
  title,
}: {
  confirmLabel?: string;
  description: string;
  isOpen: boolean;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          animate={{ opacity: 1 }}
          className="confirm-overlay"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
        >
          <motion.section
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="confirm-dialog"
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            transition={{ duration: 0.16 }}
          >
            <div className="flex items-start justify-between gap-4">
              <span className="confirm-icon">
                <AlertTriangle className="h-5 w-5" aria-hidden />
              </span>
              <button
                aria-label="Close confirmation"
                className="icon-neutral-button"
                disabled={isPending}
                type="button"
                onClick={onClose}
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <h2
              className="mt-4 text-xl font-semibold text-[#121a16]"
              id="confirm-dialog-title"
            >
              {title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#59645f]">
              {description}
            </p>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <button
                className="secondary-icon-button"
                disabled={isPending}
                type="button"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="danger-button"
                disabled={isPending}
                type="button"
                onClick={onConfirm}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : null}
                {confirmLabel}
              </button>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
