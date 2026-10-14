export const STUDENT_API_URL = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/$/, "");

export function getStoredUserId() {
  return typeof window === "undefined" ? null : window.localStorage.getItem("userId");
}

export async function studentFetch(path, options) {
  if (!STUDENT_API_URL) throw new Error("The backend API URL is not configured.");
  const response = await fetch(`${STUDENT_API_URL}${path}`, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || payload.error || `Request failed (${response.status})`);
  }
  return payload;
}

export function studentFileUrl(filePath) {
  if (!filePath) return "";
  if (/^https?:\/\//i.test(filePath)) return filePath;
  return `${STUDENT_API_URL}/${String(filePath).replaceAll("\\", "/").replace(/^\/+/, "")}`;
}

export function formatStudentDate(value) {
  if (!value) return "—";
  const dateOnly = typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = dateOnly
    ? new Date(Number(value.slice(0, 4)), Number(value.slice(5, 7)) - 1, Number(value.slice(8, 10)))
    : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString();
}
