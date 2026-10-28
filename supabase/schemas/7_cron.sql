-- Keep the local scheduler aligned with the production cleanup job.
select cron.unschedule(jobid)
from cron.job
where jobname = 'Clean rooms';

select cron.schedule(
  'Clean rooms',
  '*/30 * * * *',
  $job$
    DELETE FROM public.travel_room
    WHERE datetime < NOW() - INTERVAL '6 hours';
  $job$
);