import killPort from 'kill-port';

const rawPort = process.env.PORT || process.env.npm_config_port || '4000';
const port = Number(rawPort) || 4000;

try {
  await killPort(port);
  console.log(`[predev] Cleared port ${port}`);
} catch (err) {
  const message = err?.message || String(err);
  if (message.includes('port was not found')) {
    console.log(`[predev] Port ${port} was already free`);
  } else {
    console.warn(`[predev] Could not clear port ${port}: ${message}`);
  }
}
