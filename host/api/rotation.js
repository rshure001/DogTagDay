const schedule = {
  0: 'commercial-1',
  3: 'commercial-2',
  6: 'commercial-1',
  9: 'commercial-2',
  12: 'commercial-1',
  15: 'commercial-2',
  18: 'commercial-1',
  21: 'commercial-2'
};

export default function handler(req, res) {
  const now = new Date();
  const local = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
  }).formatToParts(now).reduce((o, p) => (o[p.type] = p.value, o), {});
  const hour = Number(local.hour) % 24;
  const slotHour = [0,3,6,9,12,15,18,21].reduce((best, h) => h <= hour ? h : best, 0);
  res.status(200).json({
    timezone: 'America/Los_Angeles',
    slotHour,
    commercial: schedule[slotHour],
    localTime: `${local.year}-${local.month}-${local.day} ${local.hour}:${local.minute}`
  });
}
