// auth.js — Registro/Login + datos usando Google Apps Script (Google Sheets)
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyg9Pkepfm8zd4daGH_v7bjxI5ZJgS4but7PLO1llg_jHggRlH2j6DqFr3pyi7PRSVR/exec";

// Reglas de password:
// - mínimo 8
// - al menos 1 mayúscula
// - al menos 1 número
// - SOLO letras y números (sin espacios ni caracteres especiales)
export function validatePassword(pw) {
  if (pw.length < 8) return "La contraseña debe tener mínimo 8 caracteres.";
  if (!/^[A-Za-z0-9]+$/.test(pw)) return "Solo se permiten letras y números (sin espacios ni caracteres especiales).";
  if (!/[A-Z]/.test(pw)) return "Debe tener al menos 1 mayúscula.";
  if (!/[0-9]/.test(pw)) return "Debe tener al menos 1 número.";
  return null;
}

export async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// CLAVE: text/plain para evitar preflight CORS en Apps Script
async function postJson(payload) {
  const res = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });
  const txt = await res.text();
  let data;
  try { data = JSON.parse(txt); }
  catch { data = { ok:false, error:"Respuesta no JSON del servidor", raw: txt }; }
  return data;
}

export async function registerUser(username, password) {
  const u = username.trim();
  const p = password.trim();
  if (!u) return { ok:false, error:"Ingresá un usuario." };
  const err = validatePassword(p);
  if (err) return { ok:false, error: err };
  const password_hash = await sha256(p);
  // devuelve usuario_id
  return await postJson({ action:"register", username: u, password_hash });
}

export async function loginUser(username, password) {
  const u = username.trim();
  const p = password.trim();
  if (!u) return { ok:false, error:"Ingresá un usuario." };
  if (!p) return { ok:false, error:"Ingresá una contraseña." };
  const password_hash = await sha256(p);
  // devuelve usuario_id
  return await postJson({ action:"login", username: u, password_hash });
}

export async function listMaterias() {
  return await postJson({ action:"list_materias" });
}

export async function loadProgress(usuario_id) {
  return await postJson({ action:"load_progress", usuario_id });
}

export async function saveProgress(usuario_id, progreso) {
  return await postJson({ action:"save_progress", usuario_id, progreso });
}
