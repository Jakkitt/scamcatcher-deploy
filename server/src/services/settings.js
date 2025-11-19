import mongoose from 'mongoose';
import Setting from '../models/Setting.js';

const cache = new Map();
const TTL = Number(process.env.SETTING_CACHE_TTL || 60 * 1000);

function setCache(key, value) {
  cache.set(key, { value, ts: Date.now() });
}

export async function getSetting(key, defaultValue = null) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < TTL) {
    return cached.value;
  }
  const ready = mongoose.connection?.readyState;
  if (ready !== 1 && ready !== 2) {
    setCache(key, defaultValue);
    return defaultValue;
  }
  const doc = await Setting.findOne({ key });
  const value = doc ? doc.value : defaultValue;
  setCache(key, value);
  return value;
}

export async function setSetting(key, value) {
  await Setting.findOneAndUpdate(
    { key },
    { value },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  setCache(key, value);
  return value;
}

export function clearSettingsCache() {
  cache.clear();
}
