import sanitizeHtml from "sanitize-html";
import Report from "../models/Report.js";
import { getSetting } from "./settings.js";

const MAX_LIMIT = 200;

export const normalizeAccount = (value = "") => String(value || "").replace(/[^\d]/g, "");

export const sanitizeDescription = (value = "") =>
  sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).trim();

const sanitizeNamePart = (value = "") => String(value || "").trim();

const stripTitle = (name = "") => {
  if (!name) return "";
  const titles = [
    // Thai full
    "เด็กชาย", "เด็กหญิง", "นาย", "นางสาว", "นาง", "พล.ต.อ.", "พล.ต.ท.", "พล.ต.ต.", "พ.ต.อ.", "พ.ต.ท.", "พ.ต.ต.", "ร.ต.อ.", "ร.ต.ท.", "ร.ต.ต.", 
    // Thai short
    "ด.ช.", "ด.ญ.", "น.ส.", "ดร.", "ผศ.", "รศ.", "ศ.", 
    // English
    "mr.", "mrs.", "miss.", "ms.", "dr."
  ];
  
  // Create a regex from titles
  // We want to match titles at the beginning of the string, case insensitive
  // Be careful with dots in titles needing escape, but mostly plain text is fine or handled by regex engine if not special chars
  // Sort by length desc to match longest title first (e.g. "นางสาว" before "นาง")
  const sortedTitles = titles.sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`^(${sortedTitles.join("|").replace(/\./g, "\\.")})\\s*`, "i");
  
  return name.replace(pattern, "").trim();
};

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
  const normalizedAccount = normalizeAccount(payload.account || "");
  const bank = payload.bank || "";

  // Auto-Approve Logic (Volume Threshold) - Dynamic Settings
  let initialStatus = 'pending';
  let verificationMethod = 'manual';

  if (firstName && lastName && bank && normalizedAccount) {
    // Check settings first
    const autoApproveEnabled = await getSetting('auto_approve_enabled', false);
    const threshold = await getSetting('auto_approve_threshold', 5);

    if (autoApproveEnabled) {
      const existingCount = await Report.countDocuments({
        firstName,
        lastName,
        bank,
        account: normalizedAccount,
        status: { $ne: 'rejected' }
      });

      // Logic: IF (existing + this_new_report) >= threshold
      // So checking if existing >= (threshold - 1)
      if (existingCount >= (Math.max(threshold, 1) - 1)) {
        initialStatus = 'approved';
        verificationMethod = 'auto_volume';
      }
    }
  }

  const doc = await Report.create({
    owner: ownerId,
    name: displayName,
    firstName,
    lastName,
    bank,
    account: normalizedAccount,
    amount: payload.amount,
    date: payload.date,
    category: payload.category,
    channel: payload.channel || "",
    desc: sanitizeDescription(payload.desc || ""),
    photos,
    status: initialStatus,
    verificationMethod: verificationMethod
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
  const clauses = [];
  // Hybrid Search Strategy:
  // 1. Structured Match: Matches specific firstName/lastName columns (for new data)
  // 2. Legacy Match: Matches the single 'name' column (for old data or unstructured input)
  
  const nameConditions = [];
  const fullName = buildDisplayName(filters.firstName, filters.lastName, filters.name);

  // 1. Structured Match
  const structuredCriteria = {};
  const first = stripTitle(sanitizeNamePart(filters.firstName));
  const last = stripTitle(sanitizeNamePart(filters.lastName));
  
  if (first) structuredCriteria.firstName = { $regex: first, $options: "i" };
  if (last) structuredCriteria.lastName = { $regex: last, $options: "i" };
  
  if (Object.keys(structuredCriteria).length > 0) {
    nameConditions.push(structuredCriteria);
  }

  // 2. Legacy Match
  // If we have any name input, we also try to match it against the 'name' field
  // This ensures old records (where name wasn't split) are still found.
  if (fullName) {
    nameConditions.push({ name: { $regex: fullName, $options: "i" } });
  }

  // Combine strategies with $or
  if (nameConditions.length > 0) {
    clauses.push({ $or: nameConditions });
  }

  if (filters.account) {
    const digits = normalizeAccount(filters.account);
    if (digits) {
      const regex = buildAccountRegex(digits) || new RegExp(digits, "i");
      clauses.push({ account: { $regex: regex } });
    }
  }
  if (filters.bank) clauses.push({ bank: filters.bank });
  if (filters.channel) clauses.push({ channel: { $regex: filters.channel, $options: "i" } });
  if (filters.status) clauses.push({ status: filters.status });

  if (clauses.length === 1) {
    return clauses[0];
  }
  if (clauses.length > 1) {
    cond.$and = clauses;
    return cond;
  }
  return cond;
}

export async function searchReportRecords(filters = {}, options = {}) {
  const cond = buildSearchCondition(filters);
  const limit = Math.min(Math.max(options.limit || MAX_LIMIT, 1), MAX_LIMIT);
  return Report.find(cond).sort({ createdAt: -1 }).limit(limit);
}
