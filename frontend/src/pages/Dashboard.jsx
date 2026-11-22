// import React, { useState, useRef, useEffect } from 'react';
// import {
//   Paperclip,
//   Search,
//   ShieldAlert,
//   FileText,
//   Info,
//   Loader2,
//   CheckCircle2,
//   AlertTriangle,
//   XCircle,
//   Download,
//   LogOut,
//   History,
//   Mail,
//   RefreshCw,
//   ChevronRight
// } from 'lucide-react';


// // export default function Dashboard() {
// export default function Dashboard({ onLogout }) {
//   const [inputText, setInputText] = useState('');
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [isDownloading, setIsDownloading] = useState(false);
//   const [analysisResult, setAnalysisResult] = useState(null);


//   const [emailHistory, setEmailHistory] = useState([]);
//   const [isLoadingHistory, setIsLoadingHistory] = useState(false);
//   const [selectedAnalysisId, setSelectedAnalysisId] = useState(null);
//   const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);


//   // --- OBTENER HISTORIAL DEL USUARIO ---
  

//   const fetchEmailHistory = async () => {
//     setIsLoadingHistory(true);

//     try {
//       const response = await fetch(
//         `${import.meta.env.VITE_API_URL}/api/v1/email-history`,
//         {
//           method: 'GET',
//           credentials: 'include'
//         }
//       );

//       if (!response.ok) {
//         throw new Error('No se pudo obtener el historial');
//       }

//       const data = await response.json();

//       setEmailHistory(data);

//     } catch (error) {
//       console.error('Error al cargar el historial:', error);
//       alert(`Error al cargar historial: ${error.message}`);
//     } finally {
//       setIsLoadingHistory(false);
//     }
//   };
//     useEffect(() => {
//     fetchEmailHistory();
//   }, []);


//   // --- RECUPERAR ANALISIS DESDE EL HISTORIAL ---

//   const handleSelectAnalysis = async (analysisId) => {
//     setIsLoadingAnalysis(true);

//     try {
//       const response = await fetch(
//         `${import.meta.env.VITE_API_URL}/api/v1/email-history/${analysisId}`,
//         {
//           method: 'GET',
//           credentials: 'include'
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(
//           errorData.detail || 'No se pudo recuperar el análisis'
//         );
//       }

//       const data = await response.json();

//       setAnalysisResult({
//         id: data.id,
//         score: data.score,
//         category: data.category,
//         parsing: {
//           fromVisible: data.from_visible,
//           fromReal: data.from_real,
//           subject: data.subject
//         },
//         heuristics: data.heuristics || [],
//         highlightedText: data.highlighted_text || [],
//         explanation: data.explanation
//       });

//       setSelectedAnalysisId(data.id);

//       // Limpiar el formulario para un nuevo análisis
//       setInputText('');
//       setSelectedFile(null);

//     } catch (error) {
//       console.error('Error al recuperar el análisis:', error);
//       alert(`Error: ${error.message}`);
//     } finally {
//       setIsLoadingAnalysis(false);
//     }
//   };

//   const fileInputRef = useRef(null);
//   // const reportRef = useRef(null); // Referencia del área que se capturará para el PDF

//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) setSelectedFile(file);
//   };

//   const handleAnalyze = async (e) => {
//     e.preventDefault();
//     if (!inputText.trim() && !selectedFile) return;

//     setIsAnalyzing(true);
    
//     // Preparar el cuerpo con FormData para subir texto y/o archivo .eml
//     const formData = new FormData();
//     if (inputText.trim()) formData.append('text', inputText);
//     if (selectedFile) formData.append('file', selectedFile);

//     try {
//       // const response = await fetch('http://127.0.0.1:8000/api/v1/analyze-email', {
//       //   method: 'POST',
//       //   body: formData,
//       // });
//       const response = await fetch(
//         `${import.meta.env.VITE_API_URL}/api/v1/analyze-email`,
//         {
//           method: 'POST',
//           credentials: 'include',
//           body: formData,
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.detail || 'Error al procesar la solicitud');
//       }

//       const data = await response.json();
      
//       // Mapeo de la respuesta estructurada desde el Backend / Gemini
//       // setAnalysisResult({
//       //   score: data.score,
//       //   category: data.category,
//       //   parsing: {
//       //     fromVisible: data.from_visible,
//       //     fromReal: data.from_real,
//       //     subject: data.subject,
//       //   },
//       //   heuristics: data.heuristics,
//       //   highlightedText: data.highlighted_text,
//       //   explanation: data.explanation,
//       // });

//       const newAnalysis = {
//         id: data.analysis_id,
//         score: data.score,
//         category: data.category,
//         parsing: {
//           fromVisible: data.from_visible,
//           fromReal: data.from_real,
//           subject: data.subject
//         },
//         heuristics: data.heuristics,
//         highlightedText: data.highlighted_text,
//         explanation: data.explanation
//       };

//       setAnalysisResult(newAnalysis);
//       setSelectedAnalysisId(data.analysis_id);

//       // Actualizar historial después de guardar el análisis en BD
//       await fetchEmailHistory();

//       // Limpiar los campos de entrada
//       setInputText('');
//       setSelectedFile(null);

//       if (fileInputRef.current) {
//         fileInputRef.current.value = '';
//       }

//     } catch (error) {
//       console.error("Error conectando con la API:", error);
//       alert(`Error de análisis: ${error.message}`);
//     } finally {
//       setIsAnalyzing(false);
//     }
//   };

//   // --- FUNCIÓN DE GENERACIÓN Y DESCARGA DE PDF ---
//   // const handleDownloadPDF = async () => {
//   //   if (!reportRef.current || !analysisResult) return;

