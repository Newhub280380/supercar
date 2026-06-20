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