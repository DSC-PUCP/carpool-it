SET default_tablespace = '';

SET default_table_access_method = heap;

--
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
    CONSTRAINT driver_rating_check CHECK (((rating IS NULL) OR ((rating >= 0) AND (rating <= 5))))
);


--
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
-- Name: driver driver_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.driver
    ADD CONSTRAINT driver_pkey PRIMARY KEY (id);


--
-- Name: driver driver_qr_url_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.driver
    ADD CONSTRAINT driver_qr_url_key UNIQUE (qr_url);


--
-- Name: location location_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.location
    ADD CONSTRAINT location_pkey PRIMARY KEY (id);


--
-- Name: profile profile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile
    ADD CONSTRAINT profile_pkey PRIMARY KEY (id);


--
-- Name: profile profile_tag_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile
    ADD CONSTRAINT profile_tag_key UNIQUE (tag);


--
-- Name: travel_room travel_room_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.travel_room
    ADD CONSTRAINT travel_room_pkey PRIMARY KEY (id);


--
-- Name: travel_room_stop travel_room_stop_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.travel_room_stop
    ADD CONSTRAINT travel_room_stop_pkey PRIMARY KEY (room_id, user_id);


--
-- Name: idx_location_coords_gist; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_location_coords_gist ON public.location USING gist (coords);


--
-- Name: idx_location_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_location_user_id ON public.location USING btree (user_id);


--
-- Name: idx_stop_coords_gist; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stop_coords_gist ON public.travel_room_stop USING gist (stop_coords);


--
-- Name: driver driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.driver
    ADD CONSTRAINT driver_id_fkey FOREIGN KEY (id) REFERENCES public.profile(id) ON DELETE CASCADE;


--
-- Name: profile fk_profile_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile
    ADD CONSTRAINT fk_profile_user FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: location location_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.location
    ADD CONSTRAINT location_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profile(id) ON DELETE CASCADE;


--
-- Name: profile profile_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile
    ADD CONSTRAINT profile_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.location(id) ON DELETE SET NULL;


--
-- Name: travel_room travel_room_owner_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.travel_room
    ADD CONSTRAINT travel_room_owner_id_fkey1 FOREIGN KEY (owner_id) REFERENCES public.profile(id);


--
-- Name: travel_room_stop travel_room_stop_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.travel_room_stop
    ADD CONSTRAINT travel_room_stop_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.travel_room(id) ON DELETE CASCADE;


--
-- Name: travel_room_stop travel_room_stop_user_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.travel_room_stop
    ADD CONSTRAINT travel_room_stop_user_id_fkey1 FOREIGN KEY (user_id) REFERENCES public.profile(id) ON DELETE CASCADE;

