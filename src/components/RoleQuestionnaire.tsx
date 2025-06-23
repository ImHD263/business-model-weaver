
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, AlertTriangle, Brain, Edit2 } from 'lucide-react';
import type { Participant } from '@/pages/Index';

interface RoleQuestionnaireProps {
  participants: Participant[];
  onUpdate: (participants: Participant[]) => void;
  onNotification: (message: string) => void;
}

const predefinedRoles = [
  'Sub-contractor',
  'PRU (Product Responsible Unit)',
  'LRD (Limited Risk Distributor)',
  'End Customer',
  'Supplier',
  'Distributor',
  'Manufacturer',
  'Service Provider'
];

const questions = [
  {
    id: 'manufacturing',
    text: 'Does this participant manufacture or produce the product?',
    options: ['Yes', 'No', 'Partially'],
    roleMapping: {
      'Yes': ['Manufacturer', 'PRU (Product Responsible Unit)'],
      'No': ['Distributor', 'End Customer', 'LRD (Limited Risk Distributor)'],
      'Partially': ['Sub-contractor', 'Supplier']
    }
  },
  {
    id: 'distribution',
    text: 'Is this participant involved in distribution or sales?',
    options: ['Primary distributor', 'Secondary distributor', 'End customer', 'Not involved'],
    roleMapping: {
      'Primary distributor': ['Distributor', 'LRD (Limited Risk Distributor)'],
      'Secondary distributor': ['Sub-contractor', 'Distributor'],
      'End customer': ['End Customer'],
      'Not involved': ['Manufacturer', 'Supplier', 'PRU (Product Responsible Unit)']
    }
  },
  {
    id: 'responsibility',
    text: 'What is their primary responsibility?',
    options: ['Product development', 'Manufacturing', 'Sales & marketing', 'End usage', 'Support services'],
    roleMapping: {
      'Product development': ['PRU (Product Responsible Unit)', 'Manufacturer'],
      'Manufacturing': ['Manufacturer', 'Sub-contractor'],
      'Sales & marketing': ['Distributor', 'LRD (Limited Risk Distributor)'],
      'End usage': ['End Customer'],
      'Support services': ['Service Provider', 'Sub-contractor']
    }
  },
  {
    id: 'risk',
    text: 'What level of business risk do they bear?',
    options: ['Full risk', 'Limited risk', 'No risk'],
    roleMapping: {
      'Full risk': ['PRU (Product Responsible Unit)', 'Manufacturer'],
      'Limited risk': ['LRD (Limited Risk Distributor)', 'Distributor'],
      'No risk': ['Sub-contractor', 'End Customer']
    }
  }
];

