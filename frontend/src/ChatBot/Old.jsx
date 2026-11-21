
import React, { useState, useRef } from 'react';
import { 
  Paperclip, 
  Search, 
  ShieldAlert, 
  FileText, 
  Info, 
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle
} from 'lucide-react';

// Base de datos Mock para la simulación estática del MVP
const MOCK_DATASETS = {
  netflix: {
    score: 88,
    category: 'PHISHING CRÍTICO',
    from_visible: 'Servicio al Cliente Netflix <info@mailer.global-stream-security.net>',
    from_real: '185.220.101.5 (global-stream-security.net)',
    subject: 'IMPORTANTE: Actualice su método de pago - Cuenta Suspendida',
    explanation: 'El correo suplanta la identidad de Netflix alertando sobre un fallo en el cobro. Utiliza coerción temporal (12 horas) para obligar al usuario a ingresar sus datos bancarios en un dominio malicioso que no pertenece a Netflix.',
    heuristics: [
      { rule: 'SPF / DKIM Check', status: 'fail', detail: 'El dominio remitente global-stream-security.net no coincide con los registros oficiales de Netflix.' },
      { rule: 'Domain Age', status: 'warning', detail: 'El dominio objetivo fue registrado hace menos de 7 días.' },
      { rule: 'Urgency Heuristics', status: 'fail', detail: 'Detección de patrones de presión temporal agresiva ("próximas 12 horas").' },
      { rule: 'SSL Certificate', status: 'pass', detail: 'Conexión HTTPS válida en la URL adjunta.' }
    ],
    highlighted_text: [
      { type: 'normal', text: 'Estimado suscriptor,\n\nNo hemos podido procesar el cobro de su suscripción mensual debido a un problema con su tarjeta de crédito o débito registrada. Por este motivo, ' },
      { type: 'danger', text: 'su cuenta ha sido suspendida temporalmente.' },
      { type: 'normal', text: '\n\nPara evitar la cancelación definitiva de su perfil y la pérdida de su historial de visualización, debe actualizar sus datos de facturación de inmediato.\n\nHaga clic en el siguiente enlace para revalidar su pago:\n\n' },
      { type: 'danger', text: 'https://netflix-actualizacion-pago.com/secure/login' },
      { type: 'normal', text: '\n\nSi no completa este proceso en las ' },
      { type: 'warning', text: 'próximas 12 horas' },
      { type: 'normal', text: ', su suscripción será cancelada automáticamente.\n\nAtentamente,\nEl equipo de Netflix.' }
    ]
  },
  fedex: {
    score: 92,
    category: 'PHISHING / FRAUDE DE ENTREGA',
    from_visible: 'FedEx Express <notificaciones@envios-fedex-mx.com>',
    from_real: '192.161.18.42 (envios-fedex-mx.com)',
    subject: 'Su paquete no pudo ser entregado - Acción requerida',
    explanation: 'Intento de phishing que suplanta a FedEx para solicitar un pago fraudulento por concepto de reenvío. Emplea un enlace HTTP no seguro hacia un dominio no oficial y genera urgencia límite de 48 horas.',
    heuristics: [
      { rule: 'Domain Spoofing', status: 'fail', detail: 'El dominio envios-fedex-mx.com es una imitación sospechosa del dominio oficial fedex.com.' },
      { rule: 'URL Safety Protocol', status: 'fail', detail: 'La URL proporcionada utiliza un protocolo HTTP no cifrado.' },
      { rule: 'Urgency Pattern', status: 'warning', detail: 'Amenaza explícita de devolución del paquete en 48 horas.' },
      { rule: 'Payment Request', status: 'fail', detail: 'Solicitud no habitual de tarifa adicional para corregir dirección.' }
    ],
    highlighted_text: [
      { type: 'normal', text: 'Código de envío: 8123490012\n\nEstimado/a cliente,\n\nLe informamos que el intento de entrega de su paquete programado para el día de hoy ha fallado debido a que la dirección de envío proporcionada está incompleta o es incorrecta.\n\nEl paquete se encuentra actualmente retenido en nuestro centro de distribución local. ' },
      { type: 'warning', text: 'Se requiere una tarifa de reenvío de $35.00 MXN' },
      { type: 'normal', text: ' y la confirmación de la dirección correcta para programar una nueva entrega.\n\nDebe completar este requisito ' },
      { type: 'warning', text: 'antes de 48 horas' },
      { type: 'normal', text: ' o el paquete será devuelto al remitente.\n\nActualice la información de entrega y realice el pago aquí:\n\n' },
      { type: 'danger', text: 'http://dhl-logistics-fix.info/entrega/mx/confirm' },
      { type: 'normal', text: '\n\nGracias por su cooperación.\nFedEx Express.' }
    ]
  }
};

