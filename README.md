# INFINITY X TRADERS V2

Clean restart build covering Stage 1 to Stage 6 foundation:

1. React/Vite/Tailwind frontend
2. Supabase login and profiles
3. Role access: Public, Free Member, VIP Elite, Admin
4. Admin signal creation
5. VIP-only signal locking
6. Manual payment request and subscription approval foundation

## Setup

1. Copy `.env.local.example` to `.env.local`.
2. Add your real Supabase Project URL and Publishable key.
3. Run the SQL in `sql/setup_stage_1_to_6.sql` in Supabase SQL Editor.
4. Create your admin user in Supabase Authentication.
5. Run the admin SQL comment at the bottom of the SQL file with your email.
6. Install and run:

```bash
npm.cmd install
npm.cmd run dev
```

Open the localhost link shown by Vite.
