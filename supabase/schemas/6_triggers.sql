CREATE TRIGGER trg_set_updated_at_push_device_token BEFORE UPDATE ON public.push_device_token FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_push_device_token();

CREATE TRIGGER trg_set_updated_at_recurrent_travel BEFORE UPDATE ON public.recurrent_travel FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_push_device_token();

CREATE TRIGGER trg_validate_driver BEFORE UPDATE OF is_driver ON public.profile FOR EACH ROW EXECUTE FUNCTION public.validate_driver_exists();

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER trg_broadcast_room_message
AFTER INSERT ON public.travel_room_message
FOR EACH ROW
EXECUTE FUNCTION public.broadcast_room_message();

CREATE TRIGGER trg_push_join_room AFTER INSERT ON public.travel_room_stop FOR EACH ROW EXECUTE FUNCTION public.notify_push_event();

CREATE TRIGGER trg_push_leave_room AFTER DELETE ON public.travel_room_stop FOR EACH ROW EXECUTE FUNCTION public.notify_push_event();

CREATE TRIGGER trg_push_chat_message AFTER INSERT ON public.travel_room_message FOR EACH ROW EXECUTE FUNCTION public.notify_push_event();

CREATE TRIGGER trg_push_next_stop AFTER UPDATE OF current_stop ON public.travel_room FOR EACH ROW WHEN (old.current_stop IS DISTINCT FROM new.current_stop) EXECUTE FUNCTION public.notify_push_event();
