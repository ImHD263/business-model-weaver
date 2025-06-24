
import type { BusinessModel } from '@/pages/Index';

export const useWorkflowCanvas = () => {
  const drawWorkflowToCanvas = (businessModel: BusinessModel): HTMLCanvasElement | null => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Set canvas size to capture full preview area
    canvas.width = 1200;
    canvas.height = 900;

    // Clear canvas with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw title
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Business Model Workflow', canvas.width / 2, 40);

    const getParticipantFinancialInfo = (participantId: string) => {
      return businessModel.financialInfo.find(info => info.participantId === participantId);
    };

    // Scale factor to match preview exactly
    const scale = 3;

    // Draw participants with exact positioning from preview
    businessModel.participants.forEach((participant, index) => {
      const x = (participant.x !== undefined ? participant.x : (50 + (index % 3) * 180)) * scale;
      const y = (participant.y !== undefined ? participant.y : (50 + Math.floor(index / 3) * 120)) * scale + 80;
      const financialInfo = getParticipantFinancialInfo(participant.id);

      // Draw participant box
      ctx.fillStyle = participant.color || '#3b82f6';
      ctx.fillRect(x, y, 200 * scale, 80 * scale);

      // Draw border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2 * scale;
      ctx.strokeRect(x, y, 200 * scale, 80 * scale);

      // Draw participant name
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${14 * scale}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(participant.entityName, x + (100 * scale), y + (22 * scale));
      
      // Draw role
      if (participant.role) {
        ctx.font = `${12 * scale}px Arial`;
        ctx.fillText(participant.role, x + (100 * scale), y + (42 * scale));
      }
      
      // Draw country
      ctx.font = `${10 * scale}px Arial`;
      ctx.fillText(`(${participant.country})`, x + (100 * scale), y + (62 * scale));

      // Draw financial indicator
      if (financialInfo && financialInfo.revenue) {
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(x + (185 * scale), y + (15 * scale), 6 * scale, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${8 * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('$', x + (185 * scale), y + (19 * scale));
      }
    });

    // Draw flows and financial details exactly like preview
    businessModel.flows.forEach(flow => {
      const fromParticipant = businessModel.participants.find(p => p.id === flow.from);
      const toParticipant = businessModel.participants.find(p => p.id === flow.to);
      
      if (!fromParticipant || !toParticipant) return;

      const fromIndex = businessModel.participants.findIndex(p => p.id === flow.from);
      const toIndex = businessModel.participants.findIndex(p => p.id === flow.to);
      
      const fromX = ((fromParticipant.x !== undefined ? fromParticipant.x : (50 + (fromIndex % 3) * 180)) + 100) * scale;
      const fromY = ((fromParticipant.y !== undefined ? fromParticipant.y : (50 + Math.floor(fromIndex / 3) * 120)) + 40) * scale + 80;
      const toX = ((toParticipant.x !== undefined ? toParticipant.x : (50 + (toIndex % 3) * 180)) + 100) * scale;
      const toY = ((toParticipant.y !== undefined ? toParticipant.y : (50 + Math.floor(toIndex / 3) * 120)) + 40) * scale + 80;

      const hasComplementaryFlow = businessModel.flows.some(f => 
        f.id !== flow.id &&
        f.from === flow.from && 
        f.to === flow.to && 
        f.type !== flow.type
      );

      ctx.beginPath();
      let midX, midY;
      
      if (hasComplementaryFlow) {
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
        ctx.setLineDash([8 * scale, 8 * scale]);
      }
      
      ctx.lineWidth = 3 * scale;
      ctx.stroke();
      
      // Draw arrow
      const angle = Math.atan2(toY - fromY, toX - fromX);
      const arrowLength = 15 * scale;
      
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
      ctx.setLineDash([]);

      // Draw financial details on billing flows - giống hệt preview
      if (flow.type === 'billing') {
        const financialInfo = getParticipantFinancialInfo(flow.from);
        if (financialInfo && financialInfo.revenue) {
          // Revenue text
          ctx.fillStyle = '#059669';
          ctx.font = `bold ${10 * scale}px Arial`;
          ctx.textAlign = 'center';
          
          // Background cho text
          const textWidth = ctx.measureText(financialInfo.revenue).width;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(midX - textWidth/2 - 4*scale, midY - 12*scale, textWidth + 8*scale, 16*scale);
          ctx.strokeStyle = '#d1d5db';
          ctx.lineWidth = 1;
          ctx.strokeRect(midX - textWidth/2 - 4*scale, midY - 12*scale, textWidth + 8*scale, 16*scale);
          
          ctx.fillStyle = '#059669';
          ctx.fillText(financialInfo.revenue, midX, midY - 4*scale);
          
          // Pricing type
          ctx.fillStyle = '#374151';
          ctx.font = `${8 * scale}px Arial`;
          const pricingWidth = ctx.measureText(financialInfo.pricingType).width;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(midX - pricingWidth/2 - 2*scale, midY + 2*scale, pricingWidth + 4*scale, 12*scale);
          ctx.strokeRect(midX - pricingWidth/2 - 2*scale, midY + 2*scale, pricingWidth + 4*scale, 12*scale);
          
          ctx.fillStyle = '#374151';
          ctx.fillText(financialInfo.pricingType, midX, midY + 10*scale);
          
          // Tax indicators
          const indicators = [];
          if (financialInfo.whtApplicable) indicators.push({ text: 'WHT', color: '#dc2626' });
          if (financialInfo.vatGstApplicable) indicators.push({ text: 'VAT/GST', color: '#2563eb' });
          
          if (indicators.length > 0) {
            let yOffset = midY + 20*scale;
            indicators.forEach((indicator, idx) => {
              const xOffset = indicators.length === 1 ? midX : midX + (idx === 0 ? -15*scale : 15*scale);
              
              const indicatorWidth = ctx.measureText(indicator.text).width;
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(xOffset - indicatorWidth/2 - 2*scale, yOffset - 6*scale, indicatorWidth + 4*scale, 12*scale);
              ctx.strokeRect(xOffset - indicatorWidth/2 - 2*scale, yOffset - 6*scale, indicatorWidth + 4*scale, 12*scale);
              
              ctx.fillStyle = indicator.color;
              ctx.fillText(indicator.text, xOffset, yOffset + 2*scale);
            });
          }
        }
      }
    });

    // Draw legend
    const legendY = canvas.height - 120 * scale;
    ctx.fillStyle = '#1f2937';
    ctx.font = `bold ${14 * scale}px Arial`;
    ctx.textAlign = 'left';
    ctx.fillText('Legend:', 50 * scale, legendY);

    // Billing flow legend
    ctx.beginPath();
    ctx.moveTo(50 * scale, legendY + (20 * scale));
    ctx.lineTo(100 * scale, legendY + (20 * scale));
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 3 * scale;
    ctx.setLineDash([]);
    ctx.stroke();
    
    ctx.fillStyle = '#1f2937';
    ctx.font = `${12 * scale}px Arial`;
    ctx.fillText('Billing Flow', 110 * scale, legendY + (25 * scale));

    // Delivery flow legend
    ctx.beginPath();
    ctx.moveTo(50 * scale, legendY + (40 * scale));
    ctx.lineTo(100 * scale, legendY + (40 * scale));
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3 * scale;
    ctx.setLineDash([8 * scale, 8 * scale]);
    ctx.stroke();
    
    ctx.fillText('Delivery Flow', 110 * scale, legendY + (45 * scale));

    return canvas;
  };

  return { drawWorkflowToCanvas };
};
