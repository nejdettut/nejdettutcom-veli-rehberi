"use client";

import { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Heart,
  Loader2,
  Puzzle,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Result = {
  answer: string;
  actionTips: string[];
  activityIdeas: string[];
  screenTimeNote: string;
  warningFlags: string[];
};

type Age = "okul-oncesi" | "ilkokul" | "ortaokul" | "lise";

const AGES: { value: Age; label: string; icon: string }[] = [
  { value: "okul-oncesi", label: "Okul öncesi", icon: "🧸" },
  { value: "ilkokul", label: "İlkokul", icon: "🎒" },
  { value: "ortaokul", label: "Ortaokul", icon: "📚" },
  { value: "lise", label: "Lise", icon: "🎓" },
];

const ORNEK_SORULAR = [
  "Çocuğum yemek seçiyor, ne yapmalıyım?",
  "Ekran süresini nasıl yönetirim?",
  "Ödevlerini zamanında yapmıyor — nasıl motive ederim?",
  "Arkadaşlarıyla anlaşmazlık yaşıyor, araya girmeli miyim?",
  "Uyku saatine uymuyor, nasıl bir rutin kurarım?",
];

const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-navy px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-navy/90 disabled:opacity-50 dark:bg-brand-turquoise dark:text-brand-navy";
const CARD =
  "rounded-2xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60";
const MUTED = "text-slate-500 dark:text-slate-400";

export function VeliApp() {
  const [question, setQuestion] = useState("");
  const [age, setAge] = useState<Age>("ilkokul");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function run() {
    if (question.trim().length < 5) {
      setError("Sorunu en az 5 karakter yaz.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await fetch("/api/rehber", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, ageGroup: age }),
      });
      const data = await r.json();
      if (!r.ok) setError(data.error ?? "Bilinmeyen hata.");
      else setResult(data as Result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ağ hatası.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Input */}
      <div className="space-y-4 lg:col-span-2">
        <div className={CARD}>
          <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <Heart className="size-4 text-brand-turquoise" />
              Sorunu yaz
            </h2>
          </div>
          <div className="space-y-4 p-5">
            <div>
              <label className={cn("mb-1.5 block text-xs font-semibold uppercase tracking-wider", MUTED)}>
                Çocuğun yaş grubu
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {AGES.map((a) => (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() => setAge(a.value)}
                    className={cn(
                      "rounded-lg border px-2 py-2 text-xs font-medium transition",
                      age === a.value
                        ? "border-brand-navy bg-brand-navy/5 text-slate-900 dark:border-brand-turquoise dark:bg-brand-turquoise/10 dark:text-slate-100"
                        : "border-slate-300 bg-white/50 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300",
                    )}
                  >
                    <span className="mr-1">{a.icon}</span>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={cn("mb-1.5 block text-xs font-semibold uppercase tracking-wider", MUTED)}>
                Sorun ne?
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Serbestçe yaz. Örn: Çocuğum sürekli telefonda, kitap okumuyor…"
                className="block h-36 w-full resize-y rounded-lg border border-slate-300 bg-white p-3 text-sm leading-relaxed shadow-inner outline-none focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            <button
              type="button"
              onClick={run}
              disabled={loading}
              className={BTN_PRIMARY}
            >
              {loading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Düşünülüyor…
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5" />
                  Rehber al
                </>
              )}
            </button>
            <p className={cn("text-[11px]", MUTED)}>
              Saatte 20 soru sınırı var.
            </p>
          </div>
        </div>

        <div className={CARD}>
          <div className="px-5 py-4">
            <p className={cn("mb-2 text-xs font-semibold uppercase tracking-wider", MUTED)}>
              Hazır sorular
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ORNEK_SORULAR.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setQuestion(s)}
                  className="rounded-full border border-slate-300 bg-white/70 px-2.5 py-1 text-[11px] text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
          <strong>Uyarı:</strong> Bu araç eğitim amaçlıdır; pedagog, psikolog
          veya hekim görüşünün yerine geçmez.
        </div>
      </div>

      {/* Output */}
      <div className="space-y-4 lg:col-span-3">
        {error ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-900 dark:text-red-200"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {error}
          </div>
        ) : null}

        {!result && !loading && !error ? (
          <div
            className={cn(
              CARD,
              "flex flex-col items-center gap-3 border-dashed py-14 text-center",
            )}
          >
            <Heart className="size-10 text-brand-turquoise" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Hazır olduğunda rehber al
            </h3>
            <p className={cn("max-w-sm text-sm", MUTED)}>
              Çocuğunun yaş grubunu seç, sorunu yaz. Yapay zekâ pedagog yaklaşımıyla
              yanıt + adımlar + aktivite önerisi + ekran süresi ipucu verir.
            </p>
          </div>
        ) : null}

        {loading ? (
          <div
            className={cn(
              CARD,
              "flex flex-col items-center gap-3 py-14 text-center",
            )}
          >
            <Loader2 className="size-10 animate-spin text-brand-turquoise" />
            <p className={cn("text-sm", MUTED)}>Düşünülüyor… 10-20 saniye.</p>
          </div>
        ) : null}

        {result ? (
          <>
            {result.warningFlags.length > 0 ? (
              <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="mb-1 font-semibold">Dikkat</p>
                  <ul className="list-disc space-y-1 pl-4">
                    {result.warningFlags.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            <div className={cn(CARD, "p-5")}>
              <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                Önerim
              </h3>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                {result.answer}
              </p>
            </div>

            <div className={cn(CARD, "p-5")}>
              <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                Somut adımlar
              </h3>
              <ul className="space-y-2">
                {result.actionTips.map((t, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200"
                  >
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={cn(CARD, "p-5")}>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                <Puzzle className="size-4 text-brand-turquoise" />
                Yaşa uygun aktivite önerisi
              </h3>
              <ul className="space-y-2">
                {result.activityIdeas.map((t, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200"
                  >
                    <Sparkles className="mt-0.5 size-4 shrink-0 text-brand-amber" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 text-sm text-sky-900 dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-200">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider">
                📱 Ekran süresi / dijital alışkanlık
              </p>
              <p>{result.screenTimeNote}</p>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
