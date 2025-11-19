import sanitizeHtml from "sanitize-html";
import Report from "../models/Report.js";

const MAX_LIMIT = 200;

export const normalizeAccount = (value = "") => String(value || "").replace(/[^\d]/g, "");

export const sanitizeDescription = (value = "") =>
  sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).trim();

const sanitizeNamePart = (value = "") => String(value || "").trim();

const buildDisplayName = (firstName = "", lastName = "", fallback = "") => {
  const first = sanitizeNamePart(firstName);
  const last = sanitizeNamePart(lastName);
  if (first || last) {
    return `${first} ${last}`.trim();
  }
  return sanitizeNamePart(fallback);
};

export async function createReportRecord({ ownerId, payload = {}, photos = [] }) {
  const firstName = sanitizeNamePart(payload.firstName);
  const lastName = sanitizeNamePart(payload.lastName);
  const displayName = buildDisplayName(firstName, lastName, payload.name);

  const doc = await Report.create({
    owner: ownerId,
    name: displayName,
    firstName,
    lastName,
    bank: payload.bank || "",
    account: normalizeAccount(payload.account || ""),
    amount: payload.amount,
    date: payload.date,
    category: payload.category,
    channel: payload.channel || "",
    desc: sanitizeDescription(payload.desc || ""),
    photos,
  });
  return doc;
}

function buildAccountRegex(digits = "") {
  if (!digits) return null;
  const parts = digits.split("").map((d) => `${d}[\\D]*?`);
  return parts.length ? new RegExp(parts.join(""), "i") : null;
}

export function buildSearchCondition(filters = {}) {
  const cond = {};
  const fullName = buildDisplayName(filters.firstName, filters.lastName, filters.name);
  if (fullName) {
    cond.name = { $regex: fullName, $options: "i" };
  }
  if (filters.account) {
    const digits = normalizeAccount(filters.account);
    if (digits) {
      const regex = buildAccountRegex(digits) || new RegExp(digits, "i");
      cond.account = { $regex: regex };
    }
  }
  if (filters.bank) cond.bank = filters.bank;
  if (filters.channel) cond.channel = { $regex: filters.channel, $options: "i" };
  return cond;
}

export async function searchReportRecords(filters = {}, options = {}) {
  const cond = buildSearchCondition(filters);
  const limit = Math.min(Math.max(options.limit || MAX_LIMIT, 1), MAX_LIMIT);
  return Report.find(cond).sort({ createdAt: -1 }).limit(limit);
}
