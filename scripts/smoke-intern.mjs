// End-to-end smoke test: intern login -> assigned events -> report -> admin approves.
const BASE = "http://localhost:3000";

async function login(email, password) {
  const r1 = await fetch(BASE + "/api/auth/csrf");
  const { csrfToken } = await r1.json();
  const csrfCookies = (r1.headers.getSetCookie() || []).map((c) => c.split(";")[0]).join("; ");
  const body = new URLSearchParams({ email, password, csrfToken, json: "true" });
  const r2 = await fetch(BASE + "/api/auth/callback/credentials", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: csrfCookies },
    body,
    redirect: "manual",
  });
  const setCookie = r2.headers.getSetCookie ? r2.headers.getSetCookie() : [];
  return [...csrfCookies.split("; ").filter(Boolean), ...setCookie.map((c) => c.split(";")[0])].join("; ");
}

const internJar = await login("intern@asoujda.ma", "intern123");
const adminJar = await login("admin@asoujda.ma", "admin123");
console.log("jars:", internJar ? "intern ok" : "INTERN LOGIN FAILED", "|", adminJar ? "admin ok" : "ADMIN LOGIN FAILED");

const get = (url, jar) => fetch(BASE + url, { headers: { Cookie: jar } }).then(async (r) => [r.status, await r.json()]);

const [s1, ev] = await get("/api/events?assigned=1&limit=10", internJar);
console.log("assigned events:", s1, ev.events?.length, ev.events?.[0]?.title);

const eventId = ev.events?.[0]?.id;
if (!eventId) process.exit(1);

const post = await fetch(BASE + "/api/event-reports", {
  method: "POST",
  headers: { "Content-Type": "application/json", Cookie: internJar },
  body: JSON.stringify({ eventId, attendees: 42, staffCount: 3, highlights: "Great turnout, lively Q&A." }),
});
const report = await post.json();
console.log("report POST:", post.status, report.report?.id);

const post2 = await fetch(BASE + "/api/event-edits", {
  method: "POST",
  headers: { "Content-Type": "application/json", Cookie: internJar },
  body: JSON.stringify({ eventId, field: "location", requestedValue: "Room 2", reason: "Room 1 double-booked" }),
});
const req2 = await post2.json();
console.log("edit POST:", post2.status, req2.request?.id);

const [s3, repList] = await get("/api/event-reports", adminJar);
const [s4, reqList] = await get("/api/event-edits", adminJar);
console.log("admin reports:", s3, repList.reports?.length, "| admin edits:", s4, reqList.requests?.length);

const patch = await fetch(BASE + "/api/event-reports", {
  method: "PATCH",
  headers: { "Content-Type": "application/json", Cookie: adminJar },
  body: JSON.stringify({ id: report.report.id, status: "APPROVED", adminNote: "Nice work." }),
});
console.log("report approve:", patch.status);

const patch2 = await fetch(BASE + "/api/event-edits", {
  method: "PATCH",
  headers: { "Content-Type": "application/json", Cookie: adminJar },
  body: JSON.stringify({ id: req2.request.id, status: "APPROVED" }),
});
console.log("edit approve:", patch2.status, (await patch2.json()).request?.status);

const evs = await get("/api/events?limit=10&upcoming=0", adminJar);
console.log("event location after approval:", evs[1].events.find((e) => e.id === eventId)?.location);

console.log("users API unauth:", (await fetch(BASE + "/api/users")).status);
console.log("users API intern:", (await fetch(BASE + "/api/users", { headers: { Cookie: internJar } })).status);