//   //   setIsDownloading(true);

//   //   try {
//   //     const element = reportRef.current;

//   //     // Renderizado del HTML hacia un Lienzo/Canvas manteniendo fondo oscuro
//   //     const canvas = await html2canvas(element, {
//   //       scale: 2, // Escala 2x para nitidez de texto en Retina/Pantallas HD
//   //       useCORS: true,
//   //       backgroundColor: '#09090b', // Color idéntico a zinc-950
//   //       logging: false
//   //     });

//   //     const imgData = canvas.toDataURL('image/png');
//   //     const pdf = new jsPDF({
//   //       orientation: 'portrait',
//   //       unit: 'mm',
//   //       format: 'a4'
//   //     });

//   //     const imgWidth = 210; // Ancho Estándar A4 en mm
//   //     const pageHeight = 295; // Alto Estándar A4 en mm
//   //     const imgHeight = (canvas.height * imgWidth) / canvas.width;
//   //     let heightLeft = imgHeight;
//   //     let position = 0;

//   //     // Primera página
//   //     pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
//   //     heightLeft -= pageHeight;

//   //     // Soporte multipágina en caso de análisis extensos
//   //     while (heightLeft >= 0) {
//   //       position = heightLeft - imgHeight;
//   //       pdf.addPage();
//   //       pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
//   //       heightLeft -= pageHeight;
//   //     }

//   //     // Nombre descriptivo sanitized con asunto + timestamp
//   //     const cleanSubject = (analysisResult.parsing.subject || 'correo')
//   //       .toLowerCase()
//   //       .replace(/[^a-z0-9]/g, '_')
//   //       .substring(0, 20);
//   //     const timestamp = new Date().toISOString().split('T')[0];
//   //     const filename = `PhishGuard_Reporte_${cleanSubject}_${timestamp}.pdf`;

//   //     pdf.save(filename);

//   //   } catch (error) {
//   //     console.error("Error al exportar el archivo PDF:", error);
//   //     alert("No se pudo generar el archivo PDF. Intente nuevamente.");
//   //   } finally {
//   //     setIsDownloading(false);
//   //   }
//   // };

//   // --- GENERACIÓN Y DESCARGA DEL PDF DESDE EL BACKEND ---

//   const handleDownloadPDF = async () => {

//     if (!analysisResult) return;

//     setIsDownloading(true);

//     try {

//       // Preparar los resultados del análisis
//       const reportData = {
//         score: analysisResult.score,
//         category: analysisResult.category,

//         from_visible: analysisResult.parsing.fromVisible,
//         from_real: analysisResult.parsing.fromReal,
//         subject: analysisResult.parsing.subject,

//         heuristics: analysisResult.heuristics,

//         highlighted_text: analysisResult.highlightedText,

//         explanation: analysisResult.explanation
//       };

//       // Solicitar la generación del PDF al backend
//       const response = await fetch(
//         `${import.meta.env.VITE_API_URL}/api/v1/generate-report`,
//         {
//           method: 'POST',
//           credentials: 'include',
//           headers: {
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify(reportData)
//         }
//       );

//       if (!response.ok) {

//         let errorMessage = 'No se pudo generar el reporte PDF';

//         try {
//           const errorData = await response.json();
//           errorMessage = errorData.detail || errorMessage;
//         } catch {
//           // Mantener el mensaje predeterminado
//         }

//         throw new Error(errorMessage);
//       }

//       // Recibir el PDF como archivo binario
//       const pdfBlob = await response.blob();

//       // Crear URL temporal para descargar el documento
//       const pdfUrl = window.URL.createObjectURL(pdfBlob);

//       const link = document.createElement('a');

//       link.href = pdfUrl;
//       link.download = `PhishGuard_Reporte_${new Date()
//         .toISOString()
//         .split('T')[0]}.pdf`;

//       document.body.appendChild(link);

//       link.click();

//       // Liberar recursos
//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(pdfUrl);

//     } catch (error) {

//       console.error("Error al descargar el reporte:", error);

//       alert(`Error al generar el PDF: ${error.message}`);

//     } finally {

//       setIsDownloading(false);

//     }
//   };

//   // Helper para asignar estilos de color dinámicos según el Score de Riesgo
//   const getRiskStyles = (score) => {
//     if (score >= 70) {
//       return {
//         badgeBg: 'bg-red-950/30 border-red-900/50',
//         textColor: 'text-red-400',
//         subTextColor: 'text-red-400/80',
//       };
//     } else if (score >= 30) {
//       return {
//         badgeBg: 'bg-amber-950/30 border-amber-900/50',
//         textColor: 'text-amber-400',
//         subTextColor: 'text-amber-400/80',
//       };
//     }
//     return {
//       badgeBg: 'bg-emerald-950/30 border-emerald-900/50',
//       textColor: 'text-emerald-400',
//       subTextColor: 'text-emerald-400/80',
//     };
//   };

//   return (
//     <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 font-sans antialiased selection:bg-zinc-800">
      
//       {/* Top Navbar */}
//       <header className="border-b border-zinc-800 bg-zinc-900/60 px-5 py-3 flex items-center justify-between">
//         <div className="flex items-center gap-2.5">
//           <div className="p-1.5 bg-zinc-800 border border-zinc-700/60 rounded">
//             <ShieldAlert size={18} className="text-zinc-200" />
//           </div>
//           <span className="font-semibold text-sm tracking-tight text-zinc-200">PhishGuard AI</span>
//           <span className="text-xs text-zinc-500 font-mono">/ Console v1.0</span>
//         </div>
     
