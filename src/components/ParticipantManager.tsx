
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Save, Trash2, X } from 'lucide-react';
import type { Participant } from '@/pages/Index';

interface ParticipantManagerProps {
  participants: Participant[];
  onUpdate: (participants: Participant[]) => void;
  onNotification: (message: string) => void;
}

const COUNTRIES = [
  'Germany', 'United States', 'China', 'Japan', 'India', 'Brazil', 'United Kingdom',
  'France', 'Italy', 'Canada', 'Australia', 'South Korea', 'Mexico', 'Spain',
  'Netherlands', 'Turkey', 'Thailand', 'Vietnam', 'Malaysia', 'Singapore'
];

export const ParticipantManager: React.FC<ParticipantManagerProps> = ({
  participants,
  onUpdate,
  onNotification
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    entityName: '',
    country: '',
    isBoschEntity: false,
    isEndCustomer: false
  });

  const resetForm = () => {
    setFormData({
      entityName: '',
      country: '',
      isBoschEntity: false,
      isEndCustomer: false
    });
  };

  const handleAdd = () => {
    if (!formData.entityName.trim() || !formData.country) {
      onNotification('Please fill in all required fields');
      return;
    }

    const newParticipant: Participant = {
      id: Date.now().toString(),
      entityName: formData.entityName.trim(),
      country: formData.country,
      isBoschEntity: formData.isBoschEntity,
      isEndCustomer: formData.isEndCustomer
    };

    onUpdate([...participants, newParticipant]);
    onNotification('Participant added successfully');
    resetForm();
    setShowAddForm(false);
  };

  const handleEdit = (participant: Participant) => {
    setEditingId(participant.id);
    setFormData({
      entityName: participant.entityName,
      country: participant.country,
      isBoschEntity: participant.isBoschEntity,
      isEndCustomer: participant.isEndCustomer
    });
  };

  const handleSaveEdit = () => {
    if (!formData.entityName.trim() || !formData.country) {
      onNotification('Please fill in all required fields');
      return;
    }

    const updatedParticipants = participants.map(p => 
      p.id === editingId 
        ? {
            ...p,
            entityName: formData.entityName.trim(),
            country: formData.country,
            isBoschEntity: formData.isBoschEntity,
            isEndCustomer: formData.isEndCustomer
          }
        : p
    );

    onUpdate(updatedParticipants);
    onNotification('Participant updated successfully');
    setEditingId(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    onUpdate(participants.filter(p => p.id !== id));
    onNotification('Participant deleted successfully');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Participant Management</h3>
          <p className="text-gray-600">Add and manage business model participants</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)} 
          className="flex items-center gap-2"
          disabled={showAddForm}
        >
          <Plus className="w-4 h-4" />
          Add Participant
        </Button>
      </div>

      {/* Add New Participant Form */}
      {showAddForm && (
        <Card className="p-4 border-green-200 bg-green-50">
          <h4 className="font-semibold mb-4 text-green-800">Add New Participant</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Entity Name *</Label>
              <Input
                value={formData.entityName}
                onChange={(e) => setFormData({...formData, entityName: e.target.value})}
                placeholder="Enter entity name"
              />
            </div>
            
            <div>
              <Label>Country *</Label>
              <Select value={formData.country} onValueChange={(value) => setFormData({...formData, country: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-4 mt-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="bosch-entity"
                checked={formData.isBoschEntity}
                onCheckedChange={(checked) => setFormData({...formData, isBoschEntity: !!checked})}
              />
              <Label htmlFor="bosch-entity">Bosch Entity</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="end-customer"
                checked={formData.isEndCustomer}
                onCheckedChange={(checked) => setFormData({...formData, isEndCustomer: !!checked})}
              />
              <Label htmlFor="end-customer">End Customer</Label>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button onClick={handleAdd}>
              <Save className="w-4 h-4 mr-2" />
              Add Participant
            </Button>
            <Button variant="outline" onClick={() => {
              setShowAddForm(false);
              resetForm();
            }}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Participants List */}
      {participants.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No participants added yet. Click "Add Participant" to get started.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {participants.map((participant) => (
            <Card key={participant.id} className="p-4">
              {editingId === participant.id ? (
                // Edit Mode
                <div className="space-y-4">
                  <h4 className="font-semibold text-blue-800">Edit Participant</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Entity Name *</Label>
                      <Input
                        value={formData.entityName}
                        onChange={(e) => setFormData({...formData, entityName: e.target.value})}
                        placeholder="Enter entity name"
                      />
                    </div>
                    
                    <div>
                      <Label>Country *</Label>
                      <Select value={formData.country} onValueChange={(value) => setFormData({...formData, country: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map(country => (
                            <SelectItem key={country} value={country}>{country}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id={`edit-bosch-${participant.id}`}
                        checked={formData.isBoschEntity}
                        onCheckedChange={(checked) => setFormData({...formData, isBoschEntity: !!checked})}
                      />
                      <Label htmlFor={`edit-bosch-${participant.id}`}>Bosch Entity</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id={`edit-customer-${participant.id}`}
                        checked={formData.isEndCustomer}
                        onCheckedChange={(checked) => setFormData({...formData, isEndCustomer: !!checked})}
                      />
                      <Label htmlFor={`edit-customer-${participant.id}`}>End Customer</Label>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleSaveEdit}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={handleCancelEdit}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // Display Mode
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-lg">{participant.entityName}</h4>
                      <Badge variant="outline">{participant.country}</Badge>
                      {participant.isBoschEntity && <Badge>Bosch Entity</Badge>}
                      {participant.isEndCustomer && <Badge variant="secondary">End Customer</Badge>}
                    </div>
                    <p className="text-sm text-gray-600">
                      Country: {participant.country} | 
                      Type: {participant.isBoschEntity ? 'Bosch Entity' : 'External'} |
                      {participant.isEndCustomer ? ' End Customer' : ' Business Partner'}
                    </p>
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
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {participants.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Total Participants:</span>
              <div className="text-lg font-bold text-blue-600">{participants.length}</div>
            </div>
            <div>
              <span className="font-medium">Bosch Entities:</span>
              <div className="text-lg font-bold text-green-600">
                {participants.filter(p => p.isBoschEntity).length}
              </div>
            </div>
            <div>
              <span className="font-medium">End Customers:</span>
              <div className="text-lg font-bold text-purple-600">
                {participants.filter(p => p.isEndCustomer).length}
              </div>
            </div>
            <div>
              <span className="font-medium">Countries:</span>
              <div className="text-lg font-bold text-orange-600">
                {new Set(participants.map(p => p.country)).size}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
