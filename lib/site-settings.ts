import { getKhaiwalDb } from "./khaiwal-mongodb";

export type KhaiwalSettings = {
  heading: string;
  name: string;
  whatsapp: string;
  schedule: string;
  jodiRate: string;
  harufRate: string;
  callToAction: string;
};

export const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID || "desawersatta";
const COLLECTION = "site_settings";
export const KHAIWAL_WEBSITES = [
  { id: "desawersatta", name: "Desawer Satta", url: "https://desawersatta.com" },
  { id: "sattaonlineresult", name: "Satta Online Result", url: "https://sattaonlineresult.com" }
] as const;

export function validSiteId(value?: string) {
  return KHAIWAL_WEBSITES.some((website) => website.id === value) ? value! : SITE_ID;
}

export const defaultKhaiwalSettings: KhaiwalSettings = {
  heading: "Direct Company सबसे भरोसेमंद खाईवाल",
  name: "Arun bhai khaiwal",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918708328760",
  schedule: `⏰ सदर बाजार ------------ 01:20 PM
⏰ ग्वालियर -------------- 02:20 PM
⏰ दिल्ली बाजार ----------- 03:00 PM
⏰ दिल्ली मटका ----------- 03:20 PM
⏰ श्री गणेश ------------- 04:20 PM
⏰ आगरा ---------------- 05:20 PM
⏰ फरीदाबाद ------------- 05:50 PM
⏰ अलवर --------------- 07:20 PM
⏰ गाज़ियाबाद ------------ 08:50 PM
⏰ द्वारका --------------- 10:15 PM
⏰ गली ---------------- 11:20 PM
⏰ दिसावर -------------- 02:00 AM`,
  jodiRate: "10 के 960",
  harufRate: "100 के 960",
  callToAction: "गेम लगाने के लिए whatsapp पर क्लिक करें"
};

function cleanSettings(data?: Partial<KhaiwalSettings>): KhaiwalSettings {
  return {
    heading: String(data?.heading || defaultKhaiwalSettings.heading),
    name: String(data?.name || defaultKhaiwalSettings.name),
    whatsapp: String(data?.whatsapp || defaultKhaiwalSettings.whatsapp),
    schedule: String(data?.schedule || defaultKhaiwalSettings.schedule),
    jodiRate: String(data?.jodiRate || defaultKhaiwalSettings.jodiRate),
    harufRate: String(data?.harufRate || defaultKhaiwalSettings.harufRate),
    callToAction: String(data?.callToAction || defaultKhaiwalSettings.callToAction)
  };
}

export async function getKhaiwalSettings(siteId = SITE_ID) {
  const selectedSite = validSiteId(siteId);
  try {
    const document = await (await getKhaiwalDb())
      .collection<Partial<KhaiwalSettings> & { siteId: string }>(COLLECTION)
      .findOne({ siteId: selectedSite });
    return cleanSettings(document || undefined);
  } catch {
    return defaultKhaiwalSettings;
  }
}

export async function saveKhaiwalSettings(settings: KhaiwalSettings, siteId = SITE_ID) {
  const selectedSite = validSiteId(siteId);
  await (await getKhaiwalDb()).collection(COLLECTION).updateOne(
    { siteId: selectedSite },
    { $set: { ...cleanSettings(settings), siteId: selectedSite, updatedAt: new Date() } },
    { upsert: true }
  );
}
