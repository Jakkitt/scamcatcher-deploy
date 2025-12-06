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

const AUTO_APPROVE_ENABLED_KEY = 'auto_approve_enabled';
const AUTO_APPROVE_THRESHOLD_KEY = 'auto_approve_threshold';

export async function getAutoApproveSetting(req, res) {
  try {
    const enabled = await getSetting(AUTO_APPROVE_ENABLED_KEY, false);
    const threshold = await getSetting(AUTO_APPROVE_THRESHOLD_KEY, 5);
    return res.json({ enabled, threshold });
  } catch (err) {
    return res.status(500).json({ error: { message: err.message } });
  }
}

export async function updateAutoApproveSetting(req, res) {
  try {
    const { enabled, threshold } = req.body || {};
    if (enabled !== undefined) await setSetting(AUTO_APPROVE_ENABLED_KEY, enabled);
    if (threshold !== undefined) await setSetting(AUTO_APPROVE_THRESHOLD_KEY, threshold);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: { message: err.message } });
  }
}
