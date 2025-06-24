
import React from 'react';
import { WorkflowSummary } from './WorkflowSummary';
import { WorkflowPreview } from './WorkflowPreview';
import { ExportControls } from './ExportControls';
import { ParticipantsList } from './ParticipantsList';
import type { BusinessModel, Participant } from '@/pages/Index';

interface ImageWorkflowCreatorProps {
  businessModel: BusinessModel;
  onNotification: (message: string) => void;
  onUpdateParticipants?: (participants: Participant[]) => void;
}

export const ImageWorkflowCreator: React.FC<ImageWorkflowCreatorProps> = ({
  businessModel,
  onNotification,
  onUpdateParticipants
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">Image Workflow Creation</h3>
          <p className="text-gray-600">Export your business model as an image or PDF</p>
        </div>
      </div>

      <WorkflowSummary businessModel={businessModel} />
      <WorkflowPreview 
        businessModel={businessModel} 
        onUpdateParticipants={onUpdateParticipants}
      />
      <ExportControls businessModel={businessModel} onNotification={onNotification} />
      <ParticipantsList businessModel={businessModel} />
    </div>
  );
};
