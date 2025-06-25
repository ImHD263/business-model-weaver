
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, X } from 'lucide-react';
import type { Participant } from '@/pages/Index';

interface RoleQuestionnaireProps {
  participants: Participant[];
  onUpdate: (participants: Participant[]) => void;
  onNotification: (message: string) => void;
}

const PREDEFINED_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
];

const COMMON_ROLES = [
  'End Customer',
  'Local Distributor',
  'Regional Distributor', 
  'LRD (Local/Regional Distributor)',
  'PRU (Production Unit)',
  'Manufacturer',
  'Supplier',
  'Service Provider',
  'Logistics Partner',
  'Financial Institution'
];

export const RoleQuestionnaire: React.FC<RoleQuestionnaireProps> = ({
  participants,
  onUpdate,
  onNotification
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState('');
  const [editingColor, setEditingColor] = useState('');

  const handleEditRole = (participant: Participant) => {
    setEditingId(participant.id);
    setEditingRole(participant.role || '');
    setEditingColor(participant.color || PREDEFINED_COLORS[0]);
  };

  const handleSaveRole = () => {
    if (!editingId || !editingRole.trim()) {
      onNotification('Please enter a valid role');
      return;
    }

    const updatedParticipants = participants.map(p => 
      p.id === editingId 
        ? { ...p, role: editingRole.trim(), color: editingColor }
        : p
    );

    onUpdate(updatedParticipants);
    onNotification('Role and color updated successfully');
    setEditingId(null);
    setEditingRole('');
    setEditingColor('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingRole('');
    setEditingColor('');
  };

  const assignAutoRoles = () => {
    const updatedParticipants = participants.map((participant, index) => {
      if (participant.role) return participant; // Keep existing roles
      
      let autoRole = '';
      let autoColor = PREDEFINED_COLORS[index % PREDEFINED_COLORS.length];
      
      if (participant.isEndCustomer) {
        autoRole = 'End Customer';
      } else if (participant.isBoschEntity) {
        autoRole = index % 2 === 0 ? 'PRU (Production Unit)' : 'Regional Distributor';
      } else {
        autoRole = 'Local Distributor';
      }
      
      return { ...participant, role: autoRole, color: autoColor };
    });

    onUpdate(updatedParticipants);
    onNotification('Auto-assigned roles and colors based on participant types');
  };

  const unassignedCount = participants.filter(p => !p.role).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Role Assignment & Color Selection</h3>
          <p className="text-gray-600">Assign roles and colors to participants for better visualization</p>
        </div>
        
        {unassignedCount > 0 && (
          <Button onClick={assignAutoRoles} variant="outline">
            Auto-assign Roles ({unassignedCount} remaining)
          </Button>
        )}
      </div>

      {participants.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No participants available. Please add participants in the first step.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {participants.map((participant) => (
            <Card key={participant.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Preview Box - Updated Layout */}
                  <div className="relative">
                    <div
                      className="w-32 h-20 rounded-lg border-2 border-white shadow-lg flex flex-col text-white text-xs font-semibold overflow-hidden"
                      style={{ backgroundColor: participant.color || '#6B7280' }}
                    >
                      {/* Role Section - 2/3 with solid border */}
                      <div className="flex-1 flex items-center justify-center border-b-2 border-white border-solid px-2">
                        <div className="text-center leading-tight">
                          {participant.role || 'No Role'}
                        </div>
                      </div>
                      
                      {/* Name Section - 1/3 with dashed border */}
                      <div className="h-6 flex items-center justify-center border-t-2 border-white border-dashed px-2">
                        <div className="text-center text-xs opacity-90 truncate">
                          {participant.entityName}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{participant.entityName}</h4>
                      <Badge variant="outline">{participant.country}</Badge>
                      {participant.isBoschEntity && <Badge>Bosch Entity</Badge>}
                      {participant.isEndCustomer && <Badge variant="secondary">End Customer</Badge>}
                    </div>
                    
                    {editingId === participant.id ? (
                      <div className="space-y-3">
                        <div>
                          <Label>Role</Label>
                          <Select value={editingRole} onValueChange={setEditingRole}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select or type a role" />
                            </SelectTrigger>
                            <SelectContent>
                              {COMMON_ROLES.map(role => (
                                <SelectItem key={role} value={role}>{role}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            value={editingRole}
                            onChange={(e) => setEditingRole(e.target.value)}
                            placeholder="Or type custom role"
                            className="mt-2"
                          />
                        </div>
                        
                        <div>
                          <Label>Color</Label>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {PREDEFINED_COLORS.map(color => (
                              <button
                                key={color}
                                className={`w-8 h-8 rounded border-2 ${
                                  editingColor === color ? 'border-gray-800' : 'border-gray-300'
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => setEditingColor(color)}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button onClick={handleSaveRole} size="sm">
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button onClick={handleCancelEdit} variant="outline" size="sm">
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">
                            <strong>Role:</strong> {participant.role || 'Not assigned'}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Color:</strong> 
                            <span
                              className="inline-block w-4 h-4 rounded ml-2 border"
                              style={{ backgroundColor: participant.color || '#6B7280' }}
                            />
                          </p>
                        </div>
                        <Button onClick={() => handleEditRole(participant)} variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {participants.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">Next Steps</h4>
          <p className="text-blue-700 text-sm">
            Once all participants have assigned roles and colors, you can proceed to relationship mapping 
            to define how they interact with each other.
          </p>
          {unassignedCount > 0 && (
            <p className="text-blue-600 text-sm mt-2">
              ⚠️ {unassignedCount} participant(s) still need role assignment
            </p>
          )}
        </Card>
      )}
    </div>
  );
};