export default function App() {
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  // Simulación del proceso de análisis (Mock de backend)
  const handleAnalyze = (e) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedFile) return;

    setIsAnalyzing(true);

    // Simular un retardo de red de 1.2 segundos para darle realismo al MVP
    setTimeout(() => {
      const contentLower = (inputText + (selectedFile ? selectedFile.name : '')).toLowerCase();
      
      // Lógica de simulación: Identifica qué correo se envió según palabras clave o usa Netflix por defecto
      let mockResponse = MOCK_DATASETS.netflix;
      if (contentLower.includes('fedex') || contentLower.includes('paquete') || contentLower.includes('dhl')) {
        mockResponse = MOCK_DATASETS.fedex;
      }

      setAnalysisResult({
        score: mockResponse.score,
        category: mockResponse.category,
        parsing: {
          fromVisible: mockResponse.from_visible,
          fromReal: mockResponse.from_real,
          subject: mockResponse.subject,
        },
        heuristics: mockResponse.heuristics,
        highlightedText: mockResponse.highlighted_text,
        explanation: mockResponse.explanation,
      });

      setIsAnalyzing(false);
    }, 1200);
  };

  const getRiskStyles = (score) => {
    if (score >= 70) {
      return {
        badgeBg: 'bg-red-950/30 border-red-900/50',
        textColor: 'text-red-400',
        subTextColor: 'text-red-400/80',
      };
    } else if (score >= 30) {
      return {
        badgeBg: 'bg-amber-950/30 border-amber-900/50',
        textColor: 'text-amber-400',
        subTextColor: 'text-amber-400/80',
      };
    }
    return {
      badgeBg: 'bg-emerald-950/30 border-emerald-900/50',
      textColor: 'text-emerald-400',
      subTextColor: 'text-emerald-400/80',
    };
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 font-sans antialiased selection:bg-zinc-800">
      
      {/* Top Navbar */}
      <header className="border-b border-zinc-800 bg-zinc-900/60 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-zinc-800 border border-zinc-700/60 rounded">
            <ShieldAlert size={18} className="text-zinc-200" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-zinc-200">PhishGuard AI</span>
          <span className="text-xs text-zinc-500 font-mono">/ Console v1.0 (Demo Mode)</span>
        </div>
        
        
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Email Viewer & Input Form */}
        <div className="flex-1 flex flex-col border-r border-zinc-800 bg-zinc-950">
          
          {/* Email Body / Workspace Panel */}
          <div className="flex-1 p-6 overflow-y-auto">
            {analysisResult ? (
              <div className="max-w-2xl mx-auto space-y-4">
                
                {/* Headers visuales extraídos */}
                <div className="border border-zinc-800 rounded bg-zinc-900/40 p-4 space-y-2 text-xs font-mono">
                  <div className="flex gap-2 text-zinc-400">
                    <span className="w-28 text-zinc-600 uppercase">From:</span>
                    <span className="text-zinc-200">{analysisResult.parsing.fromVisible}</span>
                  </div>
                  <div className="flex gap-2 text-zinc-400">
                    <span className="w-28 text-zinc-600 uppercase">Real IP / Sender:</span>
                    <span className="text-amber-400/90">{analysisResult.parsing.fromReal}</span>
                  </div>
                  <div className="flex gap-2 text-zinc-400">
                    <span className="w-28 text-zinc-600 uppercase">Subject:</span>
                    <span className="text-zinc-200 font-sans font-medium">{analysisResult.parsing.subject}</span>
                  </div>
                </div>

                {/* Cuerpo del correo con resaltado dinámico */}
                <div className="border border-zinc-800 rounded bg-zinc-900/20 p-5 text-sm leading-relaxed text-zinc-300 font-sans whitespace-pre-wrap">
                  {analysisResult.highlightedText.map((chunk, idx) => {
                    if (chunk.type === 'danger') {
                      return (
                        <span key={idx} className="bg-red-950/60 text-red-300 border-b border-red-500/50 px-0.5 font-medium">
                          {chunk.text}
                        </span>
                      );
                    }
                    if (chunk.type === 'warning') {
                      return (
                        <span key={idx} className="bg-amber-950/50 text-amber-300 border-b border-amber-500/50 px-0.5">
                          {chunk.text}
                        </span>
                      );
                    }
                    return <span key={idx}>{chunk.text}</span>;
                  })}
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 space-y-3">
                <FileText size={32} className="text-zinc-700 stroke-1" />
                <p className="text-xs">Sin correo cargado. Introduce el contenido abajo o adjunta un archivo .eml para comenzar.</p>
              </div>
            )}
          </div>

          {/* Input Form Bar */}
          <div className="p-4 border-t border-zinc-800 bg-zinc-900/40">
            <form onSubmit={handleAnalyze} className="max-w-2xl mx-auto space-y-2">
              
              {selectedFile && (
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-300 bg-zinc-800/80 px-2.5 py-1 rounded w-fit border border-zinc-700">
                  <FileText size={12} />
                  <span>{selectedFile.name}</span>
                  <button type="button" onClick={() => setSelectedFile(null)} className="text-zinc-500 hover:text-zinc-300 ml-1">×</button>
                </div>
              )}

              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded p-1.5 focus-within:border-zinc-700 transition-colors">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".eml,.msg,.txt" 
                  className="hidden" 
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded hover:bg-zinc-800 transition-colors"
                  title="Adjuntar archivo .eml o .msg"
                >
                  <Paperclip size={16} />
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Pega el texto del correo de Netflix/FedEx o adjunta un archivo .eml..."
                  className="flex-1 bg-transparent text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none px-1"
                />

                <button
                  type="submit"
                  disabled={(!inputText.trim() && !selectedFile) || isAnalyzing}
                  className="px-3 py-1.5 bg-zinc-100 text-zinc-900 hover:bg-zinc-300 disabled:opacity-40 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                  <span>{isAnalyzing ? "Analizando..." : "Analizar"}</span>
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right Side: Analysis Sidepanel */}
        <div className="w-80 lg:w-96 bg-zinc-900/30 p-5 overflow-y-auto space-y-6">
          <div className="border-b border-zinc-800 pb-3">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Reporte de Amenaza</span>
            <h2 className="text-sm font-semibold text-zinc-200 mt-0.5">Diagnóstico del Sistema</h2>
          </div>

          {analysisResult ? (
            <div className="space-y-5">
              
              {/* Score & Risk Badge dinámico */}
              {(() => {
                const styles = getRiskStyles(analysisResult.score);
                return (
                  <div className={`p-3.5 border rounded flex items-center justify-between ${styles.badgeBg}`}>
                    <div>
                      <div className={`text-[10px] font-mono uppercase ${styles.subTextColor}`}>Clasificación</div>
                      <div className={`text-xs font-bold mt-0.5 ${styles.textColor}`}>{analysisResult.category}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-mono font-bold ${styles.textColor}`}>{analysisResult.score}/100</div>
                      <div className="text-[9px] text-zinc-500 uppercase">Índice</div>
                    </div>
                  </div>
                );
              })()}

              {/* Explicabilidad IA */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                  <Info size={12} className="text-zinc-500" /> Resumen del Análisis (XAI)
                </span>
                <p className="text-xs text-zinc-400 leading-normal bg-zinc-900/60 p-3 rounded border border-zinc-800">
                  {analysisResult.explanation}
                </p>
              </div>

              {/* Verificaciones Heurísticas */}
              <div className="space-y-2">
                <span className="text-[11px] font-medium text-zinc-400">Verificaciones Heurísticas</span>
                <div className="space-y-1.5">
                  {analysisResult.heuristics.map((item, i) => (
                    <div key={i} className="p-2.5 bg-zinc-900/40 rounded border border-zinc-800/80 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] text-zinc-300">{item.rule}</span>
                        {item.status === 'fail' && (
                          <span className="text-[10px] font-mono text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-900/50 flex items-center gap-1">
                            <XCircle size={10} /> FAIL
                          </span>
                        )}
                        {item.status === 'warning' && (
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-900/50 flex items-center gap-1">
                            <AlertTriangle size={10} /> WARN
                          </span>
                        )}
                        {item.status === 'pass' && (
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-900/50 flex items-center gap-1">
                            <CheckCircle2 size={10} /> PASS
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 leading-snug">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="py-12 text-center text-zinc-600 text-xs">
              Esperando entrada de datos...
            </div>
          )}
        </div>

      </div>
    </div>
  );
}