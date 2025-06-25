
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
      maxX = Math.max(maxX, x + 220);
      maxY = Math.max(maxY, y + 100);
    });

    // Thêm padding lớn hơn
    const padding = 150;
    const contentWidth = maxX - minX + (2 * padding);
    const contentHeight = maxY - minY + (2 * padding) + 150;

    // Set canvas size to fit all content
    canvas.width = Math.max(contentWidth, 1000);
    canvas.height = Math.max(contentHeight, 800);

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
    const offsetY = -minY + padding + 80;

    // Draw participants với layout mới (role 2/3, name 1/3)
    businessModel.participants.forEach((participant, index) => {
      const x = (participant.x !== undefined ? participant.x : (50 + (index % 3) * 250)) + offsetX;
      const y = (participant.y !== undefined ? participant.y : (50 + Math.floor(index / 3) * 120)) + offsetY;
      const financialInfo = getParticipantFinancialInfo(participant.id);

      // Draw participant box với layout mới
      const boxWidth = 200;
      const boxHeight = 80;
      
      ctx.fillStyle = participant.color || '#6B7280';
      ctx.fillRect(x, y, boxWidth, boxHeight);

      // Draw border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, boxWidth, boxHeight);

      // Role section (2/3 - 53px height)
      const roleHeight = Math.floor(boxHeight * 2 / 3);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      
      // Draw role text với word wrap
      const roleText = participant.role || 'No Role';
      const maxWidth = boxWidth - 20;
      const words = roleText.split(' ');
      let line = '';
      let lineHeight = 14;
      let currentY = y + roleHeight / 2 - 7;
      
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, x + boxWidth / 2, currentY);
          line = words[n] + ' ';
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x + boxWidth / 2, currentY);
      
      // Draw solid divider line
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 20, y + roleHeight);
      ctx.lineTo(x + boxWidth - 20, y + roleHeight);
      ctx.stroke();

      // Name section (1/3 với dashed border)
      ctx.font = '10px Arial';
      ctx.fillStyle = '#ffffff';
      
      // Draw name text với truncation
      const nameText = participant.entityName;
      let truncatedName = nameText;
      while (ctx.measureText(truncatedName).width > maxWidth && truncatedName.length > 0) {
        truncatedName = truncatedName.slice(0, -1);
      }
      if (truncatedName.length < nameText.length) {
        truncatedName = truncatedName.slice(0, -3) + '...';
      }
      
      ctx.fillText(truncatedName, x + boxWidth / 2, y + roleHeight + (boxHeight - roleHeight) / 2 + 3);
      
      // Draw dashed divider line
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(x + 20, y + roleHeight);
      ctx.lineTo(x + boxWidth - 20, y + roleHeight);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw financial indicator
      if (financialInfo && financialInfo.revenue) {
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(x + boxWidth - 15, y + 15, 6, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('$', x + boxWidth - 15, y + 19);
      }
    });

    // Draw flows với positioning tránh đè lên boxes
    businessModel.flows.forEach(flow => {
      const fromParticipant = businessModel.participants.find(p => p.id === flow.from);
      const toParticipant = businessModel.participants.find(p => p.id === flow.to);
      
      if (!fromParticipant || !toParticipant) return;

      const fromIndex = businessModel.participants.findIndex(p => p.id === flow.from);
      const toIndex = businessModel.participants.findIndex(p => p.id === flow.to);
      
      const fromX = (fromParticipant.x !== undefined ? fromParticipant.x : (50 + (fromIndex % 3) * 250)) + offsetX;
      const fromY = (fromParticipant.y !== undefined ? fromParticipant.y : (50 + Math.floor(fromIndex / 3) * 120)) + offsetY;
      const toX = (toParticipant.x !== undefined ? toParticipant.x : (50 + (toIndex % 3) * 250)) + offsetX;
      const toY = (toParticipant.y !== undefined ? toParticipant.y : (50 + Math.floor(toIndex / 3) * 120)) + offsetY;

      // Calculate connection points on box edges
      const fromCenterX = fromX + 100;
      const fromCenterY = fromY + 40;
      const toCenterX = toX + 100;
      const toCenterY = toY + 40;

      // Determine which edge to connect from/to
      let startX, startY, endX, endY;
      
      if (Math.abs(fromCenterX - toCenterX) > Math.abs(fromCenterY - toCenterY)) {
        // Horizontal connection
        if (fromCenterX < toCenterX) {
          startX = fromX + 200;
          startY = fromCenterY;
          endX = toX;
          endY = toCenterY;
        } else {
          startX = fromX;
          startY = fromCenterY;
          endX = toX + 200;
          endY = toCenterY;
        }
      } else {
        // Vertical connection
        if (fromCenterY < toCenterY) {
          startX = fromCenterX;
          startY = fromY + 80;
          endX = toCenterX;
          endY = toY;
        } else {
          startX = fromCenterX;
          startY = fromY;
          endX = toCenterX;
          endY = toY + 80;
        }
      }

      const hasComplementaryFlow = businessModel.flows.some(f => 
        f.id !== flow.id &&
        f.from === flow.from && 
        f.to === flow.to && 
        f.type !== flow.type
      );

      ctx.beginPath();
      let midX, midY;
      
      if (hasComplementaryFlow) {
        const offset = flow.type === 'billing' ? -20 : 20;
        midX = (startX + endX) / 2;
        midY = (startY + endY) / 2;
        
        const dx = endX - startX;
        const dy = endY - startY;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length > 0) {
          const perpX = -dy / length * offset;
          const perpY = dx / length * offset;
          
          const controlX = midX + perpX;
          const controlY = midY + perpY;
          
          ctx.moveTo(startX, startY);
          ctx.quadraticCurveTo(controlX, controlY, endX, endY);
          
          midX = controlX;
          midY = controlY;
        }
      } else {
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        midX = (startX + endX) / 2;
        midY = (startY + endY) / 2;
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
      const angle = Math.atan2(endY - startY, endX - startX);
      const arrowLength = 15;
      
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - arrowLength * Math.cos(angle - Math.PI / 6),
        endY - arrowLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - arrowLength * Math.cos(angle + Math.PI / 6),
        endY - arrowLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw financial details trên billing flows - font lớn hơn để dễ đọc
      if (flow.type === 'billing') {
        const financialInfo = getParticipantFinancialInfo(flow.from);
        if (financialInfo && financialInfo.revenue) {
          // Revenue text - tăng font size để dễ đọc
          ctx.fillStyle = '#059669';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(financialInfo.revenue, midX, midY - 15);
          
          // Pricing type - tăng font size
          ctx.fillStyle = '#374151';
          ctx.font = '10px Arial';
          ctx.fillText(financialInfo.pricingType, midX, midY);
          
          // Tax indicators - tăng font size
          const indicators = [];
          if (financialInfo.whtApplicable) indicators.push({ text: 'WHT', color: '#dc2626' });
          if (financialInfo.vatGstApplicable) indicators.push({ text: 'VAT/GST', color: '#2563eb' });
          
          if (indicators.length > 0) {
            let yOffset = midY + 15;
            indicators.forEach((indicator, idx) => {
              const xOffset = indicators.length === 1 ? midX : midX + (idx === 0 ? -20 : 20);
              
              ctx.fillStyle = indicator.color;
              ctx.font = '8px Arial';
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
