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
select cron.unschedule(jobid)
from cron.job
where jobname = 'Clean push tokens';

select cron.schedule(
  'Clean push tokens',
  '0 4 * * 0',
  $job$
    DELETE FROM public.push_device_token
    WHERE (active = false AND updated_at < NOW() - INTERVAL '30 days')
       OR updated_at < NOW() - INTERVAL '60 days';
  $job$
);
