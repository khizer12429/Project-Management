-- Run in Supabase SQL Editor to skip email confirmation.
-- Also disable "Confirm email" in Authentication → Providers → Email.

-- Fix existing users who cannot log in
update auth.users
set email_confirmed_at = coalesce(email_confirmed_at, now())
where email_confirmed_at is null;

-- Auto-confirm every new signup
create or replace function public.auto_confirm_new_user()
returns trigger
language plpgsql
security definer
set search_path = auth, public
as $$
begin
  new.email_confirmed_at := coalesce(new.email_confirmed_at, now());
  return new;
end;
$$;

drop trigger if exists auto_confirm_new_user on auth.users;

create trigger auto_confirm_new_user
  before insert on auth.users
  for each row execute procedure public.auto_confirm_new_user();
