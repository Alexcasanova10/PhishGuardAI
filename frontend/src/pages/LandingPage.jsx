
import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Mail,
  ArrowRight,
  UploadCloud,
  Search,
  LockKeyhole,
  FileText,
  Eye,
  Zap,
  Menu,
  X,
  CheckCircle2,
  ScanSearch
} from "lucide-react";

import { GoogleLogin } from "@react-oauth/google";
import { useGoogleLogin } from "@react-oauth/google";


// export default function App() {
export default function LandingPage({ onGoogleLogin }) {
  const [emailMode, setEmailMode] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [companyMode, setCompanyMode] = useState(false);

  // EL ANTIGUO, FUNCIONA BIEN
// const handleGoogleLogin = async (credentialResponse) => {

//   if (!credentialResponse.credential) {
//     alert("Google no devolvió una credencial válida.");
//     return;
//   }

//   try {
//     await onGoogleLogin(credentialResponse.credential);
//   } catch (error) {
//     console.error("Error de autenticación:", error);
//     alert(error.message || "No se pudo iniciar sesión con Google.");
//   }
// };


// 2. Dentro de LandingPage({ onGoogleLogin }), reemplaza handleGoogleLogin por esto:
const loginWithGoogle = useGoogleLogin({
  scope: "https://www.googleapis.com/auth/gmail.readonly",
  onSuccess: async (tokenResponse) => {
    try {
      // Guardamos el token temporal para poder leer Gmail en el Dashboard
      localStorage.setItem("google_access_token", tokenResponse.access_token);
      // Pasamos el access_token a tu función padre (App.jsx)
      await onGoogleLogin(tokenResponse.access_token);
    } catch (error) {
      console.error("Error de autenticación:", error);
      alert(error.message || "No se pudo iniciar sesión con Google.");
    }
  },
  onError: () => {
    alert("No se pudo completar la autenticación con Google.");
  },
});

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    // Aquí conectarás tu endpoint de login/registro.
    console.log("Autenticación mediante correo");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans overflow-x-hidden">

      {/* NAVBAR */}
      <header className="relative z-20 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur">
        <nav className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">

          <a href="#" className="flex items-center gap-3">
            <div className="p-2 bg-violet-500/10 border border-violet-500/20 rounded-xl">
              <ShieldAlert className="text-violet-400" size={23} />
            </div>
            <span className="font-bold text-xl tracking-tight">
              PhishGuard <span className="text-violet-400">AI</span>
            </span>
          </a>

          <div className="hidden md:flex items-center gap-9 text-sm text-zinc-400">
            <a href="#inicio" className="hover:text-white transition">
              Inicio
            </a>
            <a href="#funciones" className="hover:text-white transition">
              Funcionalidades
            </a>
            <a href="#nosotros" className="hover:text-white transition">
              Acerca de
            </a>
          </div>

          <button
            onClick={() => {
              setEmailMode(false);
              document.getElementById("acceso")?.scrollIntoView({
                behavior: "smooth"
              });
            }}
            className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm font-semibold transition"
          >
            Iniciar sesión
            <ArrowRight size={16} />
          </button>

          <button
            className="md:hidden text-zinc-300"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            {mobileMenu ? <X /> : <Menu />}
          </button>
        </nav>

        {mobileMenu && (
          <div className="md:hidden p-5 border-t border-zinc-800 flex flex-col gap-5 text-sm text-zinc-300">
            <a href="#inicio" onClick={() => setMobileMenu(false)}>Inicio</a>
            <a href="#funciones" onClick={() => setMobileMenu(false)}>Funcionalidades</a>
            <a href="#nosotros" onClick={() => setMobileMenu(false)}>Acerca de</a>
            <a href="#acceso" onClick={() => setMobileMenu(false)}>Iniciar sesión</a>
          </div>
        )}
      </header>

      {/* HERO */}
      <main id="inicio" className="relative">

        {/* Background decoration */}
        <div className="absolute top-10 left-1/3 w-96 h-96 bg-violet-600/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />

        <section className="relative max-w-7xl mx-auto px-6 lg:px-10 py-14 lg:py-20">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* LEFT: PRESENTACIÓN */}
            <div className="space-y-8">

              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-300 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Inteligencia artificial aplicada a la ciberseguridad
              </div>

              <div className="space-y-5">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.12]">
                  Protege tu correo.
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400">
                    Detecta el phishing.
                  </span>
                </h1>

                <p className="text-zinc-400 text-base lg:text-lg leading-relaxed max-w-xl">
                  Analiza correos electrónicos con inteligencia artificial
                  y descubre posibles amenazas de phishing antes de que
                  comprometan tu información.
                </p>
              </div>

              {/* Beneficios */}
              <div className="space-y-4">

                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
                    <ScanSearch size={21} className="text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-100">
                      Análisis inteligente
                    </h3>
                    <p className="text-sm text-zinc-500 mt-1">
                      Identifica patrones sospechosos y señales de phishing.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <ShieldCheck size={21} className="text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-100">
                      Evaluación de amenazas
                    </h3>
                    <p className="text-sm text-zinc-500 mt-1">
                      Obtén una clasificación de riesgo y explicaciones
                      sobre los resultados.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <FileText size={21} className="text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-100">
                      Reportes detallados
                    </h3>
                    <p className="text-sm text-zinc-500 mt-1">
                      Consulta los hallazgos y descarga tus análisis en PDF.
                    </p>
                  </div>
                </div>

              </div>

              {/* File formats */}
              <div className="pt-5 border-t border-zinc-800">
                <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wider font-mono">
                  Formatos compatibles
                </p>

                <div className="flex gap-3">
                  {[".EML", ".MSG"].map((format) => (
                    <div
                      key={format}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono"
                    >
                      <FileText size={14} className="text-violet-400" />
                      {format}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* RIGHT: LOGIN PANEL */}
            <div id="acceso" className="relative">

              {/* Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-purple-500/10 to-cyan-500/20 blur-3xl rounded-full" />

              <div className="relative bg-zinc-900/90 border border-zinc-800 rounded-2xl p-7 sm:p-9 shadow-2xl backdrop-blur-xl">

                {/* Login header */}
                <div className="mb-8">

                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 mb-6 shadow-lg shadow-violet-900/30">
                    <ShieldAlert size={25} className="text-white" />
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    Inicia sesión o
                    <br />
                    <span className="text-violet-400">
                      regístrate en segundos
                    </span>
                  </h2>

                  <p className="text-zinc-400 text-sm mt-3 leading-relaxed">
                    Accede a PhishGuard AI y comienza a proteger
                    tu información frente a posibles amenazas.
                  </p>

                </div>

                {/* antiguo login con google */}
                {/* <div className="w-full flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => {
                      alert("No se pudo completar la autenticación con Google.");
                    }}
                    theme="filled_black"
                    shape="rectangular"
                    size="large"
                    text="continue_with"
                    width="350"
                  />
                </div> */}
                <div className="w-full flex justify-center">
                  <button
                    type="button"
                    onClick={() => loginWithGoogle()}
                    className="w-full max-w-[350px] flex items-center justify-center gap-3 px-5 py-3 rounded-lg bg-white text-zinc-900 hover:bg-zinc-200 font-semibold text-sm transition cursor-pointer shadow"
                  >
                    <Mail size={18} className="text-red-500" />
                    Continuar con Google y Gmail
                  </button>
                </div>
                
 
              </div>

              {/* Security note */}
              <div className="relative flex justify-center items-center gap-2 mt-5 text-xs text-zinc-500">
                <ShieldCheck size={15} className="text-emerald-500" />
                Tu seguridad es nuestra prioridad.
              </div>

            </div>

          </div>
        </section>

        {/* FEATURES */}
        <section id="funciones" className="relative border-t border-zinc-800 bg-zinc-900/30 py-20">

          <div className="max-w-7xl mx-auto px-6 lg:px-10">

            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs uppercase tracking-widest text-violet-400 font-semibold">
                ¿Cómo funciona?
              </span>

              <h2 className="text-3xl font-bold mt-3">
                Analiza. Detecta. Protege.
              </h2>

              <p className="text-sm text-zinc-500 mt-4 leading-relaxed">
                Una herramienta diseñada para facilitar la identificación
                de correos electrónicos potencialmente maliciosos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <FeatureCard
                icon={<UploadCloud size={23} />}
                number="01"
                title="Carga tu correo"
                description="Adjunta un archivo .eml o .msg para iniciar el análisis."
              />

              <FeatureCard
                icon={<Search size={23} />}
                number="02"
                title="Analizamos su contenido"
                description="Examinamos indicadores, remitentes, enlaces y patrones sospechosos."
              />

              <FeatureCard
                icon={<ShieldCheck size={23} />}
                number="03"
                title="Obtén tu diagnóstico"
                description="Consulta el nivel de riesgo, los hallazgos y un reporte detallado."
              />

            </div>

          </div>
        </section>

        {/* ABOUT */}
        <section id="nosotros" className="relative max-w-7xl mx-auto px-6 lg:px-10 py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 border border-zinc-800 rounded-2xl p-8 lg:p-12 bg-gradient-to-br from-zinc-900 to-zinc-950">

            <div>
              <div className="flex items-center gap-2 text-violet-400 text-xs uppercase tracking-widest font-semibold mb-4">
                <Zap size={15} />
                PhishGuard AI
              </div>

              <h2 className="text-2xl lg:text-3xl font-bold">
                La seguridad comienza con la prevención.
              </h2>

              <p className="text-sm text-zinc-400 mt-3 max-w-xl leading-relaxed">
                Identifica posibles intentos de fraude digital y toma
                decisiones informadas antes de interactuar con un
                correo electrónico sospechoso.
              </p>
            </div>

            <button
              onClick={() => document.getElementById("acceso")?.scrollIntoView({
                behavior: "smooth"
              })}
              className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 font-semibold text-sm transition"
            >
              Comenzar ahora
              <ArrowRight size={17} />
            </button>

          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-zinc-800 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-7 flex flex-col sm:flex-row justify-between items-center gap-4">

          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <ShieldAlert size={17} className="text-violet-400" />
            <span className="font-semibold text-zinc-300">PhishGuard AI</span>
          </div>

          <p className="text-xs text-zinc-600">
            © 2026 PhishGuard AI. Todos los derechos reservados.
          </p>

          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <CheckCircle2 size={14} className="text-emerald-500" />
            Protección inteligente
          </div>

        </div>
      </footer>

    </div>
  );
}


// COMPONENTE DE TARJETAS DE FUNCIONALIDADES
function FeatureCard({ icon, number, title, description }) {
  return (
    <div className="group p-7 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 hover:border-violet-500/40 transition duration-300">

      <div className="flex justify-between items-center mb-7">
        <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 group-hover:bg-violet-500/20 transition">
          {icon}
        </div>

        <span className="text-xs font-mono text-zinc-600">
          / {number}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-zinc-100">
        {title}
      </h3>

      <p className="text-sm text-zinc-500 mt-3 leading-relaxed">
        {description}
      </p>

    </div>
  );
}
