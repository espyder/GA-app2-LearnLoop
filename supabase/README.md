# LearnLoop Supabase SQL

These scripts are grouped by database object type. For a new Supabase project,
open **SQL Editor** and run them in numeric order:

For the complete database, authentication, RLS, and application data-flow
documentation, see [`SUPABASE.md`](SUPABASE.md).

1. `schema/01_tables.sql` creates tables, columns, constraints, and indexes.
2. `schema/02_functions_and_triggers.sql` creates the timestamp function and
   attaches update triggers.
3. `security/03_rls_policies.sql` enables Row Level Security and applies client
   grants and ownership policies.
4. `seed/04_lessons.sql` inserts or updates the six shared lessons.

```text
supabase/
├── schema/    tables, constraints, indexes, functions, and triggers
├── security/  privileges and Row Level Security policies
└── seed/      shared application data
```

All scripts are safe to rerun for the canonical LearnLoop setup. The seed uses
`on conflict (id) do update`, so stable lesson IDs and user progress references
are preserved.

## Dashboard-only configuration

SQL does not configure the hosted email provider. In Supabase Dashboard:

1. Open **Authentication → Providers**.
2. Enable **Email**.
3. Choose whether sign-up requires email confirmation.
4. Add redirect URLs if the project later handles confirmation links inside a
   native production build.

The Expo client must use only the project URL and publishable key. Never place a
secret key, legacy `service_role` key, or database password in the application.
