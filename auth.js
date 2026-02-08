// auth.js — Registro/Login + datos usando Google Apps Script (Google Sheets)
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyO9NdV_5LSfSboTkOw8zlmT_Ciif9Fa2_1DlZxpmue0hZpfQKZB0k3UbHQQ2b3FpI/exec"; // <-- si cambia tu WebApp (/exec), reemplazá esta URL

// ===== Validaciones =====
export function validateDni(dni) {
  const s = String(dni || "").trim();
  if (!/^\d{7,8}$/.test(s)) return { ok:false, error:"El DNI debe tener 7 u 8 dígitos (solo números)" };
  return { ok:true };
}

// Reglas de password:
// - mínimo 8
// - al menos 1 mayúscula
// - al menos 1 número
// - SOLO letras y números (sin espacios ni caracteres especiales)
export function validatePass(pass) {
  const p = String(pass || "");
  if (p.length < 8) return { ok:false, error:"La contraseña debe tener mínimo 8 caracteres." };
  if (!/[A-Z]/.test(p)) return { ok:false, error:"La contraseña debe tener al menos 1 mayúscula." };
  if (!/\d/.test(p)) return { ok:false, error:"La contraseña debe tener al menos 1 número." };
  if (!/^[A-Za-z0-9]+$/.test(p)) return { ok:false, error:"La contraseña solo puede tener letras y números (sin espacios ni caracteres especiales)." };
  return { ok:true };
}

// ===== Helpers =====
async function sha256(text) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(String(text)));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function postJson(payload) {
  const res = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  });
  const txt = await res.text();
  try { return JSON.parse(txt); }
  catch { return { ok:false, error:"Respuesta no JSON del servidor", raw: txt, http_status: res.status }; }
}

// ===== Auth =====
export async function registerUser(usuario, pass) {
  const u = String(usuario || "").trim();
  const p = String(pass || "").trim();

  const vd = validateDni(u);
  if (!vd.ok) return { ok:false, error: vd.error };

  const vp = validatePass(p);
  if (!vp.ok) return { ok:false, error: vp.error };

  const password_hash = await sha256(p);
  return await postJson({ action: "register", usuario: u, password_hash });
}

export async function loginUser(usuario, pass) {
  const u = String(usuario || "").trim();
  const p = String(pass || "").trim();

  const vd = validateDni(u);
  if (!vd.ok) return { ok:false, error: vd.error };
  if (!p) return { ok:false, error:"Ingresá una contraseña." };

  const password_hash = await sha256(p);
  return await postJson({ action: "login", usuario: u, password_hash });
}

// ===== Datos =====
export async function listMaterias() {
  return await postJson({ action: "list_materias" });
}

export async function listMateriaOrientacion() {
  return await postJson({ action: "list_materia_orientacion" });
}

export async function loadProgress(usuario_id) {
  return await postJson({ action: "load_progress", usuario_id });
}

export async function saveProgress(usuario_id, progreso) {
  return await postJson({ action: "save_progress", usuario_id, progreso });
}
