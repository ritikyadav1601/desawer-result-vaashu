"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { saveKhaiwalSettings } from "@/lib/site-settings";
import { fallbackGames } from "@/lib/data";
import { saveMainGameResult } from "@/lib/main-game-results";

const value = (form: FormData, name: string) => String(form.get(name) || "").trim();

export async function updateKhaiwalSettings(formData: FormData) {
  await requireAdmin();
  const siteId = value(formData, "siteId");
  try {
    await saveKhaiwalSettings({
      heading: value(formData, "heading"),
      name: value(formData, "name"),
      whatsapp: value(formData, "whatsapp"),
      schedule: value(formData, "schedule"),
      jodiRate: value(formData, "jodiRate"),
      harufRate: value(formData, "harufRate"),
      callToAction: value(formData, "callToAction")
    }, siteId);
  } catch (error) {
    console.error("[admin] Failed to save Khaiwal settings:", error instanceof Error ? error.message : "Unknown error");
    redirect(`/admin/dashboard?site=${encodeURIComponent(siteId)}&error=mongodb`);
  }
  revalidatePath("/");
  revalidatePath("/admin/dashboard");
  redirect(`/admin/dashboard?site=${encodeURIComponent(siteId)}&saved=1`);
}

export async function updateMainGameResult(formData: FormData) {
  await requireAdmin();
  const gameId = value(formData, "gameId");
  const date = value(formData, "date");
  const result = value(formData, "result");
  if (!fallbackGames.some((game) => game.id === gameId) || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^(?:\d{1,3}|XX)$/i.test(result)) {
    redirect("/admin/game/result?error=invalid");
  }
  try {
    await saveMainGameResult({ gameId, date, result: result.toUpperCase().padStart(2, "0") });
  } catch (error) {
    console.error("[admin] Failed to save game result:", error instanceof Error ? error.message : "Unknown error");
    redirect("/admin/game/result?error=firebase-admin");
  }
  revalidatePath("/");
  revalidatePath(`/${fallbackGames.find((game) => game.id === gameId)?.chartSlug}`);
  redirect(`/admin/game/result?date=${encodeURIComponent(date)}&saved=1`);
}
