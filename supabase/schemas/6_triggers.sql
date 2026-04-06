CREATE TRIGGER trg_set_updated_at_push_device_token BEFORE UPDATE ON public.push_device_token FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_push_device_token();

CREATE TRIGGER trg_validate_driver BEFORE UPDATE OF is_driver ON public.profile FOR EACH ROW EXECUTE FUNCTION public.validate_driver_exists();

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
