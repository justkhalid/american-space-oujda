// Dewey Decimal classification for the ASO library.
// Ready for the upcoming Excel book import: map a deweyCode like "813.54"
// to its class label, group/filter the collection, etc.

export interface DeweyClass {
  code: string;
  label: string;
  arabic: string;
}

export const DEWEY_CLASSES: DeweyClass[] = [
  { code: "000", label: "Computer science, information & general works", arabic: "علوم الحاسوب والمعلومات" },
  { code: "100", label: "Philosophy & psychology", arabic: "الفلسفة وعلم النفس" },
  { code: "200", label: "Religion", arabic: "الديانة" },
  { code: "300", label: "Social sciences", arabic: "العلوم الاجتماعية" },
  { code: "400", label: "Language", arabic: "اللغة" },
  { code: "500", label: "Science", arabic: "العلوم" },
  { code: "600", label: "Technology & applied sciences", arabic: "التكنولوجيا والعلوم التطبيقية" },
  { code: "700", label: "Arts & recreation", arabic: "الفنون والترفيه" },
  { code: "800", label: "Literature", arabic: "الأدب" },
  { code: "900", label: "History & geography", arabic: "التاريخ والجغرافيا" },
];

// Common divisions worth surfacing in the ASO collection.
export const DEWEY_DIVISIONS: { code: string; label: string }[] = [
  { code: "020", label: "Library & information sciences" },
  { code: "070", label: "News media, journalism & publishing" },
  { code: "300", label: "Social sciences, sociology & anthropology" },
  { code: "320", label: "Political science" },
  { code: "370", label: "Education" },
  { code: "398", label: "Folklore" },
  { code: "420", label: "English & Old English languages" },
  { code: "428", label: "Standard English usage" },
  { code: "500", label: "Natural sciences & mathematics" },
  { code: "510", label: "Mathematics" },
  { code: "600", label: "Technology & applied sciences" },
  { code: "613", label: "Personal health & safety" },
  { code: "650", label: "Business & management" },
  { code: "700", label: "Arts" },
  { code: "791", label: "Public performances, film, radio & TV" },
  { code: "793", label: "Indoor games & amusements" },
  { code: "800", label: "Literature, rhetoric & criticism" },
  { code: "810", label: "American literature in English" },
  { code: "820", label: "English & Old English literatures" },
  { code: "910", label: "Geography & travel" },
  { code: "970", label: "History of North America" },
];

export function deweyClassFor(code: string | null | undefined): DeweyClass | null {
  if (!code) return null;
  const digits = String(code).replace(/[^0-9]/g, "").padEnd(3, "0").slice(0, 3);
  return DEWEY_CLASSES.find((c) => c.code === digits) ?? null;
}

export function deweyLabelFor(code: string | null | undefined): string {
  return deweyClassFor(code)?.label ?? "Unclassified";
}
