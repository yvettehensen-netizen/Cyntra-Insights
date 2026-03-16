import { useMemo, useRef, type Dispatch, type SetStateAction } from "react";
import { AlertCircle, FileText, Trash2, Upload } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatBytes } from "./pemScanUtils";

function fileFingerprint(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function mergeUniqueFiles(current: File[], incoming: File[]): File[] {
  const unique = new Map<string, File>();
  [...current, ...incoming].forEach((file) => {
    unique.set(fileFingerprint(file), file);
  });
  return Array.from(unique.values()).slice(0, 20);
}

export function PemBadge({
  icon: Icon,
  text,
  accentClass,
}: {
  icon: LucideIcon;
  text: string;
  accentClass: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white/40 border border-white/10 px-4 py-2 rounded-full">
      <Icon className={`h-4 w-4 ${accentClass}`} />
      {text}
    </span>
  );
}

export function PemField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-widest text-white/40">
        {label}
      </p>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-4 text-white"
      />
    </div>
  );
}

export function PemTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-widest text-white/40">
        {label}
      </p>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[120px] rounded-2xl bg-black/40 border border-white/10 px-4 py-4 text-white resize-none"
      />
    </div>
  );
}

export function PemSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-widest text-white/40">
        {label}
      </p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-4 text-white"
      >
        <option value="">Selecteer</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

export function PemNumber({
  label,
  value,
  onChange,
  min = 0,
  max = 10,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-widest text-white/40">
        {label}
      </p>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-4 text-white"
      />
    </div>
  );
}

export function PemDocumentUpload({
  files,
  setFiles,
  accentText,
  accentBorder,
  helperText,
}: {
  files: File[];
  setFiles: Dispatch<SetStateAction<File[]>>;
  accentText: string;
  accentBorder: string;
  helperText: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileList = useMemo(() => files ?? [], [files]);
  const removeFile = (target: File) => {
    const targetKey = fileFingerprint(target);
    setFiles((prev) =>
      prev.filter((file) => fileFingerprint(file) !== targetKey)
    );
  };

  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-widest text-white/40">
        Documenten (optioneel)
      </p>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            const incoming = e.target.files
              ? Array.from(e.target.files)
              : [];
            setFiles((prev) => mergeUniqueFiles(prev, incoming));
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
        />

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-white/80 hover:text-white transition ${accentBorder}`}
        >
          <Upload className={`h-4 w-4 ${accentText}`} />
          Documenten uploaden
        </button>

        {fileList.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setFiles([]);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-white/50 hover:text-white transition"
          >
            Leegmaken
          </button>
        )}
      </div>

      {fileList.length > 0 && (
        <div className="space-y-2">
          {fileList.map((file) => (
            <div
              key={fileFingerprint(file)}
              className="flex items-center gap-2 text-sm text-white/60"
            >
              <FileText className="h-4 w-4 text-white/40" />
              <span className="flex-1 truncate">{file.name}</span>
              <span className="text-white/30">
                ({formatBytes(file.size)})
              </span>
              <button
                type="button"
                onClick={() => removeFile(file)}
                className="p-1 text-red-300 hover:text-red-200 transition"
                aria-label={`Verwijder ${file.name}`}
                title={`Verwijder ${file.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-white/30">{helperText}</p>
    </div>
  );
}

export function PemError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-red-300 bg-red-950/40 border border-red-500/40 p-4 rounded-2xl">
      <AlertCircle className="h-5 w-5" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
