import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Download, FileImage, Image } from 'lucide-react';
import type { BusinessModel } from '@/pages/Index';

interface ImageWorkflowCreatorProps {
  businessModel: BusinessModel;
  onNotification: (message: string) => void;
}

export const ImageWorkflowCreator: React.FC<ImageWorkflowCreatorProps> = ({
  businessModel,
  onNotification
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'png' | 'jpg' | 'pdf'>('png');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workflowRef = useRef<HTMLDivElement>(null);

  const exportFormats = [
    { value: 'png', label: 'PNG Image', icon: '🖼️' },
    { value: 'jpg', label: 'JPG Image', icon: '📷' },
    { value: 'pdf', label: 'PDF Document', icon: '📄' }
  ];

  const drawWorkflowToCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Set canvas size
    canvas.width = 1200;
    canvas.height = 800;

    // Clear canvas
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw title
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Business Model Workflow', canvas.width / 2, 40);

    // Draw participants
    businessModel.participants.forEach((participant, index) => {
      const x = participant.x || (100 + (index % 4) * 250);
      const y = participant.y || (100 + Math.floor(index / 4) * 150);

      // Draw participant box
      ctx.fillStyle = participant.color || '#3b82f6';
      ctx.fillRect(x, y, 200, 80);

      // Draw border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, 200, 80);

      // Draw participant name
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(participant.entityName, x + 100, y + 30);
      
      // Draw country
      ctx.font = '12px Arial';
      ctx.fillText(participant.country, x + 100, y + 50);
      
      // Draw role
      if (participant.role) {
        ctx.font = '10px Arial';
        ctx.fillText(participant.role, x + 100, y + 65);
      }
    });

    // Draw flows
    businessModel.flows.forEach(flow => {
      const fromParticipant = businessModel.participants.find(p => p.id === flow.from);
      const toParticipant = businessModel.participants.find(p => p.id === flow.to);
      
      if (!fromParticipant || !toParticipant) return;

      const fromX = (fromParticipant.x || 0) + 100;
      const fromY = (fromParticipant.y || 0) + 40;
      const toX = (toParticipant.x || 0) + 100;
      const toY = (toParticipant.y || 0) + 40;

      // Draw flow line
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      
      if (flow.type === 'billing') {
        ctx.strokeStyle = '#eab308';
        ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = '#3b82f6';
        ctx.setLineDash([5, 5]);
      }
      
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Draw arrow
      const angle = Math.atan2(toY - fromY, toX - fromX);
      const arrowLength = 15;
      
      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(
        toX - arrowLength * Math.cos(angle - Math.PI / 6),
        toY - arrowLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(toX, toY);
      ctx.lineTo(
        toX - arrowLength * Math.cos(angle + Math.PI / 6),
        toY - arrowLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.stroke();
      
      // Reset line dash
      ctx.setLineDash([]);
    });

    // Draw legend
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Legend:', 50, canvas.height - 100);

    // Billing flow legend
    ctx.beginPath();
    ctx.moveTo(50, canvas.height - 80);
    ctx.lineTo(100, canvas.height - 80);
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.stroke();
    
    ctx.fillStyle = '#1f2937';
    ctx.font = '14px Arial';
    ctx.fillText('Billing Flow', 110, canvas.height - 75);

    // Delivery flow legend
    ctx.beginPath();
    ctx.moveTo(50, canvas.height - 60);
    ctx.lineTo(100, canvas.height - 60);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    
    ctx.fillText('Delivery Flow', 110, canvas.height - 55);

    return canvas;
  };

  const exportAsImage = async () => {
    const canvas = drawWorkflowToCanvas();
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

  const exportAsPDF = async (imageDataUrl: string) => {
    // Simple PDF creation using canvas and data URL
    // In a real application, you might want to use a PDF library like jsPDF
    const link = document.createElement('a');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    canvas.width = 842; // A4 width in pixels at 72 DPI
    canvas.height = 595; // A4 height in pixels at 72 DPI
    
    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Create image from data URL
    const img = new Image();
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

  const getWorkflowSummary = () => {
    const summary = {
      participantCount: businessModel.participants.length,
      flowCount: businessModel.flows.length,
      rolesAssigned: businessModel.participants.filter(p => p.role).length,
      billingFlows: businessModel.flows.filter(f => f.type === 'billing').length,
      deliveryFlows: businessModel.flows.filter(f => f.type === 'delivery').length
    };
    return summary;
  };

  const summary = getWorkflowSummary();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">Image Workflow Creation</h3>
          <p className="text-gray-600">Export your business model as an image or PDF</p>
        </div>
      </div>

      {/* Workflow Summary */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Image className="w-5 h-5 text-blue-600" />
          Workflow Summary
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{summary.participantCount}</div>
            <div className="text-sm text-gray-600">Participants</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{summary.rolesAssigned}</div>
            <div className="text-sm text-gray-600">Roles Assigned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{summary.flowCount}</div>
            <div className="text-sm text-gray-600">Total Flows</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{summary.billingFlows}</div>
            <div className="text-sm text-gray-600">Billing Flows</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{summary.deliveryFlows}</div>
            <div className="text-sm text-gray-600">Delivery Flows</div>
          </div>
        </div>
      </Card>

      {/* Workflow Preview */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">Workflow Preview</h4>
        <div 
          ref={workflowRef}
          className="relative w-full h-64 bg-gray-50 rounded border-2 border-dashed border-gray-200 overflow-hidden"
        >
          {businessModel.participants.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No participants to display. Complete previous steps first.</p>
            </div>
          ) : (
            <>
              {/* SVG for flows */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <marker
                    id="preview-arrowhead"
                    markerWidth="8"  
                    markerHeight="6"
                    refX="7"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 8 3, 0 6" fill="#666" />
                  </marker>
                </defs>
                
                {businessModel.flows.map((flow) => {
                  const fromParticipant = businessModel.participants.find(p => p.id === flow.from);
                  const toParticipant = businessModel.participants.find(p => p.id === flow.to);
                  
                  if (!fromParticipant || !toParticipant) return null;

                  const fromX = ((fromParticipant.x || 0) / 4) + 40;
                  const fromY = ((fromParticipant.y || 0) / 4) + 20;
                  const toX = ((toParticipant.x || 0) / 4) + 40;
                  const toY = ((toParticipant.y || 0) / 4) + 20;

                  return (
                    <g key={flow.id}>
                      <path
                        d={`M ${fromX} ${fromY} L ${toX} ${toY}`}
                        stroke={flow.type === 'billing' ? '#EAB308' : '#3B82F6'}
                        strokeWidth="2"
                        strokeDasharray={flow.type === 'delivery' ? '3,3' : 'none'}
                        fill="none"
                        markerEnd="url(#preview-arrowhead)"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Participants - scaled down for preview */}
              {businessModel.participants.map((participant, index) => (
                <div
                  key={participant.id}
                  className="absolute"
                  style={{
                    left: ((participant.x || (100 + (index % 3) * 200)) / 4),
                    top: ((participant.y || (100 + Math.floor(index / 3) * 150)) / 4),
                  }}
                >
                  <div
                    className="w-20 h-10 rounded text-white text-xs font-semibold flex flex-col items-center justify-center p-1"
                    style={{ backgroundColor: participant.color }}
                  >
                    <div className="truncate w-full text-center text-xs">{participant.entityName}</div>
                    <div className="text-xs opacity-90">{participant.country}</div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </Card>

      {/* Export Controls */}
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

      {/* Participants List */}
      {businessModel.participants.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3">Participants in Workflow</h4>
          <div className="grid gap-2">
            {businessModel.participants.map(participant => (
              <div key={participant.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: participant.color }}
                  />
                  <span className="font-medium">{participant.entityName}</span>
                  <span className="text-sm text-gray-600">({participant.country})</span>
                </div>
                {participant.role && (
                  <Badge variant="secondary">{participant.role}</Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Hidden canvas for export */}
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
        width={1200}
        height={800}
      />
    </div>
  );
};
