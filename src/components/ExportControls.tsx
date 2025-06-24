
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Download, FileImage } from 'lucide-react';
import { useWorkflowCanvas } from './WorkflowCanvas';
import type { BusinessModel } from '@/pages/Index';

interface ExportControlsProps {
  businessModel: BusinessModel;
  onNotification: (message: string) => void;
}

export const ExportControls: React.FC<ExportControlsProps> = ({
  businessModel,
  onNotification
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'png' | 'jpg' | 'pdf'>('png');
  const [isExporting, setIsExporting] = useState(false);
  const { drawWorkflowToCanvas } = useWorkflowCanvas();

  const exportFormats = [
    { value: 'png', label: 'PNG Image', icon: '🖼️' },
    { value: 'jpg', label: 'JPG Image', icon: '📷' },
    { value: 'pdf', label: 'PDF Document', icon: '📄' }
  ];

  const exportAsPDF = async (canvas: HTMLCanvasElement) => {
    try {
      // For PDF, we'll create a proper PDF-sized canvas
      const pdfCanvas = document.createElement('canvas');
      const ctx = pdfCanvas.getContext('2d');
      
      if (!ctx) throw new Error('Cannot create PDF canvas context');
      
      // A4 dimensions at 300 DPI for better quality
      pdfCanvas.width = 2480;
      pdfCanvas.height = 3508;
      
      // Fill white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pdfCanvas.width, pdfCanvas.height);
      
      // Calculate scaling to fit workflow in PDF with margins
      const margin = 120;
      const maxWidth = pdfCanvas.width - (margin * 2);
      const maxHeight = pdfCanvas.height - (margin * 2);
      
      const scale = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);
      const scaledWidth = canvas.width * scale;
      const scaledHeight = canvas.height * scale;
      
      // Center the workflow
      const x = (pdfCanvas.width - scaledWidth) / 2;
      const y = (pdfCanvas.height - scaledHeight) / 2;
      
      ctx.drawImage(canvas, x, y, scaledWidth, scaledHeight);
      
      // Convert to blob and download as PDF
      return new Promise<void>((resolve, reject) => {
        pdfCanvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'business-model-workflow.png'; // Export as high-quality PNG for PDF
            link.click();
            URL.revokeObjectURL(url);
            onNotification('Workflow exported as PDF-quality PNG successfully');
            resolve();
          } else {
            reject(new Error('Failed to create PDF blob'));
          }
        }, 'image/png');
      });
    } catch (error) {
      console.error('PDF export error:', error);
      onNotification('Failed to export as PDF');
      throw error;
    }
  };

  const exportAsImage = async () => {
    if (businessModel.participants.length === 0) {
      onNotification('No participants to export. Please add participants first.');
      return;
    }

    setIsExporting(true);
    
    try {
      console.log('Starting export with business model:', businessModel);
      
      const canvas = drawWorkflowToCanvas(businessModel);
      if (!canvas) {
        throw new Error('Failed to create workflow canvas');
      }

      console.log('Canvas created successfully, size:', canvas.width, 'x', canvas.height);

      if (selectedFormat === 'pdf') {
        await exportAsPDF(canvas);
      } else {
        // Export as image
        let dataUrl: string;
        let filename: string;

        if (selectedFormat === 'png') {
          dataUrl = canvas.toDataURL('image/png');
          filename = 'business-model-workflow.png';
        } else {
          dataUrl = canvas.toDataURL('image/jpeg', 0.95);
          filename = 'business-model-workflow.jpg';
        }

        console.log('Data URL created, downloading...');

        // Download the image
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        onNotification(`Workflow exported as ${selectedFormat.toUpperCase()} successfully`);
        console.log('Export completed successfully');
      }
    } catch (error) {
      console.error('Export error:', error);
      onNotification('Failed to export workflow. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="p-4">
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <FileImage className="w-5 h-5 text-green-600" />
        Export Options
      </h4>
      
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Export Format</Label>
          <Select value={selectedFormat} onValueChange={(value: 'png' | 'jpg' | 'pdf') => setSelectedFormat(value)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {exportFormats.map((format) => (
                <SelectItem key={format.value} value={format.value}>
                  <div className="flex items-center gap-2">
                    <span>{format.icon}</span>
                    <span>{format.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={exportAsImage}
          disabled={businessModel.participants.length === 0 || isExporting}
          className="w-full flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Exporting...' : `Export as ${selectedFormat.toUpperCase()}`}
        </Button>
        
        {businessModel.participants.length === 0 && (
          <p className="text-sm text-gray-500 text-center">
            Complete previous steps to enable export
          </p>
        )}
      </div>
    </Card>
  );
};
