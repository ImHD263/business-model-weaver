
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ParticipantManager } from '@/components/ParticipantManager';
import { RoleQuestionnaire } from '@/components/RoleQuestionnaire';
import { BusinessModelDiagram } from '@/components/BusinessModelDiagram';
import { FinancialManager } from '@/components/FinancialManager';
import { ImageWorkflowCreator } from '@/components/ImageWorkflowCreator';
import { NotificationPane } from '@/components/NotificationPane';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';

export interface Participant {
  id: string;
  entityName: string;
  country: string;
  isBoschEntity: boolean;
  isEndCustomer: boolean;
  role?: string;
  color?: string;
  x?: number;
  y?: number;
}

export interface Flow {
  id: string;
  from: string;
  to: string;
  type: 'billing' | 'delivery';
  label?: string;
}

export interface FinancialInfo {
  participantId: string;
  billingTo: string;
  pricingType: string;
  whtApplicable: boolean;
  vatGstApplicable: boolean;
  revenue: string;
}

export interface BusinessModel {
  participants: Participant[];
  flows: Flow[];
  financialInfo: FinancialInfo[];
  notifications: string[];
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [businessModel, setBusinessModel] = useState<BusinessModel>({
    participants: [],
    flows: [],
    financialInfo: [],
    notifications: []
  });

  const steps = [
    'Participant Management',
    'Role Assignment',
    'Relationship Mapping',
    'Financial Details',
    'Image Workflow Creation'
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = () => {
    const dataStr = JSON.stringify(businessModel, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'business-model.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const updateBusinessModel = (updates: Partial<BusinessModel>) => {
    setBusinessModel(prev => ({ ...prev, ...updates }));
  };

  const addNotification = (message: string) => {
    setBusinessModel(prev => ({
      ...prev,
      notifications: [...prev.notifications, message]
    }));
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <ParticipantManager
            participants={businessModel.participants}
            onUpdate={(participants) => updateBusinessModel({ participants })}
            onNotification={addNotification}
          />
        );
      case 1:
        return (
          <RoleQuestionnaire
            participants={businessModel.participants}
            onUpdate={(participants) => updateBusinessModel({ participants })}
            onNotification={addNotification}
          />
        );
      case 2:
        return (
          <BusinessModelDiagram
            participants={businessModel.participants}
            flows={businessModel.flows}
            onUpdateParticipants={(participants) => updateBusinessModel({ participants })}
            onUpdateFlows={(flows) => updateBusinessModel({ flows })}
            onNotification={addNotification}
          />
        );
      case 3:
        return (
          <FinancialManager
            participants={businessModel.participants}
            financialInfo={businessModel.financialInfo}
            onUpdate={(financialInfo) => updateBusinessModel({ financialInfo })}
            onNotification={addNotification}
          />
        );
      case 4:
        return (
          <ImageWorkflowCreator
            businessModel={businessModel}
            onNotification={addNotification}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Business Model Analysis Tool
          </h1>
          <p className="text-lg text-gray-600">
            AI-Driven Participant Management & Code Generation
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    index <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
                <Badge
                  variant={index === currentStep ? 'default' : 'secondary'}
                  className="mt-2 text-xs"
                >
                  {step}
                </Badge>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Card className="p-6 shadow-lg">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {steps[currentStep]}
                </h2>
                <p className="text-gray-600 mt-1">
                  Step {currentStep + 1} of {steps.length}
                </p>
              </div>
              
              {renderCurrentStep()}
              
              {/* Navigation */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleSave}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </Button>
                  
                  <Button
                    onClick={handleNext}
                    disabled={currentStep === steps.length - 1}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Notification Pane */}
          <div className="lg:col-span-1">
            <NotificationPane
              notifications={businessModel.notifications}
              onClear={() => updateBusinessModel({ notifications: [] })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
