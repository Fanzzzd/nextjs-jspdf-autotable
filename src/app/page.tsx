"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Document, Page, pdfjs } from "react-pdf";
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, RefreshCw } from "lucide-react";
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from "react-zoom-pan-pinch";

// Import font definition files
import "@/fonts/SourceHanSans-normal.js";
import "@/fonts/SourceHanSans-bold.js";

// Define types
interface TableRow {
  id: number;
  name: string;
  department: string;
  position: string;
  salary: string;
}

type Language = "en" | "zh-CN" | "zh-TW";

// Define text content for PDF generation in each language
const translations = {
  "en": {
    title: "Employee Report",
    generatedOn: "Generated on",
    id: "ID",
    name: "Name",
    department: "Department",
    position: "Position",
    salary: "Salary",
    page: "Page",
    of: "of",
    employee: "Employee",
    departments: ["Marketing", "Engineering", "Finance", "HR", "Sales", "Operations"],
    positions: ["Manager", "Director", "Associate", "Analyst", "Specialist", "Coordinator"],
    pageOf: "Page {0} of {1}",
    resetZoom: "Fit to screen",
  },
  "zh-CN": {
    title: "员工报告",
    generatedOn: "生成日期",
    id: "编号",
    name: "姓名",
    department: "部门",
    position: "职位",
    salary: "薪资",
    page: "页码",
    of: "共",
    employee: "员工",
    departments: ["市场部", "工程部", "财务部", "人力资源部", "销售部", "运营部"],
    positions: ["经理", "主管", "专员", "分析师", "专家", "协调员"],
    pageOf: "第 {0} 页，共 {1} 页",
    resetZoom: "适应屏幕",
  },
  "zh-TW": {
    title: "員工報告",
    generatedOn: "生成日期",
    id: "編號",
    name: "姓名",
    department: "部門",
    position: "職位",
    salary: "薪資",
    page: "頁碼",
    of: "共",
    employee: "員工",
    departments: ["市場部", "工程部", "財務部", "人力資源部", "銷售部", "運營部"],
    positions: ["經理", "主管", "專員", "分析師", "專家", "協調員"],
    pageOf: "第 {0} 頁，共 {1} 頁",
    resetZoom: "適應屏幕",
  }
};

const FONT_FAMILY = "SourceHanSans";

