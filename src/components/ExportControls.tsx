
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
  const { drawWorkflowToCanvas } = useWorkflowCanvas();

  const exportFormats = [
    { value: 'png', label: 'PNG Image', icon: '🖼️' },
    { value: 'jpg', label: 'JPG Image', icon: '📷' },
    { value: 'pdf', label: 'PDF Document', icon: '📄' }
  ];

  const exportAsPDF = async (imageDataUrl: string) => {
    const link = document.createElement('a');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    canvas.width = 842; // A4 width in pixels at 72 DPI
    canvas.height = 595; // A4 height in pixels at 72 DPI
    
    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Create image from data URL - Fixed the constructor call
    const img = document.createElement('img');
    img.onload = () => {
      // Scale and center the image
      const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * 0.9;
      const x = (canvas.width - img.width * scale) / 2;
      const y = (canvas.height - img.height * scale) / 2;
      
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      
      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          link.href = url;
          link.download = 'business-model-workflow.pdf';
          link.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    };
    img.src = imageDataUrl;
  };

  const exportAsImage = async () => {
    const canvas = drawWorkflowToCanvas(businessModel);
    if (!canvas) {
      onNotification('Failed to create workflow image');
      return;
    }

    try {
      let dataUrl: string;
      let filename: string;

      if (selectedFormat === 'png') {
        dataUrl = canvas.toDataURL('image/png');
        filename = 'business-model-workflow.png';
      } else if (selectedFormat === 'jpg') {
        dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        filename = 'business-model-workflow.jpg';
      } else {
        // For PDF, we'll create a simple PDF with the image
        dataUrl = canvas.toDataURL('image/png');
        filename = 'business-model-workflow.pdf';
        await exportAsPDF(dataUrl);
        return;
      }

      // Download the image
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();

      onNotification(`Workflow exported as ${selectedFormat.toUpperCase()} successfully`);
    } catch (error) {
      onNotification('Failed to export workflow');
      console.error('Export error:', error);
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
          disabled={businessModel.participants.length === 0}
          className="w-full flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export as {selectedFormat.toUpperCase()}
        </Button>
      </div>
    </Card>
  );
};
