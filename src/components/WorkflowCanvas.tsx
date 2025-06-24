
import type { BusinessModel } from '@/pages/Index';

export const useWorkflowCanvas = () => {
  const drawWorkflowToCanvas = (businessModel: BusinessModel): HTMLCanvasElement | null => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Set canvas size to match preview proportions exactly
    canvas.width = 1600;
    canvas.height = 1200;

    // Clear canvas with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw title
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Business Model Workflow', canvas.width / 2, 50);

    // Helper function to get financial info  
    const getParticipantFinancialInfo = (participantId: string) => {
      return businessModel.financialInfo.find(info => info.participantId === participantId);
    };

    // Scale factor to match preview (4x scale for export)
    const scale = 4;

    // Draw participants with exact same positioning as preview
    businessModel.participants.forEach((participant, index) => {
      const x = (participant.x || (100 + (index % 3) * 250)) * scale;
      const y = (participant.y || (100 + Math.floor(index / 3) * 150)) * scale + 80;
      const financialInfo = getParticipantFinancialInfo(participant.id);

      // Draw participant box - scaled for export
      ctx.fillStyle = participant.color || '#3b82f6';
      ctx.fillRect(x, y, 200 * scale, 80 * scale);

      // Draw border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3 * scale;
      ctx.strokeRect(x, y, 200 * scale, 80 * scale);

      // Draw participant name (entity name)
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${16 * scale}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(participant.entityName, x + (100 * scale), y + (25 * scale));
      
      // Draw role
      if (participant.role) {
        ctx.font = `${14 * scale}px Arial`;
        ctx.fillText(participant.role, x + (100 * scale), y + (45 * scale));
      }
      
      // Draw country in parentheses
      ctx.font = `${12 * scale}px Arial`;
      ctx.fillText(`(${participant.country})`, x + (100 * scale), y + (65 * scale));

      // Draw financial indicator
      if (financialInfo && financialInfo.revenue) {
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(x + (185 * scale), y + (15 * scale), 8 * scale, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${10 * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('$', x + (185 * scale), y + (19 * scale));
      }
    });

    // Draw flows with same logic as preview
    businessModel.flows.forEach(flow => {
      const fromParticipant = businessModel.participants.find(p => p.id === flow.from);
      const toParticipant = businessModel.participants.find(p => p.id === flow.to);
      
      if (!fromParticipant || !toParticipant) return;

      const fromX = ((fromParticipant.x || 0) + 100) * scale;
      const fromY = ((fromParticipant.y || 0) + 40) * scale + 80;
      const toX = ((toParticipant.x || 0) + 100) * scale;
      const toY = ((toParticipant.y || 0) + 40) * scale + 80;

      // Check for complementary flows
      const hasComplementaryFlow = businessModel.flows.some(f => 
        f.id !== flow.id &&
        f.from === flow.from && 
        f.to === flow.to && 
        f.type !== flow.type
      );

      ctx.beginPath();
      
      let midX, midY;
      
      if (hasComplementaryFlow) {
        // Draw curved path
        const offset = (flow.type === 'billing' ? -15 : 15) * scale;
        midX = (fromX + toX) / 2;
        midY = (fromY + toY) / 2;
        
        const dx = toX - fromX;
        const dy = toY - fromY;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length > 0) {
          const perpX = -dy / length * offset;
          const perpY = dx / length * offset;
          
          const controlX = midX + perpX;
          const controlY = midY + perpY;
          
          ctx.moveTo(fromX, fromY);
          ctx.quadraticCurveTo(controlX, controlY, toX, toY);
          
          midX = controlX;
          midY = controlY;
        }
      } else {
        // Draw straight line
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        midX = (fromX + toX) / 2;
        midY = (fromY + toY) / 2;
      }
      
      if (flow.type === 'billing') {
        ctx.strokeStyle = '#eab308';
        ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = '#3b82f6';
        ctx.setLineDash([10 * scale, 10 * scale]);
      }
      
      ctx.lineWidth = 4 * scale;
      ctx.stroke();
      
      // Draw arrow
      const angle = Math.atan2(toY - fromY, toX - fromX);
      const arrowLength = 20 * scale;
      
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

      // Draw financial details on billing flows
      if (flow.type === 'billing') {
        const financialInfo = getParticipantFinancialInfo(flow.from);
        if (financialInfo && financialInfo.revenue) {
          // Draw background for financial info
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#d1d5db';
          ctx.lineWidth = 2 * scale;
          const boxWidth = 120 * scale;
          const boxHeight = 60 * scale;
          const boxX = midX - boxWidth / 2;
          const boxY = midY - boxHeight / 2;
          
          ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
          ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
          
          // Draw financial details
          ctx.fillStyle = '#059669';
          ctx.font = `bold ${12 * scale}px Arial`;
          ctx.textAlign = 'center';
          ctx.fillText(financialInfo.revenue, midX, boxY + (18 * scale));
          
          ctx.fillStyle = '#374151';
          ctx.font = `${10 * scale}px Arial`;
          ctx.fillText(financialInfo.pricingType, midX, boxY + (32 * scale));
          
          let yOffset = 46;
          if (financialInfo.whtApplicable) {
            ctx.fillStyle = '#dc2626';
            ctx.fillText('WHT', midX - (20 * scale), boxY + (yOffset * scale));
          }
          if (financialInfo.vatGstApplicable) {
            ctx.fillStyle = '#2563eb';
            ctx.fillText('VAT/GST', midX + (20 * scale), boxY + (yOffset * scale));
          }
        }
      }
    });

    // Draw enhanced legend
    const legendY = canvas.height - 150 * scale;
    ctx.fillStyle = '#1f2937';
    ctx.font = `bold ${18 * scale}px Arial`;
    ctx.textAlign = 'left';
    ctx.fillText('Legend:', 50 * scale, legendY);

    // Billing flow legend
    ctx.beginPath();
    ctx.moveTo(50 * scale, legendY + (25 * scale));
    ctx.lineTo(120 * scale, legendY + (25 * scale));
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 4 * scale;
    ctx.setLineDash([]);
    ctx.stroke();
    
    ctx.fillStyle = '#1f2937';
    ctx.font = `${16 * scale}px Arial`;
    ctx.fillText('Billing Flow', 130 * scale, legendY + (30 * scale));

    // Delivery flow legend
    ctx.beginPath();
    ctx.moveTo(50 * scale, legendY + (50 * scale));
    ctx.lineTo(120 * scale, legendY + (50 * scale));
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 4 * scale;
    ctx.setLineDash([10 * scale, 10 * scale]);
    ctx.stroke();
    
    ctx.fillText('Delivery Flow', 130 * scale, legendY + (55 * scale));

    // Financial indicator legend
    if (businessModel.financialInfo.some(info => info.revenue)) {
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(65 * scale, legendY + (75 * scale), 8 * scale, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${10 * scale}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('$', 65 * scale, legendY + (79 * scale));
      
      ctx.fillStyle = '#1f2937';
      ctx.font = `${16 * scale}px Arial`;
      ctx.textAlign = 'left';
      ctx.fillText('Has Revenue Data', 80 * scale, legendY + (80 * scale));
    }

    return canvas;
  };

  return { drawWorkflowToCanvas };
};
