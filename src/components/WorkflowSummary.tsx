
import React from 'react';
import { Card } from '@/components/ui/card';
import { Image } from 'lucide-react';
import type { BusinessModel } from '@/pages/Index';

interface WorkflowSummaryProps {
  businessModel: BusinessModel;
}

export const WorkflowSummary: React.FC<WorkflowSummaryProps> = ({ businessModel }) => {
  const getWorkflowSummary = () => {
    const summary = {
      participantCount: businessModel.participants.length,
      flowCount: businessModel.flows.length,
      rolesAssigned: businessModel.participants.filter(p => p.role).length,
      billingFlows: businessModel.flows.filter(f => f.type === 'billing').length,
      deliveryFlows: businessModel.flows.filter(f => f.type === 'delivery').length
    };
    return summary;
  };

  const summary = getWorkflowSummary();

  return (
    <Card className="p-4">
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <Image className="w-5 h-5 text-blue-600" />
        Workflow Summary
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{summary.participantCount}</div>
          <div className="text-sm text-gray-600">Participants</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{summary.rolesAssigned}</div>
          <div className="text-sm text-gray-600">Roles Assigned</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{summary.flowCount}</div>
          <div className="text-sm text-gray-600">Total Flows</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{summary.billingFlows}</div>
          <div className="text-sm text-gray-600">Billing Flows</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{summary.deliveryFlows}</div>
          <div className="text-sm text-gray-600">Delivery Flows</div>
        </div>
      </div>
    </Card>
  );
};
