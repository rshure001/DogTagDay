export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    service: 'Dog Tag Day Host',
    mode: 'portable',
    publisher: 'direct-platform-apis',
    metricoolRequired: false,
    bufferRequired: false,
    tinyfishRequired: false
  });
}
