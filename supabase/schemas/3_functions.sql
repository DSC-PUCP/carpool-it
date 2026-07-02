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

CREATE FUNCTION public.get_user_recurrent_travels(p_user_id uuid) RETURNS TABLE(id uuid, direction public.travel_direction, origin_coords double precision[], destination_coords double precision[], seats smallint, price numeric, recurrence_rule text, route_description text, is_visible boolean, trip_time time without time zone, created_at timestamp with time zone)
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
-- Name: get_public_recurrent_travels_by_tag(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_public_recurrent_travels_by_tag(p_user_tag text) RETURNS TABLE(user_id uuid, user_tag text, user_avatar text, user_rating smallint, user_rides bigint, is_driver boolean, recurrent_travels jsonb)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.tag,
    p.avatar,
    p.rating,
    p.rides,
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
-- Name: search_visible_recurrent_travels(public.travel_direction, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.search_visible_recurrent_travels(p_direction public.travel_direction DEFAULT NULL::public.travel_direction, p_limit integer DEFAULT 20, p_offset integer DEFAULT 0) RETURNS jsonb
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

