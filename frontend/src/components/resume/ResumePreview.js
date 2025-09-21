'use client';

import { useEffect, useRef, useState } from 'react';
import { ClassicTemplate, ModernTemplate, CreativeTemplate } from './ResumeTemplates';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, ZoomIn, ZoomOut, Eye, Palette, Loader } from 'lucide-react';

const templates = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  creative: CreativeTemplate
};

const templateNames = {
  classic: 'Classic',
  modern: 'Modern',
  creative: 'Creative'
};

export default function ResumePreview({ 
  resumeData, 
  selectedTemplate, 
  onTemplateChange,
  className = '' 
}) {
  const previewRef = useRef(null);
  const [zoom, setZoom] = useState(75);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const TemplateComponent = templates[selectedTemplate] || templates.classic;

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 150));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const generatePDF = async () => {
    if (!previewRef.current || isGeneratingPDF) return;

    setIsGeneratingPDF(true);
    try {
      // Temporarily set zoom to 100% for PDF generation
      const originalTransform = previewRef.current.style.transform;
      previewRef.current.style.transform = 'scale(1)';
      
      // Wait for transform to apply
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(previewRef.current, {
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        width: previewRef.current.scrollWidth,
        height: previewRef.current.scrollHeight,
        windowWidth: 1200,
        windowHeight: 1600
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'letter'
      });

      const imgWidth = 8.5; // Letter width in inches
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Generate filename
      const fileName = `${resumeData.personalInfo.firstName || 'Resume'}_${resumeData.personalInfo.lastName || 'Document'}_Resume.pdf`.replace(/\s+/g, '_');
      
      pdf.save(fileName);

      // Restore original transform
      previewRef.current.style.transform = originalTransform;
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleTemplateSelect = (templateKey) => {
    onTemplateChange(templateKey);
    setShowTemplateSelector(false);
  };

  return (
    <div className={`resume-preview-container ${className}`} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Preview Controls */}
      <div 
        className="preview-controls" 
        style={{ 
          padding: '15px 20px', 
          borderBottom: '1px solid var(--accent-subtle)', 
          backgroundColor: 'var(--background-panel)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Eye className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
          <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>Resume Preview</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            ({templateNames[selectedTemplate]})
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Zoom Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 25}
              className="p-1 rounded hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: 'var(--background-deep)', 
                border: '1px solid var(--accent-subtle)',
                color: 'var(--text-secondary)'
              }}
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            
            <span style={{ 
              fontSize: '12px', 
              color: 'var(--text-secondary)', 
              minWidth: '40px', 
              textAlign: 'center' 
            }}>
              {zoom}%
            </span>
            
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 150}
              className="p-1 rounded hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: 'var(--background-deep)', 
                border: '1px solid var(--accent-subtle)',
                color: 'var(--text-secondary)'
              }}
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          {/* Template Selector */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowTemplateSelector(!showTemplateSelector)}
              className="flex items-center gap-2 px-3 py-1 rounded border transition-colors hover:opacity-80"
              style={{ 
                backgroundColor: 'var(--background-deep)', 
                borderColor: 'var(--accent-subtle)',
                color: 'var(--text-secondary)'
              }}
            >
              <Palette className="h-4 w-4" />
              <span style={{ fontSize: '12px' }}>Template</span>
            </button>

            {showTemplateSelector && (
              <div 
                className="absolute right-0 top-full mt-2 w-32 rounded-lg border shadow-lg py-2 z-50"
                style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
              >
                {Object.keys(templates).map((templateKey) => (
                  <button
                    key={templateKey}
                    onClick={() => handleTemplateSelect(templateKey)}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors hover:opacity-80 ${
                      selectedTemplate === templateKey ? 'font-medium' : ''
                    }`}
                    style={{
                      color: selectedTemplate === templateKey ? 'var(--accent-interactive)' : 'var(--text-secondary)',
                      backgroundColor: selectedTemplate === templateKey ? 'var(--accent-subtle)' : 'transparent'
                    }}
                  >
                    {templateNames[templateKey]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* PDF Download Button */}
          <button
            onClick={generatePDF}
            disabled={isGeneratingPDF}
            className="flex items-center gap-2 px-4 py-2 rounded font-medium transition-all hover:opacity-90 disabled:opacity-50"
            style={{ 
              backgroundColor: 'var(--accent-interactive)', 
              color: 'var(--background-deep)',
              fontSize: '14px'
            }}
          >
            {isGeneratingPDF ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div 
        className="preview-content"
        style={{ 
          flex: 1,
          overflow: 'auto',
          backgroundColor: 'var(--background-deep)',
          padding: '20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start'
        }}
      >
        <div 
          style={{ 
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease-in-out',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}
        >
          <div ref={previewRef} style={{ backgroundColor: 'white' }}>
            <TemplateComponent resumeData={resumeData} />
          </div>
        </div>
      </div>

      {/* Empty State */}
      {(!resumeData.personalInfo.firstName && !resumeData.personalInfo.lastName) && (
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            zIndex: 10
          }}
        >
          <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>
            Resume Preview
          </h3>
          <p style={{ fontSize: '14px' }}>
            Start filling out your information to see a live preview of your resume
          </p>
        </div>
      )}

      {/* Click outside handler for template selector */}
      {showTemplateSelector && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowTemplateSelector(false)}
        />
      )}
    </div>
  );
}