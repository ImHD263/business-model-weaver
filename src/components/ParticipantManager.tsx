
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Save } from 'lucide-react';
import type { Participant } from '@/pages/Index';

interface ParticipantManagerProps {
  participants: Participant[];
  onUpdate: (participants: Participant[]) => void;
  onNotification: (message: string) => void;
}

const countries = [
  { code: 'IN', name: 'India' },
  { code: 'SG', name: 'Singapore' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'DE', name: 'Germany' },
  { code: 'US', name: 'United States' },
  { code: 'CN', name: 'China' },
  { code: 'JP', name: 'Japan' },
];

const colors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

export const ParticipantManager: React.FC<ParticipantManagerProps> = ({
  participants,
  onUpdate,
  onNotification
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [formData, setFormData] = useState({
    entityName: '',
    country: '',
    isBoschEntity: false,
    isEndCustomer: false,
    color: colors[0]
  });

  const resetForm = () => {
    setFormData({
      entityName: '',
      country: '',
      isBoschEntity: false,
      isEndCustomer: false,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
    setEditingParticipant(null);
  };

  const handleSubmit = () => {
    if (!formData.entityName || !formData.country) {
      onNotification('Please fill in all required fields');
      return;
    }

    const newParticipant: Participant = {
      id: editingParticipant?.id || Date.now().toString(),
      entityName: formData.entityName,
      country: formData.country,
      isBoschEntity: formData.isBoschEntity,
      isEndCustomer: formData.isEndCustomer,
      color: formData.color,
      role: editingParticipant?.role
    };

    if (editingParticipant) {
      onUpdate(participants.map(p => p.id === editingParticipant.id ? newParticipant : p));
      onNotification(`Participant "${formData.entityName}" updated successfully`);
    } else {
      onUpdate([...participants, newParticipant]);
      onNotification(`Participant "${formData.entityName}" added successfully`);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (participant: Participant) => {
    setEditingParticipant(participant);
    setFormData({
      entityName: participant.entityName,
      country: participant.country,
      isBoschEntity: participant.isBoschEntity,
      isEndCustomer: participant.isEndCustomer,
      color: participant.color || colors[0]
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const participant = participants.find(p => p.id === id);
    onUpdate(participants.filter(p => p.id !== id));
    onNotification(`Participant "${participant?.entityName}" deleted successfully`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Manage Participants</h3>
          <p className="text-gray-600">Add, edit, or delete business model participants</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Participant
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingParticipant ? 'Edit Participant' : 'Add New Participant'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="entityName">Entity Name *</Label>
                <Input
                  id="entityName"
                  value={formData.entityName}
                  onChange={(e) => setFormData({ ...formData, entityName: e.target.value })}
                  placeholder="e.g., BOSCH, GLOBAL"
                />
              </div>
              
              <div>
                <Label htmlFor="country">Country *</Label>
                <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name} ({country.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isBoschEntity"
                  checked={formData.isBoschEntity}
                  onCheckedChange={(checked) => setFormData({ ...formData, isBoschEntity: checked })}
                />
                <Label htmlFor="isBoschEntity">Bosch Entity</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isEndCustomer"
                  checked={formData.isEndCustomer}
                  onCheckedChange={(checked) => setFormData({ ...formData, isEndCustomer: checked })}
                />
                <Label htmlFor="isEndCustomer">End Customer</Label>
              </div>
              
              <div>
                <Label>Color</Label>
                <div className="flex gap-2 mt-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>
              
              <Button onClick={handleSubmit} className="w-full flex items-center gap-2">
                <Save className="w-4 h-4" />
                {editingParticipant ? 'Update' : 'Add'} Participant
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Participants List */}
      <div className="grid gap-4">
        {participants.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No participants added yet. Click "Add Participant" to get started.</p>
          </Card>
        ) : (
          participants.map((participant) => (
            <Card key={participant.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: participant.color }}
                  />
                  <div>
                    <h4 className="font-semibold">{participant.entityName}</h4>
                    <p className="text-sm text-gray-600">
                      {countries.find(c => c.code === participant.country)?.name} ({participant.country})
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    {participant.isBoschEntity && (
                      <Badge variant="secondary">Bosch Entity</Badge>
                    )}
                    {participant.isEndCustomer && (
                      <Badge variant="secondary">End Customer</Badge>
                    )}
                    {participant.role && (
                      <Badge variant="default">{participant.role}</Badge>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(participant)}
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
              </div>
            </Card>
          ))
        )}
      </div>
      
      {participants.length > 0 && (
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
          <strong>Total Participants:</strong> {participants.length}
          {participants.length >= 5 && (
            <span className="ml-2 text-amber-600">
              ⚠️ Consider if all participants are necessary for clarity
            </span>
          )}
        </div>
      )}
    </div>
  );
};
