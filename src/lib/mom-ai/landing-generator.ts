export interface LandingContent {
  title: string;
  subtitle: string;
  sections: Array<{
    heading: string;
    body: string;
    cta?: string;
  }>;
  features: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  testimonials: Array<{
    name: string;
    text: string;
  }>;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

export async function generateLandingContent(
  _posts: Array<{ title: string; body: string }>,
  _images: string[],
): Promise<LandingContent> {
  return {
    title: "Mom AI Assistant — Dein intelligenter Begleiter für den Mamalltag",
    subtitle: "KI-gestützte Unterstützung für Mütter in Deutschland: Organisation, Selbstfürsorge und Alltagsoptimierung — alles in einer App.",
    sections: [
      {
        heading: "Warum Mom AI Assistant?",
        body: "Als Mutter jonglierst du mit unzähligen Rollen: Partnerin, Berufstätige, Hausmanagerin und vor allem Mama. Mom AI Assistant versteht deinen Alltag und gibt dir tägliche Unterstützung — von Alltagsorganisation bis hin zu mentale Stärkung.",
        cta: "Kostenlos starten",
      },
      {
        heading: "Organisiere deinen Alltag ohne Stress",
        body: "Ob Kita-Termine, Arztbesuche oder Hausaufgabenbetreuung — unsere KI erinnert dich, priorisiert Aufgaben und schlägt dir die beste Route vor. Du musst nicht mehr alles im Kopf behalten.",
        cta: "Mehr erfahren",
      },
      {
        heading: "Selbstfürsorge ist kein Luxus",
        body: "Mom AI Assistant erinnert dich an Pausen, Meditationsmomente und kleine Freuden. Denn nur wenn es dir gut geht, können es auch deine Kinder und dein Umfeld.",
        cta: "Self-Care planen",
      },
      {
        heading: "Community und Expertenwissen",
        body: "Tausche dich mit anderen Müttern in deiner Nähe aus und erhalte geprüfte Tipps von Hebammen, Familiencoaches und Erziehungsexperten aus Deutschland.",
        cta: "Community beitreten",
      },
    ],
    features: [
      {
        title: "KI-Tagesplaner",
        description: "Automatische Planung deines Tages basierend auf deinen Prioritäten und Terminen.",
        icon: "calendar",
      },
      {
        title: "Erinnerungen & Routinen",
        description: "Personalisierte Reminder für Trinken, Pausen, Medikamente und Schlafhygiene.",
        icon: "bell",
      },
      {
        title: "Gesprächs-KI",
        description: "Ein vertraulicher Chat mit einer KI, die zuhört, reflektiert und dir Perspektiven aufzeigt.",
        icon: "message",
      },
      {
        title: "Deutsche Experten-Community",
        description: "Fragen an Hebammen, Kinderärzte und Müttercoaches — beantwortet und moderiert.",
        icon: "users",
      },
      {
        title: "Elternzeit-Assistent",
        description: "Tipps zu Elterngeld, Kita-Suche und Wiedereinstieg — verständlich und aktuell.",
        icon: "file-text",
      },
      {
        title: "Family-Dashboard",
        description: "Alle Termine, ToDos und Notizen zentral für die ganze Familie — geteilt nach Bedarf.",
        icon: "home",
      },
    ],
    testimonials: [
      {
        name: "Lisa M., Mutter von 2 Kindern, München",
        text: "Endlich eine App, die nicht nur organisiert, sondern auch versteht, wie ich mich fühle. Der tägliche Check-In mit der KI ist mein Ritual geworden.",
      },
      {
        name: "Sandra K., Berufstätige Mama, Berlin",
        text: "Die Experten-Community hat mir bei meiner Rückkehr in den Job unglaublich geholfen. Ich fühlte mich nicht mehr allein mit meinen Fragen.",
      },
      {
        name: "Nora B., Erziehungsurlaub, Hamburg",
        text: "Ich nutze den Tagesplaner jetzt jeden Tag — und endlich schaffe ich es, auch mal eine Tasse Tee in Ruhe zu trinken.",
      },
    ],
    seo: {
      metaTitle: "Mom AI Assistant — KI- Unterstützung für Mütter in Deutschland",
      metaDescription: "Finde Balance zwischen Familie, Beruf und dir selbst. Mit KI-gestützter Alltagsorganisation, Selbstfürsorge und Community für Mütter in Deutschland.",
      keywords: [
        "Mom AI Assistant",
        "KI für Mütter",
        "Alltagsorganisation für Mütter",
        "Selbstfürsorge Mama",
        "Community Mütter Deutschland",
        "Elternzeit Assistent",
        "Family Dashboard",
        "Mutter und Beruf",
      ],
    },
  };
}
