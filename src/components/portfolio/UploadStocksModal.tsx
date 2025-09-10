"use client";

import { UploadCloud } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface UploadStocksModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadStocksModal({ open, onClose, onSuccess }: UploadStocksModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!file) return setError("Please choose a .xlsx or .csv file");

    const form = new FormData();
    form.append("file", file);

    setBusy(true);
    try {
      const res = await fetch("/api/upload-portfolio", {
        method: "POST",
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setResult(json);

      if (json.success) {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err?.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative animate-fadeIn">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl focus:outline-none"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
          Upload Stocks to Portfolio
        </h2>

        <pre className="bg-gray-100 text-xs p-3 rounded-md overflow-auto mb-4 border">
          {` Example format (CSV or Excel):
    symbol      | quantity  | buyPrice
    RELIANCE    | 10        | 2450
    HDFCBANK    | 5         | 1650`}
        </pre>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-50 cursor-pointer"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                setFile(e.dataTransfer.files[0]);
              }
            }}
          >
            <input
              id="file"
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <label
              htmlFor="file"
              className="inline-flex items-center gap-2 text-blue-600 cursor-pointer"
            >
              <UploadCloud className="w-5 h-5" />
              {file ? file.name : "Click to choose .xlsx/.csv or drag & drop here"}
            </label>
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || !file}>
              {busy ? "Uploading…" : "Upload"}
            </Button>
          </div>
        </form>

        {result && (
          <div className="mt-6 rounded-lg border p-4 bg-green-50 max-h-64 overflow-y-auto">
            <div className="font-medium text-green-800">Upload Results</div>
            <pre className="text-sm mt-2 overflow-auto">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
