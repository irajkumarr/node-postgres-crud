const { pool } = require("./db");

const ensureSchema = async () => {
  const sql = `
    create table if not exists users(
    id bigserial primary key,
    name text not null,
    email text not null unique,
    password text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
    );
    
    create or replace function set_updated_at()
    returns trigger as $$
    begin 
    new.updated_at=now();
    return new;
    end;
    $$ language plpgsql;

    do $$
    begin
    if not exists(
    select 1 from pg_trigger where tgname='users_set_updated_at'
    ) then 
     create trigger users_set_updated_at
     before update on users
     for each row
     execute function set_updated_at();
     end if;
     end $$;
    `;
  await pool.query(sql);
};

module.exports = { ensureSchema };
