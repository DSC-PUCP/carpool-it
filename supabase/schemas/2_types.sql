--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
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
	qr_url text
);


--
-- Name: location_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.location_type AS ENUM (
    'system',
    'user'
);


--
-- Name: travel_direction; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.travel_direction AS ENUM (
    'to_campus',
    'from_campus'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'passenger',
    'driver'
);


--
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

