export interface GermanPost {
  title: string;
  body: string;
  hashtags: string[];
  platform: "instagram" | "facebook" | "blog";
}

const TOPICS = [
  {
    title: "5 Selbstfürsorge-Routinen für müde Mütter",
    body: "Als Mutter gibst du ständig — für deine Kinder, deinen Partner, deinen Job. Aber was ist mit dir? Hier sind 5 einfache Routinen, die dir auch in stressigen Alltagen helfen, Kraft zu tanken:\n\n1. Morgen-Moment: Nimm dir 5 Minuten nur für dich — Tee, Atemübungen, Blick aus dem Fenster.\n2. Bewegung ohne Druck: Spaziergänge mit Kindern zählen auch als Selbstfürsorge.\n3. Schlafhygiene: Kleine Gewohnheiten wie Lesen statt Scrollen verändern deine Nacht.\n4. Grenzen setzen: Es ist okay, Nein zu sagen.\n5. Verbindung: Triff andere Mütter — Austausch heilt.\n\nDu bist nicht egoistisch, wenn du auf dich achtest. Du bist ein Vorbild.",
    hashtags: ["#Mutter", "#Selbstfürsorge", "#MomLife", "#AlltagmitKind", "#MentalHealth", "#MamaBalance"],
    platform: "instagram" as const,
  },
  {
    title: "Elternzeit in Deutschland — was du wirklich wissen musst",
    body: "Elternzeit klingt einfach, aber es steckt mehr dahinter. Hier die wichtigsten Punkte:\n\n• Bis zu 3 Jahre möglich — aber nur 12-14 Monate mit Elterngeld.\n• Du kannst Elternzeit auch aufteilen (z. B. 2 Jahre vor, 1 Jahr später).\n• Der Arbeitgeber muss dich ggf. wieder auf einen gleichwertigen Posten setzen.\n• Zusatzleistungen wie Kindergeld und Kinderfreibetrag lohnen sich zusätzlich.\n\nTipp: Informiere dich früh bei der Elterngeldstelle deiner Stadt. Es gibt oft Fristen, die du beachten solltest.\n\nFragen? Schreib sie in die Kommentare — wir beantworten sie gerne.",
    hashtags: ["#Elternzeit", "#Elterngeld", "#Familie", "#Mutter", "#Deutschland", "#KarriereundKind"],
    platform: "facebook" as const,
  },
  {
    title: "Kita-Suche überlebt — ein ehrlicher Erfahrungsbericht",
    body: "Die Suche nach einem Kita-Platz in Deutschland kann sich anfühlen wie eine Dauerbaustelle. Ich weiß, wovon ich rede. Nach 120 Bewerbungen, 15 Gesprächen und 3 Absagen haben wir endlich einen Platz.\n\nWas mir geholfen hat:\n1. Früh starten — am besten schon während der Schwangerschaft.\n2. Flexibel sein — auch wenn es nicht der Traum-Kita ist.\n3. Netzwerk pflegen — Tipps von anderen Müttern sind Gold wert.\n4. Warteliste an allen möglichen Orten eintragen — auch bei kirchlichen oder privaten Anbietern.\n5. Geduld haben — manchmal klappt es genau im richtigen Moment.\n\nDu bist nicht allein. Dieses Thema beschäftigt tausende Mütter in Deutschland.",
    hashtags: ["#Kita", "#Kitaplatz", "#Mutteralltag", "#ElterninDeutschland", "#Familie", "#Tipps"],
    platform: "blog" as const,
  },
  {
    title: "Stillsituation: Wenn es nicht so läuft, wie im Lehrbuch",
    body: "Stillen klingt in der Schwangerschaft oft so natürlich. Die Realität sieht manchmal anders aus: wunde Brustwarzen, Milchstau, das Gefühl, alles falsch zu machen.\n\nErstens: Du bist keine schlechte Mutter, wenn es nicht klappt. Zweitens: Es gibt Hilfe — Stillberaterinnen, Hebammen und auch Online-Communities.\n\nPraktische Tipps:\n• Stillhütchen oder Hyaluron-Gel bei wunden Stellen probieren.\n• Warme Kompressen vor dem Stillen, kalte danach.\n• Kräutertees wie Fenchel-Anis fördern die Milchbildung (frag vorher deine Hebamme).\n• Lege dich nicht unter Druck — eine glückliche Mutter mit Flasche ist besser als eine gestresste mit Stillproblemen.\n\nJede Mutter und jedes Kind ist anders. Findet euren Weg.",
    hashtags: ["#Stillen", "#Hebamme", "#Mutter", "#Baby", "#Stillberatung", "#Neugeborenes", "#MomLife"],
    platform: "instagram" as const,
  },
  {
    title: "Me-Time für Mütter: 10 Minuten, die deinen Tag verändern",
    body: "Zeit für dich klingt unmöglich, wenn du kleine Kinder hast. Aber es geht nicht um Stunden — es geht um die kleinen Momente.\n\n10 Minuten, die dir gehören:\n• Meditation mit einer geführten App\n• Ein Gedicht oder eine Seite in einem Buch lesen\n• Eine warme Dusche, in der niemand klopft\n• Musik hören und tanzen, so wie niemand zuschaut\n• Ein Tagebucheintrag mit einer Frage an dich selbst: 'Wie geht es mir wirklich?'\n\nDiese 10 Minuten sind kein Luxus. Sie sind Treibstoff.\n\nWann startest du? Markiere eine Freundin, die das auch lesen sollte.",
    hashtags: ["#MeTime", "#Mutter", "#Selbstfürsorge", "#Balance", "#MomLife", "#Achtsamkeit"],
    platform: "instagram" as const,
  },
  {
    title: "Partnerschaft nach der Geburt: Wenn aus Partnern Eltern werden",
    body: "Die Geburt verändert eine Beziehung. Plötzlich bist du nicht mehr nur Partner — du bist Team Eltern. Und das braucht eine neue Spielregeln.\n\nWas hilft:\n• Regelmäßige Check-ins: 'Wie geht es dir wirklich?' statt Smalltalk.\n• Aufgaben unfair verteilen? Nein — fair genug für euch beide.\n• Gemeinsame Zeit reservieren: Auch 20 Minuten am Wochenende zählen.\n• Erwartungen klären: Der perfekte Haushalt kann warten.\n\nEs ist normal, dass es schwieriger ist als erwartet. Aber es wird leichter — besonders, wenn ihr gemeinsam daran arbeitet.",
    hashtags: ["#Partnerschaft", "#Eltern", "#Familie", "#Beziehung", "#Mutter", "#Papasein", "#TeamEltern"],
    platform: "facebook" as const,
  },
];

export function generateGermanPosts(): GermanPost[] {
  return TOPICS.map((topic) => ({
    title: topic.title,
    body: topic.body,
    hashtags: topic.hashtags,
    platform: topic.platform,
  }));
}

export function buildFallbackPost(topic: string): GermanPost {
  const lowerTopic = topic.toLowerCase();
  if (lowerTopic.includes("selbst")) {
    return TOPICS[0];
  }
  if (lowerTopic.includes("elternzeit") || lowerTopic.includes("elterngeld")) {
    return TOPICS[1];
  }
  if (lowerTopic.includes("kita") || lowerTopic.includes("betreuung")) {
    return TOPICS[2];
  }
  if (lowerTopic.includes("still") || lowerTopic.includes("baby")) {
    return TOPICS[3];
  }
  return TOPICS[4];
}