export default function PDFGenerator() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [language, setLanguage] = useState<Language>("en");
  const [scale, setScale] = useState(1.0);
  
  // Container ref
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize PDF.js worker
  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;
    
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, []);

  // Document options
  const documentOptions = useMemo(() => ({
    cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/cmaps/",
    cMapPacked: true,
  }), []);

  // Format currency based on language
  const formatCurrency = useCallback((amount: number): string => {
    switch (language) {
      case "zh-CN": return `¥${amount.toLocaleString('zh-CN')}`;
      case "zh-TW": return `NT$${amount.toLocaleString('zh-TW')}`;
      default: return `$${amount.toLocaleString('en-US')}`;
    }
  }, [language]);

  // Generate sample data
  const generateSampleData = useCallback((): TableRow[] => {
    const t = translations[language];
    return Array.from({ length: 40 }, (_, index) => ({
      id: index + 1,
      name: `${t.employee} ${index + 1}`,
      department: t.departments[Math.floor(Math.random() * t.departments.length)],
      position: t.positions[Math.floor(Math.random() * t.positions.length)],
      salary: formatCurrency((Math.floor(Math.random() * 100) + 50) * 1000),
    }));
  }, [language, formatCurrency]);

  // Generate PDF
  const generatePDF = useCallback(() => {
    const t = translations[language];
    const tableData = generateSampleData();
    const doc = new jsPDF();

    try {
      doc.setFont(FONT_FAMILY);
    } catch (e) {
      console.error(`Failed to set font family`, e);
      doc.setFont("helvetica");
    }

    // Title
    doc.setFontSize(16);
    doc.setFont(FONT_FAMILY, 'bold');
    doc.text(t.title, 14, 15);

    // Generated date
    doc.setFont(FONT_FAMILY, 'normal');
    doc.setFontSize(10);
    const dateString = new Date().toLocaleDateString(
      language === "en" ? "en-US" : language === "zh-CN" ? "zh-CN" : "zh-TW"
    );
    doc.text(`${t.generatedOn}: ${dateString}`, 14, 20);

    // Create table
    autoTable(doc, {
      head: [[t.id, t.name, t.department, t.position, t.salary]],
      body: tableData.map(row => [row.id, row.name, row.department, row.position, row.salary]),
      startY: 25,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        font: FONT_FAMILY,
        fontStyle: 'normal',
      },
      headStyles: {
        fillColor: [66, 66, 66],
        textColor: [255, 255, 255],
        font: FONT_FAMILY,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
      didDrawPage: function (data) {
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.setFont(FONT_FAMILY, 'normal');
        doc.text(
          t.pageOf.replace("{0}", data.pageNumber.toString()).replace("{1}", pageCount.toString()),
          doc.internal.pageSize.width - 45,
          doc.internal.pageSize.height - 10
        );
      }
    });

    return doc;
  }, [language, generateSampleData]);

  // Auto-generate PDF on mount and language change
  useEffect(() => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    
    const doc = generatePDF();
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    setPdfUrl(url);
    setCurrentPage(1);
    setTotalPages(0);
  }, [language, generatePDF]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setTotalPages(numPages);
    if (currentPage > numPages) setCurrentPage(numPages > 0 ? numPages : 1);
  };

  // Handle zoom state updates from TransformWrapper
  const handleTransformChange = (ref: ReactZoomPanPinchRef) => {
    const state = ref.state;
    if (state) {
      setScale(state.scale);
    }
  };

  // Page navigation
  const handlePreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  
  // Download PDF
  const handleDownloadPDF = () => {
    const doc = generatePDF();
    doc.save('employee-report.pdf');
  };

  const getPageInfoText = () => {
    if (totalPages === 0) return 'Loading...';
    const t = translations[language];
    return t.pageOf.replace("{0}", currentPage.toString()).replace("{1}", totalPages.toString());
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">PDF Generator with Auto Preview</h1>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <label htmlFor="language" className="text-sm font-medium">
              PDF Language:
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="px-3 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm"
            >
              <option value="en">English</option>
              <option value="zh-CN">简体中文</option>
              <option value="zh-TW">繁體中文</option>
            </select>
          </div>

          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Download size={18} /> Download PDF
          </button>
        </div>

        {/* PDF Viewer */}
        {pdfUrl ? (
          <div
            ref={containerRef}
            className="relative flex flex-col bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg"
            style={{ height: "70vh" }}
          >
            {/* PDF Document with TransformWrapper */}
            <TransformWrapper
              initialScale={1}
              minScale={0.5}
              maxScale={2.5}
              onTransformed={handleTransformChange}
              panning={{ disabled: false }} // Enable panning
              limitToBounds={true} // Limit panning to content boundaries
              centerOnInit={true} // Center content in the viewport
              doubleClick={{ disabled: true }} // Disable double-click zoom
              wheel={{ disabled: false, step: 0.1 }} // Enable wheel zoom with smaller steps
              pinch={{ disabled: false }} // Enable pinch for touch devices
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  <TransformComponent
                    wrapperStyle={{
                      width: "100%",
                      height: "calc(70vh - 50px)", // Adjusted for control bar height
                      overflow: "hidden", // Hide overflow instead of auto
                    }}
                    contentStyle={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: "1rem",
                    }}
                    wrapperClass="pdf-transform-wrapper"
                    contentClass="pdf-transform-content"
                  >
                    <Document
                      file={pdfUrl}
                      onLoadSuccess={onDocumentLoadSuccess}
                      options={documentOptions}
                      loading={<div className="animate-pulse text-gray-500 p-8">Loading PDF...</div>}
                      error={<div className="text-red-500 p-4">Failed to load PDF</div>}
                    >
                      <Page
                        pageNumber={currentPage}
                        renderTextLayer={true}
                        renderAnnotationLayer={false}
                        className="shadow-md bg-white"
                        renderMode="canvas"
                        loading={<div className="animate-pulse text-gray-500 p-4">Loading page...</div>}
                        onRenderError={(error) => {
                          console.warn("Render error (suppressed)", error);
                        }}
                      />
                    </Document>
                  </TransformComponent>

                  {/* Navigation Buttons */}
                  <div className="absolute inset-y-0 left-0 right-0 flex justify-between items-center px-4 pointer-events-none" style={{ zIndex: 10 }}>
                    <button
                      onClick={handlePreviousPage}
                      disabled={currentPage <= 1}
                      className="pointer-events-auto flex items-center justify-center w-10 h-10 rounded-full bg-black/40 text-white hover:bg-black/60 disabled:opacity-30"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage >= totalPages || totalPages === 0}
                      className="pointer-events-auto flex items-center justify-center w-10 h-10 rounded-full bg-black/40 text-white hover:bg-black/60 disabled:opacity-30"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>

                  {/* Controls Bar */}
                  <div className="w-full flex items-center justify-between bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium">{getPageInfoText()}</span>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => zoomOut()}
                        disabled={scale <= 0.5}
                        className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                        title="Zoom out"
                      >
                        <ZoomOut size={18} />
                      </button>
                      
                      <span className="text-sm font-medium w-14 text-center">
                        {Math.round(scale * 100)}%
                      </span>
                      
                      <button
                        onClick={() => zoomIn()}
                        disabled={scale >= 2.5}
                        className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                        title="Zoom in"
                      >
                        <ZoomIn size={18} />
                      </button>

                      <button
                        onClick={() => resetTransform()}
                        className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 ml-2 flex items-center gap-1"
                        title={translations[language].resetZoom}
                      >
                        <RefreshCw size={18} />
                        <span className="text-sm hidden sm:inline">{translations[language].resetZoom}</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </TransformWrapper>
          </div>
        ) : (
          <div className="flex items-center justify-center bg-gray-200 dark:bg-gray-800 rounded-lg p-10 min-h-[50vh]">
            <div className="text-lg animate-pulse">Loading PDF...</div>
          </div>
        )}
      </div>
    </div>
  );
}