//         <button
//             onClick={onLogout}
//             className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:text-red-400 border border-zinc-700 hover:border-red-500/50 rounded transition"
//           >
//             <LogOut size={15} />
//             Cerrar sesión
//         </button>



//       </header>

//       {/* Main Container - Vinculado a reportRef para exportación PDF completa */}
//       <div className="flex-1 flex overflow-hidden" 
//         // ref={reportRef}
//       >


       
//       {/* LEFT SIDEBAR: HISTORIAL DE CORREOS */}

//       <aside className="w-64 shrink-0 flex flex-col border-r border-zinc-800 bg-zinc-900/50 overflow-hidden">

//         {/* Encabezado del historial */}
//         <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
//           <div>
//             <div className="flex items-center gap-2">
//               <History size={15} className="text-zinc-400" />
//               <h2 className="text-xs font-semibold text-zinc-200">
//                 Historial
//               </h2>
//             </div>

//             <p className="text-[10px] text-zinc-500 mt-1">
//               Correos analizados
//             </p>
//           </div>

//           <button
//             type="button"
//             onClick={fetchEmailHistory}
//             disabled={isLoadingHistory}
//             className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded transition"
//             title="Actualizar historial"
//           >
//             <RefreshCw
//               size={14}
//               className={isLoadingHistory ? "animate-spin" : ""}
//             />
//           </button>
//         </div>

//         {/* Botón para comenzar un nuevo análisis */}
//         <div className="p-3 border-b border-zinc-800">
//           <button
//             type="button"
//             onClick={() => {
//               setAnalysisResult(null);
//               setSelectedAnalysisId(null);
//               setInputText('');
//               setSelectedFile(null);

//               if (fileInputRef.current) {
//                 fileInputRef.current.value = '';
//               }
//             }}
//             className="w-full flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-300 text-zinc-900 rounded px-3 py-2 text-xs font-medium transition"
//           >
//             <Search size={14} />
//             Nuevo análisis
//           </button>
//         </div>

//         {/* Lista de análisis */}
//         <div className="flex-1 overflow-y-auto p-2 space-y-1">

//           {isLoadingHistory && emailHistory.length === 0 ? (

//             <div className="flex flex-col items-center justify-center py-10 text-zinc-500 gap-2">
//               <Loader2 size={18} className="animate-spin" />
//               <span className="text-[10px]">Cargando historial...</span>
//             </div>

//           ) : emailHistory.length === 0 ? (

//             <div className="flex flex-col items-center justify-center text-center py-10 px-3 text-zinc-600 gap-2">
//               <Mail size={25} className="stroke-1" />
//               <p className="text-xs">No hay correos analizados todavía.</p>
//               <p className="text-[10px]">
//                 Tus análisis aparecerán aquí.
//               </p>
//             </div>

//           ) : (

//             emailHistory.map((item) => {

//               const isSelected = selectedAnalysisId === item.id;

//               const riskColor =
//                 item.score >= 70
//                   ? 'text-red-400'
//                   : item.score >= 30
//                     ? 'text-amber-400'
//                     : 'text-emerald-400';

//               const dateLabel = item.date
//                 ? new Date(item.date).toLocaleString('es-MX', {
//                     day: '2-digit',
//                     month: 'short',
//                     year: 'numeric',
//                     hour: '2-digit',
//                     minute: '2-digit'
//                   })
//                 : 'Fecha desconocida';

//               return (
//                 <button
//                   key={item.id}
//                   type="button"
//                   onClick={() => handleSelectAnalysis(item.id)}
//                   disabled={isLoadingAnalysis}
//                   className={`w-full text-left p-3 rounded border transition-colors group ${
//                     isSelected
//                       ? 'bg-zinc-800 border-zinc-600'
//                       : 'bg-transparent border-transparent hover:bg-zinc-800/60 hover:border-zinc-700'
//                   }`}
//                 >

//                   <div className="flex items-start justify-between gap-2">

//                     <div className="flex items-center gap-2 min-w-0">
//                       <Mail
//                         size={14}
//                         className="text-zinc-500 shrink-0"
//                       />

//                       <span className="text-xs font-medium text-zinc-200 truncate">
//                         {item.subject || 'Sin asunto'}
//                       </span>
//                     </div>

//                     <ChevronRight
//                       size={13}
//                       className={`shrink-0 text-zinc-600 transition ${
//                         isSelected
//                           ? 'text-zinc-300'
//                           : 'group-hover:translate-x-0.5'
//                       }`}
//                     />

//                   </div>

//                   <p className="text-[10px] text-zinc-500 truncate mt-2">
//                     {item.from_visible}
//                   </p>

//                   <div className="flex items-center justify-between gap-2 mt-3">

//                     <span className={`text-[10px] font-mono font-semibold ${riskColor}`}>
//                       {item.score}/100
//                     </span>

//                     <span className="text-[9px] text-zinc-600 truncate">
//                       {dateLabel}
//                     </span>

//                   </div>

//                   <div className="mt-2">
//                     <span className={`text-[9px] px-1.5 py-0.5 rounded border ${
//                       item.score >= 70
//                         ? 'text-red-400 bg-red-950/30 border-red-900/50'
//                         : item.score >= 30
//                           ? 'text-amber-400 bg-amber-950/30 border-amber-900/50'
//                           : 'text-emerald-400 bg-emerald-950/30 border-emerald-900/50'
//                     }`}>
//                       {item.category}
//                     </span>
//                   </div>

//                 </button>
//               );
//             })

//           )}

//         </div>

//         {/* Información del historial */}
//         <div className="p-3 border-t border-zinc-800">
//           <p className="text-[10px] text-zinc-600 text-center">
//             {emailHistory.length} análisis registrados
//           </p>
//         </div>

