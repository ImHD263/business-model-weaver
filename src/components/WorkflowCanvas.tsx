
import type { BusinessModel } from '@/pages/Index';

export const useWorkflowCanvas = () => {
  const drawWorkflowToCanvas = (businessModel: BusinessModel): HTMLCanvasElement | null => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Set canvas size to match preview proportions
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

    // Draw participants with same positioning as preview
    businessModel.participants.forEach((participant, index) => {
      const x = participant.x || (100 + (index % 3) * 250);
      const y = participant.y || (100 + Math.floor(index / 3) * 150);
      const financialInfo = getParticipantFinancialInfo(participant.id);

      // Draw participant box - larger for export
      ctx.fillStyle = participant.color || '#3b82f6';
      ctx.fillRect(x, y + 80, 200, 80);

      // Draw border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y + 80, 200, 80);

      // Draw participant name (entity name)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(participant.entityName, x + 100, y + 105);
      
      // Draw role
      if (participant.role) {
        ctx.font = '14px Arial';
        ctx.fillText(participant.role, x + 100, y + 125);
      }
      
      // Draw country in parentheses
      ctx.font = '12px Arial';
      ctx.fillText(`(${participant.country})`, x + 100, y + 145);

      // Draw financial indicator
      if (financialInfo && financialInfo.revenue) {
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(x + 185, y + 85, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('$', x + 185, y + 89);
      }

      // Add financial details below participant if available
      if (financialInfo) {
        ctx.fillStyle = '#374151';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        let yOffset = 175;
        
        if (financialInfo.revenue) {
          ctx.fillText(`Revenue: ${financialInfo.revenue}`, x + 100, y + yOffset);
          yOffset += 15;
        }
        if (financialInfo.pricingType) {
          ctx.fillText(`Pricing: ${financialInfo.pricingType}`, x + 100, y + yOffset);
          yOffset += 15;
        }
        if (financialInfo.billingTo) {
          ctx.fillText(`Billing: ${financialInfo.billingTo}`, x + 100, y + yOffset);
        }
      }
    });

    // Draw flows with same logic as preview
    businessModel.flows.forEach(flow => {
      const fromParticipant = businessModel.participants.find(p => p.id === flow.from);
      const toParticipant = businessModel.participants.find(p => p.id === flow.to);
      
      if (!fromParticipant || !toParticipant) return;

      const fromX = (fromParticipant.x || 0) + 100;
      const fromY = (fromParticipant.y || 0) + 120;
      const toX = (toParticipant.x || 0) + 100;
      const toY = (toParticipant.y || 0) + 120;

      // Check for complementary flows
      const hasComplementaryFlow = businessModel.flows.some(f => 
        f.id !== flow.id &&
        f.from === flow.from && 
        f.to === flow.to && 
        f.type !== flow.type
      );

      ctx.beginPath();
      
      if (hasComplementaryFlow) {
        // Draw curved path
        const offset = flow.type === 'billing' ? -60 : 60;
        const midX = (fromX + toX) / 2;
        const midY = (fromY + toY) / 2;
        
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
        }
      } else {
        // Draw straight line
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
      }
      
      if (flow.type === 'billing') {
        ctx.strokeStyle = '#eab308';
        ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = '#3b82f6';
        ctx.setLineDash([10, 10]);
      }
      
      ctx.lineWidth = 4;
      ctx.stroke();
      
      // Draw arrow
      const angle = Math.atan2(toY - fromY, toX - fromX);
      const arrowLength = 20;
      
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

    // Draw enhanced legend
    const legendY = canvas.height - 150;
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Legend:', 50, legendY);

    // Billing flow legend
    ctx.beginPath();
    ctx.moveTo(50, legendY + 25);
    ctx.lineTo(120, legendY + 25);
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 4;
    ctx.setLineDash([]);
    ctx.stroke();
    
    ctx.fillStyle = '#1f2937';
    ctx.font = '16px Arial';
    ctx.fillText('Billing Flow', 130, legendY + 30);

    // Delivery flow legend
    ctx.beginPath();
    ctx.moveTo(50, legendY + 50);
    ctx.lineTo(120, legendY + 50);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 10]);
    ctx.stroke();
    
    ctx.fillText('Delivery Flow', 130, legendY + 55);

    // Financial indicator legend
    if (businessModel.financialInfo.some(info => info.revenue)) {
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(65, legendY + 75, 8, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('$', 65, legendY + 79);
      
      ctx.fillStyle = '#1f2937';
      ctx.font = '16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Has Revenue Data', 80, legendY + 80);
    }

    return canvas;
  };

  return { drawWorkflowToCanvas };
};
