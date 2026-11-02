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
  XCircle,
  Download,
  LogOut 
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// export default function Dashboard() {
export default function Dashboard({ onLogout }) {
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const fileInputRef = useRef(null);
  const reportRef = useRef(null); // Referencia del área que se capturará para el PDF

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedFile) return;

    setIsAnalyzing(true);
    
    // Preparar el cuerpo con FormData para subir texto y/o archivo .eml
    const formData = new FormData();
    if (inputText.trim()) formData.append('text', inputText);
    if (selectedFile) formData.append('file', selectedFile);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/analyze-email', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al procesar la solicitud');
      }

      const data = await response.json();
      
      // Mapeo de la respuesta estructurada desde el Backend / Gemini
      setAnalysisResult({
        score: data.score,
        category: data.category,
        parsing: {
          fromVisible: data.from_visible,
          fromReal: data.from_real,
          subject: data.subject,
        },
        heuristics: data.heuristics,
        highlightedText: data.highlighted_text,
        explanation: data.explanation,
      });

    } catch (error) {
      console.error("Error conectando con la API:", error);
      alert(`Error de análisis: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- FUNCIÓN DE GENERACIÓN Y DESCARGA DE PDF ---
  const handleDownloadPDF = async () => {
    if (!reportRef.current || !analysisResult) return;

    setIsDownloading(true);

    try {
      const element = reportRef.current;

      // Renderizado del HTML hacia un Lienzo/Canvas manteniendo fondo oscuro
      const canvas = await html2canvas(element, {
        scale: 2, // Escala 2x para nitidez de texto en Retina/Pantallas HD
        useCORS: true,
        backgroundColor: '#09090b', // Color idéntico a zinc-950
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // Ancho Estándar A4 en mm
      const pageHeight = 295; // Alto Estándar A4 en mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Primera página
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Soporte multipágina en caso de análisis extensos
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Nombre descriptivo sanitized con asunto + timestamp
      const cleanSubject = (analysisResult.parsing.subject || 'correo')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .substring(0, 20);
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `PhishGuard_Reporte_${cleanSubject}_${timestamp}.pdf`;

      pdf.save(filename);

    } catch (error) {
      console.error("Error al exportar el archivo PDF:", error);
      alert("No se pudo generar el archivo PDF. Intente nuevamente.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Helper para asignar estilos de color dinámicos según el Score de Riesgo
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
          <span className="text-xs text-zinc-500 font-mono">/ Console v1.0</span>
        </div>
        <button
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:text-white border border-zinc-700 hover:border-red-500/50 rounded transition"
          >
            <LogOut size={15} />
            Cerrar sesión
          </button>
      </header>

      {/* Main Container - Vinculado a reportRef para exportación PDF completa */}
      <div className="flex-1 flex overflow-hidden" ref={reportRef}>
        
        {/* Left Side: Email Viewer & Input Form */}
        <div className="flex-1 flex flex-col border-r border-zinc-800 bg-zinc-950">
          
          {/* Email Body / Workspace Panel */}
          <div className="flex-1 p-6 overflow-y-auto">
            {analysisResult ? (
              <div className="max-w-2xl mx-auto space-y-4">
                
                {/* Headers visuales extraídos (RF-03) */}
                <div className="border border-zinc-800 rounded bg-zinc-900/40 p-4 space-y-2 text-xs font-mono">
                  <div className="flex gap-2 text-zinc-400">
                    <span className="w-20 text-zinc-600 uppercase">From:</span>
                    <span className="text-zinc-200">{analysisResult.parsing.fromVisible}</span>
                  </div>
                  <div className="flex gap-2 text-zinc-400">
                    <span className="w-20 text-zinc-600 uppercase">Real IP / Sender:</span>
                    <span className="text-amber-400/90">{analysisResult.parsing.fromReal}</span>
                  </div>
                  <div className="flex gap-2 text-zinc-400">
                    <span className="w-20 text-zinc-600 uppercase">Subject:</span>
                    <span className="text-zinc-200 font-sans font-medium">{analysisResult.parsing.subject}</span>
                  </div>
                </div>

                {/* Cuerpo del correo con resaltado dinámico (RF-08) */}
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
                <p className="text-xs">Sin correo cargado. Introduce el contenido abajo o adjunta un archivo para comenzar.</p>
              </div>
            )}
          </div>

          {/* Input Form Bar (RF-01 y RF-02) */}
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
                  placeholder="Pega texto plano, código MIME o adjunta un archivo .eml..."
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

        {/* Right Side: Analysis Sidepanel (RF-04, RF-07, RF-09) */}
        <div className="w-80 lg:w-96 bg-zinc-900/30 p-5 overflow-y-auto space-y-6">
          <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Reporte de Amenaza</span>
              <h2 className="text-sm font-semibold text-zinc-200 mt-0.5">Diagnóstico del Sistema</h2>
            </div>

            {/* Botón Descargar PDF habilitado únicamente cuando hay un resultado presente */}
            {analysisResult && (
              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="flex items-center gap-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 px-2.5 py-1.5 rounded transition-colors disabled:opacity-50 cursor-pointer"
                title="Exportar reporte a PDF"
              >
                {isDownloading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                <span>{isDownloading ? "PDF..." : "Exportar"}</span>
              </button>
            )}
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

              {/* Explicabilidad IA (RF-09) */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                  <Info size={12} className="text-zinc-500" /> Resumen del Análisis
                </span>
                <p className="text-xs text-zinc-400 leading-normal bg-zinc-900/60 p-3 rounded border border-zinc-800">
                  {analysisResult.explanation}
                </p>
              </div>

              {/* Verificaciones Heurísticas (RF-04) */}
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