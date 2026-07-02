create schema if not exists extensions;
create extension if not exists "postgis" schema extensions;
create extension if not exists "pg_cron";

CREATE SCHEMA IF NOT EXISTS public;


--
-- TOC entry 2269 (class 1247 OID 49275)
-- Name: driver_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.driver_type AS (
	id uuid,
	plate character varying,
	color character varying,
	seats smallint,
	rides bigint,
	rating smallint,
	votes bigint,
	price numeric,
	user_tag text,
	user_avatar text,
	qr_url text,
	route_description text
);


--
-- TOC entry 2316 (class 1247 OID 40074)
-- Name: location_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.location_type AS ENUM (
    'system',
    'user'
);


--
-- TOC entry 2275 (class 1247 OID 40126)
-- Name: travel_direction; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.travel_direction AS ENUM (
    'to_campus',
    'from_campus'
);


--
-- TOC entry 2278 (class 1247 OID 40132)
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'passenger',
    'driver'
);


--
-- TOC entry 2313 (class 1247 OID 45916)
-- Name: travel_room_stop_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.travel_room_stop_type AS (
	user_id uuid,
	user_role public.user_role,
	stop_coords double precision[],
	seats smallint,
	user_tag text,
	user_avatar text
);

CREATE FUNCTION public.get_available_seats(p_room_id uuid) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_driver_id uuid;
  v_capacity int;
  v_taken_seats int;
BEGIN
  -- obtener driver_id desde travel_room_stop
  SELECT trs.user_id
  INTO v_driver_id
  FROM public.travel_room_stop trs
  WHERE trs.room_id = p_room_id
    AND trs.user_role = 'driver'
  LIMIT 1;

  -- si no hay driver, no hay límite
  IF v_driver_id IS NULL THEN
    RETURN 8;
  END IF;

  -- obtener capacidad del driver
  SELECT d.seats
  INTO v_capacity
  FROM public.driver d
  WHERE d.id = v_driver_id;

  -- sumar asientos tomados por pasajeros
  SELECT COALESCE(SUM(trs.seats), 0)
  INTO v_taken_seats
  FROM public.travel_room_stop trs
  WHERE trs.room_id = p_room_id
    AND trs.user_role = 'passenger';

  -- devolver asientos disponibles
  RETURN v_capacity - v_taken_seats;
END;
$$;


--
-- TOC entry 1580 (class 1255 OID 52663)
-- Name: get_travel_room_detail(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_travel_room_detail(p_id uuid) RETURNS TABLE(id uuid, owner_id uuid, direction public.travel_direction, datetime timestamp with time zone, recurrence_rule text, current_stop smallint, stops public.travel_room_stop_type[], driver public.driver_type)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    return query
  select
    tr.id,
    tr.owner_id,
    tr.direction,
    tr.datetime,
    tr.recurrence_rule,
    tr.current_stop,
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
        order by trs.created_at asc
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
        d.qr_url,
        d.route_description
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
    ) as driver
  from travel_room tr
  where tr.id = p_id
    and tr.active = true;
END;
$$;


--
-- TOC entry 1578 (class 1255 OID 42423)
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$begin
  insert into public.profile (id, tag, avatar)
  values (new.id, split_part(new.email, '@', 1), new.raw_user_meta_data->>'avatar_url');
  return new;
end;$$;


