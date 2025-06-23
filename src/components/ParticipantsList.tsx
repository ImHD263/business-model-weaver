
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { BusinessModel } from '@/pages/Index';

interface ParticipantsListProps {
  businessModel: BusinessModel;
}

export const ParticipantsList: React.FC<ParticipantsListProps> = ({ businessModel }) => {
  if (businessModel.participants.length === 0) {
    return null;
  }

  return (
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
  );
};
