# Architektura AI w VantageOS

## Dwa różne konteksty "AI"

W ekosystemie VantageOS istnieją **dwa różne byty AI**, które robią zupełnie inne rzeczy:

### 1. Antigravity (Agent IDE) 🔧

**Co to jest:** Agent kodujący w IDE, który pisze i edytuje kod VantageOS.

**Gdzie działa:** W edytorze kodu (Cursor, VS Code)  
**Kto go używa:** Developer (Marcin)  
**Co robi:**

- Pisze komponenty React, API routes, seed data
- Debuguje błędy, refaktoryzuje kod
- Zarządza Git, uruchamia buildy
- Czyta i modyfikuje pliki projektu

**Klient końcowy NIE widzi Antigravity.** To narzędzie deweloperskie.

---

### 2. AI Chat w VantageOS 💬

**Co to jest:** Chatbot wbudowany w aplikację, dostępny dla użytkowników VantageOS.

**Gdzie działa:** W przeglądarce, panel boczny w app  
**Kto go używa:** Każdy użytkownik VantageOS (CEO, Manager, Citizen Dev)  
**Co robi:**

- Odpowiada na pytania o SOPy, MUDA, agentów
- Przeszukuje Wiki wiedzę (RAG-like)
- Pomaga tworzyć nowe SOPy i agentów
- Wyjaśnia koncepcje Lean AI

---

## Obecna architektura (Sprint 16)

```
User → ChatPanel (React) → /api/chat (Next.js API Route)
                                ↓
                    searchWiki(query) → wiki-knowledge.ts
                                ↓
                    generateWikiEnrichedResponse()
                                ↓
                    Simulated response + wiki sources
                                ↓
                    Save to DB (ChatMessage, ChatSession)
                                ↓
                    Return JSON { content, wikiSources, sessionId }
```

**Model:** `simulated-wiki`  
**Backend AI:** Brak (pattern matching + wiki context)  
**Persistence:** Prisma → PostgreSQL (ChatSession, ChatMessage)

---

## Planowana architektura (przyszłe sprinty)

```text
User → ChatPanel → /api/chat
                      ↓
      resolveApiKey(userRole)
      ┌─ Tier 1: Platform Keys (META_ADMIN / PARTNER)
      │           → PLATFORM_OPENAI_API_KEY
      │           → PLATFORM_ANTHROPIC_API_KEY
      ├─ Tier 2: Organization Keys (Client roles)
      │           → OPENAI_API_KEY
      │           → ANTHROPIC_API_KEY
      └─ Tier 3: Simulated (no keys)
                      ↓
        searchWiki(query) → wiki context
                      ↓
        ┌─ OpenAI API (gpt-4-turbo) ← domyślny
        ├─ Anthropic API (claude-3) ← fallback
        └─ Simulated ← offline fallback
                      ↓
        Response + wiki sources + tier info
```

### Multi-Tier API Key System

| Tier | Role | Klucze env | Kto płaci |
| --- | --- | --- | --- |
| **Platform** | META_ADMIN, PARTNER | `PLATFORM_OPENAI_API_KEY`, `PLATFORM_ANTHROPIC_API_KEY`, `PLATFORM_GOOGLE_API_KEY` | SYHI |
| **Organization** | SPONSOR, PILOT, MANAGER, EXPERT, CITIZEN_DEV | `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY` | Klient |
| **Simulated** | Każdy (brak kluczy) | Brak | Nikt |

**Logika resolwera** (`src/lib/ai/api-key-resolver.ts`):

1. Sprawdź rolę użytkownika
2. META_ADMIN / PARTNER → szukaj `PLATFORM_*` env vars
3. Klient → szukaj standardowych env vars
4. Provider fallback: OpenAI → Anthropic → Google
5. Platform user bez PLATFORM_ keys → fallback do org keys
6. Brak jakichkolwiek kluczy → tryb symulowany

**Zmienne środowiskowe:**

```env
# Platform keys (SYHI-owned, for META_ADMIN & PARTNER)
PLATFORM_OPENAI_API_KEY=sk-...
PLATFORM_ANTHROPIC_API_KEY=sk-ant-...
PLATFORM_GOOGLE_API_KEY=AIza...

# Organization keys (Client-owned)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...
```

---

## Podsumowanie

| Cecha | Antigravity (IDE) | AI Chat (App) |
| --- | --- | --- |
| **Użytkownik** | Developer | Każdy user VantageOS |
| **Środowisko** | Edytor kodu | Przeglądarka |
| **Cel** | Budowanie VantageOS | Używanie VantageOS |
| **Backend** | Claude/Gemini (Anthropic/Google) | Tier-based (Platform/Org/Simulated) |
| **Dane** | Pliki projektu | Wiki, SOPy, DB |
| **Widoczność** | Tylko dev | Wszyscy użytkownicy |
