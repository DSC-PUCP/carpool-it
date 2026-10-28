BEGIN;

ALTER TABLE public.driver
  ALTER COLUMN rating TYPE numeric(3,2)
  USING rating::numeric(3,2);

ALTER TYPE public.driver_type
  ALTER ATTRIBUTE rating TYPE numeric(3,2) CASCADE;

UPDATE public.driver
SET rating = NULL
WHERE votes = 0;

CREATE OR REPLACE FUNCTION public.get_driver_rating(p_driver uuid)
RETURNS TABLE(rating numeric, votes bigint)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path = public
    AS $$
  SELECT d.rating, d.votes
  FROM public.driver d
  WHERE d.id = p_driver;
$$;

CREATE OR REPLACE FUNCTION public.rate_driver(p_driver uuid, p_rate integer)
RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path = public
    AS $$
BEGIN
  IF p_rate IS NULL OR p_rate < 1 OR p_rate > 5 THEN
    RAISE EXCEPTION 'La calificación debe estar entre 1 y 5.';
  END IF;

  UPDATE public.driver
  SET
    rating = (
      (COALESCE(rating, 0)::numeric * votes + p_rate)::numeric / (votes + 1)
    )::numeric(3,2),
    votes = votes + 1
  WHERE id = p_driver;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No se encontró el conductor para calificar.';
  END IF;
END;
$$;

NOTIFY pgrst, 'reload schema';

COMMIT;
