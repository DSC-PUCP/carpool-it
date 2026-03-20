--
-- Name: driver Delete profile with service_role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Delete profile with service_role" ON public.driver FOR DELETE TO service_role USING (true);


--
-- Name: profile Delete profile with service_role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Delete profile with service_role" ON public.profile FOR DELETE TO service_role USING (true);


--
-- Name: location Enable delete for users based on user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable delete for users based on user_id" ON public.location FOR DELETE TO authenticated USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- Name: travel_room_stop Enable delete for users based on user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable delete for users based on user_id" ON public.travel_room_stop FOR DELETE TO authenticated USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- Name: travel_room Enable delete for users based on user_id and driver_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable delete for users based on user_id and driver_id" ON public.travel_room FOR DELETE TO authenticated USING (((auth.uid() = owner_id) OR (EXISTS ( SELECT 1
   FROM public.travel_room_stop trs
  WHERE ((trs.room_id = travel_room.id) AND (trs.user_id = auth.uid()) AND (trs.user_role = 'driver'::public.user_role))))));


--
-- Name: driver Enable insert for users based on user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable insert for users based on user_id" ON public.driver FOR INSERT TO authenticated WITH CHECK ((( SELECT auth.uid() AS uid) = id));


--
-- Name: location Enable insert for users based on user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable insert for users based on user_id" ON public.location FOR INSERT TO authenticated WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));


--
-- Name: profile Enable insert for users based on user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable insert for users based on user_id" ON public.profile FOR INSERT TO authenticated WITH CHECK ((( SELECT auth.uid() AS uid) = id));


--
-- Name: travel_room Enable insert for users based on user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable insert for users based on user_id" ON public.travel_room FOR INSERT TO authenticated WITH CHECK ((( SELECT auth.uid() AS uid) = owner_id));


--
-- Name: travel_room_stop Enable insert for users based on user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable insert for users based on user_id" ON public.travel_room_stop FOR INSERT TO authenticated WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));


--
-- Name: driver Enable read access for all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users" ON public.driver FOR SELECT USING (true);


--
-- Name: location Enable read access for all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users" ON public.location FOR SELECT USING (true);


--
-- Name: profile Enable read access for all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users" ON public.profile FOR SELECT USING (true);


--
-- Name: travel_room Enable read access for all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users" ON public.travel_room FOR SELECT USING (true);


--
-- Name: travel_room_stop Enable read access for all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users" ON public.travel_room_stop FOR SELECT USING (true);


--
-- Name: driver Enable update for users based on user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable update for users based on user_id" ON public.driver FOR UPDATE TO authenticated USING ((auth.uid() = id)) WITH CHECK ((( SELECT auth.uid() AS uid) = id));


--
-- Name: location Enable update for users based on user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable update for users based on user_id" ON public.location FOR UPDATE TO authenticated USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- Name: profile Enable update for users based on user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable update for users based on user_id" ON public.profile FOR UPDATE TO authenticated USING ((( SELECT auth.uid() AS uid) = id));


--
-- Name: travel_room Enable update for users based on user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable update for users based on user_id" ON public.travel_room FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.travel_room_stop trs
  WHERE ((trs.room_id = travel_room.id) AND (trs.user_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.travel_room_stop trs
  WHERE ((trs.room_id = travel_room.id) AND (trs.user_id = auth.uid())))));


--
-- Name: travel_room_stop Enable update for users based on user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable update for users based on user_id" ON public.travel_room_stop FOR UPDATE TO authenticated USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- Name: driver; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.driver ENABLE ROW LEVEL SECURITY;

--
-- Name: location; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.location ENABLE ROW LEVEL SECURITY;

--
-- Name: profile; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;

--
-- Name: travel_room; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.travel_room ENABLE ROW LEVEL SECURITY;

--
-- Name: travel_room_stop; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.travel_room_stop ENABLE ROW LEVEL SECURITY;