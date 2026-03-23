-- Extensions
create extension if not exists "pg_cron" with schema "pg_catalog";
create extension if not exists "postgis" with schema "extensions";

-- Types
create type "public"."location_type" as enum ('system', 'user');
create type "public"."travel_direction" as enum ('to_campus', 'from_campus');
create type "public"."user_role" as enum ('passenger', 'driver');
create type "public"."driver_type" as ("id" uuid, "plate" character varying, "color" character varying, "seats" smallint, "rides" bigint, "rating" smallint, "votes" bigint, "price" numeric, "user_tag" text, "user_avatar" text, "qr_url" text);
create type "public"."travel_room_stop_type" as ("user_id" uuid, "user_role" public.user_role, "stop_coords" double precision[], "seats" smallint, "user_tag" text, "user_avatar" text);

-- Tables
create table "public"."driver" (
  "id" uuid not null,
  "plate" character varying(50),
  "color" character varying(30),
  "seats" smallint default 4,
  "rides" bigint not null default 0,
  "rating" smallint,
  "votes" bigint not null default 0,
  "price" numeric not null default '5'::numeric,
  "qr_url" text,
  "wallet_address" text
);

alter table "public"."driver" enable row level security;

create table "public"."location" (
  "id" uuid not null default gen_random_uuid(),
  "user_id" uuid,
  "name" character varying(100) not null default 'Casa'::character varying,
  "type" public.location_type not null default 'user'::public.location_type,
  "coords" extensions.geometry(Point,4326) not null,
  "created_at" timestamp with time zone not null default now()
);

alter table "public"."location" enable row level security;

create table "public"."profile" (
  "id" uuid not null,
  "tag" character varying(100) not null,
  "is_driver" boolean not null default false,
  "contribution" numeric(4,2) not null default '0'::numeric,
  "rides" bigint not null default 0,
  "rating" smallint,
  "votes" bigint not null default 0,
  "avatar" text,
  "location_id" uuid,
  "last_travel" timestamp with time zone
);

alter table "public"."profile" enable row level security;

create table "public"."travel_room" (
  "id" uuid not null default gen_random_uuid(),
  "owner_id" uuid not null,
  "direction" public.travel_direction not null,
  "datetime" timestamp with time zone not null,
  "recurrence_rule" text,
  "created_at" timestamp with time zone not null default now(),
  "updated_at" timestamp with time zone not null default now(),
  "active" boolean not null default true,
  "current_stop" smallint not null default '0'::smallint,
  "allow" boolean not null default true
);

alter table "public"."travel_room" enable row level security;

create table "public"."travel_room_stop" (
  "room_id" uuid not null,
  "user_id" uuid not null,
  "user_role" public.user_role not null,
  "stop_coords" extensions.geometry(Point,4326) not null,
  "seats" smallint not null default 1,
  "price" numeric(4,2) not null default 5.00,
  "created_at" timestamp with time zone not null default now(),
  "confirmed" boolean not null default false
);

alter table "public"."travel_room_stop" enable row level security;

-- Indexes
CREATE UNIQUE INDEX driver_pkey ON public.driver USING btree (id);
CREATE UNIQUE INDEX driver_qr_url_key ON public.driver USING btree (qr_url);
CREATE INDEX idx_location_coords_gist ON public.location USING gist (coords);
CREATE INDEX idx_location_user_id ON public.location USING btree (user_id);
CREATE INDEX idx_stop_coords_gist ON public.travel_room_stop USING gist (stop_coords);
CREATE UNIQUE INDEX location_pkey ON public.location USING btree (id);
CREATE UNIQUE INDEX profile_pkey ON public.profile USING btree (id);
CREATE UNIQUE INDEX profile_tag_key ON public.profile USING btree (tag);
CREATE UNIQUE INDEX travel_room_pkey ON public.travel_room USING btree (id);
CREATE UNIQUE INDEX travel_room_stop_pkey ON public.travel_room_stop USING btree (room_id, user_id);