export const RoleQuestionnaire: React.FC<RoleQuestionnaireProps> = ({
  participants,
  onUpdate,
  onNotification
}) => {
  const [selectedParticipant, setSelectedParticipant] = useState<string>('');
  const [editingParticipant, setEditingParticipant] = useState<string>('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [suggestedRoles, setSuggestedRoles] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleAnswerChange = (questionId: string, answer: string) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);
    
    // Calculate suggested roles based on answers
    if (Object.keys(newAnswers).length === questions.length) {
      analyzeRoles(newAnswers);
    }
  };

  const analyzeRoles = (allAnswers: Record<string, string>) => {
    const roleScores: Record<string, number> = {};
    
    questions.forEach(question => {
      const answer = allAnswers[question.id];
      if (answer && question.roleMapping[answer]) {
        question.roleMapping[answer].forEach(role => {
          roleScores[role] = (roleScores[role] || 0) + 1;
        });
      }
    });
    
    // Sort roles by score and get top suggestions
    const sortedRoles = Object.entries(roleScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([role]) => role);
    
    setSuggestedRoles(sortedRoles);
    setShowSuggestions(true);
  };

  const assignRole = (participantId: string, role: string) => {
    const updatedParticipants = participants.map(p =>
      p.id === participantId ? { ...p, role } : p
    );
    onUpdate(updatedParticipants);
    
    const participant = participants.find(p => p.id === participantId);
    onNotification(`Role "${role}" assigned to ${participant?.entityName}`);
    
    // Reset for next participant
    resetForm();
  };

  const resetForm = () => {
    setAnswers({});
    setSuggestedRoles([]);
    setShowSuggestions(false);
    setSelectedParticipant('');
    setEditingParticipant('');
  };

  const startEditing = (participantId: string) => {
    setEditingParticipant(participantId);
    setSelectedParticipant('');
    setAnswers({});
    setSuggestedRoles([]);
    setShowSuggestions(false);
  };

  const autoAssignRoles = () => {
    const updatedParticipants = participants.map(participant => {
      // Simple rule-based assignment
      if (participant.isEndCustomer) {
        return { ...participant, role: 'End Customer' };
      } else if (participant.isBoschEntity) {
        return { ...participant, role: 'PRU (Product Responsible Unit)' };
      } else {
        return { ...participant, role: 'Sub-contractor' };
      }
    });
    
    onUpdate(updatedParticipants);
    onNotification('Auto-assignment completed. Please review and adjust as needed.');
    
    // Check for conflicts
    checkRoleConflicts(updatedParticipants);
  };

  const checkRoleConflicts = (participantsList: Participant[]) => {
    const roleCount = participantsList.reduce((acc, p) => {
      if (p.role) {
        acc[p.role] = (acc[p.role] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const conflicts: string[] = [];
    
    // Check for multiple PRUs
    if (roleCount['PRU (Product Responsible Unit)'] > 1) {
      conflicts.push('Multiple Product Responsible Units detected');
    }
    
    // Check for missing end customer
    if (!roleCount['End Customer']) {
      conflicts.push('No End Customer identified');
    }
    
    if (conflicts.length > 0) {
      onNotification(`⚠️ Potential conflicts: ${conflicts.join(', ')}`);
    } else {
      onNotification('✅ Roles are clarified. No conflict found.');
    }
  };

  const currentParticipant = participants.find(p => p.id === selectedParticipant || p.id === editingParticipant);
  const unassignedParticipants = participants.filter(p => !p.role);
  const assignedParticipants = participants.filter(p => p.role);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">Role Assignment</h3>
          <p className="text-gray-600">Assign roles based on questionnaire or manual selection</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={autoAssignRoles}
            className="flex items-center gap-2"
            disabled={participants.length === 0}
          >
            <Brain className="w-4 h-4" />
            Auto-Assign
          </Button>
        </div>
      </div>

      {/* Assigned Participants */}
      {assignedParticipants.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Assigned Participants ({assignedParticipants.length})
          </h4>
          <div className="grid gap-2">
            {assignedParticipants.map(participant => (
              <div key={participant.id} className="flex items-center justify-between p-2 bg-green-50 rounded">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: participant.color }}
                  />
                  <span className="font-medium">{participant.entityName}</span>
                  <span className="text-sm text-gray-600">({participant.country})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">{participant.role}</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEditing(participant.id)}
                    className="flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Unassigned Participants */}
      {unassignedParticipants.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Unassigned Participants ({unassignedParticipants.length})
          </h4>
          
          <div className="space-y-4">
            <div>
              <Label>Select participant to assign role:</Label>
              <Select value={selectedParticipant} onValueChange={setSelectedParticipant}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a participant" />
                </SelectTrigger>
                <SelectContent>
                  {unassignedParticipants.map(participant => (
                    <SelectItem key={participant.id} value={participant.id}>
                      {participant.entityName} ({participant.country})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Manual Role Assignment for unassigned */}
            {selectedParticipant && !showSuggestions && (
              <div className="space-y-4">
                <div>
                  <Label>Or assign role manually:</Label>
                  <Select onValueChange={(role) => assignRole(selectedParticipant, role)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedRoles.map(role => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">or</p>
                  <p className="text-sm font-medium">Answer the questionnaire for AI-driven suggestions:</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Edit Role for assigned participants */}
      {editingParticipant && (
        <Card className="p-4 border-blue-200 bg-blue-50">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-blue-600" />
            Editing Role for: {participants.find(p => p.id === editingParticipant)?.entityName}
          </h4>
          
          <div className="space-y-4">
            <div>
              <Label>Select new role:</Label>
              <Select onValueChange={(role) => assignRole(editingParticipant, role)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {predefinedRoles.map(role => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Questionnaire */}
      {(selectedParticipant || editingParticipant) && currentParticipant && (
        <div className="space-y-4 border-t pt-4">
          <h5 className="font-medium">
            Questionnaire for: {currentParticipant.entityName}
          </h5>
          
          {questions.map((question) => (
            <div key={question.id} className="space-y-2">
              <Label className="text-sm font-medium">{question.text}</Label>
              <RadioGroup
                value={answers[question.id] || ''}
                onValueChange={(value) => handleAnswerChange(question.id, value)}
              >
                {question.options.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                    <Label htmlFor={`${question.id}-${option}`} className="text-sm">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}
        </div>
      )}

      {/* AI Suggestions */}
      {showSuggestions && suggestedRoles.length > 0 && (
        <Card className="p-4 bg-blue-50">
          <h5 className="font-medium mb-2 flex items-center gap-2">
            <Brain className="w-4 h-4 text-blue-600" />
            AI-Suggested Roles:
          </h5>
          <div className="flex gap-2 flex-wrap">
            {suggestedRoles.map((role) => (
              <Button
                key={role}
                variant="outline"
                size="sm"
                onClick={() => assignRole(selectedParticipant || editingParticipant, role)}
                className="text-xs"
              >
                {role}
              </Button>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Click on a suggested role to assign it, or continue with manual selection above.
          </p>
        </Card>
      )}

      {participants.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No participants available. Please add participants in the previous step.</p>
        </Card>
      )}
    </div>
  );
};