//       </aside>
 

        
//         {/* Left Side: Email Viewer & Input Form */}
//         <div className="flex-1 flex flex-col border-r border-zinc-800 bg-zinc-950">
          
//           {/* Email Body / Workspace Panel */}
//           <div className="flex-1 p-6 overflow-y-auto">
//             {analysisResult ? (
//               <div className="max-w-2xl mx-auto space-y-4">
                
//                 {/* Headers visuales extraídos (RF-03) */}
//                 <div className="border border-zinc-800 rounded bg-zinc-900/40 p-4 space-y-2 text-xs font-mono">
//                   <div className="flex gap-2 text-zinc-400">
//                     <span className="w-20 text-zinc-600 uppercase">From:</span>
//                     <span className="text-zinc-200">{analysisResult.parsing.fromVisible}</span>
//                   </div>
//                   <div className="flex gap-2 text-zinc-400">
//                     <span className="w-20 text-zinc-600 uppercase">Real IP / Sender:</span>
//                     <span className="text-amber-400/90">{analysisResult.parsing.fromReal}</span>
//                   </div>
//                   <div className="flex gap-2 text-zinc-400">
//                     <span className="w-20 text-zinc-600 uppercase">Subject:</span>
//                     <span className="text-zinc-200 font-sans font-medium">{analysisResult.parsing.subject}</span>
//                   </div>
//                 </div>

//                 {/* Cuerpo del correo con resaltado dinámico (RF-08) */}
//                 <div className="border border-zinc-800 rounded bg-zinc-900/20 p-5 text-sm leading-relaxed text-zinc-300 font-sans whitespace-pre-wrap">
//                   {analysisResult.highlightedText.map((chunk, idx) => {
//                     if (chunk.type === 'danger') {
//                       return (
//                         <span key={idx} className="bg-red-950/60 text-red-300 border-b border-red-500/50 px-0.5 font-medium">
//                           {chunk.text}
//                         </span>
//                       );
//                     }
//                     if (chunk.type === 'warning') {
//                       return (
//                         <span key={idx} className="bg-amber-950/50 text-amber-300 border-b border-amber-500/50 px-0.5">
//                           {chunk.text}
//                         </span>
//                       );
//                     }
//                     return <span key={idx}>{chunk.text}</span>;
//                   })}
//                 </div>

//               </div>
//             ) : (
//               <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 space-y-3">
//                 <FileText size={32} className="text-zinc-700 stroke-1" />
//                 <p className="text-xs">Sin correo cargado. Introduce el contenido abajo o adjunta un archivo para comenzar.</p>
//               </div>
//             )} 
//           </div>

//           {/* Input Form Bar (RF-01 y RF-02) */}
//           <div className="p-4 border-t border-zinc-800 bg-zinc-900/40">
//             <form onSubmit={handleAnalyze} className="max-w-2xl mx-auto space-y-2">
              
//               {selectedFile && (
//                 <div className="flex items-center gap-2 text-xs font-mono text-zinc-300 bg-zinc-800/80 px-2.5 py-1 rounded w-fit border border-zinc-700">
//                   <FileText size={12} />
//                   <span>{selectedFile.name}</span>
//                   <button type="button" onClick={() => setSelectedFile(null)} className="text-zinc-500 hover:text-zinc-300 ml-1">×</button>
//                 </div>
//               )}

//               <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded p-1.5 focus-within:border-zinc-700 transition-colors">
//                 <input 
//                   type="file" 
//                   ref={fileInputRef} 
//                   onChange={handleFileUpload} 
//                   accept=".eml,.msg,.txt" 
//                   className="hidden" 
//                 />

//                 <button
//                   type="button"
//                   onClick={() => fileInputRef.current?.click()}
//                   className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded hover:bg-zinc-800 transition-colors"
//                   title="Adjuntar archivo .eml o .msg"
//                 >
//                   <Paperclip size={16} />
//                 </button>

//                 <input
//                   type="text"
//                   value={inputText}
//                   onChange={(e) => setInputText(e.target.value)}
//                   placeholder="Pega texto plano, código MIME o adjunta un archivo .eml..."
//                   className="flex-1 bg-transparent text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none px-1"
//                 />

//                 <button
//                   type="submit"
//                   disabled={(!inputText.trim() && !selectedFile) || isAnalyzing}
//                   className="px-3 py-1.5 bg-zinc-100 text-zinc-900 hover:bg-zinc-300 disabled:opacity-40 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed"
//                 >
//                   {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
//                   <span>{isAnalyzing ? "Analizando..." : "Analizar"}</span>
//                 </button>
//               </div>
//             </form>
//           </div>

//         </div>

//         {/* Right Side: Analysis Sidepanel (RF-04, RF-07, RF-09) */}
//         <div className="w-80 lg:w-96 bg-zinc-900/30 p-5 overflow-y-auto space-y-6">
//           <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
//             <div>
//               <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Reporte de Amenaza</span>
//               <h2 className="text-sm font-semibold text-zinc-200 mt-0.5">Diagnóstico del Sistema</h2>
//             </div>

//             {/* Botón Descargar PDF habilitado únicamente cuando hay un resultado presente */}
//               {analysisResult && (
//                 <button
//                   type="button"
//                   onClick={handleDownloadPDF}
//                   disabled={isDownloading}
//                   className="flex items-center gap-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 px-2.5 py-1.5 rounded transition-colors disabled:opacity-50 cursor-pointer"
//                   title="Descargar reporte PDF"
//                 >
//                   {isDownloading ? (
//                     <Loader2 size={13} className="animate-spin" />
//                   ) : (
//                     <Download size={13} />
//                   )}

