import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export function sanitizeText(value: string) {
  if (!value) return "";
  return value
    .replace(/\*/g, "")
    .replace(/HGBCO/gi, "")
    .replace(/primary structural failure/gi, "Samenvatting")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeList(items: string[]) {
  return items.map((item) => sanitizeText(item)).filter(Boolean);
}

export function asList(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(/\n|•|\*/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

export function toScore(value: any) {
  const num = Number(value);
  if (Number.isFinite(num)) return Math.max(0, Math.min(10, num));
  return 0;
}

export function usePemReport(storageKeyPrefix: string) {
  const { state } = useLocation();
  const { id } = useParams<{ id: string }>();

  const report = useMemo(() => {
    if (state) return state as any;
    if (!id) return null;
    try {
      const raw = sessionStorage.getItem(`${storageKeyPrefix}_${id}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [state, id, storageKeyPrefix]);

  return { report, id };
}

export function useSignedDocuments(documentsList: any[]) {
  const [signedDocuments, setSignedDocuments] = useState<any[]>([]);

  useEffect(() => {
    let active = true;

    async function buildSignedUrls() {
      if (!documentsList.length) {
        if (active) setSignedDocuments([]);
        return;
      }

      const signed = await Promise.all(
        documentsList.map(async (doc: any) => {
          if (!doc?.bucket || !doc?.path) {
            return { ...doc, signed_url: null };
          }

          const { data, error } = await supabase.storage
            .from(doc.bucket)
            .createSignedUrl(doc.path, 60 * 60 * 24);

          return {
            ...doc,
            signed_url: error ? null : data?.signedUrl ?? null,
          };
        })
      );

      if (active) setSignedDocuments(signed);
    }

    buildSignedUrls();
    return () => {
      active = false;
    };
  }, [documentsList]);

  return signedDocuments;
}
