# 🌟 Matemática Mágica

Um jogo de matemática para crianças (~8 anos), em português, com trilha pedagógica de somas até multiplicações, XP, level ups comemorados, minigames de fliperama, desafio do dia com adesivos e brindes cosméticos por constância. Sem punição, sem notificação, com sinal claro de "treino do dia completo" pra não prender a criança no celular.

**Stack:** Next.js 14 (App Router) · Supabase (Auth Google + Postgres) · Tailwind CSS · Vercel

---

## Chaves e credenciais que você vai precisar

| Chave | Onde consegue | Onde usa |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | `.env.local` e Vercel |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API (campo `anon` `public`) | `.env.local` e Vercel |
| Google **Client ID** | Google Cloud Console → Credentials | Painel do Supabase (provider Google) |
| Google **Client Secret** | Google Cloud Console → Credentials | Painel do Supabase (provider Google) |

Nenhuma chave do Google vai no código nem no `.env.local`. Elas ficam só dentro do painel do Supabase.

---

## Passo 1: Criar o projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto novo (plano free serve).
2. Guarde a **senha do banco** que ele pedir (você não vai precisar dela no app, mas guarde).
3. Com o projeto criado, vá em **Project Settings → API** e copie:
   - **Project URL** → será o `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → será o `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Criar as tabelas

4. No menu lateral, abra o **SQL Editor**.
5. Copie o conteúdo inteiro do arquivo [`supabase/schema.sql`](./supabase/schema.sql) deste repositório, cole e clique em **Run**.
6. Deve criar 4 tabelas: `profiles`, `progress`, `daily_challenges` e `answer_log`, todas com RLS ativado (cada jogador só enxerga os próprios dados).

---

## Passo 2: Configurar o login com Google

### 2a. No Google Cloud Console

1. Acesse [console.cloud.google.com](https://console.cloud.google.com) e crie um projeto (ex: "matematica-magica").
2. Vá em **APIs & Services → OAuth consent screen**:
   - Tipo: **External**
   - Preencha nome do app, e-mail de suporte e e-mail do desenvolvedor
   - Em **Test users**, adicione o seu Gmail (enquanto o app estiver em modo "Testing", só os e-mails listados conseguem logar; adicione o da família)
3. Vá em **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**
   - Em **Authorized JavaScript origins**, adicione:
     - `http://localhost:3000`
     - `https://SEU-APP.vercel.app` (adicione depois do deploy, quando souber a URL)
   - Em **Authorized redirect URIs**, adicione (ESSA É A PARTE MAIS IMPORTANTE):
     - `https://SEU-PROJETO.supabase.co/auth/v1/callback`
     - (troque `SEU-PROJETO` pelo subdomínio real do seu projeto Supabase, o mesmo do Project URL)
4. Clique em **Create** e copie o **Client ID** e o **Client Secret**.

### 2b. No painel do Supabase

1. Vá em **Authentication → Providers → Google**.
2. Ative o toggle **Enable Sign in with Google**.
3. Cole o **Client ID** e o **Client Secret** do passo anterior. Salve.

### 2c. URLs de redirecionamento do Supabase

1. Vá em **Authentication → URL Configuration**:
   - **Site URL**: `http://localhost:3000` (durante o desenvolvimento; depois do deploy troque para `https://SEU-APP.vercel.app`)
   - **Redirect URLs**: adicione as duas:
     - `http://localhost:3000/auth/callback`
     - `https://SEU-APP.vercel.app/auth/callback`

---

## Passo 3: Rodar localmente

```bash
# 1. instalar dependências
npm install

# 2. criar o arquivo de variáveis de ambiente
cp .env.local.example .env.local
# edite o .env.local e preencha com a URL e a anon key do Passo 1

# 3. rodar
npm run dev
```

Abra `http://localhost:3000`, clique em **Entrar com Google** e pronto.

`.env.local` esperado:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seuprojetoabc123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

---

## Passo 4: Deploy na Vercel

1. Suba o projeto pro GitHub (repositório privado funciona).
2. Acesse [vercel.com](https://vercel.com) → **Add New → Project** → importe o repositório.
3. Antes de clicar em Deploy, abra **Environment Variables** e adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy. Anote a URL final (ex: `https://matematica-magica.vercel.app`).
5. **Volte e atualize** com essa URL:
   - Google Cloud Console → Credentials → seu OAuth client → **Authorized JavaScript origins**
   - Supabase → Authentication → URL Configuration → **Site URL** e **Redirect URLs** (`https://SUA-URL/auth/callback`)

Sem o passo 5 o login funciona local mas falha em produção (erro de redirect).

---

## Estrutura do jogo

- **Trilha**: 5 mundos, 16 fases, de somas até 10 com desenhos até 24 × 3. Fase completa com 8/10 acertos. Erro nunca tira XP; a questão errada volta disfarçada algumas rodadas depois; 3 erros seguidos injetam silenciosamente uma questão mais fácil.
- **XP e níveis**: 10 XP por acerto + bônus de sequência. Level up = fanfarra, confete, título novo (Aprendiz das Somas → ... → Lenda da Matemática) e chapéus pro Pip.
- **Desafio do Dia**: 10 questões (7 da fase atual + 3 de revisão), determinísticas por criança+data. Completa = adesivo no calendário, +80 XP e o Pip vai dormir (o hub entra em modo noite: sinal claro de "por hoje chega").
- **Constância sem ansiedade**: marcos por dias TOTAIS de treino (3, 7, 14, 30, 60), nunca sequência que zera. Cada marco dá um cosmético exclusivo.
- **Fliperama**: Math Attack (inimigos caem com continhas) e Dupla Relâmpago (memória). XP com teto diário de 120; depois disso joga por diversão. Ponte Numérica e Mercadinho Maluco estão registrados como "em breve" em `lib/minigames.ts`.

## Onde mexer

| Quero... | Arquivo |
|---|---|
| Ajustar/adicionar fases e mundos | `lib/levels.ts` |
| Mudar a geração de questões e distratores | `lib/questionGenerator.ts` |
| Ajustar XP, títulos, chapéus, marcos, adesivos | `lib/xp.ts` |
| Mudar as questões do desafio do dia | `lib/daily.ts` |
| Adicionar um minigame novo | `lib/minigames.ts` + página em `app/jogar/fliperama/` |
| Sons | `lib/audio.ts` (tudo sintetizado, zero arquivos de áudio) |

## Dados coletados (pro futuro "painel do pai")

Toda resposta vai pra tabela `answer_log` com fase, questão, acerto e origem (trilha, desafio ou minigame). Dá pra montar depois um dashboard de acompanhamento: taxa de acerto por tabuada, evolução por semana, etc.