-- Primary keys
alter table "public"."driver" add constraint "driver_pkey" PRIMARY KEY using index "driver_pkey";
alter table "public"."location" add constraint "location_pkey" PRIMARY KEY using index "location_pkey";
alter table "public"."profile" add constraint "profile_pkey" PRIMARY KEY using index "profile_pkey";
alter table "public"."travel_room" add constraint "travel_room_pkey" PRIMARY KEY using index "travel_room_pkey";
alter table "public"."travel_room_stop" add constraint "travel_room_stop_pkey" PRIMARY KEY using index "travel_room_stop_pkey";

-- Foreign keys
alter table "public"."driver" add constraint "driver_id_fkey" FOREIGN KEY (id) REFERENCES public.profile(id) ON DELETE CASCADE not valid;
alter table "public"."driver" validate constraint "driver_id_fkey";

alter table "public"."driver" add constraint "driver_qr_url_key" UNIQUE using index "driver_qr_url_key";

alter table "public"."driver" add constraint "driver_rating_check" CHECK (((rating IS NULL) OR ((rating >= 0) AND (rating <= 5)))) not valid;
alter table "public"."driver" validate constraint "driver_rating_check";

alter table "public"."location" add constraint "location_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profile(id) ON DELETE CASCADE not valid;
alter table "public"."location" validate constraint "location_user_id_fkey";

alter table "public"."profile" add constraint "fk_profile_user" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;
alter table "public"."profile" validate constraint "fk_profile_user";

alter table "public"."profile" add constraint "profile_location_id_fkey" FOREIGN KEY (location_id) REFERENCES public.location(id) ON DELETE SET NULL not valid;
alter table "public"."profile" validate constraint "profile_location_id_fkey";

alter table "public"."profile" add constraint "profile_rating_check" CHECK (((rating IS NULL) OR ((rating >= 0) AND (rating <= 5)))) not valid;
alter table "public"."profile" validate constraint "profile_rating_check";

alter table "public"."profile" add constraint "profile_tag_key" UNIQUE using index "profile_tag_key";

alter table "public"."travel_room" add constraint "travel_room_owner_id_fkey1" FOREIGN KEY (owner_id) REFERENCES public.profile(id) not valid;
alter table "public"."travel_room" validate constraint "travel_room_owner_id_fkey1";

alter table "public"."travel_room_stop" add constraint "travel_room_stop_room_id_fkey" FOREIGN KEY (room_id) REFERENCES public.travel_room(id) ON DELETE CASCADE not valid;
alter table "public"."travel_room_stop" validate constraint "travel_room_stop_room_id_fkey";

alter table "public"."travel_room_stop" add constraint "travel_room_stop_user_id_fkey1" FOREIGN KEY (user_id) REFERENCES public.profile(id) ON DELETE CASCADE not valid;
alter table "public"."travel_room_stop" validate constraint "travel_room_stop_user_id_fkey1";

