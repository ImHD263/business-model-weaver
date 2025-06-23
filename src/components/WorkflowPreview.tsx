
import React from 'react';
import { Card } from '@/components/ui/card';
import type { BusinessModel } from '@/pages/Index';

interface WorkflowPreviewProps {
  businessModel: BusinessModel;
}

export const WorkflowPreview: React.FC<WorkflowPreviewProps> = ({ businessModel }) => {
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
  );
};
