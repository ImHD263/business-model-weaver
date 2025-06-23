
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Save } from 'lucide-react';
import type { Participant, Flow } from '@/pages/Index';

interface BusinessModelDiagramProps {
  participants: Participant[];
  flows: Flow[];
  onUpdateParticipants: (participants: Participant[]) => void;
  onUpdateFlows: (flows: Flow[]) => void;
  onNotification: (message: string) => void;
}

export const BusinessModelDiagram: React.FC<BusinessModelDiagramProps> = ({
  participants,
  flows,
  onUpdateParticipants,
  onUpdateFlows,
  onNotification
}) => {
  const [draggedParticipant, setDraggedParticipant] = useState<string | null>(null);
  const [isFlowDialogOpen, setIsFlowDialogOpen] = useState(false);
  const [newFlow, setNewFlow] = useState({ 
    from: '', 
    to: '', 
    types: { billing: false, delivery: false },
    label: '' 
  });
  const diagramRef = useRef<HTMLDivElement>(null);

  // Initialize participant positions if not set
  useEffect(() => {
    const participantsNeedingPosition = participants.filter(p => p.x === undefined || p.y === undefined);
    if (participantsNeedingPosition.length > 0) {
      const updatedParticipants = participants.map((p, index) => ({
        ...p,
        x: p.x ?? 100 + (index % 3) * 200,
        y: p.y ?? 100 + Math.floor(index / 3) * 150
      }));
      onUpdateParticipants(updatedParticipants);
    }
  }, [participants, onUpdateParticipants]);

  const handleDragStart = (e: React.DragEvent, participantId: string) => {
    setDraggedParticipant(participantId);
    e.dataTransfer.setData('text/plain', participantId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const participantId = e.dataTransfer.getData('text/plain');
    
    if (!diagramRef.current || !participantId) return;

    const rect = diagramRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left - 75, rect.width - 150)); // Keep within bounds
    const y = Math.max(0, Math.min(e.clientY - rect.top - 30, rect.height - 80)); // Keep within bounds

    const updatedParticipants = participants.map(p =>
      p.id === participantId ? { ...p, x, y } : p
    );
    onUpdateParticipants(updatedParticipants);
    setDraggedParticipant(null);
  };

  const createFlows = () => {
    if (!newFlow.from || !newFlow.to) {
      onNotification('Please select both source and target participants');
      return;
    }

    if (newFlow.from === newFlow.to) {
      onNotification('Source and target cannot be the same');
      return;
    }

    if (!newFlow.types.billing && !newFlow.types.delivery) {
      onNotification('Please select at least one flow type');
      return;
    }

    const newFlows: Flow[] = [];
    const timestamp = Date.now();

    if (newFlow.types.billing) {
      newFlows.push({
        id: `billing-${timestamp}`,
        from: newFlow.from,
        to: newFlow.to,
        type: 'billing',
        label: newFlow.label || 'Billing flow'
      });
    }

    if (newFlow.types.delivery) {
      newFlows.push({
        id: `delivery-${timestamp}`,
        from: newFlow.from,
        to: newFlow.to,
        type: 'delivery',
        label: newFlow.label || 'Delivery flow'
      });
    }

    onUpdateFlows([...flows, ...newFlows]);
    onNotification(`Created ${newFlows.length} flow(s) successfully`);
    setIsFlowDialogOpen(false);
    setNewFlow({ from: '', to: '', types: { billing: false, delivery: false }, label: '' });
  };

  const deleteFlow = (flowId: string) => {
    onUpdateFlows(flows.filter(f => f.id !== flowId));
    onNotification('Flow deleted successfully');
  };

  const autoGenerateFlows = () => {
    const newFlows: Flow[] = [];
    
    // Generate flows based on roles
    const endCustomers = participants.filter(p => p.role === 'End Customer');
    const distributors = participants.filter(p => p.role?.includes('Distributor') || p.role?.includes('LRD'));
    const manufacturers = participants.filter(p => p.role?.includes('PRU') || p.role?.includes('Manufacturer'));
    
    // Create delivery flows: Manufacturer -> Distributor -> End Customer
    manufacturers.forEach(manufacturer => {
      distributors.forEach(distributor => {
        newFlows.push({
          id: `delivery-${manufacturer.id}-${distributor.id}`,
          from: manufacturer.id,
          to: distributor.id,
          type: 'delivery',
          label: 'Product Delivery'
        });
      });
    });

    distributors.forEach(distributor => {
      endCustomers.forEach(customer => {
        newFlows.push({
          id: `delivery-${distributor.id}-${customer.id}`,
          from: distributor.id,
          to: customer.id,
          type: 'delivery',
          label: 'Product Delivery'
        });
      });
    });

    // Create billing flows: End Customer -> Distributor -> Manufacturer
    endCustomers.forEach(customer => {
      distributors.forEach(distributor => {
        newFlows.push({
          id: `billing-${customer.id}-${distributor.id}`,
          from: customer.id,
          to: distributor.id,
          type: 'billing',
          label: 'Payment'
        });
      });
    });

    distributors.forEach(distributor => {
      manufacturers.forEach(manufacturer => {
        newFlows.push({
          id: `billing-${distributor.id}-${manufacturer.id}`,
          from: distributor.id,
          to: manufacturer.id,
          type: 'billing',
          label: 'Payment'
        });
      });
    });

    onUpdateFlows(newFlows);
    onNotification(`Auto-generated ${newFlows.length} flows based on participant roles`);
  };

  const getFlowPath = (flow: Flow) => {
    const fromParticipant = participants.find(p => p.id === flow.from);
    const toParticipant = participants.find(p => p.id === flow.to);
    
    if (!fromParticipant || !toParticipant) return '';

    const fromX = (fromParticipant.x || 0) + 75; // Center of participant box
    const fromY = (fromParticipant.y || 0) + 30;
    const toX = (toParticipant.x || 0) + 75;
    const toY = (toParticipant.y || 0) + 30;

    // Check if there's a complementary flow (billing vs delivery between same participants)
    const hasComplementaryFlow = flows.some(f => 
      f.id !== flow.id &&
      f.from === flow.from && 
      f.to === flow.to && 
      f.type !== flow.type
    );

    // If there's a complementary flow, offset this one to prevent overlap
    if (hasComplementaryFlow) {
      const offset = flow.type === 'billing' ? -10 : 10;
      const midX = (fromX + toX) / 2;
      const midY = (fromY + toY) / 2;
      
      // Calculate perpendicular offset
      const dx = toX - fromX;
      const dy = toY - fromY;
      const length = Math.sqrt(dx * dx + dy * dy);
      
      if (length > 0) {
        const perpX = -dy / length * offset;
        const perpY = dx / length * offset;
        
        const controlX = midX + perpX;
        const controlY = midY + perpY;
        
        return `M ${fromX} ${fromY} Q ${controlX} ${controlY} ${toX} ${toY}`;
      }
    }

    return `M ${fromX} ${fromY} L ${toX} ${toY}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Relationship Mapping</h3>
          <p className="text-gray-600">Visualize and manage participant relationships</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={autoGenerateFlows}
            disabled={participants.filter(p => p.role).length < 2}
          >
            Auto-Generate Flows
          </Button>
          
          <Dialog open={isFlowDialogOpen} onOpenChange={setIsFlowDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Flow
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Flow(s)</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label>From Participant</Label>
                  <Select value={newFlow.from} onValueChange={(value) => setNewFlow({...newFlow, from: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      {participants.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.entityName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>To Participant</Label>
                  <Select value={newFlow.to} onValueChange={(value) => setNewFlow({...newFlow, to: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select target" />
                    </SelectTrigger>
                    <SelectContent>
                      {participants.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.entityName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Flow Types</Label>
                  <div className="flex flex-col gap-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="billing"
                        checked={newFlow.types.billing}
                        onCheckedChange={(checked) => 
                          setNewFlow({
                            ...newFlow, 
                            types: { ...newFlow.types, billing: !!checked }
                          })
                        }
                      />
                      <Label htmlFor="billing">Billing Flow</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="delivery"
                        checked={newFlow.types.delivery}
                        onCheckedChange={(checked) => 
                          setNewFlow({
                            ...newFlow, 
                            types: { ...newFlow.types, delivery: !!checked }
                          })
                        }
                      />
                      <Label htmlFor="delivery">Delivery Flow</Label>
                    </div>
                  </div>
                </div>
                
                <Button onClick={createFlows} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Create Flow(s)
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Legend */}
      <Card className="p-4">
        <h4 className="font-semibold mb-2">Legend</h4>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-yellow-500"></div>
            <span className="text-sm">Billing Flow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-blue-500 border-dashed border-2 border-blue-500 bg-transparent"></div>
            <span className="text-sm">Delivery Flow</span>
          </div>
        </div>
      </Card>

      {/* Diagram Area */}
      <Card className="p-4">
        <div
          ref={diagramRef}
          className="relative w-full h-96 bg-gray-50 rounded border-2 border-dashed border-gray-200 overflow-hidden"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {participants.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No participants to display. Add participants in the first step.</p>
            </div>
          ) : (
            <>
              {/* SVG for flows */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
                  </marker>
                </defs>
                
                {flows.map((flow) => (
                  <g key={flow.id}>
                    <path
                      d={getFlowPath(flow)}
                      stroke={flow.type === 'billing' ? '#EAB308' : '#3B82F6'}
                      strokeWidth="2"
                      strokeDasharray={flow.type === 'delivery' ? '5,5' : 'none'}
                      fill="none"
                      markerEnd="url(#arrowhead)"
                    />
                  </g>
                ))}
              </svg>

              {/* Participants */}
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="absolute cursor-move select-none"
                  style={{
                    left: participant.x || 0,
                    top: participant.y || 0,
                    transform: draggedParticipant === participant.id ? 'scale(1.05)' : 'scale(1)',
                    zIndex: draggedParticipant === participant.id ? 10 : 1
                  }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, participant.id)}
                >
                  <div
                    className="w-32 h-16 rounded-lg border-2 border-white shadow-lg flex flex-col items-center justify-center text-white text-xs font-semibold p-2"
                    style={{ backgroundColor: participant.color }}
                  >
                    <div className="truncate w-full text-center">{participant.entityName}</div>
                    <div className="text-xs opacity-90">{participant.country}</div>
                    {participant.role && (
                      <Badge variant="secondary" className="text-xs mt-1 bg-white text-gray-800">
                        {participant.role.split(' ')[0]}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>💡 Drag participants to reposition them in the diagram</p>
        </div>
      </Card>

      {/* Flow Management */}
      {flows.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3">Active Flows ({flows.length})</h4>
          <div className="space-y-2">
            {flows.map((flow) => {
              const fromParticipant = participants.find(p => p.id === flow.from);
              const toParticipant = participants.find(p => p.id === flow.to);
              
              return (
                <div key={flow.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-1 ${
                        flow.type === 'billing' ? 'bg-yellow-500' : 'bg-blue-500'
                      } ${flow.type === 'delivery' ? 'border-dashed border-2 border-blue-500 bg-transparent' : ''}`}
                    />
                    <span className="text-sm">
                      {fromParticipant?.entityName} → {toParticipant?.entityName}
                    </span>
                    <Badge variant={flow.type === 'billing' ? 'default' : 'secondary'}>
                      {flow.type}
                    </Badge>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteFlow(flow.id)}
                  >
                    ×
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};