-- Functions
set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_available_seats(p_room_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$DECLARE
  v_driver_id uuid;
  v_capacity int;
  v_taken_seats int;
BEGIN
  SELECT trs.user_id
  INTO v_driver_id
  FROM public.travel_room_stop trs
  WHERE trs.room_id = p_room_id
    AND trs.user_role = 'driver'
  LIMIT 1;

  IF v_driver_id IS NULL THEN
    RETURN 8;
  END IF;

  SELECT d.seats
  INTO v_capacity
  FROM public.driver d
  WHERE d.id = v_driver_id;

  SELECT COALESCE(SUM(trs.seats), 0)
  INTO v_taken_seats
  FROM public.travel_room_stop trs
  WHERE trs.room_id = p_room_id
    AND trs.user_role = 'passenger';

  RETURN v_capacity - v_taken_seats;
END;$function$
;

CREATE OR REPLACE FUNCTION public.get_travel_room_detail(p_id uuid)
 RETURNS TABLE(id uuid, owner_id uuid, direction public.travel_direction, datetime timestamp with time zone, recurrence_rule text, current_stop smallint, stops public.travel_room_stop_type[], driver public.driver_type)
 LANGUAGE plpgsql
AS $function$BEGIN
    RETURN QUERY
    SELECT
        tr.id,
        tr.owner_id,
        tr.direction,
        tr.datetime,
        tr.recurrence_rule,
        tr.current_stop,
        (
            SELECT ARRAY_AGG(
              ROW(
                trs.user_id,
                trs.user_role,
                ARRAY[ST_Y(trs.stop_coords), ST_X(trs.stop_coords)],
                trs.seats,
                pf.tag,
                pf.avatar
              )::travel_room_stop_type
              ORDER BY trs.created_at ASC
            )
            FROM travel_room_stop trs
            JOIN public.profile pf ON pf.id = trs.user_id
            WHERE trs.room_id = tr.id
        ) AS stops,
        (
            SELECT ROW(
              d.id,
              d.plate,
              d.color,
              d.seats,
              d.rides,
              d.rating,
              d.votes,
              d.price,
              pf.tag,
              pf.avatar,
              d.qr_url
            )::driver_type
            FROM driver d
            JOIN public.profile pf ON pf.id = d.id
            WHERE d.id = (
                SELECT trs.user_id
                FROM travel_room_stop trs
                WHERE trs.room_id = tr.id
                  AND trs.user_role = 'driver'
                LIMIT 1
            )
        ) AS driver
    FROM travel_room tr
    WHERE tr.id = p_id
      AND tr.active = TRUE;
END;$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$begin
  insert into public.profile (id, tag, avatar)
  values (new.id, split_part(new.email, '@', 1), new.raw_user_meta_data->>'avatar_url');
  return new;
end;$function$
;

CREATE OR REPLACE FUNCTION public.increment_profile_rides(p_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$BEGIN
    UPDATE public.profile
    SET 
        rides = COALESCE(rides, 0) + 1,
        contribution = COALESCE(contribution, 0) + 1.5,
        last_travel = NOW()
    WHERE id = p_id;
END;$function$
;

CREATE OR REPLACE FUNCTION public.rate_driver(p_driver uuid, p_rate integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$BEGIN
  UPDATE public.driver
  SET 
      rating = ((rating * votes) + p_rate) / (votes + 1),
      votes = votes + 1
  WHERE id = p_driver;
END;$function$
;

CREATE OR REPLACE FUNCTION public.search_travel_rooms(p_direction public.travel_direction DEFAULT NULL::public.travel_direction, p_lat double precision DEFAULT NULL::double precision, p_lon double precision DEFAULT NULL::double precision, p_date timestamp with time zone DEFAULT NULL::timestamp with time zone, p_only_offers boolean DEFAULT NULL::boolean, p_limit integer DEFAULT 5, p_offset integer DEFAULT 0)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
declare
  v_total int;
  v_total_pages int;
  v_page int;
  v_next int;
  v_travels jsonb;
begin

  with base as (
    select tr.*
    from travel_room tr
    where tr.active = true
      and (p_direction is null or tr.direction = p_direction)
      and (
        p_only_offers is null
        or (
          p_only_offers = true
          and exists (
            select 1
            from travel_room_stop trs
            where trs.room_id = tr.id
            and trs.user_role = 'driver'
          )
        )
      )
  )
  select count(*)
  into v_total
  from base;

  v_page := floor(p_offset / p_limit) + 1;

  if v_total = 0 then
    v_total_pages := 0;
  else
    v_total_pages := ceil(v_total::numeric / p_limit);
  end if;

  if p_offset + p_limit >= v_total then
    v_next := null;
  else
    v_next := p_offset + p_limit;
  end if;

  with base as (
    select tr.*
    from travel_room tr
    where tr.active = true
      and (p_direction is null or tr.direction = p_direction)
      and (
        p_only_offers is null
        or (
          p_only_offers = true
          and exists (
            select 1
            from travel_room_stop trs
            where trs.room_id = tr.id
            and trs.user_role = 'driver'
          )
        )
      )
  )
  select jsonb_agg(row_to_json(t))
  into v_travels
  from (
    select
      tr.id,
      tr.owner_id,
      tr.direction,
      tr.datetime,
      tr.recurrence_rule,
      (
        select array_agg(
          row(
            trs.user_id,
            trs.user_role,
            array[st_y(trs.stop_coords), st_x(trs.stop_coords)],
            trs.seats,
            pf.tag,
            pf.avatar
          )::travel_room_stop_type
        )
        from travel_room_stop trs
        join public.profile pf on pf.id = trs.user_id
        where trs.room_id = tr.id
      ) as stops,
      (
        select row(
          d.id,
          d.plate,
          d.color,
          d.seats,
          d.rides,
          d.rating,
          d.votes,
          d.price,
          pf.tag,
          pf.avatar,
          d.qr_url
        )::driver_type
        from driver d
        join public.profile pf on pf.id = d.id
        where d.id = (
          select trs.user_id
          from travel_room_stop trs
          where trs.room_id = tr.id
          and trs.user_role = 'driver'
          limit 1
        )
      ) as driver,
      (
        (case when p_direction is not null and tr.direction = p_direction then 1 else 0 end) +
        (case
          when p_lat is not null and p_lon is not null then
            1.0 / (
              1.0 + st_distance(
                (
                  select stop_coords
                  from travel_room_stop
                  where room_id = tr.id
                  limit 1
                ),
                st_setsrid(st_makepoint(p_lon, p_lat), 4326)
              )
            )
          else 0
        end) +
        (case
          when p_date is not null then
            1.0 / (1.0 + abs(extract(epoch from (tr.datetime - p_date))))
          else 0
        end) +
        (case when tr.recurrence_rule is null then 0.5 else 0 end)
      ) as relevance_score
    from base tr
    order by relevance_score desc, tr.created_at desc
    limit p_limit
    offset p_offset
  ) t;

  return jsonb_build_object(
    'travels', coalesce(v_travels, '[]'::jsonb),
    'metadata', jsonb_build_object(
      'total', v_total,
      'page', v_page,
      'totalPages', v_total_pages,
      'next', v_next
    )
  );

end;
$function$
;

-- Grants
grant delete on table "public"."driver" to "anon";
grant insert on table "public"."driver" to "anon";
grant references on table "public"."driver" to "anon";
grant select on table "public"."driver" to "anon";
grant trigger on table "public"."driver" to "anon";
grant truncate on table "public"."driver" to "anon";
grant update on table "public"."driver" to "anon";
grant delete on table "public"."driver" to "authenticated";
grant insert on table "public"."driver" to "authenticated";
grant references on table "public"."driver" to "authenticated";
grant select on table "public"."driver" to "authenticated";
grant trigger on table "public"."driver" to "authenticated";
grant truncate on table "public"."driver" to "authenticated";
grant update on table "public"."driver" to "authenticated";
grant delete on table "public"."driver" to "service_role";
grant insert on table "public"."driver" to "service_role";
grant references on table "public"."driver" to "service_role";
grant select on table "public"."driver" to "service_role";
grant trigger on table "public"."driver" to "service_role";
grant truncate on table "public"."driver" to "service_role";
grant update on table "public"."driver" to "service_role";

grant delete on table "public"."location" to "anon";
grant insert on table "public"."location" to "anon";
grant references on table "public"."location" to "anon";
grant select on table "public"."location" to "anon";
grant trigger on table "public"."location" to "anon";
grant truncate on table "public"."location" to "anon";
grant update on table "public"."location" to "anon";
grant delete on table "public"."location" to "authenticated";
grant insert on table "public"."location" to "authenticated";
grant references on table "public"."location" to "authenticated";
grant select on table "public"."location" to "authenticated";
grant trigger on table "public"."location" to "authenticated";
grant truncate on table "public"."location" to "authenticated";
grant update on table "public"."location" to "authenticated";
grant delete on table "public"."location" to "service_role";
grant insert on table "public"."location" to "service_role";
grant references on table "public"."location" to "service_role";
grant select on table "public"."location" to "service_role";
grant trigger on table "public"."location" to "service_role";
grant truncate on table "public"."location" to "service_role";
grant update on table "public"."location" to "service_role";

grant delete on table "public"."profile" to "anon";
grant insert on table "public"."profile" to "anon";
grant references on table "public"."profile" to "anon";
grant select on table "public"."profile" to "anon";
grant trigger on table "public"."profile" to "anon";
grant truncate on table "public"."profile" to "anon";
grant update on table "public"."profile" to "anon";
grant delete on table "public"."profile" to "authenticated";
grant insert on table "public"."profile" to "authenticated";
grant references on table "public"."profile" to "authenticated";
grant select on table "public"."profile" to "authenticated";
grant trigger on table "public"."profile" to "authenticated";
grant truncate on table "public"."profile" to "authenticated";
grant update on table "public"."profile" to "authenticated";
grant delete on table "public"."profile" to "service_role";
grant insert on table "public"."profile" to "service_role";
grant references on table "public"."profile" to "service_role";
grant select on table "public"."profile" to "service_role";
grant trigger on table "public"."profile" to "service_role";
grant truncate on table "public"."profile" to "service_role";
grant update on table "public"."profile" to "service_role";

grant delete on table "public"."travel_room" to "anon";
grant insert on table "public"."travel_room" to "anon";
grant references on table "public"."travel_room" to "anon";
grant select on table "public"."travel_room" to "anon";
grant trigger on table "public"."travel_room" to "anon";
grant truncate on table "public"."travel_room" to "anon";
grant update on table "public"."travel_room" to "anon";
grant delete on table "public"."travel_room" to "authenticated";
grant insert on table "public"."travel_room" to "authenticated";
grant references on table "public"."travel_room" to "authenticated";
grant select on table "public"."travel_room" to "authenticated";
grant trigger on table "public"."travel_room" to "authenticated";
grant truncate on table "public"."travel_room" to "authenticated";
grant update on table "public"."travel_room" to "authenticated";
grant delete on table "public"."travel_room" to "service_role";
grant insert on table "public"."travel_room" to "service_role";
grant references on table "public"."travel_room" to "service_role";
grant select on table "public"."travel_room" to "service_role";
grant trigger on table "public"."travel_room" to "service_role";
grant truncate on table "public"."travel_room" to "service_role";
grant update on table "public"."travel_room" to "service_role";

grant delete on table "public"."travel_room_stop" to "anon";
grant insert on table "public"."travel_room_stop" to "anon";
grant references on table "public"."travel_room_stop" to "anon";
grant select on table "public"."travel_room_stop" to "anon";
grant trigger on table "public"."travel_room_stop" to "anon";
grant truncate on table "public"."travel_room_stop" to "anon";
grant update on table "public"."travel_room_stop" to "anon";
grant delete on table "public"."travel_room_stop" to "authenticated";
grant insert on table "public"."travel_room_stop" to "authenticated";
grant references on table "public"."travel_room_stop" to "authenticated";
grant select on table "public"."travel_room_stop" to "authenticated";
grant trigger on table "public"."travel_room_stop" to "authenticated";
grant truncate on table "public"."travel_room_stop" to "authenticated";
grant update on table "public"."travel_room_stop" to "authenticated";
grant delete on table "public"."travel_room_stop" to "service_role";
grant insert on table "public"."travel_room_stop" to "service_role";
grant references on table "public"."travel_room_stop" to "service_role";
grant select on table "public"."travel_room_stop" to "service_role";
grant trigger on table "public"."travel_room_stop" to "service_role";
grant truncate on table "public"."travel_room_stop" to "service_role";
grant update on table "public"."travel_room_stop" to "service_role";

-- RLS Policies
create policy "Delete profile with service_role"
  on "public"."driver"
  as permissive
  for delete
  to service_role
  using (true);

create policy "Enable insert for users based on user_id"
  on "public"."driver"
  as permissive
  for insert
  to authenticated
  with check ((( SELECT auth.uid() AS uid) = id));

create policy "Enable read access for all users"
  on "public"."driver"
  as permissive
  for select
  to public
  using (true);

create policy "Enable update for users based on user_id"
  on "public"."driver"
  as permissive
  for update
  to authenticated
  using ((auth.uid() = id))
  with check ((( SELECT auth.uid() AS uid) = id));

create policy "Enable delete for users based on user_id"
  on "public"."location"
  as permissive
  for delete
  to authenticated
  using ((( SELECT auth.uid() AS uid) = user_id));

create policy "Enable insert for users based on user_id"
  on "public"."location"
  as permissive
  for insert
  to authenticated
  with check ((( SELECT auth.uid() AS uid) = user_id));

create policy "Enable read access for all users"
  on "public"."location"
  as permissive
  for select
  to public
  using (true);

create policy "Enable update for users based on user_id"
  on "public"."location"
  as permissive
  for update
  to authenticated
  using ((( SELECT auth.uid() AS uid) = user_id));

create policy "Delete profile with service_role"
  on "public"."profile"
  as permissive
  for delete
  to service_role
  using (true);

create policy "Enable insert for users based on user_id"
  on "public"."profile"
  as permissive
  for insert
  to authenticated
  with check ((( SELECT auth.uid() AS uid) = id));

create policy "Enable read access for all users"
  on "public"."profile"
  as permissive
  for select
  to public
  using (true);

create policy "Enable update for users based on user_id"
  on "public"."profile"
  as permissive
  for update
  to authenticated
  using ((( SELECT auth.uid() AS uid) = id));

create policy "Enable delete for users based on user_id and driver_id"
  on "public"."travel_room"
  as permissive
  for delete
  to authenticated
  using (((auth.uid() = owner_id) OR (EXISTS ( SELECT 1
     FROM public.travel_room_stop trs
    WHERE ((trs.room_id = travel_room.id) AND (trs.user_id = auth.uid()) AND (trs.user_role = 'driver'::public.user_role))))));

create policy "Enable insert for users based on user_id"
  on "public"."travel_room"
  as permissive
  for insert
  to authenticated
  with check ((( SELECT auth.uid() AS uid) = owner_id));

create policy "Enable read access for all users"
  on "public"."travel_room"
  as permissive
  for select
  to public
  using (true);

create policy "Enable update for users based on user_id"
  on "public"."travel_room"
  as permissive
  for update
  to public
  using ((EXISTS ( SELECT 1
     FROM public.travel_room_stop trs
    WHERE ((trs.room_id = travel_room.id) AND (trs.user_id = auth.uid())))))
  with check ((EXISTS ( SELECT 1
     FROM public.travel_room_stop trs
    WHERE ((trs.room_id = travel_room.id) AND (trs.user_id = auth.uid())))));

create policy "Enable delete for users based on user_id"
  on "public"."travel_room_stop"
  as permissive
  for delete
  to authenticated
  using ((( SELECT auth.uid() AS uid) = user_id));

create policy "Enable insert for users based on user_id"
  on "public"."travel_room_stop"
  as permissive
  for insert
  to authenticated
  with check ((( SELECT auth.uid() AS uid) = user_id));

create policy "Enable read access for all users"
  on "public"."travel_room_stop"
  as permissive
  for select
  to public
  using (true);

create policy "Enable update for users based on user_id"
  on "public"."travel_room_stop"
  as permissive
  for update
  to authenticated
  using ((( SELECT auth.uid() AS uid) = user_id));

-- Triggers
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();