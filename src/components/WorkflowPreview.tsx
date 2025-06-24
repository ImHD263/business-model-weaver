
import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign } from 'lucide-react';
import type { BusinessModel, Participant } from '@/pages/Index';

interface WorkflowPreviewProps {
  businessModel: BusinessModel;
  onUpdateParticipants?: (participants: Participant[]) => void;
}

export const WorkflowPreview: React.FC<WorkflowPreviewProps> = ({ 
  businessModel, 
  onUpdateParticipants 
}) => {
  const [draggedParticipant, setDraggedParticipant] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const getParticipantFinancialInfo = (participantId: string) => {
    return businessModel.financialInfo.find(info => info.participantId === participantId);
  };

  const handleMouseDown = (e: React.MouseEvent, participantId: string) => {
    if (!onUpdateParticipants) return;
    
    const participant = businessModel.participants.find(p => p.id === participantId);
    if (!participant) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    
    if (containerRect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setDraggedParticipant(participantId);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedParticipant || !onUpdateParticipants || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(containerRect.width - 200, e.clientX - containerRect.left - dragOffset.x));
    const newY = Math.max(0, Math.min(containerRect.height - 80, e.clientY - containerRect.top - dragOffset.y));

    const updatedParticipants = businessModel.participants.map(p => 
      p.id === draggedParticipant 
        ? { ...p, x: newX * 4, y: newY * 4 } // Scale back up for canvas export
        : p
    );

    onUpdateParticipants(updatedParticipants);
  };

  const handleMouseUp = () => {
    setDraggedParticipant(null);
    setDragOffset({ x: 0, y: 0 });
  };

  const getFlowPath = (flow: any) => {
    const fromParticipant = businessModel.participants.find(p => p.id === flow.from);
    const toParticipant = businessModel.participants.find(p => p.id === flow.to);
    
    if (!fromParticipant || !toParticipant) return '';

    const fromX = ((fromParticipant.x || 0) / 4) + 100;
    const fromY = ((fromParticipant.y || 0) / 4) + 40;
    const toX = ((toParticipant.x || 0) / 4) + 100;
    const toY = ((toParticipant.y || 0) / 4) + 40;

    // Check for complementary flows and create curved paths to avoid overlap
    const hasComplementaryFlow = businessModel.flows.some(f => 
      f.id !== flow.id &&
      f.from === flow.from && 
      f.to === flow.to && 
      f.type !== flow.type
    );

    if (hasComplementaryFlow) {
      const offset = flow.type === 'billing' ? -15 : 15;
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
        
        return `M ${fromX} ${fromY} Q ${controlX} ${controlY} ${toX} ${toY}`;
      }
    }

    return `M ${fromX} ${fromY} L ${toX} ${toY}`;
  };

  return (
    <Card className="p-4">
      <h4 className="font-semibold mb-3">Workflow Preview</h4>
      <div 
        ref={containerRef}
        className="relative w-full h-96 bg-gray-50 rounded border-2 border-dashed border-gray-200 overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
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
                  markerWidth="10"  
                  markerHeight="8"
                  refX="9"
                  refY="4"
                  orient="auto"
                >
                  <polygon points="0 0, 10 4, 0 8" fill="#666" />
                </marker>
              </defs>
              
              {businessModel.flows.map((flow) => (
                <g key={flow.id}>
                  <path
                    d={getFlowPath(flow)}
                    stroke={flow.type === 'billing' ? '#EAB308' : '#3B82F6'}
                    strokeWidth="2"
                    strokeDasharray={flow.type === 'delivery' ? '5,5' : 'none'}
                    fill="none"
                    markerEnd="url(#preview-arrowhead)"
                  />
                </g>
              ))}
            </svg>

            {/* Participants */}
            {businessModel.participants.map((participant, index) => {
              const financialInfo = getParticipantFinancialInfo(participant.id);
              const x = (participant.x || (100 + (index % 3) * 250)) / 4;
              const y = (participant.y || (100 + Math.floor(index / 3) * 150)) / 4;
              
              return (
                <div
                  key={participant.id}
                  className={`absolute group cursor-move select-none ${draggedParticipant === participant.id ? 'z-10' : ''}`}
                  style={{
                    left: x,
                    top: y,
                  }}
                  onMouseDown={(e) => handleMouseDown(e, participant.id)}
                >
                  <div
                    className="w-50 h-20 rounded text-white text-sm font-semibold flex flex-col items-center justify-center p-2 relative shadow-lg"
                    style={{ backgroundColor: participant.color }}
                  >
                    <div className="text-center font-bold text-sm leading-tight">
                      {participant.entityName}
                    </div>
                    <div className="text-xs opacity-90 mt-1">
                      {participant.role}
                    </div>
                    <div className="text-xs opacity-75">
                      ({participant.country})
                    </div>
                    
                    {/* Financial indicators */}
                    {financialInfo && (
                      <div className="absolute -top-2 -right-2 flex gap-1">
                        {financialInfo.revenue && (
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <DollarSign className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Enhanced tooltip on hover */}
                  {financialInfo && (
                    <div className="absolute invisible group-hover:visible bg-black text-white text-xs rounded p-2 -top-20 left-1/2 transform -translate-x-1/2 z-20 whitespace-nowrap">
                      <div>Revenue: {financialInfo.revenue}</div>
                      <div>Pricing: {financialInfo.pricingType}</div>
                      <div>Billing To: {financialInfo.billingTo}</div>
                      {financialInfo.whtApplicable && <div>WHT Applicable</div>}
                      {financialInfo.vatGstApplicable && <div>VAT/GST Applicable</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Enhanced legend */}
      <div className="mt-4 space-y-2">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-1 bg-yellow-500"></div>
            <span>Billing Flow</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-1 bg-blue-500 border-dashed border-2 border-blue-500 bg-transparent"></div>
            <span>Delivery Flow</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-green-500" />
            <span>Has Revenue Data</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-600 space-y-1">
          <div>💡 Drag participants to reposition them</div>
          {businessModel.financialInfo.length > 0 && (
            <div>💡 Hover over participants to see financial details</div>
          )}
        </div>
      </div>
    </Card>
  );
};
