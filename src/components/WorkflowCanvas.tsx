
import type { BusinessModel } from '@/pages/Index';

export const useWorkflowCanvas = () => {
  const drawWorkflowToCanvas = (businessModel: BusinessModel): HTMLCanvasElement | null => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Tính toán kích thước canvas dựa trên vị trí thực tế của participants
    let maxX = 0;
    let maxY = 0;
    let minX = Infinity;
    let minY = Infinity;

    // Tìm bounds của tất cả participants
    businessModel.participants.forEach((participant, index) => {
      const x = participant.x !== undefined ? participant.x : (50 + (index % 3) * 250);
      const y = participant.y !== undefined ? participant.y : (50 + Math.floor(index / 3) * 120);
      
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + 200); // 200 là width của participant box
      maxY = Math.max(maxY, y + 80);  // 80 là height của participant box
    });

    // Thêm padding
    const padding = 100;
    const contentWidth = maxX - minX + (2 * padding);
    const contentHeight = maxY - minY + (2 * padding) + 100; // +100 cho title và legend

    // Set canvas size to fit all content
    canvas.width = Math.max(contentWidth, 800);
    canvas.height = Math.max(contentHeight, 600);

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

    // Offset để center content
    const offsetX = -minX + padding;
    const offsetY = -minY + padding + 60; // +60 cho title

    // Draw participants với vị trí chính xác
    businessModel.participants.forEach((participant, index) => {
      const x = (participant.x !== undefined ? participant.x : (50 + (index % 3) * 250)) + offsetX;
      const y = (participant.y !== undefined ? participant.y : (50 + Math.floor(index / 3) * 120)) + offsetY;
      const financialInfo = getParticipantFinancialInfo(participant.id);

      // Draw participant box với layout mới (role 2/3, name 1/3)
      ctx.fillStyle = participant.color || '#6B7280';
      ctx.fillRect(x, y, 200, 80);

      // Draw border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, 200, 80);

      // Role section (2/3 with solid border)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      
      // Draw role text
      const roleText = participant.role || 'No Role';
      ctx.fillText(roleText, x + 100, y + 35);
      
      // Draw solid divider line
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 20, y + 53);
      ctx.lineTo(x + 180, y + 53);
      ctx.stroke();

      // Name section (1/3 with dashed border)
      ctx.font = '12px Arial';
      ctx.fillText(participant.entityName, x + 100, y + 70);
      
      // Draw dashed divider line (already drawn above as solid, now make it dashed)
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(x + 20, y + 53);
      ctx.lineTo(x + 180, y + 53);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw financial indicator
      if (financialInfo && financialInfo.revenue) {
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(x + 185, y + 15, 6, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('$', x + 185, y + 19);
      }
    });

    // Draw flows với vị trí chính xác
    businessModel.flows.forEach(flow => {
      const fromParticipant = businessModel.participants.find(p => p.id === flow.from);
      const toParticipant = businessModel.participants.find(p => p.id === flow.to);
      
      if (!fromParticipant || !toParticipant) return;

      const fromIndex = businessModel.participants.findIndex(p => p.id === flow.from);
      const toIndex = businessModel.participants.findIndex(p => p.id === flow.to);
      
      const fromX = ((fromParticipant.x !== undefined ? fromParticipant.x : (50 + (fromIndex % 3) * 250)) + 100) + offsetX;
      const fromY = ((fromParticipant.y !== undefined ? fromParticipant.y : (50 + Math.floor(fromIndex / 3) * 120)) + 40) + offsetY;
      const toX = ((toParticipant.x !== undefined ? toParticipant.x : (50 + (toIndex % 3) * 250)) + 100) + offsetX;
      const toY = ((toParticipant.y !== undefined ? toParticipant.y : (50 + Math.floor(toIndex / 3) * 120)) + 40) + offsetY;

      const hasComplementaryFlow = businessModel.flows.some(f => 
        f.id !== flow.id &&
        f.from === flow.from && 
        f.to === flow.to && 
        f.type !== flow.type
      );

      ctx.beginPath();
      let midX, midY;
      
      if (hasComplementaryFlow) {
        const offset = flow.type === 'billing' ? -15 : 15;
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
        ctx.setLineDash([8, 8]);
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
      ctx.setLineDash([]);

      // Draw financial details directly on billing flows (không có box)
      if (flow.type === 'billing') {
        const financialInfo = getParticipantFinancialInfo(flow.from);
        if (financialInfo && financialInfo.revenue) {
          // Revenue text - font nhỏ hơn
          ctx.fillStyle = '#059669';
          ctx.font = 'bold 10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(financialInfo.revenue, midX, midY - 8);
          
          // Pricing type - font nhỏ hơn
          ctx.fillStyle = '#374151';
          ctx.font = '8px Arial';
          ctx.fillText(financialInfo.pricingType, midX, midY + 4);
          
          // Tax indicators - font nhỏ hơn
          const indicators = [];
          if (financialInfo.whtApplicable) indicators.push({ text: 'WHT', color: '#dc2626' });
          if (financialInfo.vatGstApplicable) indicators.push({ text: 'VAT/GST', color: '#2563eb' });
          
          if (indicators.length > 0) {
            let yOffset = midY + 16;
            indicators.forEach((indicator, idx) => {
              const xOffset = indicators.length === 1 ? midX : midX + (idx === 0 ? -20 : 20);
              
              ctx.fillStyle = indicator.color;
              ctx.font = '7px Arial';
              ctx.fillText(indicator.text, xOffset, yOffset);
            });
          }
        }
      }
    });

    // Draw legend ở cuối canvas
    const legendY = canvas.height - 80;
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Legend:', 50, legendY);

    // Billing flow legend
    ctx.beginPath();
    ctx.moveTo(50, legendY + 20);
    ctx.lineTo(100, legendY + 20);
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.stroke();
    
    ctx.fillStyle = '#1f2937';
    ctx.font = '12px Arial';
    ctx.fillText('Billing Flow', 110, legendY + 25);

    // Delivery flow legend
    ctx.beginPath();
    ctx.moveTo(50, legendY + 40);
    ctx.lineTo(100, legendY + 40);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]);
    ctx.stroke();
    
    ctx.fillText('Delivery Flow', 110, legendY + 45);

    return canvas;
  };

  return { drawWorkflowToCanvas };
};
