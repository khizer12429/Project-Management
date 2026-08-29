# Helm

Project management workspace. This first slice covers authentication: login for admins and members, and member-only signup.

## Stack

- React + Vite
- Tailwind CSS
- Supabase Auth and Postgres
- Redux Toolkit
- Yup + React Hook Form

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a Supabase project, then run `supabase/schema.sql` in the SQL Editor.

3. Copy `.env.example` to `.env` and add your project URL and anon key.

4. In Supabase go to **Authentication → Providers → Email** and turn **Confirm email** off.

5. Run `supabase/disable-email-confirmation.sql` in the SQL Editor so existing users (like `hassan12@gmail.com`) can log in without verifying email.

6. Start the app:

```bash
npm run dev
```

## Roles

- Signup always creates a `user` profile. The database trigger ignores any client-sent role.
- Admins and users both sign in through `/login`.
- Promote the first admin in SQL after that person signs up:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users
  where email = 'admin@yourcompany.com'
);
```

Later, the admin panel will create additional admins. Do not add an admin option to signup.
