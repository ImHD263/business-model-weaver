
import type { BusinessModel } from '@/pages/Index';

export const useWorkflowCanvas = () => {
  const drawWorkflowToCanvas = (businessModel: BusinessModel): HTMLCanvasElement | null => {
    const canvas = document.createElement('canvas');
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

  return { drawWorkflowToCanvas };
};
