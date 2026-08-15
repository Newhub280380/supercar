import { describe, expect, it } from "vitest";
import {
  buildSystemPrompt,
  faqItems,
  getProcedureRecommendations,
  getProceduresByCategory,
  procedures,
  searchFAQ,
  searchProcedures,
} from "./knowledge-base";

describe("procedures dataset", () => {
  it("has unique ids and non-empty core fields", () => {
    const ids = procedures.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const procedure of procedures) {
      expect(procedure.name).not.toBe("");
      expect(procedure.indications.length).toBeGreaterThan(0);
      expect(procedure.contraindications.length).toBeGreaterThan(0);
      expect(procedure.suitableFor.length).toBeGreaterThan(0);
    }
  });
});

describe("getProceduresByCategory", () => {
  it("returns only procedures of the requested category", () => {
    const category = procedures[0].category;
    const result = getProceduresByCategory(category);

    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.category === category)).toBe(true);
  });
});

describe("getProcedureRecommendations", () => {
  it("returns only procedures suitable for the skin type", () => {
    const result = getProcedureRecommendations("sensitive", []);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.suitableFor.includes("sensitive"))).toBe(true);
  });

  it("treats an empty concern list as no concern filter", () => {
    expect(getProcedureRecommendations("normal", [])).toEqual(
      procedures.filter((p) => p.suitableFor.includes("normal")),
    );
  });

  it("narrows results by concern, matching indications case-insensitively", () => {
    const concern = procedures.find((p) => p.suitableFor.includes("normal"))!
      .indications[0];
    const result = getProcedureRecommendations("normal", [
      concern.toUpperCase(),
    ]);

    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThanOrEqual(
      getProcedureRecommendations("normal", []).length,
    );
  });

  it("returns nothing when no procedure matches the concern", () => {
    expect(
      getProcedureRecommendations("normal", ["сломанный автомобиль"]),
    ).toEqual([]);
  });
});

describe("searchProcedures", () => {
  it("matches on the procedure name regardless of case", () => {
    const name = procedures[0].name;
    const result = searchProcedures(name.toUpperCase());
    expect(result.map((p) => p.name)).toContain(name);
  });

  it("matches on category", () => {
    const category = procedures[0].category;
    expect(searchProcedures(category).length).toBeGreaterThan(0);
  });

  it("returns every procedure for an empty query", () => {
    expect(searchProcedures("")).toHaveLength(procedures.length);
  });

  it("returns nothing for an unrelated query", () => {
    expect(searchProcedures("квантовая физика")).toEqual([]);
  });
});

describe("searchFAQ", () => {
  it("matches on question text", () => {
    const question = faqItems[0].question;
    expect(searchFAQ(question.slice(0, 10)).map((f) => f.question)).toContain(
      question,
    );
  });

  it("returns every item for an empty query and nothing for an unrelated one", () => {
    expect(searchFAQ("")).toHaveLength(faqItems.length);
    expect(searchFAQ("квантовая физика")).toEqual([]);
  });
});

describe("buildSystemPrompt", () => {
  it("embeds the knowledge base and the FAQ", () => {
    const prompt = buildSystemPrompt("professional");
    expect(prompt).toContain("ТВОЯ БАЗА ЗНАНИЙ");
    expect(prompt).toContain("ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ");
    for (const procedure of procedures) {
      expect(prompt).toContain(procedure.name);
    }
    expect(prompt).toContain(faqItems[0].question);
  });

  it("uses a different instruction per tone", () => {
    const professional = buildSystemPrompt("professional");
    const friendly = buildSystemPrompt("friendly");

    expect(professional).not.toBe(friendly);
    expect(professional).toContain("профессиональный AI-консультант");
    expect(friendly).toContain("дружелюбный AI-помощник");
  });
});
