export {
  generateAIResponse,
  checkRateLimit,
  safetyFilter,
  type ChatMessage,
  type ChatRole,
  type AIChatResponse,
  type SendMessageParams,
} from "./openai-service";

export {
  procedures,
  faqItems,
  skinCareRecommendations,
  getProcedureRecommendations,
  getProceduresByCategory,
  searchProcedures,
  searchFAQ,
  buildSystemPrompt,
  type Procedure,
  type FAQItem,
} from "./knowledge-base";

export {
  contentTemplates,
  getTemplate,
  buildGeneratorPrompt,
  PLATFORM_LABELS,
  TEMPLATE_LABELS,
  TONE_LABELS,
  type ContentTemplate,
  type TemplateParams,
} from "./content-templates";

export {
  generateContent,
  generateMockContent,
  checkContentRateLimit,
} from "./content-generator";