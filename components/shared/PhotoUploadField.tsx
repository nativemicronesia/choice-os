"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { compressImageFile } from "@/lib/utils/compressImage";

type UploadResult = { success: true; url: string } | { success: false; error: string };

export function PhotoUploadField({
  label,
  value,
  onChange,
  uploadAction,
  deleteAction,
  onBusyChange,
}: {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  uploadAction: (formData: FormData) => Promise<UploadResult>;
  deleteAction: (url: string) => Promise<void>;
  onBusyChange?: (busy: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "compressing" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setStatus("compressing");
    onBusyChange?.(true);
    try {
      const compressed = await compressImageFile(file);
      setStatus("uploading");
      const fd = new FormData();
      fd.set("file", compressed);
      const result = await uploadAction(fd);
      if (!result.success) throw new Error(result.error);
      if (pendingUrl) await deleteAction(pendingUrl);
      setPendingUrl(result.url);
      onChange(result.url);
      setStatus("idle");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Upload failed");
      setPreview(value);
    } finally {
      URL.revokeObjectURL(objectUrl);
      onBusyChange?.(false);
    }
  }

  async function handleRemove() {
    if (pendingUrl) await deleteAction(pendingUrl);
    setPendingUrl(null);
    setPreview(null);
    onChange(null);
  }

  const isBusy = status === "compressing" || status === "uploading";

  return (
    <div>
      <label className="mb-1 block text-xs text-ink-500">{label}</label>
      <div className="flex items-center gap-3">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-sand-100">
          {preview && <Image src={preview} alt="" fill sizes="80px" className="object-cover" />}
        </div>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            disabled={isBusy}
            onClick={() => inputRef.current?.click()}
            className="rounded-lg border border-sand-300 px-3 py-1.5 text-sm font-medium text-ink-700 disabled:opacity-60"
          >
            {isBusy ? (status === "compressing" ? "Preparing…" : "Uploading…") : preview ? "Change photo" : "Add photo"}
          </button>
          {preview && !isBusy && (
            <button type="button" onClick={handleRemove} className="text-sm text-ink-500 underline">
              Remove
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-700">{error}</p>}
    </div>
  );
}
