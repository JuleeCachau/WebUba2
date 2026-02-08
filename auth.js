// auth.js - cliente para Apps Script WebApp
// Config: pegá acá tu URL /exec del Apps Script (webapp)
export const URL_EXEC = "https://script.google.com/macros/s/AKfycbxPeWTfUGeQrFbPWB9vYzpBl2EMaPpT7kEIJcQgCFOIfusoI4NOSO0GW8V_sLIQ8dKc/exec"; // <-- REEMPLAZAR

async function post_(payload) {
  const res = await fetch(URL_EXEC, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });
  // Apps Script suele responder 302 y luego 200 en script.googleusercontent.com
  // fetch sigue el redirect, así que res.text() es el body final.
  const txt = await res.text();
  try { return JSON.parse(txt); } 
  catch { return { ok:false, error:"Respuesta no JSON: " + txt.slice(0,200) }; }
}

export async function registerUser(username, password_hash) {
  return post_({ action:"register", username, password_hash });
}

export async function loginUser(username, password_hash) {
  return post_({ action:"login", username, password_hash });
}

export async function listMaterias() {
  return post_({ action:"list_materias" });
}

// orientacion_id -> materias obligatorias (para marcar ★)
export async function listObligatorias(orientacion_id) {
  return post_({ action:"list_obligatorias", orientacion_id });
}

export async function loadProgress(usuario_id) {
  return post_({ action:"load_progress", usuario_id });
}

export async function saveProgress(usuario_id, progreso) {
  return post_({ action:"save_progress", usuario_id, progreso });
}
