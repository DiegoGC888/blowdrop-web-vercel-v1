"use client";

import { useState, useEffect } from "react";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [emailValid, setEmailValid] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);

  // ✅ Extraer el token desde los parámetros de la URL (?token=...)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paramToken = urlParams.get("access_token");
    if (paramToken) {
      setToken(paramToken);
    }
  }, []);

  const contieneNumerosConsecutivos = (pwd: string) => {
    for (let i = 0; i < pwd.length - 1; i++) {
      const curr = parseInt(pwd[i]);
      const next = parseInt(pwd[i + 1]);
      if (!isNaN(curr) && !isNaN(next) && next === curr + 1) {
        return true;
      }
    }
    return false;
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email.trim());

  const validations = {
    length: newPassword.length >= 12,
    maxLength: newPassword.length <= 15,
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    special: /[_$#%&]/.test(newPassword),
    noSequential: !contieneNumerosConsecutivos(newPassword),
  };

  const allValid = Object.values(validations).every(Boolean);

  useEffect(() => {
    setEmailValid(isEmailValid);
    setCanSubmit(
      isEmailValid &&
        allValid &&
        newPassword === confirmPassword &&
        newPassword.length > 0
    );
  }, [email, newPassword, confirmPassword, isEmailValid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return setMessage("Token no válido o expirado.");

    setLoading(true);
    setMessage("🔄 Actualizando contraseña...");

    try {
      const res = await fetch(
        "https://blowdrop-api-vercel-v1.vercel.app/api/reset-pwd",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, token, newPassword }),
        }
      );

      if (!res.ok) {
        const errorRes = await res.json();
        throw new Error(errorRes?.error || "Error desconocido del servidor.");
      }

      const result = await res.json();
      setMessage(result.message || "Contraseña actualizada correctamente.");
    } catch (err: any) {
      setMessage(
        "❌ Error al conectar con el servidor: " +
          (err?.message || "error desconocido")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
        <img
          src="/blow-drop.png"
          alt="Blowdrop Logo"
          className="w-60 h-auto mx-auto mb-4"
        />
        <h1 className="text-2xl font-bold mb-2 text-blue-700">
          Restablecer contraseña
        </h1>
        <p className="mb-4 text-gray-600">Crea una nueva contraseña segura.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          {/* Email */}
          <div className="relative">
            <label className="block text-gray-800 font-semibold text-sm mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 rounded w-full text-gray-900 text-base"
              required
            />
            {!emailValid && email.length > 0 && (
              <p className="text-sm text-red-600">Formato de correo inválido</p>
            )}
          </div>

          {/* Nueva contraseña */}
          <div className="relative">
            <label className="block text-gray-800 font-semibold text-sm mb-1">
              Nueva contraseña
            </label>
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Nueva Contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border p-2 rounded w-full pr-10 text-gray-900 text-base"
              required
            />
            <span
              className="absolute right-3 top-9 cursor-pointer text-gray-500"
              onClick={() => setPasswordVisible(!passwordVisible)}
            >
              {passwordVisible ? "🔓" : "🔒"}
            </span>
          </div>

          {/* Confirmar contraseña */}
          <div className="relative">
            <label className="block text-gray-800 font-semibold text-sm mb-1">
              Confirmar contraseña
            </label>
            <input
              type={confirmVisible ? "text" : "password"}
              placeholder="Confirmar Contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border p-2 rounded w-full pr-10 text-gray-900 text-base"
              required
            />
            <span
              className="absolute right-3 top-9 cursor-pointer text-gray-500"
              onClick={() => setConfirmVisible(!confirmVisible)}
            >
              {confirmVisible ? "🔓" : "🔒"}
            </span>
          </div>

          {/* Validaciones */}
          <ul className="text-sm text-left mt-2 space-y-1">
            <li className={validations.length ? "text-green-600" : "text-red-600"}>
              • Mínimo 12 caracteres
            </li>
            <li className={validations.maxLength ? "text-green-600" : "text-red-600"}>
              • Máximo 15 caracteres
            </li>
            <li className={validations.upper ? "text-green-600" : "text-red-600"}>
              • Al menos una mayúscula
            </li>
            <li className={validations.lower ? "text-green-600" : "text-red-600"}>
              • Al menos una minúscula
            </li>
            <li className={validations.special ? "text-green-600" : "text-red-600"}>
              • Al menos un símbolo (_ $ # % &)
            </li>
            <li className={validations.noSequential ? "text-green-600" : "text-red-600"}>
              • No números consecutivos
            </li>
          </ul>

          {confirmPassword.length > 0 && newPassword !== confirmPassword && (
            <p className="text-sm text-red-600">Las contraseñas no coinciden.</p>
          )}

          <button
            type="submit"
            disabled={!canSubmit || loading}
            className={`py-2 px-4 rounded text-white font-semibold ${
              canSubmit && !loading
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? "Actualizando..." : "Cambiar contraseña"}
          </button>
        </form>

        {message && <p className="mt-4 text-sm text-red-600">{message}</p>}
      </div>
    </main>
  );
}
