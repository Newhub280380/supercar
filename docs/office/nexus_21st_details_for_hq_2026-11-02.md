# Nexus HQ + 21st.dev — детали для HQ зоопарка Beautyart (2 нояб. 2026)

## 1. Nexus HQ (`/workspace/nexus-hq/src`, лицензия в клоне НЕ указана — уточнить перед копированием, React+Vite+R3F, ~2150 строк)
| Файл | Что | Зачем нам |
|---|---|---|
| `types.ts` (73) | `AgentState = idle/working/completed/pending_approval/offline`, `Agent`, `Approval` | Готовая модель статусов = наши Working/Done/ждёт одобрения 1:1 |
| `ui/AgentStatusCards.tsx` (130) | Карточки агентов, STATUS_CONFIG цвет+glow-точка | Сетка карточек Гарри/Сократ/Антибиотик/… — менять только имена/иконки |
| `ui/AvatarCard.tsx` (112) | Попап деталей агента (close/reset) | Клик по боту → детали, текущая задача |
| `ui/ActionLog.tsx` (235) | Лог действий, `deriveActionStatus`, STATUS_COLORS | Журнал «кто что сделал», approve/deny видны |
| `ui/LiveFeed.tsx` (90) | Короткая лента событий task_update/audit_event | Live Activity сбоку HUD |
| `ui/HUD.tsx` (108) | Верхняя панель: connected, demoMode, кол-во агентов, runtimes | Шапка HQ «7/8 онлайн, N ждут одобрения» |
| `hooks/useClawOS.ts` (208) | poll + WebSocket (`ws`, ping 20с, реконнект), demo-переключатель | Единая точка подключения: подменить URL на наш бэкенд статусов |
| `lib/demo.ts` (197) | `DemoAgent`, `DemoState`, генератор фейковых событий | Demo Mode: подставить наших 8 ботов без бэкенда |
| `ui/ConnectPanel.tsx` (108) | Экран подключения host / Demo | Стартовый экран |
| `ui/SettingsPanel.tsx` (191) | Настройки | позже |
| `scene/Office.tsx`, `Zone.tsx`, `Avatar.tsx`, `CommonArea.tsx`, `Floor.tsx` | 3D-офис: зоны, аватары, зона одобрений (`approvalCount`) | 3D-вид/«небоскрёб»; CommonArea = комната «ждут одобрения» |
| `lib/colors.ts`, `lib/positions.ts` | Палитра статусов, раскладка мест | Цвета статусов + места ботов по этажам |

## 2. 21st.dev (копируется как код; CLI-установка требует бесплатный API-ключ с дневным лимитом — paid не нужен; можно просто скопировать код со страницы)
| # | Кусок | Ссылка | Лицензия | Куда |
|---|---|---|---|---|
| 1 | Shader State (WebGL mesh, 0 зависимостей) | https://21st.dev/@vnantes/components/shader-state | MIT | фон HQ |
| 2 | Timeline (activity feed, анимированная вставка) | https://21st.dev/@kuratlielia/components/timeline | MIT (motion, lucide) | Live Activity / Action Log |
| 3 | Activity Feed (аватар+действие+время) | https://21st.dev/@mohammadshehadeh/components/activity-feed | MIT | лента в карточке агента |
| 4 | Log (severity-бейджи, acknowledgement-маркер) | https://21st.dev/@alexisroe/components/log | MIT | Action Log / одобрения |
| 5 | Illos Shader Feature Bento (3 карточки с шейдером) | https://21st.dev/@navedux/components/illos-shader-feature-bento | MIT (иллюстрации — Illos free) | плитки статуса |
| 6 | Feature Bento Grid w/ Animated Waves | https://21st.dev/@shadcnspace/components/feature-28 | MIT | бенто-сетка ботов |
| — | ProfileCard (3D tilt, status cycle) | https://21st.dev/@dhileepkumargm/components/profile-card | license unknown | карточка агента — только как референс |
| — | Data Stream (терминальный лог) | https://21st.dev/@thegridcn/components/data-stream | no-license | пропустить |
| — | Shader Background (plasma) | https://21st.dev/@minhxthanh/components/shader-background | unknown | пропустить |
Paywall-кусков в списке нет. Не устанавливать Magic MCP/pro.

## 3. Приоритет
**Взять сейчас (топ-5):**
1. `types.ts` + `lib/demo.ts` из Nexus → наши 8 ботов и статусы в Demo Mode.
2. `ui/AgentStatusCards.tsx` + `AvatarCard.tsx` → карточки ботов.
3. `ui/HUD.tsx` + `ui/LiveFeed.tsx` → шапка и live-лента.
4. `hooks/useClawOS.ts` → WebSocket/poll статусов (подменить endpoint).
5. 21st Shader State (фон) + kuratlielia Timeline (Action Log с анимацией).

**Позже:** 3D `scene/*` (под небоскрёб), CommonArea как комната одобрений, Bento (#5/#6) как плитки, Activity Feed/Log, SettingsPanel; ProfileCard — только если автор даст лицензию.