//                   <span>
//                     {isDownloading ? "Generando PDF..." : "Descargar PDF"}
//                   </span>
//                 </button>
//               )}
//           </div>

//           {analysisResult ? (
//             <div className="space-y-5">
              
//               {/* Score & Risk Badge dinámico */}
//               {(() => {
//                 const styles = getRiskStyles(analysisResult.score);
//                 return (
//                   <div className={`p-3.5 border rounded flex items-center justify-between ${styles.badgeBg}`}>
//                     <div>
//                       <div className={`text-[10px] font-mono uppercase ${styles.subTextColor}`}>Clasificación</div>
//                       <div className={`text-xs font-bold mt-0.5 ${styles.textColor}`}>{analysisResult.category}</div>
//                     </div>
//                     <div className="text-right">
//                       <div className={`text-lg font-mono font-bold ${styles.textColor}`}>{analysisResult.score}/100</div>
//                       <div className="text-[9px] text-zinc-500 uppercase">Índice</div>
//                     </div>
//                   </div>
//                 );
//               })()}

//               {/* Explicabilidad IA (RF-09) */}
//               <div className="space-y-1.5">
//                 <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
//                   <Info size={12} className="text-zinc-500" /> Resumen del Análisis
//                 </span>
//                 <p className="text-xs text-zinc-400 leading-normal bg-zinc-900/60 p-3 rounded border border-zinc-800">
//                   {analysisResult.explanation}
//                 </p>
//               </div>

//               {/* Verificaciones Heurísticas (RF-04) */}
//               <div className="space-y-2">
//                 <span className="text-[11px] font-medium text-zinc-400">Verificaciones Heurísticas</span>
//                 <div className="space-y-1.5">
//                   {analysisResult.heuristics.map((item, i) => (
//                     <div key={i} className="p-2.5 bg-zinc-900/40 rounded border border-zinc-800/80 text-xs space-y-1">
//                       <div className="flex items-center justify-between">
//                         <span className="font-mono text-[11px] text-zinc-300">{item.rule}</span>
//                         {item.status === 'fail' && (
//                           <span className="text-[10px] font-mono text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-900/50 flex items-center gap-1">
//                             <XCircle size={10} /> FAIL
//                           </span>
//                         )}
//                         {item.status === 'warning' && (
//                           <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-900/50 flex items-center gap-1">
//                             <AlertTriangle size={10} /> WARN
//                           </span>
//                         )}
//                         {item.status === 'pass' && (
//                           <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-900/50 flex items-center gap-1">
//                             <CheckCircle2 size={10} /> PASS
//                           </span>
//                         )}
//                       </div>
//                       <p className="text-[11px] text-zinc-500 leading-snug">{item.detail}</p>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//             </div>
//           ) : (
//             <div className="py-12 text-center text-zinc-600 text-xs">
//               Esperando entrada de datos...
//             </div>
//           )}
//         </div>

//       </div>
//     </div>
//   );
// }

import React, { useState, useRef, useEffect } from 'react';
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
  LogOut,
  History,
  Mail,
  RefreshCw,
  ChevronRight,
  Inbox
} from 'lucide-react';

