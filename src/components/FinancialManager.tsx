
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Save } from 'lucide-react';
import type { Participant, FinancialInfo } from '@/pages/Index';

interface FinancialManagerProps {
  participants: Participant[];
  financialInfo: FinancialInfo[];
  onUpdate: (financialInfo: FinancialInfo[]) => void;
  onNotification: (message: string) => void;
}

const pricingTypes = [
  'Interco-SDS Pricing',
  "Vendor's Price",
  'SDS Pricing - SG&A - RoS',
  'Market Price',
  'Cost Plus',
  'Fixed Price',
  'Commission Based'
];

export const FinancialManager: React.FC<FinancialManagerProps> = ({
  participants,
  financialInfo,
  onUpdate,
  onNotification
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFinancial, setEditingFinancial] = useState<FinancialInfo | null>(null);
  const [formData, setFormData] = useState({
    participantId: '',
    billingTo: '',
    pricingType: '',
    whtApplicable: false,
    vatGstApplicable: false,
    revenue: ''
  });

  const resetForm = () => {
    setFormData({
      participantId: '',
      billingTo: '',
      pricingType: '',
      whtApplicable: false,
      vatGstApplicable: false,
      revenue: ''
    });
    setEditingFinancial(null);
  };

  const handleSubmit = () => {
    if (!formData.participantId || !formData.billingTo || !formData.pricingType) {
      onNotification('Please fill in all required fields');
      return;
    }

    const newFinancialInfo: FinancialInfo = {
      participantId: formData.participantId,
      billingTo: formData.billingTo,
      pricingType: formData.pricingType,
      whtApplicable: formData.whtApplicable,
      vatGstApplicable: formData.vatGstApplicable,
      revenue: formData.revenue
    };

    if (editingFinancial) {
      onUpdate(financialInfo.map(f => 
        f.participantId === editingFinancial.participantId ? newFinancialInfo : f
      ));
      onNotification('Financial information updated successfully');
    } else {
      // Check if financial info already exists for this participant
      const existingIndex = financialInfo.findIndex(f => f.participantId === formData.participantId);
      if (existingIndex >= 0) {
        onUpdate(financialInfo.map((f, index) => 
          index === existingIndex ? newFinancialInfo : f
        ));
        onNotification('Financial information updated successfully');
      } else {
        onUpdate([...financialInfo, newFinancialInfo]);
        onNotification('Financial information added successfully');
      }
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (financial: FinancialInfo) => {
    setEditingFinancial(financial);
    setFormData({
      participantId: financial.participantId,
      billingTo: financial.billingTo,
      pricingType: financial.pricingType,
      whtApplicable: financial.whtApplicable,
      vatGstApplicable: financial.vatGstApplicable,
      revenue: financial.revenue
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (participantId: string) => {
    onUpdate(financialInfo.filter(f => f.participantId !== participantId));
    const participant = participants.find(p => p.id === participantId);
    onNotification(`Financial information for "${participant?.entityName}" deleted successfully`);
  };

  const autoGenerateFinancials = () => {
    const newFinancials: FinancialInfo[] = [];
    
    participants.forEach(participant => {
      // Skip if financial info already exists
      if (financialInfo.some(f => f.participantId === participant.id)) return;
      
      let defaultBillingTo = '';
      let defaultPricingType = '';
      
      // Auto-assign based on role
      switch (participant.role) {
        case 'End Customer':
          defaultBillingTo = participants.find(p => p.role?.includes('Distributor'))?.id || '';
          defaultPricingType = 'Market Price';
          break;
        case 'LRD (Limited Risk Distributor)':
        case 'Distributor':
          defaultBillingTo = participants.find(p => p.role?.includes('PRU') || p.role?.includes('Manufacturer'))?.id || '';
          defaultPricingType = 'SDS Pricing - SG&A - RoS';
          break;
        case 'Sub-contractor':
          defaultBillingTo = participants.find(p => p.role?.includes('PRU') || p.role?.includes('Manufacturer'))?.id || '';
          defaultPricingType = "Vendor's Price";
          break;
        default:
          defaultPricingType = 'Interco-SDS Pricing';
      }

      newFinancials.push({
        participantId: participant.id,
        billingTo: defaultBillingTo,
        pricingType: defaultPricingType,
        whtApplicable: !participant.isBoschEntity,
        vatGstApplicable: true,
        revenue: ''
      });
    });

    onUpdate([...financialInfo, ...newFinancials]);
    onNotification(`Auto-generated financial information for ${newFinancials.length} participants`);
  };

  const getParticipantName = (id: string) => {
    return participants.find(p => p.id === id)?.entityName || 'Unknown';
  };

  const participantsWithFinancials = participants.filter(p => 
    financialInfo.some(f => f.participantId === p.id)
  );
  const participantsWithoutFinancials = participants.filter(p => 
    !financialInfo.some(f => f.participantId === p.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Financial Information</h3>
          <p className="text-gray-600">Manage billing and financial details for each participant</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={autoGenerateFinancials}
            disabled={participants.length === 0}
          >
            Auto-Generate
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Financial Info
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingFinancial ? 'Edit Financial Information' : 'Add Financial Information'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="participant">Participant *</Label>
                  <Select
                    value={formData.participantId}
                    onValueChange={(value) => setFormData({ ...formData, participantId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select participant" />
                    </SelectTrigger>
                    <SelectContent>
                      {participants.map((participant) => (
                        <SelectItem key={participant.id} value={participant.id}>
                          {participant.entityName} ({participant.country})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="billingTo">Billing To *</Label>
                  <Select
                    value={formData.billingTo}
                    onValueChange={(value) => setFormData({ ...formData, billingTo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select billing entity" />
                    </SelectTrigger>
                    <SelectContent>
                      {participants
                        .filter(p => p.id !== formData.participantId)
                        .map((participant) => (
                          <SelectItem key={participant.id} value={participant.id}>
                            {participant.entityName} ({participant.country})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="pricingType">Pricing Type *</Label>
                  <Select
                    value={formData.pricingType}
                    onValueChange={(value) => setFormData({ ...formData, pricingType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pricing type" />
                    </SelectTrigger>
                    <SelectContent>
                      {pricingTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="whtApplicable"
                    checked={formData.whtApplicable}
                    onCheckedChange={(checked) => setFormData({ ...formData, whtApplicable: checked })}
                  />
                  <Label htmlFor="whtApplicable">WHT (Withholding Tax) Applicable</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="vatGstApplicable"
                    checked={formData.vatGstApplicable}
                    onCheckedChange={(checked) => setFormData({ ...formData, vatGstApplicable: checked })}
                  />
                  <Label htmlFor="vatGstApplicable">VAT/GST Applicable</Label>
                </div>
                
                <div>
                  <Label htmlFor="revenue">Revenue/Benefit/Compensation</Label>
                  <Input
                    id="revenue"
                    value={formData.revenue}
                    onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                    placeholder="Enter amount or description"
                  />
                </div>
                
                <Button onClick={handleSubmit} className="w-full flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {editingFinancial ? 'Update' : 'Add'} Financial Information
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Financial Information List */}
      {participantsWithFinancials.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold">Configured Financial Information ({participantsWithFinancials.length})</h4>
          
          {participantsWithFinancials.map((participant) => {
            const financial = financialInfo.find(f => f.participantId === participant.id)!;
            const billingToName = getParticipantName(financial.billingTo);
            
            return (
              <Card key={participant.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: participant.color }}
                      />
                      <h5 className="font-semibold">{participant.entityName}</h5>
                      <Badge variant="outline">{participant.country}</Badge>
                      {participant.role && (
                        <Badge variant="secondary">{participant.role}</Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Billing To:</span>
                        <span className="ml-2">{billingToName}</span>
                      </div>
                      <div>
                        <span className="font-medium">Pricing Type:</span>
                        <span className="ml-2">{financial.pricingType}</span>
                      </div>
                      <div>
                        <span className="font-medium">WHT:</span>
                        <Badge variant={financial.whtApplicable ? 'default' : 'secondary'} className="ml-2 text-xs">
                          {financial.whtApplicable ? 'Applicable' : 'Not Applicable'}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">VAT/GST:</span>
                        <Badge variant={financial.vatGstApplicable ? 'default' : 'secondary'} className="ml-2 text-xs">
                          {financial.vatGstApplicable ? 'Applicable' : 'Not Applicable'}
                        </Badge>
                      </div>
                      {financial.revenue && (
                        <div className="col-span-2">
                          <span className="font-medium">Revenue:</span>
                          <span className="ml-2">{financial.revenue}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(financial)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(participant.id)}
                    >
                      ×
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Participants without Financial Information */}
      {participantsWithoutFinancials.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3 text-amber-600">
            Participants Missing Financial Information ({participantsWithoutFinancials.length})
          </h4>
          <div className="space-y-2">
            {participantsWithoutFinancials.map((participant) => (
              <div key={participant.id} className="flex items-center justify-between p-2 bg-amber-50 rounded">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: participant.color }}
                  />
                  <span className="font-medium">{participant.entityName}</span>
                  <span className="text-sm text-gray-600">({participant.country})</span>
                  {participant.role && (
                    <Badge variant="secondary">{participant.role}</Badge>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setFormData({ ...formData, participantId: participant.id });
                    setIsDialogOpen(true);
                  }}
                >
                  Add Financial Info
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {participants.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No participants available. Please add participants in the first step.</p>
        </Card>
      )}
    </div>
  );
};
