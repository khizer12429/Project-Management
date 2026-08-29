-- Helm schema: users → projects → tasks
-- Signup always creates role = 'user'. Admins are promoted separately.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_members (
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  description text not null default '',
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date date,
  assigned_to uuid references public.profiles (id) on delete set null,
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activity (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  task_id uuid references public.tasks (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(trim(body)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists projects_created_by_idx on public.projects (created_by);
create index if not exists project_members_user_id_idx on public.project_members (user_id);
create index if not exists tasks_project_id_idx on public.tasks (project_id);
create index if not exists tasks_assigned_to_idx on public.tasks (assigned_to);
create index if not exists tasks_due_date_idx on public.tasks (due_date);
create index if not exists tasks_status_idx on public.tasks (status);
create index if not exists activity_project_id_idx on public.activity (project_id, created_at desc);
create index if not exists activity_task_id_idx on public.activity (task_id, created_at desc);
create index if not exists task_comments_task_id_idx on public.task_comments (task_id, created_at asc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    'user'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

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

create or replace function public.handle_new_project()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.project_members (project_id, user_id, role)
  values (new.id, new.created_by, 'owner');
  return new;
end;
$$;

drop trigger if exists on_project_created on public.projects;

create trigger on_project_created
  after insert on public.projects
  for each row execute procedure public.handle_new_project();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute procedure public.set_updated_at();

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute procedure public.set_updated_at();

create or replace function public.enforce_assignee_task_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.uid() is not null
     and not public.is_admin()
     and old.assigned_to = auth.uid() then
    if new.title is distinct from old.title
       or new.description is distinct from old.description
       or new.priority is distinct from old.priority
       or new.due_date is distinct from old.due_date
       or new.project_id is distinct from old.project_id
       or new.assigned_to is distinct from old.assigned_to
       or new.created_by is distinct from old.created_by then
      raise exception 'Assignees can only update task status';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists tasks_enforce_assignee_update on public.tasks;
create trigger tasks_enforce_assignee_update
  before update on public.tasks
  for each row execute procedure public.enforce_assignee_task_update();

create or replace function public.log_task_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from new.status then
    insert into public.activity (project_id, task_id, user_id, action, details)
    values (
      new.project_id,
      new.id,
      auth.uid(),
      'task_status_changed',
      jsonb_build_object(
        'task_title', new.title,
        'from_status', old.status,
        'to_status', new.status
      )
    );
  end if;
  return new;
end;
$$;

drop trigger if exists tasks_log_status_change on public.tasks;
create trigger tasks_log_status_change
  after update on public.tasks
  for each row execute procedure public.log_task_status_change();

create or replace function public.keep_profile_role()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_keep_role on public.profiles;
create trigger profiles_keep_role
  before update on public.profiles
  for each row execute procedure public.keep_profile_role();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_project_member(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.project_members
    where project_id = p_project_id and user_id = auth.uid()
  );
$$;

create or replace function public.can_access_task(p_task_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tasks t
    where t.id = p_task_id
      and (
        public.is_admin()
        or public.is_project_member(t.project_id)
        or t.assigned_to = auth.uid()
        or t.created_by = auth.uid()
      )
  );
$$;

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.tasks enable row level security;
alter table public.activity enable row level security;
alter table public.task_comments enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can read related profiles" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can read related profiles"
  on public.profiles
  for select
  to authenticated
  using (
    id = auth.uid()
    or public.is_admin()
    or exists (
      select 1
      from public.project_members mine
      join public.project_members theirs on theirs.project_id = mine.project_id
      where mine.user_id = auth.uid()
        and theirs.user_id = profiles.id
    )
    or exists (
      select 1
      from public.tasks t
      where (
        (t.assigned_to = auth.uid() and (t.created_by = profiles.id or t.assigned_to = profiles.id))
        or (t.created_by = auth.uid() and (t.assigned_to = profiles.id or t.created_by = profiles.id))
      )
    )
    or exists (
      select 1
      from public.task_comments mine
      join public.task_comments theirs on mine.task_id = theirs.task_id
      where mine.user_id = auth.uid()
        and theirs.user_id = profiles.id
    )
  );

drop policy if exists "Users can create own profile" on public.profiles;

create policy "Users can create own profile"
  on public.profiles
  for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists "Admins can update profiles" on public.profiles;
drop policy if exists "Admins can delete profiles" on public.profiles;

create policy "Admins can update profiles"
  on public.profiles
  for update
  to authenticated
  using (public.is_admin());

create policy "Admins can delete profiles"
  on public.profiles
  for delete
  to authenticated
  using (public.is_admin());

drop policy if exists "Members can read projects" on public.projects;
drop policy if exists "Users can create projects" on public.projects;
drop policy if exists "Owners can update projects" on public.projects;
drop policy if exists "Owners can delete projects" on public.projects;
drop policy if exists "Admins can create projects" on public.projects;
drop policy if exists "Admins can update projects" on public.projects;
drop policy if exists "Admins can delete projects" on public.projects;

create policy "Members can read projects"
  on public.projects
  for select
  to authenticated
  using (
    public.is_admin()
    or public.is_project_member(id)
    or exists (
      select 1
      from public.tasks
      where tasks.project_id = projects.id
        and tasks.assigned_to = auth.uid()
    )
  );

create policy "Admins can create projects"
  on public.projects
  for insert
  to authenticated
  with check (public.is_admin() and created_by = auth.uid());

create policy "Admins can update projects"
  on public.projects
  for update
  to authenticated
  using (public.is_admin());

create policy "Admins can delete projects"
  on public.projects
  for delete
  to authenticated
  using (public.is_admin());

drop policy if exists "Members can read project members" on public.project_members;
drop policy if exists "Owners can add project members" on public.project_members;
drop policy if exists "Owners can remove project members" on public.project_members;
drop policy if exists "Admins can add project members" on public.project_members;
drop policy if exists "Admins can remove project members" on public.project_members;

create policy "Members can read project members"
  on public.project_members
  for select
  to authenticated
  using (public.is_admin() or public.is_project_member(project_id));

create policy "Admins can add project members"
  on public.project_members
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can remove project members"
  on public.project_members
  for delete
  to authenticated
  using (public.is_admin());

drop policy if exists "Members can read tasks" on public.tasks;
drop policy if exists "Members can create tasks" on public.tasks;
drop policy if exists "Members can update tasks" on public.tasks;
drop policy if exists "Members can delete tasks" on public.tasks;
drop policy if exists "Admins can create tasks" on public.tasks;
drop policy if exists "Admins can update tasks" on public.tasks;
drop policy if exists "Admins can delete tasks" on public.tasks;
drop policy if exists "Assignees can update assigned tasks" on public.tasks;

create policy "Members can read tasks"
  on public.tasks
  for select
  to authenticated
  using (
    public.is_admin()
    or public.is_project_member(project_id)
    or assigned_to = auth.uid()
  );

create policy "Admins can create tasks"
  on public.tasks
  for insert
  to authenticated
  with check (public.is_admin() and created_by = auth.uid());

create policy "Admins can update tasks"
  on public.tasks
  for update
  to authenticated
  using (public.is_admin());

create policy "Assignees can update assigned tasks"
  on public.tasks
  for update
  to authenticated
  using (assigned_to = auth.uid() and not public.is_admin())
  with check (assigned_to = auth.uid());

create policy "Admins can delete tasks"
  on public.tasks
  for delete
  to authenticated
  using (public.is_admin());

drop policy if exists "Members can read activity" on public.activity;
drop policy if exists "Members can write activity" on public.activity;
drop policy if exists "Admins can write activity" on public.activity;
drop policy if exists "Admins can read activity" on public.activity;

create policy "Admins can read activity"
  on public.activity
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Users can read task comments" on public.task_comments;
drop policy if exists "Users can add task comments" on public.task_comments;

create policy "Users can read task comments"
  on public.task_comments
  for select
  to authenticated
  using (public.can_access_task(task_id));

create policy "Users can add task comments"
  on public.task_comments
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.can_access_task(task_id)
  );

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.handle_new_project() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.keep_profile_role() from public, anon, authenticated;
revoke all on function public.enforce_assignee_task_update() from public, anon, authenticated;
revoke all on function public.log_task_status_change() from public, anon, authenticated;

revoke all on function public.auto_confirm_new_user() from public, anon, authenticated;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_project_member(uuid) to authenticated;
grant execute on function public.can_access_task(uuid) to authenticated;

create or replace function public.admin_delete_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can delete users';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'You cannot delete your own account';
  end if;

  delete from auth.users where id = p_user_id;

  if not found then
    raise exception 'User not found';
  end if;
end;
$$;

revoke all on function public.admin_delete_user(uuid) from public, anon;
grant execute on function public.admin_delete_user(uuid) to authenticated;
