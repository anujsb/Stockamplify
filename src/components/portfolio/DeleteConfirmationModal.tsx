import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  itemCount: number;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemCount,
}) => {
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // ⬇️ Reset local state when closed
  useEffect(() => {
    if (!isOpen) {
      setConfirmationText("");
      setIsDeleting(false);
    }
  }, [isOpen]);

  // ⬇️ Prevent background scroll while modal open
  useEffect(() => {
    if (!isOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [isOpen]);

  const isConfirmed = confirmationText === "DELETE";

  const handleConfirmClick = async () => {
    if (!isConfirmed) return;
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsDeleting(false);
      setConfirmationText("");
    }
  };

  if (!isOpen) return null;

  // ⬇️ Render in a portal at the end of <body>
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <div className="relative z-[10000] w-full max-w-md max-h-[90vh] overflow-auto rounded-2xl bg-white p-6 shadow-2xl mx-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-red-600 sm:text-xl">
          ⚠️ Confirm Delete
        </h2>

        <p className="mt-4 text-sm text-gray-700 sm:text-base">
          You are about to permanently delete <strong>{itemCount} items</strong> from your
          portfolio. This action <span className="font-semibold">cannot be undone</span>.
        </p>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Type <span className="font-bold">DELETE</span> to confirm:
          </label>
          <input
            type="text"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-red-400"
            placeholder="DELETE"
          />
        </div>

        <div className="mt-6 flex flex-col justify-end gap-3 sm:flex-row">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="w-full rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300 sm:w-auto"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmClick}
            disabled={!isConfirmed || isDeleting}
            className={`w-full rounded-md px-4 py-2 text-white sm:w-auto ${
              isConfirmed && !isDeleting
                ? "bg-red-600 hover:bg-red-700"
                : "cursor-not-allowed bg-red-300"
            }`}
          >
            {isDeleting ? "Deleting…" : "Confirm Delete"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
