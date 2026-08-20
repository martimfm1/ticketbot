import { supabaseServer } from "@/lib/supabase";

export type TicketIntent = "billing" | "technical" | "sales" | "appeal" | "general";
export type TicketSentiment = "positive" | "neutral" | "frustrated" | "angry";

const KEYWORDS: Record<Exclude<TicketIntent, "general">, string[]> = {
  billing: ["payment", "pay", "invoice", "refund", "subscription", "billing", "pagamento", "fatura", "reembolso"],
  technical: ["error", "bug", "broken", "not working", "crash", "erro", "bug", "não funciona", "falha"],
  sales: ["buy", "price", "pricing", "upgrade", "premium", "comprar", "preço", "plano", "upgrade"],
  appeal: ["ban", "banned", "appeal", "suspension", "banido", "banimento", "recurso"],
};

const NEGATIVE = ["angry", "furious", "terrible", "hate", "stupid", "scam", "ridiculous", "raiva", "péssimo", "burla", "ridículo"];
const FRUSTRATED = ["help", "please", "can't", "cannot", "still", "again", "urgent", "ajuda", "não consigo", "ainda", "urgente"];

export function classifyIntent(text: string): TicketIntent {
  const value = text.toLowerCase();
  let best: TicketIntent = "general";
  let score = 0;
  for (const [intent, keywords] of Object.entries(KEYWORDS) as Array<[Exclude<TicketIntent, "general">, string[]]>) {
    const current = keywords.reduce((total, keyword) => total + (value.includes(keyword) ? 1 : 0), 0);
    if (current > score) { score = current; best = intent; }
  }
  return best;
}

export function classifySentiment(text: string): TicketSentiment {
  const value = text.toLowerCase();
  if (NEGATIVE.some((keyword) => value.includes(keyword))) return "angry";
  if (FRUSTRATED.some((keyword) => value.includes(keyword))) return "frustrated";
  if (/thank|thanks|love|great|obrigad|excelente|ótimo/.test(value)) return "positive";
  return "neutral";
}

export function confidence(intent: TicketIntent, sentiment: TicketSentiment, text: string): number {
  const lengthBonus = Math.min(0.12, text.trim().length / 1000);
  const intentScore = intent === "general" ? 0.52 : 0.78;
  const sentimentBonus = sentiment === "angry" || sentiment === "frustrated" ? 0.05 : 0;
  return Math.min(0.99, intentScore + sentimentBonus + lengthBonus);
}

export async function groundedSuggestion(guildId: string, text: string) {
  const intent = classifyIntent(text);
  const sentiment = classifySentiment(text);
  const score = confidence(intent, sentiment, text);
  const { data, error } = await supabaseServer
    .from("knowledge_articles")
    .select("id,title,content,source_url")
    .eq("guild_id", guildId)
    .eq("published", true)
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  const tokens = text.toLowerCase().split(/\W+/).filter((token) => token.length > 3);
  const article = (data ?? []).map((item) => ({ item, score: tokens.reduce((sum, token) => sum + ((`${item.title} ${item.content}`).toLowerCase().includes(token) ? 1 : 0), 0) })).sort((a, b) => b.score - a.score)[0]?.item ?? null;

  return {
    intent,
    sentiment,
    confidence: score,
    article,
    suggestedReply: article ? `Com base na nossa documentação, ${article.content.slice(0, 900).trim()}` : null,
  };
}
