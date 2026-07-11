-- ============================================================
-- Matemática Mágica - Schema do Supabase
-- Cole este arquivo inteiro no SQL Editor do Supabase e execute.
-- ============================================================

-- Perfil do jogador (nome escolhido no jogo, separado da conta Google)
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  avatar_config jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Progresso principal
create table if not exists progress (
  user_id uuid primary key references auth.users on delete cascade,
  current_fase int default 1,
  total_xp int default 0,
  unlocked_cosmetics jsonb default '[]'::jsonb,
  best_streak int default 0,
  total_training_days int default 0,
  claimed_milestones jsonb default '[]'::jsonb,
  updated_at timestamptz default now()
);

-- Desafio do dia (uma linha por dia por jogador)
create table if not exists daily_challenges (
  user_id uuid references auth.users on delete cascade,
  challenge_date date not null,
  completed boolean default false,
  score int default 0,
  sticker_id text,
  created_at timestamptz default now(),
  primary key (user_id, challenge_date)
);

-- Log de respostas (alimenta o futuro "dashboard de pai")
create table if not exists answer_log (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete cascade,
  fase int,
  question text,
  correct boolean,
  source text default 'trilha', -- trilha | desafio | math_attack | dupla_relampago
  answered_at timestamptz default now()
);

-- ============================================================
-- Row Level Security: cada jogador só acessa os próprios dados
-- ============================================================
alter table profiles enable row level security;
alter table progress enable row level security;
alter table daily_challenges enable row level security;
alter table answer_log enable row level security;

create policy "own profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own progress" on progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own daily" on daily_challenges
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own answers" on answer_log
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