--
-- TOC entry 1585 (class 1255 OID 64832)
-- Name: increment_profile_rides(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.increment_profile_rides(p_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$BEGIN
    UPDATE public.profile
    SET 
        rides = COALESCE(rides, 0) + 1,
        contribution = COALESCE(contribution, 0) + 1.5,
        last_travel = NOW()
    WHERE id = p_id;
END;$$;


--
-- TOC entry 1593 (class 1255 OID 78706)
-- Name: rate_driver(uuid, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.rate_driver(p_driver uuid, p_rate integer) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$BEGIN
  UPDATE public.driver
  SET 
      rating = ((rating * votes) + p_rate) / (votes + 1),
      votes = votes + 1
  WHERE id = p_driver;
END;$$;


--
-- TOC entry 1594 (class 1255 OID 78713)
-- Name: search_travel_rooms(public.travel_direction, double precision, double precision, timestamp with time zone, boolean, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.search_travel_rooms(p_direction public.travel_direction DEFAULT NULL::public.travel_direction, p_lat double precision DEFAULT NULL::double precision, p_lon double precision DEFAULT NULL::double precision, p_date timestamp with time zone DEFAULT NULL::timestamp with time zone, p_only_offers boolean DEFAULT NULL::boolean, p_limit integer DEFAULT 5, p_offset integer DEFAULT 0) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$declare
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
        or (
          p_only_offers = false
          and not exists (
            select 1
            from travel_room_stop trs
            where trs.room_id = tr.id
              and trs.user_role = 'driver'
          )
        )
      )
  )
  select count(*) into v_total from base;

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
        or (
          p_only_offers = false
          and not exists (
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
          d.qr_url,
          d.route_description
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
end;$$;


--
-- TOC entry 1595 (class 1255 OID 95565)
-- Name: set_updated_at_push_device_token(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at_push_device_token() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  new.updated_at := now();
  return new;
end;
$$;


--
-- TOC entry 1596 (class 1255 OID 105736)
-- Name: validate_driver_exists(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_driver_exists() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Solo validar si el nuevo valor de is_driver es true
  IF NEW.is_driver = true THEN
    -- Verificar existencia en la tabla driver
    IF NOT EXISTS (
      SELECT 1
      FROM public.driver d
      WHERE d.id = NEW.id
    ) THEN
      -- Cancelar la operación
      RAISE EXCEPTION 'No existe un registro en driver para el usuario %', NEW.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: get_user_recurrent_travels(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_recurrent_travels(p_user_id uuid)
RETURNS TABLE(id uuid, direction public.travel_direction, origin_coords double precision[], destination_coords double precision[], seats smallint, price numeric, recurrence_rule text, route_description text, is_visible boolean, trip_time time without time zone, created_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    rt.id,
    rt.direction,
    array[st_y(rt.origin_coords), st_x(rt.origin_coords)],
    array[st_y(rt.destination_coords), st_x(rt.destination_coords)],
    rt.seats,
    rt.price,
    rt.recurrence_rule,
    rt.route_description,
    rt.is_visible,
    rt.trip_time,
    rt.created_at
  FROM public.recurrent_travel rt
  WHERE rt.user_id = p_user_id
  ORDER BY rt.created_at DESC;
END;
$$;


--
-- Name: count_user_recurrent_travels(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.count_user_recurrent_travels(p_user_id uuid) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.recurrent_travel rt
  WHERE rt.user_id = p_user_id;
  RETURN v_count;
END;
$$;


--
-- Name: get_public_recurrent_travels_by_tag(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_public_recurrent_travels_by_tag(p_user_tag text)
RETURNS TABLE(user_id uuid, user_tag text, user_avatar text, user_rating smallint, user_rides bigint, is_driver boolean, recurrent_travels jsonb)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.tag::text,
    p.avatar,
    p.rating,
    p.rides::bigint,
    p.is_driver,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', rt.id,
            'direction', rt.direction,
            'origin_coords', array[st_y(rt.origin_coords), st_x(rt.origin_coords)],
            'destination_coords', array[st_y(rt.destination_coords), st_x(rt.destination_coords)],
            'seats', rt.seats,
            'price', rt.price,
            'recurrence_rule', rt.recurrence_rule,
            'route_description', rt.route_description,
            'is_visible', rt.is_visible,
            'trip_time', rt.trip_time,
            'created_at', rt.created_at
          )
          ORDER BY rt.created_at DESC
        )
        FROM public.recurrent_travel rt
        WHERE rt.user_id = p.id
          AND rt.is_visible = true
      ),
      '[]'::jsonb
    )
  FROM public.profile p
  WHERE p.tag = p_user_tag;
END;
$$;


--
-- Name: search_visible_recurrent_travels(public.travel_direction, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.search_visible_recurrent_travels(
    p_direction public.travel_direction DEFAULT NULL::public.travel_direction,
    p_limit integer DEFAULT 20,
    p_offset integer DEFAULT 0
) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
declare
  v_total int;
  v_travels jsonb;
begin
  select count(*) into v_total
  from public.recurrent_travel rt
  where rt.is_visible = true
    and (p_direction is null or rt.direction = p_direction);

  select jsonb_agg(row_to_json(t))
  into v_travels
  from (
    select
      rt.id,
      rt.user_id,
      pf.tag as user_tag,
      pf.avatar as user_avatar,
      rt.direction,
      array[st_y(rt.origin_coords), st_x(rt.origin_coords)] as origin_coords,
      array[st_y(rt.destination_coords), st_x(rt.destination_coords)] as destination_coords,
      rt.seats,
      rt.price,
      rt.recurrence_rule,
      rt.route_description,
      rt.trip_time,
      rt.created_at
    from public.recurrent_travel rt
    join public.profile pf on pf.id = rt.user_id
    where rt.is_visible = true
      and (p_direction is null or rt.direction = p_direction)
    order by rt.created_at desc
    limit p_limit
    offset p_offset
  ) t;

  return jsonb_build_object(
    'travels', coalesce(v_travels, '[]'::jsonb),
    'total', v_total
  );
end;
$$;

SET default_table_access_method = heap;

--
-- TOC entry 404 (class 1259 OID 41278)
-- Name: driver; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.driver (
    id uuid NOT NULL,
    plate character varying(50),
    color character varying(30),
    seats smallint DEFAULT 4,
    rides bigint DEFAULT 0 NOT NULL,
    rating smallint,
    votes bigint DEFAULT 0 NOT NULL,
    price numeric DEFAULT '5'::numeric NOT NULL,
    qr_url text,
    wallet_address text,
    route_description text,
    CONSTRAINT driver_rating_check CHECK (((rating IS NULL) OR ((rating >= 0) AND (rating <= 5))))
);


--
-- TOC entry 400 (class 1259 OID 40079)
-- Name: location; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.location (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    name character varying(100) DEFAULT 'Casa'::character varying NOT NULL,
    type public.location_type DEFAULT 'user'::public.location_type NOT NULL,
    coords extensions.geometry(Point,4326) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 401 (class 1259 OID 40097)
-- Name: profile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profile (
    id uuid NOT NULL,
    tag character varying(100) NOT NULL,
    is_driver boolean DEFAULT false NOT NULL,
    contribution numeric(4,2) DEFAULT '0'::numeric NOT NULL,
    rides bigint DEFAULT 0 NOT NULL,
    rating smallint,
    votes bigint DEFAULT 0 NOT NULL,
    avatar text,
    location_id uuid,
    last_travel timestamp with time zone,
    CONSTRAINT profile_rating_check CHECK (((rating IS NULL) OR ((rating >= 0) AND (rating <= 5))))
);


--
-- TOC entry 414 (class 1259 OID 95545)
-- Name: push_device_token; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.push_device_token (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token text NOT NULL,
    platform text,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 402 (class 1259 OID 40137)
-- Name: travel_room; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.travel_room (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    direction public.travel_direction NOT NULL,
    datetime timestamp with time zone NOT NULL,
    recurrence_rule text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    active boolean DEFAULT true NOT NULL,
    current_stop smallint DEFAULT '0'::smallint NOT NULL,
    allow boolean DEFAULT true NOT NULL
);


--
-- TOC entry 403 (class 1259 OID 41257)
-- Name: travel_room_stop; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.travel_room_stop (
    room_id uuid NOT NULL,
    user_id uuid NOT NULL,
    user_role public.user_role NOT NULL,
    stop_coords extensions.geometry(Point,4326) NOT NULL,
    seats smallint DEFAULT 1 NOT NULL,
    price numeric(4,2) DEFAULT 5.00 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    confirmed boolean DEFAULT false NOT NULL
);


--
-- Name: recurrent_travel; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recurrent_travel (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    direction public.travel_direction NOT NULL,
    origin_coords extensions.geometry(Point,4326) NOT NULL,
    destination_coords extensions.geometry(Point,4326) NOT NULL,
    seats smallint DEFAULT 1 NOT NULL,
    price numeric(4,2) DEFAULT 5.00 NOT NULL,
    recurrence_rule text NOT NULL,
    route_description text,
    is_visible boolean DEFAULT true NOT NULL,
    trip_time time without time zone DEFAULT '08:00'::time without time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 4958 (class 2606 OID 41286)
-- Name: driver driver_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.driver
    ADD CONSTRAINT driver_pkey PRIMARY KEY (id);


--
-- TOC entry 4960 (class 2606 OID 76380)
-- Name: driver driver_qr_url_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.driver
    ADD CONSTRAINT driver_qr_url_key UNIQUE (qr_url);


--
-- TOC entry 4947 (class 2606 OID 40089)
-- Name: location location_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.location
    ADD CONSTRAINT location_pkey PRIMARY KEY (id);


--
-- TOC entry 4949 (class 2606 OID 40106)
-- Name: profile profile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile
    ADD CONSTRAINT profile_pkey PRIMARY KEY (id);


--
-- TOC entry 4951 (class 2606 OID 41300)
-- Name: profile profile_tag_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile
    ADD CONSTRAINT profile_tag_key UNIQUE (tag);


--
-- TOC entry 4963 (class 2606 OID 95555)
-- Name: push_device_token push_device_token_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_device_token
    ADD CONSTRAINT push_device_token_pkey PRIMARY KEY (id);


--
-- TOC entry 4965 (class 2606 OID 95557)
-- Name: push_device_token push_device_token_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_device_token
    ADD CONSTRAINT push_device_token_token_key UNIQUE (token);


--
-- TOC entry 4953 (class 2606 OID 40146)
-- Name: travel_room travel_room_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.travel_room
    ADD CONSTRAINT travel_room_pkey PRIMARY KEY (id);


--
-- TOC entry 4956 (class 2606 OID 41266)
-- Name: travel_room_stop travel_room_stop_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.travel_room_stop
    ADD CONSTRAINT travel_room_stop_pkey PRIMARY KEY (room_id, user_id);


--
-- Name: recurrent_travel recurrent_travel_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurrent_travel
    ADD CONSTRAINT recurrent_travel_pkey PRIMARY KEY (id);


--
-- TOC entry 4944 (class 1259 OID 40095)
-- Name: idx_location_coords_gist; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_location_coords_gist ON public.location USING gist (coords);


--
-- TOC entry 4945 (class 1259 OID 40096)
-- Name: idx_location_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_location_user_id ON public.location USING btree (user_id);


--
-- TOC entry 4961 (class 1259 OID 95563)
-- Name: idx_push_device_token_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_push_device_token_user_id ON public.push_device_token USING btree (user_id);


--
-- TOC entry 4954 (class 1259 OID 41277)
-- Name: idx_stop_coords_gist; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stop_coords_gist ON public.travel_room_stop USING gist (stop_coords);


--
-- Name: idx_recurrent_travel_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recurrent_travel_user_id ON public.recurrent_travel USING btree (user_id);


--
-- Name: idx_recurrent_travel_origin_coords_gist; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recurrent_travel_origin_coords_gist ON public.recurrent_travel USING gist (origin_coords);



--
-- TOC entry 4972 (class 2606 OID 48155)
-- Name: driver driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.driver
    ADD CONSTRAINT driver_id_fkey FOREIGN KEY (id) REFERENCES public.profile(id) ON DELETE CASCADE;


--
-- TOC entry 4967 (class 2606 OID 40107)
-- Name: profile fk_profile_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile
    ADD CONSTRAINT fk_profile_user FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4966 (class 2606 OID 79835)
-- Name: location location_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.location
    ADD CONSTRAINT location_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profile(id) ON DELETE CASCADE;


--
-- TOC entry 4968 (class 2606 OID 50450)
-- Name: profile profile_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile
    ADD CONSTRAINT profile_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.location(id) ON DELETE SET NULL;


--
-- TOC entry 4973 (class 2606 OID 95558)
-- Name: push_device_token push_device_token_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_device_token
    ADD CONSTRAINT push_device_token_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profile(id) ON DELETE CASCADE;


--
-- TOC entry 4969 (class 2606 OID 48135)
-- Name: travel_room travel_room_owner_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.travel_room
    ADD CONSTRAINT travel_room_owner_id_fkey1 FOREIGN KEY (owner_id) REFERENCES public.profile(id);


--
-- TOC entry 4970 (class 2606 OID 41267)
-- Name: travel_room_stop travel_room_stop_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.travel_room_stop
    ADD CONSTRAINT travel_room_stop_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.travel_room(id) ON DELETE CASCADE;


--
-- TOC entry 4971 (class 2606 OID 48130)
-- Name: travel_room_stop travel_room_stop_user_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.travel_room_stop
    ADD CONSTRAINT travel_room_stop_user_id_fkey1 FOREIGN KEY (user_id) REFERENCES public.profile(id) ON DELETE CASCADE;


--
-- Name: recurrent_travel recurrent_travel_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurrent_travel
    ADD CONSTRAINT recurrent_travel_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profile(id) ON DELETE CASCADE;

CREATE POLICY "Delete profile with service_role" ON public.driver FOR DELETE TO service_role USING (true);


--
-- TOC entry 5139 (class 3256 OID 44772)
-- Name: profile Delete profile with service_role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Delete profile with service_role" ON public.profile FOR DELETE TO service_role USING (true);


--
-- TOC entry 5135 (class 3256 OID 43585)
-- Name: location Enable delete for users based on user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable delete for users based on user_id" ON public.location FOR DELETE TO authenticated USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 5147 (class 3256 OID 42465)
-- Name: travel_room_stop Enable delete for users based on user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable delete for users based on user_id" ON public.travel_room_stop FOR DELETE TO authenticated USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 5143 (class 3256 OID 43630)
-- Name: travel_room Enable delete for users based on user_id and driver_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable delete for users based on user_id and driver_id" ON public.travel_room FOR DELETE TO authenticated USING (((auth.uid() = owner_id) OR (EXISTS ( SELECT 1
   FROM public.travel_room_stop trs
  WHERE ((trs.room_id = travel_room.id) AND (trs.user_id = auth.uid()) AND (trs.user_role = 'driver'::public.user_role))))));


--
-- TOC entry 5152 (class 3256 OID 42474)
-- Name: driver Enable insert for users based on user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable insert for users based on user_id" ON public.driver FOR INSERT TO authenticated WITH CHECK ((( SELECT auth.uid() AS uid) = id));


--
-- TOC entry 5136 (class 3256 OID 42473)
-- Name: location Enable insert for users based on user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable insert for users based on user_id" ON public.location FOR INSERT TO authenticated WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 5140 (class 3256 OID 41312)
-- Name: profile Enable insert for users based on user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable insert for users based on user_id" ON public.profile FOR INSERT TO authenticated WITH CHECK ((( SELECT auth.uid() AS uid) = id));


--
-- TOC entry 5144 (class 3256 OID 42472)
-- Name: travel_room Enable insert for users based on user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable insert for users based on user_id" ON public.travel_room FOR INSERT TO authenticated WITH CHECK ((( SELECT auth.uid() AS uid) = owner_id));


--
-- TOC entry 5148 (class 3256 OID 42466)
-- Name: travel_room_stop Enable insert for users based on user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable insert for users based on user_id" ON public.travel_room_stop FOR INSERT TO authenticated WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 5153 (class 3256 OID 42460)
-- Name: driver Enable read access for all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users" ON public.driver FOR SELECT TO authenticated USING (true);


--
-- TOC entry 5137 (class 3256 OID 42461)
-- Name: location Enable read access for all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users" ON public.location FOR SELECT TO authenticated USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 5141 (class 3256 OID 42470)
-- Name: profile Enable read access for all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users" ON public.profile FOR SELECT TO authenticated USING (true);


--
-- TOC entry 5145 (class 3256 OID 42459)
-- Name: travel_room Enable read access for all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users" ON public.travel_room FOR SELECT TO authenticated USING (true);


--
-- TOC entry 5149 (class 3256 OID 43588)
-- Name: travel_room_stop Enable read access for all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users" ON public.travel_room_stop FOR SELECT TO authenticated USING (true);


--
-- TOC entry 5154 (class 3256 OID 77488)
-- Name: driver Enable update for users based on user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable update for users based on user_id" ON public.driver FOR UPDATE TO authenticated USING ((auth.uid() = id)) WITH CHECK ((( SELECT auth.uid() AS uid) = id));


--
-- TOC entry 5138 (class 3256 OID 49290)
-- Name: location Enable update for users based on user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable update for users based on user_id" ON public.location FOR UPDATE TO authenticated USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 5142 (class 3256 OID 42471)
-- Name: profile Enable update for users based on user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable update for users based on user_id" ON public.profile FOR UPDATE TO authenticated USING ((( SELECT auth.uid() AS uid) = id)) WITH CHECK (((( SELECT auth.uid() AS uid) = id) AND (NOT (votes IS DISTINCT FROM ( SELECT profile_1.votes
   FROM public.profile profile_1
  WHERE (profile_1.id = auth.uid())))) AND (NOT (rides IS DISTINCT FROM ( SELECT profile_1.rides
   FROM public.profile profile_1
  WHERE (profile_1.id = auth.uid())))) AND (NOT (rating IS DISTINCT FROM ( SELECT profile_1.rating
   FROM public.profile profile_1
  WHERE (profile_1.id = auth.uid())))) AND (NOT (avatar IS DISTINCT FROM ( SELECT profile_1.avatar
   FROM public.profile profile_1
  WHERE (profile_1.id = auth.uid()))))));


--
-- TOC entry 5146 (class 3256 OID 43589)
-- Name: travel_room Enable update for users based on user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable update for users based on user_id" ON public.travel_room FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.travel_room_stop trs
  WHERE ((trs.room_id = travel_room.id) AND (trs.user_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.travel_room_stop trs
  WHERE ((trs.room_id = travel_room.id) AND (trs.user_id = auth.uid())))));


