-- Slam Book: private anonymous notes. Tables are locked (RLS on, no policies);
-- the public key can only call these functions. Only the owner's secret link can read entries.
create table if not exists public.slam_books(
  id text primary key default substr(replace(gen_random_uuid()::text,'-',''),1,10),
  secret text not null default replace(gen_random_uuid()::text,'-',''),
  owner text not null check (char_length(owner) between 1 and 30),
  created_at timestamptz not null default now()
);
create table if not exists public.slam_entries(
  id bigint generated always as identity primary key,
  book_id text not null references public.slam_books(id) on delete cascade,
  author text check (char_length(author)<=30),
  answers jsonb not null,
  rating jsonb,
  scrap text check (char_length(scrap)<=500),
  created_at timestamptz not null default now()
);
create index if not exists slam_entries_book on public.slam_entries(book_id, created_at desc);
alter table public.slam_books enable row level security;
alter table public.slam_entries enable row level security;

create or replace function public.slam_create(p_owner text) returns json
language plpgsql security definer set search_path=public as $$
declare r public.slam_books;
begin
  p_owner:=btrim(coalesce(p_owner,''));
  if char_length(p_owner) not between 1 and 30 then raise exception 'name 1-30 characters'; end if;
  insert into public.slam_books(owner) values (p_owner) returning * into r;
  return json_build_object('id',r.id,'secret',r.secret,'owner',r.owner);
end $$;

create or replace function public.slam_info(p_id text) returns json
language sql security definer set search_path=public as $$
  select json_build_object('owner',owner) from public.slam_books where id=p_id
$$;

create or replace function public.slam_add(p_id text, p_author text, p_answers jsonb, p_rating jsonb, p_scrap text) returns json
language plpgsql security definer set search_path=public as $$
begin
  if not exists(select 1 from public.slam_books where id=p_id) then raise exception 'no such book'; end if;
  if (select count(*) from public.slam_entries where book_id=p_id)>=300 then raise exception 'this slam book is full'; end if;
  if length(p_answers::text)>4000 or length(coalesce(p_rating::text,''))>200 then raise exception 'too long'; end if;
  insert into public.slam_entries(book_id,author,answers,rating,scrap)
    values (p_id, nullif(left(btrim(coalesce(p_author,'')),30),''), p_answers, p_rating, nullif(left(btrim(coalesce(p_scrap,'')),500),''));
  return json_build_object('ok',true);
end $$;

create or replace function public.slam_read(p_id text, p_secret text) returns json
language plpgsql security definer set search_path=public as $$
declare b public.slam_books;
begin
  select * into b from public.slam_books where id=p_id and secret=p_secret;
  if not found then raise exception 'wrong link'; end if;
  return json_build_object('owner',b.owner,'entries',coalesce((select json_agg(json_build_object('author',author,'answers',answers,'rating',rating,'scrap',scrap,'at',created_at) order by created_at desc) from public.slam_entries where book_id=b.id),'[]'::json));
end $$;

grant execute on function public.slam_create(text), public.slam_info(text), public.slam_add(text,text,jsonb,jsonb,text), public.slam_read(text,text) to anon, authenticated;
