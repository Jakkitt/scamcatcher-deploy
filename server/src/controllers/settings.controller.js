import { getSetting, setSetting } from '../services/settings.js';

const EXTERNAL_KEY = 'external_checks_enabled';

export async function getExternalChecksSetting(req, res) {
  try {
    const enabled = await getSetting(EXTERNAL_KEY, true);
    return res.json({ enabled: enabled !== false });
  } catch (err) {
    return res.status(500).json({ error: { message: err.message } });
  }
}

export async function updateExternalChecksSetting(req, res) {
  try {
    const enabled = req.body?.enabled !== false;
    await setSetting(EXTERNAL_KEY, enabled);
    return res.json({ enabled });
  } catch (err) {
    return res.status(500).json({ error: { message: err.message } });
  }
}