export default function Dashboard({ onLogout, googleAccessToken }) {
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Estados para el Sidebar (Historial vs Bandeja Gmail)
  const [sidebarTab, setSidebarTab] = useState('history'); // 'history' | 'gmail'

  // Estados de Historial (MySQL)
  const [emailHistory, setEmailHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  // Estados de Bandeja de Entrada (Gmail API)
  const [gmailMessages, setGmailMessages] = useState([]);
  const [isLoadingGmail, setIsLoadingGmail] = useState(false);
  const [analyzingGmailId, setAnalyzingGmailId] = useState(null);

  const fileInputRef = useRef(null);

  // --- OBTENER HISTORIAL DEL USUARIO (MySQL) ---
  const fetchEmailHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/email-history`,
        {
          method: 'GET',
          credentials: 'include'
        }
      );

      if (!response.ok) {
        throw new Error('No se pudo obtener el historial');
      }

      const data = await response.json();
      setEmailHistory(data);
    } catch (error) {
      console.error('Error al cargar el historial:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchEmailHistory();
  }, []);

  // --- LISTAR ÚLTIMOS CORREOS DE GMAIL ---ANTERIOR
  // const fetchGmailInbox = async () => {
  //   setIsLoadingGmail(true);
  //   try {
  //     const headers = {};
  //     if (googleAccessToken) {
  //       headers['Authorization'] = `Bearer ${googleAccessToken}`;
  //     }

  //     const response = await fetch(
  //       `${import.meta.env.VITE_API_URL}/api/v1/gmail/list`,
  //       {
  //         method: 'GET',
  //         credentials: 'include',
  //         headers
  //       }
  //     );

  //     if (!response.ok) {
  //       const errorData = await response.json().catch(() => ({}));
  //       throw new Error(errorData.detail || 'No se pudo conectar con Gmail. Verifica los permisos de lectura.');
  //     }

  //     const data = await response.json();
  //     setGmailMessages(data);
  //   } catch (error) {
  //     console.error('Error al cargar bandeja de Gmail:', error);
  //     alert(`Error de Gmail: ${error.message}`);
  //   } finally {
  //     setIsLoadingGmail(false);
  //   }
  // };


  // NUEVO
  const fetchGmailInbox = async () => {
  const googleToken = localStorage.getItem("google_access_token");

  if (!googleToken) {
    alert("Vuelve a iniciar sesión para autorizar el acceso a Gmail.");
    return;
  }

  try {
    const response = await fetch("http://localhost:8000/api/v1/gmail/list", {
      method: "GET",
      credentials: "include", // <-- Envía automáticamente tu cookie phishguard_session
      headers: {
        "X-Google-Token": googleToken
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMsg = typeof errorData.detail === "string"
        ? errorData.detail
        : JSON.stringify(errorData.detail);
      throw new Error(errorMsg);
    }

    const emails = await response.json();
    setGmailMessages(emails);
  } catch (error) {
    console.error("Error al cargar bandeja de Gmail:", error);
    alert(`Error: ${error.message}`);
  }
};

  // Cargar correos de Gmail automáticamente al cambiar a la pestaña 'gmail' si está vacía
  useEffect(() => {
    if (sidebarTab === 'gmail' && gmailMessages.length === 0) {
      fetchGmailInbox();
    }
  }, [sidebarTab]);

  // // --- ANALIZAR UN CORREO SELECCIONADO DESDE GMAIL ---
  // const handleAnalyzeGmailMessage = async (messageId) => {
  //   setAnalyzingGmailId(messageId);
  //   setIsAnalyzing(true);

  //   try {
  //     const headers = {};
  //     if (googleAccessToken) {
  //       headers['Authorization'] = `Bearer ${googleAccessToken}`;
  //     }

  //     const response = await fetch(
  //       `${import.meta.env.VITE_API_URL}/api/v1/gmail/analyze/${messageId}`,
  //       {
  //         method: 'POST',
  //         credentials: 'include',
  //         headers
  //       }
  //     );

  //     if (!response.ok) {
  //       const errorData = await response.json().catch(() => ({}));
  //       throw new Error(errorData.detail || errorData.detail);
  //     }

  //     const data = await response.json();

  //     setAnalysisResult({
  //       id: data.analysis_id || null,
  //       score: data.score,
  //       category: data.category,
  //       parsing: {
  //         fromVisible: data.from_visible,
  //         fromReal: data.from_real,
  //         subject: data.subject
  //       },
  //       heuristics: data.heuristics || [],
  //       highlightedText: data.highlighted_text || [],
  //       explanation: data.explanation
  //     });

  //     setSelectedAnalysisId(data.analysis_id || null);
  //     await fetchEmailHistory();
  //   } catch (error) {
  //     console.error('Error analizando correo de Gmail:', error);
  //     alert(`Error al analizar correo: ${error.message}`);
  //   } finally {
  //     setAnalyzingGmailId(null);
  //     setIsAnalyzing(false);
  //   }
  // };
  // --- ANALIZAR UN CORREO SELECCIONADO DESDE GMAIL ---
  const handleAnalyzeGmailMessage = async (messageId) => {
    setAnalyzingGmailId(messageId);
    setIsAnalyzing(true);

    try {
      // Recupera el token de la variable de estado o desde localStorage como respaldo
      const tokenToUse = googleAccessToken || localStorage.getItem('google_access_token');

      if (!tokenToUse) {
        throw new Error('No se encontró el token de Google. Vuelve a iniciar sesión.');
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/gmail/analyze/${messageId}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'X-Google-Token': tokenToUse // <-- Header exacto que espera FastAPI (sin "Bearer")
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          typeof errorData.detail === 'string'
            ? errorData.detail
            : JSON.stringify(errorData.detail || 'Error en el servidor');
        throw new Error(errorMessage);
      }

      const data = await response.json();

      setAnalysisResult({
        id: data.analysis_id || null,
        score: data.score,
        category: data.category,
        parsing: {
          fromVisible: data.from_visible,
          fromReal: data.from_real,
          subject: data.subject
        },
        heuristics: data.heuristics || [],
        highlightedText: data.highlighted_text || [],
        explanation: data.explanation
      });

      setSelectedAnalysisId(data.analysis_id || null);
      await fetchEmailHistory();
    } catch (error) {
      console.error('Error analizando correo de Gmail:', error);
      alert(`Error al analizar correo: ${error.message}`);
    } finally {
      setAnalyzingGmailId(null);
      setIsAnalyzing(false);
    }
  };

  // --- RECUPERAR ANÁLISIS DESDE EL HISTORIAL ---
  const handleSelectAnalysis = async (analysisId) => {
    setIsLoadingAnalysis(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/email-history/${analysisId}`,
        {
          method: 'GET',
          credentials: 'include'
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'No se pudo recuperar el análisis');
      }

      const data = await response.json();

      setAnalysisResult({
        id: data.id,
        score: data.score,
        category: data.category,
        parsing: {
          fromVisible: data.from_visible,
          fromReal: data.from_real,
          subject: data.subject
        },
        heuristics: data.heuristics || [],
        highlightedText: data.highlighted_text || [],
        explanation: data.explanation
      });

      setSelectedAnalysisId(data.id);
      setInputText('');
      setSelectedFile(null);
    } catch (error) {
      console.error('Error al recuperar el análisis:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  // --- ANALIZAR TEXTO PLANO O ARCHIVO (.EML / .MSG) ---
  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedFile) return;

    setIsAnalyzing(true);

    const formData = new FormData();
    if (inputText.trim()) formData.append('text', inputText);
    if (selectedFile) formData.append('file', selectedFile);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/analyze-email`,
        {
          method: 'POST',
          credentials: 'include',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al procesar la solicitud');
      }

      const data = await response.json();

      const newAnalysis = {
        id: data.analysis_id || null,
        score: data.score,
        category: data.category,
        parsing: {
          fromVisible: data.from_visible,
          fromReal: data.from_real,
          subject: data.subject
        },
        heuristics: data.heuristics || [],
        highlightedText: data.highlighted_text || [],
        explanation: data.explanation
      };

      setAnalysisResult(newAnalysis);
      setSelectedAnalysisId(data.analysis_id || null);

      // Actualizar historial después de guardar el análisis en BD
      await fetchEmailHistory();

      // Limpiar los campos de entrada
      setInputText('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error("Error conectando con la API:", error);
      alert(`Error de análisis: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- GENERACIÓN Y DESCARGA DEL PDF DESDE EL BACKEND ---
  const handleDownloadPDF = async () => {
    if (!analysisResult) return;

    setIsDownloading(true);

    try {
      const reportData = {
        score: analysisResult.score,
        category: analysisResult.category,
        from_visible: analysisResult.parsing.fromVisible,
        from_real: analysisResult.parsing.fromReal,
        subject: analysisResult.parsing.subject,
        heuristics: analysisResult.heuristics,
        highlighted_text: analysisResult.highlightedText,
        explanation: analysisResult.explanation
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/generate-report`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(reportData)
        }
      );

      if (!response.ok) {
        let errorMessage = 'No se pudo generar el reporte PDF';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {
          // Mantener mensaje por defecto
        }
        throw new Error(errorMessage);
      }

      const pdfBlob = await response.blob();
      const pdfUrl = window.URL.createObjectURL(pdfBlob);

      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `PhishGuard_Reporte_${new Date().toISOString().split('T')[0]}.pdf`;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(pdfUrl);
    } catch (error) {
      console.error("Error al descargar el reporte:", error);
      alert(`Error al generar el PDF: ${error.message}`);
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
          className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:text-red-400 border border-zinc-700 hover:border-red-500/50 rounded transition cursor-pointer"
        >
          <LogOut size={15} />
          Cerrar sesión
        </button>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT SIDEBAR: HISTORIAL & BANDEJA GMAIL */}
        <aside className="w-72 shrink-0 flex flex-col border-r border-zinc-800 bg-zinc-900/50 overflow-hidden">

          {/* Selector de Pestañas (Historial / Gmail) */}
          <div className="grid grid-cols-2 border-b border-zinc-800 bg-zinc-950/40 p-1 gap-1">
            <button
              type="button"
              onClick={() => setSidebarTab('history')}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded transition cursor-pointer ${
                sidebarTab === 'history'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <History size={13} />
              Historial
            </button>

            <button
              type="button"
              onClick={() => setSidebarTab('gmail')}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded transition cursor-pointer ${
                sidebarTab === 'gmail'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Inbox size={13} />
              Gmail
            </button>
          </div>

          {/* VISTA 1: HISTORIAL DE ANÁLISIS */}
          {sidebarTab === 'history' && (
            <>
              <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-semibold text-zinc-200">Historial Guardado</h2>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Auditorías anteriores</p>
                </div>

                <button
                  type="button"
                  onClick={fetchEmailHistory}
                  disabled={isLoadingHistory}
                  className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded transition cursor-pointer"
                  title="Actualizar historial"
                >
                  <RefreshCw size={14} className={isLoadingHistory ? "animate-spin" : ""} />
                </button>
              </div>

              <div className="p-3 border-b border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setAnalysisResult(null);
                    setSelectedAnalysisId(null);
                    setInputText('');
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-300 text-zinc-900 rounded px-3 py-2 text-xs font-medium transition cursor-pointer"
                >
                  <Search size={14} />
                  Nuevo análisis manual
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {isLoadingHistory && emailHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-zinc-500 gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    <span className="text-[10px]">Cargando historial...</span>
                  </div>
                ) : emailHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-10 px-3 text-zinc-600 gap-2">
                    <Mail size={25} className="stroke-1" />
                    <p className="text-xs">No hay correos analizados todavía.</p>
                    <p className="text-[10px]">Tus análisis aparecerán aquí.</p>
                  </div>
                ) : (
                  emailHistory.map((item) => {
                    const isSelected = selectedAnalysisId === item.id;
                    const riskColor =
                      item.score >= 70
                        ? 'text-red-400'
                        : item.score >= 30
                          ? 'text-amber-400'
                          : 'text-emerald-400';

                    const dateLabel = item.date
                      ? new Date(item.date).toLocaleString('es-MX', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Fecha desconocida';

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectAnalysis(item.id)}
                        disabled={isLoadingAnalysis}
                        className={`w-full text-left p-3 rounded border transition-colors group cursor-pointer ${
                          isSelected
                            ? 'bg-zinc-800 border-zinc-600'
                            : 'bg-transparent border-transparent hover:bg-zinc-800/60 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Mail size={14} className="text-zinc-500 shrink-0" />
                            <span className="text-xs font-medium text-zinc-200 truncate">
                              {item.subject || 'Sin asunto'}
                            </span>
                          </div>
                          <ChevronRight
                            size={13}
                            className={`shrink-0 text-zinc-600 transition ${
                              isSelected ? 'text-zinc-300' : 'group-hover:translate-x-0.5'
                            }`}
                          />
                        </div>

                        <p className="text-[10px] text-zinc-500 truncate mt-1.5">
                          {item.from_visible}
                        </p>

                        <div className="flex items-center justify-between gap-2 mt-2.5">
                          <span className={`text-[10px] font-mono font-semibold ${riskColor}`}>
                            {item.score}/100
                          </span>
                          <span className="text-[9px] text-zinc-600 truncate">
                            {dateLabel}
                          </span>
                        </div>

                        <div className="mt-2">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded border ${
                            item.score >= 70
                              ? 'text-red-400 bg-red-950/30 border-red-900/50'
                              : item.score >= 30
                                ? 'text-amber-400 bg-amber-950/30 border-amber-900/50'
                                : 'text-emerald-400 bg-emerald-950/30 border-emerald-900/50'
                          }`}>
                            {item.category}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              <div className="p-3 border-t border-zinc-800">
                <p className="text-[10px] text-zinc-600 text-center">
                  {emailHistory.length} análisis registrados
                </p>
              </div>
            </>
          )}

          {/* VISTA 2: BANDEJA DE ENTRADA DE GMAIL */}
          {sidebarTab === 'gmail' && (
            <>
              <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-semibold text-zinc-200">Bandeja Principal</h2>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Selecciona un correo para auditar</p>
                </div>

                <button
                  type="button"
                  onClick={fetchGmailInbox}
                  disabled={isLoadingGmail}
                  className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded transition cursor-pointer"
                  title="Sincronizar bandeja de Gmail"
                >
                  <RefreshCw size={14} className={isLoadingGmail ? "animate-spin" : ""} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {isLoadingGmail ? (
                  <div className="flex flex-col items-center justify-center py-10 text-zinc-500 gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    <span className="text-[10px]">Sincronizando con Gmail...</span>
                  </div>
                ) : gmailMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-10 px-3 text-zinc-600 gap-2">
                    <Inbox size={25} className="stroke-1" />
                    <p className="text-xs">Mostrar los últimos correos.</p>
                    <button
                      type="button"
                      onClick={fetchGmailInbox}
                      className="mt-1 text-[11px] text-zinc-400 underline hover:text-zinc-200 cursor-pointer"
                    >
                      Conectar bandeja de entrada 
                    </button>
                  </div>
                ) : (
                  gmailMessages.map((msg) => {
                    const isThisAnalyzing = analyzingGmailId === msg.id;

                    return (
                      <button
                        key={msg.id}
                        type="button"
                        onClick={() => handleAnalyzeGmailMessage(msg.id)}
                        disabled={isAnalyzing}
                        className="w-full text-left p-3 rounded border border-transparent hover:bg-zinc-800/60 hover:border-zinc-700 transition-colors group cursor-pointer disabled:opacity-50"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-medium text-zinc-200 truncate">
                            {msg.subject || 'Sin asunto'}
                          </span>
                          {isThisAnalyzing ? (
                            <Loader2 size={13} className="animate-spin text-zinc-400 shrink-0" />
                          ) : (
                            <ChevronRight size={13} className="shrink-0 text-zinc-600 group-hover:translate-x-0.5 transition" />
                          )}
                        </div>

                        <p className="text-[10px] text-zinc-400 truncate mt-1">
                          {msg.from || 'Remitente desconocido'}
                        </p>

                        {msg.snippet && (
                          <p className="text-[10px] text-zinc-600 line-clamp-2 mt-1.5 leading-snug">
                            {msg.snippet}
                          </p>
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              <div className="p-3 border-t border-zinc-800">
                <p className="text-[10px] text-zinc-600 text-center">
                  Clic en un correo para analizar con IA
                </p>
              </div>
            </>
          )}

        </aside>

        {/* Center: Email Viewer & Input Form */}
        <div className="flex-1 flex flex-col border-r border-zinc-800 bg-zinc-950">
          
          {/* Email Body / Workspace Panel */}
          <div className="flex-1 p-6 overflow-y-auto">
            {isAnalyzing && !analysisResult ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400 space-y-3">
                <Loader2 size={28} className="animate-spin text-zinc-500" />
                <p className="text-xs">Analizando encabezados, URLs y contenido semántico con Gemini...</p>
              </div>
            ) : analysisResult ? (
              <div className="max-w-2xl mx-auto space-y-4">
                
                {/* Headers visuales extraídos (RF-03) */}
                <div className="border border-zinc-800 rounded bg-zinc-900/40 p-4 space-y-2 text-xs font-mono">
                  <div className="flex gap-2 text-zinc-400">
                    <span className="w-24 shrink-0 text-zinc-600 uppercase">From:</span>
                    <span className="text-zinc-200 break-all">{analysisResult.parsing.fromVisible}</span>
                  </div>
                  <div className="flex gap-2 text-zinc-400">
                    <span className="w-24 shrink-0 text-zinc-600 uppercase">Real Sender:</span>
                    <span className="text-amber-400/90 break-all">{analysisResult.parsing.fromReal}</span>
                  </div>
                  <div className="flex gap-2 text-zinc-400">
                    <span className="w-24 shrink-0 text-zinc-600 uppercase">Subject:</span>
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
                <p className="text-xs max-w-sm">
                  Sin correo cargado. Pega el contenido abajo, adjunta un archivo <span className="font-mono text-zinc-400">.eml</span> o selecciona un mensaje desde la pestaña <span className="text-zinc-300 font-medium">Gmail</span>.
                </p>
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
                  <button type="button" onClick={() => setSelectedFile(null)} className="text-zinc-500 hover:text-zinc-300 ml-1 cursor-pointer">×</button>
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
                  className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded hover:bg-zinc-800 transition-colors cursor-pointer"
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

        {/* Right Side: Analysis Sidepanel (RF-04, RF-07, RF-09, RF-10) */}
        <div className="w-80 lg:w-96 bg-zinc-900/30 p-5 overflow-y-auto space-y-6">
          <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Reporte de Amenaza</span>
              <h2 className="text-sm font-semibold text-zinc-200 mt-0.5">Diagnóstico del Sistema</h2>
            </div>

            {analysisResult && (
              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="flex items-center gap-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 px-2.5 py-1.5 rounded transition-colors disabled:opacity-50 cursor-pointer"
                title="Descargar reporte PDF"
              >
                {isDownloading ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Download size={13} />
                )}
                <span>{isDownloading ? "Generando PDF..." : "Descargar PDF"}</span>
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