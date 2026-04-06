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
