export const getDefaultDate = (): Date => {
  const now = new Date();

  if (now.getHours() >= 23) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(7, 0, 0, 0);
    return tomorrow;
  }

  const minutes = now.getMinutes();
  const next = new Date(now.getTime());
  next.setSeconds(0, 0);

  if (minutes < 30) {
    next.setMinutes(30);
  } else {
    next.setHours(next.getHours() + 1, 0, 0, 0);
  }

  return next;
};
