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

