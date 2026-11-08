import "server-only";
import { generateObject } from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const Req = z.object({
  question: z.string().min(5).max(1500),
  ageGroup: z.enum(["okul-oncesi", "ilkokul", "ortaokul", "lise"]),
});

const Res = z.object({
  answer: z.string(),
  actionTips: z.array(z.string()).min(3).max(6),
  activityIdeas: z.array(z.string()).min(2).max(4),
  screenTimeNote: z.string(),
  warningFlags: z.array(z.string()),
});

const AGE_LABEL: Record<z.infer<typeof Req>["ageGroup"], string> = {
  "okul-oncesi": "okul öncesi (3-6 yaş)",
  ilkokul: "ilkokul (6-10 yaş)",
  ortaokul: "ortaokul (10-14 yaş)",
  lise: "lise (14-18 yaş)",
};

export async function POST(req: Request) {
  const limited = await rateLimit({
    action: "veli",
    windowMs: 60 * 60 * 1000,
    max: 20,
  });
  if (!limited.ok) {
    return json({ error: "Saatte en fazla 20 soru." }, 429);
  }
  let body: z.infer<typeof Req>;
  try {
    body = Req.parse(await req.json());
  } catch {
    return json({ error: "Geçersiz istek gövdesi." }, 400);
  }

  const system = [
    "Sen deneyimli bir eğitim koçu ve pedagogsun. Türk velilere çocuklarının yaş grubuna uygun, kanıta dayalı pratik tavsiyeler veriyorsun.",
    "Kesin tıbbi/psikiyatrik tanı vermeden; 'önerilir', 'olabilir', 'denenebilir' gibi ifadelerle konuşursun.",
    "Yanıtın 2-3 paragraf (JSON 'answer' alanı). 'actionTips' 3-6 somut adım. 'activityIdeas' 2-4 yaşa uygun aktivite önerisi. 'screenTimeNote' ekran süresi / dijital alışkanlık ipucu.",
    "'warningFlags' alanına: eğer soruda pedagog/psikolog/doktor önermen gerektirecek sinyal varsa kısa uyarı ekle (örn. 'Uyku bozukluğu 2 haftadan uzunsa doktora başvurulmalı'). Yoksa boş liste.",
    `Çocuğun yaş grubu: ${AGE_LABEL[body.ageGroup]}.`,
  ].join(" ");

  const prompt = `Veli sorusu: ${body.question}`;

  try {
    const { object } = await generateObject({
      model: groq("openai/gpt-oss-120b"),
      schema: Res,
      system,
      prompt,
      temperature: 0.5,
    });
    return json(object);
  } catch (err) {
    console.error("[veli] failed:", err);
    return json({ error: "Yanıt üretilemedi." }, 502);
  }
}

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
