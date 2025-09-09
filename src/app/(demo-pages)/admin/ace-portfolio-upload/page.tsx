"use client";

import { UploadCloud } from "lucide-react";
import { useState } from "react";

export default function AcePortfolioUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!file) return setError("Please choose a .xlsx or .csv file");

    const form = new FormData();
    form.append("file", file);

    setBusy(true);
    try {
      const res = await fetch("/api/admin/ace-portfolio-upload/", {
        method: "POST",
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setResult(json);
    } catch (err: any) {
      setError(err?.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">Upload ACE Portfolio (wide)</h1>
      <p className="text-sm text-gray-600 mb-6">
        Required headers: <code>company, symbol, c1, c2, c3, c4, c5, value_cr, ace_id</code>. Values
        can be numbers or “%”.
      </p>

      <form onSubmit={handleSubmit} className="border rounded-xl p-6 space-y-4 bg-white">
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

        <button
          type="submit"
          disabled={busy || !file}
          className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-60"
        >
          {busy ? "Uploading…" : "Upload & Upsert"}
        </button>
      </form>

      {error && <p className="mt-4 text-red-600">{error}</p>}

      {result && (
        <div className="mt-6 rounded-lg border p-4 bg-green-50">
          <div className="font-medium text-green-800">Success</div>
          <pre className="text-sm mt-2 overflow-auto">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
