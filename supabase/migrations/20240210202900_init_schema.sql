-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create a view for auth.users in public schema
create or replace view public.users as
select * from auth.users;

-- Create gift_boxes table
create table public.gift_boxes (
    id bigint generated always as identity primary key,
    user_id uuid not null,
    box_type text not null check (box_type in ('常规', '清真')),
    delivery_type text not null check (delivery_type in ('线下领取', '线上邮寄')),
    address text,
    recipient_name text,
    phone text,
    status text not null default '申请中' check (status in ('申请中', '已发货')),
    tracking_number text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint delivery_info_required check (
        (delivery_type = '线下领取') or
        (delivery_type = '线上邮寄' and address is not null and recipient_name is not null and phone is not null)
    )
);

alter table public.gift_boxes
    add constraint gift_boxes_user_id_fkey
    foreign key (user_id)
    references auth.users(id);

-- Add table comment
comment on table public.gift_boxes is '中秋节礼盒申请记录表';

-- Enable RLS
alter table public.gift_boxes enable row level security;

-- Create RLS policies
-- 员工可以查看自己的申请记录
create policy "Users can view their own applications"
on public.gift_boxes
for select
to authenticated
using (auth.uid()::uuid = user_id);

-- 员工可以创建申请记录（每人限一次）
create policy "Users can create one application"
on public.gift_boxes
for insert
to authenticated
with check (
    auth.uid()::uuid = user_id and
    not exists (
        select 1
        from public.gift_boxes
        where user_id = auth.uid()::uuid
    )
);

-- 管理员可以查看所有记录
create policy "Admins can view all applications"
on public.gift_boxes
for select
to authenticated
using (
    auth.jwt() ->> 'email' = 'admin@example.com'
);

-- 管理员可以更新记录（填写快递单号）
create policy "Admins can update applications"
on public.gift_boxes
for update
to authenticated
using (
    auth.jwt() ->> 'email' = 'admin@example.com'
)
with check (
    auth.jwt() ->> 'email' = 'admin@example.com'
);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$;

create trigger handle_updated_at
    before update on public.gift_boxes
    for each row
    execute function public.handle_updated_at();

-- Insert initial users
-- Note: Passwords are same as emails for testing purposes
insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) values
    ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'admin@example.com', crypt('admin@example.com', gen_salt('bf')), now(), null, now(), '{"provider": "email"}', '{}', now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'e0001@example.com', crypt('e0001@example.com', gen_salt('bf')), now(), null, now(), '{"provider": "email"}', '{}', now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'e0002@example.com', crypt('e0002@example.com', gen_salt('bf')), now(), null, now(), '{"provider": "email"}', '{}', now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'authenticated', 'authenticated', 'e0003@example.com', crypt('e0003@example.com', gen_salt('bf')), now(), null, now(), '{"provider": "email"}', '{}', now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555', 'authenticated', 'authenticated', 'e0004@example.com', crypt('e0004@example.com', gen_salt('bf')), now(), null, now(), '{"provider": "email"}', '{}', now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', '66666666-6666-6666-6666-666666666666', 'authenticated', 'authenticated', 'e0005@example.com', crypt('e0005@example.com', gen_salt('bf')), now(), null, now(), '{"provider": "email"}', '{}', now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', '77777777-7777-7777-7777-777777777777', 'authenticated', 'authenticated', 'e0006@example.com', crypt('e0006@example.com', gen_salt('bf')), now(), null, now(), '{"provider": "email"}', '{}', now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', '88888888-8888-8888-8888-888888888888', 'authenticated', 'authenticated', 'e0007@example.com', crypt('e0007@example.com', gen_salt('bf')), now(), null, now(), '{"provider": "email"}', '{}', now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', '99999999-9999-9999-9999-999999999999', 'authenticated', 'authenticated', 'e0008@example.com', crypt('e0008@example.com', gen_salt('bf')), now(), null, now(), '{"provider": "email"}', '{}', now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'authenticated', 'authenticated', 'e0009@example.com', crypt('e0009@example.com', gen_salt('bf')), now(), null, now(), '{"provider": "email"}', '{}', now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'authenticated', 'authenticated', 'e0010@example.com', crypt('e0010@example.com', gen_salt('bf')), now(), null, now(), '{"provider": "email"}', '{}', now(), now(), '', '', '', '');
