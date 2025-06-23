
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Package } from 'lucide-react';
import type { BusinessModel } from '@/pages/Index';

interface WorkflowPreviewProps {
  businessModel: BusinessModel;
}

export const WorkflowPreview: React.FC<WorkflowPreviewProps> = ({ businessModel }) => {
  const getParticipantFinancialInfo = (participantId: string) => {
    return businessModel.financialInfo.find(info => info.participantId === participantId);
  };

  const getFlowPath = (flow: any) => {
    const fromParticipant = businessModel.participants.find(p => p.id === flow.from);
    const toParticipant = businessModel.participants.find(p => p.id === flow.to);
    
    if (!fromParticipant || !toParticipant) return '';

    const fromX = ((fromParticipant.x || 0) / 4) + 40;
    const fromY = ((fromParticipant.y || 0) / 4) + 20;
    const toX = ((toParticipant.x || 0) / 4) + 40;
    const toY = ((toParticipant.y || 0) / 4) + 20;

    // Check if there's a complementary flow (billing vs delivery between same participants)
    const hasComplementaryFlow = businessModel.flows.some(f => 
      f.id !== flow.id &&
      f.from === flow.from && 
      f.to === flow.to && 
      f.type !== flow.type
    );

    // If there's a complementary flow, offset this one to prevent overlap
    if (hasComplementaryFlow) {
      const offset = flow.type === 'billing' ? -8 : 8;
      const midX = (fromX + toX) / 2;
      const midY = (fromY + toY) / 2;
      
      // Calculate perpendicular offset
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
      <div className="relative w-full h-64 bg-gray-50 rounded border-2 border-dashed border-gray-200 overflow-hidden">
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
              
              {businessModel.flows.map((flow) => (
                <g key={flow.id}>
                  <path
                    d={getFlowPath(flow)}
                    stroke={flow.type === 'billing' ? '#EAB308' : '#3B82F6'}
                    strokeWidth="2"
                    strokeDasharray={flow.type === 'delivery' ? '3,3' : 'none'}
                    fill="none"
                    markerEnd="url(#preview-arrowhead)"
                  />
                </g>
              ))}
            </svg>

            {/* Participants - scaled down for preview */}
            {businessModel.participants.map((participant, index) => {
              const financialInfo = getParticipantFinancialInfo(participant.id);
              return (
                <div
                  key={participant.id}
                  className="absolute group"
                  style={{
                    left: ((participant.x || (100 + (index % 3) * 200)) / 4),
                    top: ((participant.y || (100 + Math.floor(index / 3) * 150)) / 4),
                  }}
                >
                  <div
                    className="w-20 h-12 rounded text-white text-xs font-semibold flex flex-col items-center justify-center p-1 relative"
                    style={{ backgroundColor: participant.color }}
                  >
                    <div className="truncate w-full text-center text-xs">{participant.entityName}</div>
                    <div className="text-xs opacity-90">{participant.country}</div>
                    
                    {/* Financial indicators */}
                    {financialInfo && (
                      <div className="absolute -top-1 -right-1 flex gap-1">
                        {financialInfo.revenue && (
                          <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                            <DollarSign className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>
                    )}
                    
                    {participant.role && (
                      <Badge 
                        variant="secondary" 
                        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs px-1 py-0 bg-white text-gray-800"
                      >
                        {participant.role.split(' ')[0]}
                      </Badge>
                    )}
                  </div>

                  {/* Tooltip on hover */}
                  {financialInfo && (
                    <div className="absolute invisible group-hover:visible bg-black text-white text-xs rounded p-2 -top-16 left-1/2 transform -translate-x-1/2 z-10 whitespace-nowrap">
                      <div>Revenue: {financialInfo.revenue}</div>
                      <div>Pricing: {financialInfo.pricingType}</div>
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

      {/* Enhanced legend with financial info */}
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
        
        {businessModel.financialInfo.length > 0 && (
          <div className="text-xs text-gray-600">
            💡 Hover over participants to see financial details
          </div>
        )}
      </div>
    </Card>
  );
};