--
-- TOC entry 5150 (class 3256 OID 42468)
-- Name: travel_room_stop Enable update for users based on user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable update for users based on user_id" ON public.travel_room_stop FOR UPDATE TO authenticated USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 5155 (class 3256 OID 95564)
-- Name: push_device_token Users can manage own push tokens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage own push tokens" ON public.push_device_token TO authenticated USING ((( SELECT auth.uid() AS uid) = user_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 5133 (class 0 OID 41278)
-- Dependencies: 404
-- Name: driver; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.driver ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5129 (class 0 OID 40079)
-- Dependencies: 400
-- Name: location; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.location ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5130 (class 0 OID 40097)
-- Dependencies: 401
-- Name: profile; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5134 (class 0 OID 95545)
-- Dependencies: 414
-- Name: push_device_token; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.push_device_token ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5131 (class 0 OID 40137)
-- Dependencies: 402
-- Name: travel_room; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.travel_room ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5132 (class 0 OID 41257)
-- Dependencies: 403
-- Name: travel_room_stop; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.travel_room_stop ENABLE ROW LEVEL SECURITY;


--
-- Name: recurrent_travel; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.recurrent_travel ENABLE ROW LEVEL SECURITY;


--
-- Name: recurrent_travel Enable read access for all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users" ON public.recurrent_travel FOR SELECT USING (true);


--
-- Name: recurrent_travel Enable insert for users based on user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable insert for users based on user_id" ON public.recurrent_travel FOR INSERT TO authenticated WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));


--
-- Name: recurrent_travel Enable update for users based on user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable update for users based on user_id" ON public.recurrent_travel FOR UPDATE TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));


--
-- Name: recurrent_travel Enable delete for users based on user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable delete for users based on user_id" ON public.recurrent_travel FOR DELETE TO authenticated USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE TRIGGER trg_set_updated_at_push_device_token BEFORE UPDATE ON public.push_device_token FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_push_device_token();

CREATE TRIGGER trg_set_updated_at_recurrent_travel BEFORE UPDATE ON public.recurrent_travel FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_push_device_token();

CREATE TRIGGER trg_validate_driver BEFORE UPDATE OF is_driver ON public.profile FOR EACH ROW EXECUTE FUNCTION public.validate_driver_exists();

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

