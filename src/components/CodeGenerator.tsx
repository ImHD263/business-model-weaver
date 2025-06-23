
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Copy, Save } from 'lucide-react';
import type { BusinessModel } from '@/pages/Index';

interface CodeGeneratorProps {
  businessModel: BusinessModel;
  onNotification: (message: string) => void;
}

const programmingLanguages = [
  { id: 'javascript', name: 'JavaScript', extension: 'js' },
  { id: 'typescript', name: 'TypeScript', extension: 'ts' },
  { id: 'python', name: 'Python', extension: 'py' },
  { id: 'java', name: 'Java', extension: 'java' },
  { id: 'csharp', name: 'C#', extension: 'cs' },
  { id: 'json', name: 'JSON Schema', extension: 'json' }
];

const codeTemplates = {
  javascript: (model: BusinessModel) => `
// Business Model Implementation
class BusinessModel {
  constructor() {
    this.participants = ${JSON.stringify(model.participants.map(p => ({
      id: p.id,
      entityName: p.entityName,
      country: p.country,
      isBoschEntity: p.isBoschEntity,
      isEndCustomer: p.isEndCustomer,
      role: p.role
    })), null, 2)};
    
    this.flows = ${JSON.stringify(model.flows, null, 2)};
    
    this.financialInfo = ${JSON.stringify(model.financialInfo, null, 2)};
  }
  
  getParticipantById(id) {
    return this.participants.find(p => p.id === id);
  }
  
  getFlowsByParticipant(participantId) {
    return this.flows.filter(f => f.from === participantId || f.to === participantId);
  }
  
  getFinancialInfo(participantId) {
    return this.financialInfo.find(f => f.participantId === participantId);
  }
  
  validateBusinessModel() {
    const issues = [];
    
    // Check for unassigned roles
    const unassignedParticipants = this.participants.filter(p => !p.role);
    if (unassignedParticipants.length > 0) {
      issues.push(\`Participants without roles: \${unassignedParticipants.map(p => p.entityName).join(', ')}\`);
    }
    
    // Check for missing financial information
    const missingFinancials = this.participants.filter(p => 
      !this.financialInfo.some(f => f.participantId === p.id)
    );
    if (missingFinancials.length > 0) {
      issues.push(\`Missing financial info: \${missingFinancials.map(p => p.entityName).join(', ')}\`);
    }
    
    return issues;
  }
}

// Usage Example
const businessModel = new BusinessModel();
console.log('Business Model:', businessModel);
console.log('Validation Issues:', businessModel.validateBusinessModel());
`,

  typescript: (model: BusinessModel) => `
// Business Model Types
interface Participant {
  id: string;
  entityName: string;
  country: string;
  isBoschEntity: boolean;
  isEndCustomer: boolean;
  role?: string;
}

interface Flow {
  id: string;
  from: string;
  to: string;
  type: 'billing' | 'delivery';
  label?: string;
}

interface FinancialInfo {
  participantId: string;
  billingTo: string;
  pricingType: string;
  whtApplicable: boolean;
  vatGstApplicable: boolean;
  revenue: string;
}

// Business Model Implementation
class BusinessModel {
  private participants: Participant[];
  private flows: Flow[];
  private financialInfo: FinancialInfo[];
  
  constructor() {
    this.participants = ${JSON.stringify(model.participants.map(p => ({
      id: p.id,
      entityName: p.entityName,
      country: p.country,
      isBoschEntity: p.isBoschEntity,
      isEndCustomer: p.isEndCustomer,
      role: p.role
    })), null, 2)};
    
    this.flows = ${JSON.stringify(model.flows, null, 2)};
    
    this.financialInfo = ${JSON.stringify(model.financialInfo, null, 2)};
  }
  
  getParticipantById(id: string): Participant | undefined {
    return this.participants.find(p => p.id === id);
  }
  
  getFlowsByParticipant(participantId: string): Flow[] {
    return this.flows.filter(f => f.from === participantId || f.to === participantId);
  }
  
  getFinancialInfo(participantId: string): FinancialInfo | undefined {
    return this.financialInfo.find(f => f.participantId === participantId);
  }
  
  validateBusinessModel(): string[] {
    const issues: string[] = [];
    
    // Check for unassigned roles
    const unassignedParticipants = this.participants.filter(p => !p.role);
    if (unassignedParticipants.length > 0) {
      issues.push(\`Participants without roles: \${unassignedParticipants.map(p => p.entityName).join(', ')}\`);
    }
    
    // Check for missing financial information
    const missingFinancials = this.participants.filter(p => 
      !this.financialInfo.some(f => f.participantId === p.id)
    );
    if (missingFinancials.length > 0) {
      issues.push(\`Missing financial info: \${missingFinancials.map(p => p.entityName).join(', ')}\`);
    }
    
    return issues;
  }
}

// Usage Example
const businessModel = new BusinessModel();
console.log('Business Model:', businessModel);
console.log('Validation Issues:', businessModel.validateBusinessModel());
`,

  python: (model: BusinessModel) => `
from typing import List, Dict, Optional
from dataclasses import dataclass

@dataclass
class Participant:
    id: str
    entity_name: str
    country: str
    is_bosch_entity: bool
    is_end_customer: bool
    role: Optional[str] = None

@dataclass
class Flow:
    id: str
    from_participant: str
    to_participant: str
    flow_type: str  # 'billing' or 'delivery'
    label: Optional[str] = None

@dataclass
class FinancialInfo:
    participant_id: str
    billing_to: str
    pricing_type: str
    wht_applicable: bool
    vat_gst_applicable: bool
    revenue: str

class BusinessModel:
    def __init__(self):
        self.participants = [
${model.participants.map(p => `            Participant(
                id="${p.id}",
                entity_name="${p.entityName}",
                country="${p.country}",
                is_bosch_entity=${p.isBoschEntity ? 'True' : 'False'},
                is_end_customer=${p.isEndCustomer ? 'True' : 'False'},
                role="${p.role || ''}"
            )`).join(',\n')}
        ]
        
        self.flows = [
${model.flows.map(f => `            Flow(
                id="${f.id}",
                from_participant="${f.from}",
                to_participant="${f.to}",
                flow_type="${f.type}",
                label="${f.label || ''}"
            )`).join(',\n')}
        ]
        
        self.financial_info = [
${model.financialInfo.map(f => `            FinancialInfo(
                participant_id="${f.participantId}",
                billing_to="${f.billingTo}",
                pricing_type="${f.pricingType}",
                wht_applicable=${f.whtApplicable ? 'True' : 'False'},
                vat_gst_applicable=${f.vatGstApplicable ? 'True' : 'False'},
                revenue="${f.revenue}"
            )`).join(',\n')}
        ]
    
    def get_participant_by_id(self, participant_id: str) -> Optional[Participant]:
        return next((p for p in self.participants if p.id == participant_id), None)
    
    def get_flows_by_participant(self, participant_id: str) -> List[Flow]:
        return [f for f in self.flows if f.from_participant == participant_id or f.to_participant == participant_id]
    
    def get_financial_info(self, participant_id: str) -> Optional[FinancialInfo]:
        return next((f for f in self.financial_info if f.participant_id == participant_id), None)
    
    def validate_business_model(self) -> List[str]:
        issues = []
        
        # Check for unassigned roles
        unassigned_participants = [p for p in self.participants if not p.role]
        if unassigned_participants:
            issues.append(f"Participants without roles: {', '.join(p.entity_name for p in unassigned_participants)}")
        
        # Check for missing financial information
        missing_financials = [p for p in self.participants if not any(f.participant_id == p.id for f in self.financial_info)]
        if missing_financials:
            issues.append(f"Missing financial info: {', '.join(p.entity_name for p in missing_financials)}")
        
        return issues

# Usage Example
if __name__ == "__main__":
    business_model = BusinessModel()
    print("Business Model created successfully")
    print("Validation Issues:", business_model.validate_business_model())
`,

  java: (model: BusinessModel) => `
import java.util.*;

public class BusinessModel {
    
    public static class Participant {
        private String id;
        private String entityName;
        private String country;
        private boolean isBoschEntity;
        private boolean isEndCustomer;
        private String role;
        
        public Participant(String id, String entityName, String country, 
                         boolean isBoschEntity, boolean isEndCustomer, String role) {
            this.id = id;
            this.entityName = entityName;
            this.country = country;
            this.isBoschEntity = isBoschEntity;
            this.isEndCustomer = isEndCustomer;
            this.role = role;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public String getEntityName() { return entityName; }
        public String getCountry() { return country; }
        public boolean isBoschEntity() { return isBoschEntity; }
        public boolean isEndCustomer() { return isEndCustomer; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }
    
    public static class Flow {
        private String id;
        private String from;
        private String to;
        private String type;
        private String label;
        
        public Flow(String id, String from, String to, String type, String label) {
            this.id = id;
            this.from = from;
            this.to = to;
            this.type = type;
            this.label = label;
        }
        
        // Getters
        public String getId() { return id; }
        public String getFrom() { return from; }
        public String getTo() { return to; }
        public String getType() { return type; }
        public String getLabel() { return label; }
    }
    
    public static class FinancialInfo {
        private String participantId;
        private String billingTo;
        private String pricingType;
        private boolean whtApplicable;
        private boolean vatGstApplicable;
        private String revenue;
        
        public FinancialInfo(String participantId, String billingTo, String pricingType,
                           boolean whtApplicable, boolean vatGstApplicable, String revenue) {
            this.participantId = participantId;
            this.billingTo = billingTo;
            this.pricingType = pricingType;
            this.whtApplicable = whtApplicable;
            this.vatGstApplicable = vatGstApplicable;
            this.revenue = revenue;
        }
        
        // Getters
        public String getParticipantId() { return participantId; }
        public String getBillingTo() { return billingTo; }
        public String getPricingType() { return pricingType; }
        public boolean isWhtApplicable() { return whtApplicable; }
        public boolean isVatGstApplicable() { return vatGstApplicable; }
        public String getRevenue() { return revenue; }
    }
    
    private List<Participant> participants;
    private List<Flow> flows;
    private List<FinancialInfo> financialInfo;
    
    public BusinessModel() {
        initializeData();
    }
    
    private void initializeData() {
        participants = Arrays.asList(
${model.participants.map(p => `            new Participant("${p.id}", "${p.entityName}", "${p.country}", ${p.isBoschEntity}, ${p.isEndCustomer}, "${p.role || ''}")`).join(',\n')}
        );
        
        flows = Arrays.asList(
${model.flows.map(f => `            new Flow("${f.id}", "${f.from}", "${f.to}", "${f.type}", "${f.label || ''}")`).join(',\n')}
        );
        
        financialInfo = Arrays.asList(
${model.financialInfo.map(f => `            new FinancialInfo("${f.participantId}", "${f.billingTo}", "${f.pricingType}", ${f.whtApplicable}, ${f.vatGstApplicable}, "${f.revenue}")`).join(',\n')}
        );
    }
    
    public Optional<Participant> getParticipantById(String id) {
        return participants.stream().filter(p -> p.getId().equals(id)).findFirst();
    }
    
    public List<Flow> getFlowsByParticipant(String participantId) {
        return flows.stream()
                   .filter(f -> f.getFrom().equals(participantId) || f.getTo().equals(participantId))
                   .collect(Collectors.toList());
    }
    
    public Optional<FinancialInfo> getFinancialInfo(String participantId) {
        return financialInfo.stream()
                          .filter(f -> f.getParticipantId().equals(participantId))
                          .findFirst();
    }
    
    public List<String> validateBusinessModel() {
        List<String> issues = new ArrayList<>();
        
        // Check for unassigned roles
        List<Participant> unassigned = participants.stream()
                                                 .filter(p -> p.getRole() == null || p.getRole().isEmpty())
                                                 .collect(Collectors.toList());
        if (!unassigned.isEmpty()) {
            String names = unassigned.stream().map(Participant::getEntityName).collect(Collectors.joining(", "));
            issues.add("Participants without roles: " + names);
        }
        
        return issues;
    }
    
    public static void main(String[] args) {
        BusinessModel model = new BusinessModel();
        System.out.println("Business Model created successfully");
        System.out.println("Validation Issues: " + model.validateBusinessModel());
    }
}
`,

  csharp: (model: BusinessModel) => `
using System;
using System.Collections.Generic;
using System.Linq;

namespace BusinessModelNamespace
{
    public class Participant
    {
        public string Id { get; set; }
        public string EntityName { get; set; }
        public string Country { get; set; }
        public bool IsBoschEntity { get; set; }
        public bool IsEndCustomer { get; set; }
        public string Role { get; set; }
        
        public Participant(string id, string entityName, string country, 
                         bool isBoschEntity, bool isEndCustomer, string role = null)
        {
            Id = id;
            EntityName = entityName;
            Country = country;
            IsBoschEntity = isBoschEntity;
            IsEndCustomer = isEndCustomer;
            Role = role;
        }
    }
    
    public class Flow
    {
        public string Id { get; set; }
        public string From { get; set; }
        public string To { get; set; }
        public string Type { get; set; }
        public string Label { get; set; }
        
        public Flow(string id, string from, string to, string type, string label = null)
        {
            Id = id;
            From = from;
            To = to;
            Type = type;
            Label = label;
        }
    }
    
    public class FinancialInfo
    {
        public string ParticipantId { get; set; }
        public string BillingTo { get; set; }
        public string PricingType { get; set; }
        public bool WhtApplicable { get; set; }
        public bool VatGstApplicable { get; set; }
        public string Revenue { get; set; }
        
        public FinancialInfo(string participantId, string billingTo, string pricingType,
                           bool whtApplicable, bool vatGstApplicable, string revenue)
        {
            ParticipantId = participantId;
            BillingTo = billingTo;
            PricingType = pricingType;
            WhtApplicable = whtApplicable;
            VatGstApplicable = vatGstApplicable;
            Revenue = revenue;
        }
    }
    
    public class BusinessModel
    {
        private List<Participant> participants;
        private List<Flow> flows;
        private List<FinancialInfo> financialInfo;
        
        public BusinessModel()
        {
            InitializeData();
        }
        
        private void InitializeData()
        {
            participants = new List<Participant>
            {
${model.participants.map(p => `                new Participant("${p.id}", "${p.entityName}", "${p.country}", ${p.isBoschEntity ? 'true' : 'false'}, ${p.isEndCustomer ? 'true' : 'false'}, "${p.role || ''}")`).join(',\n')}
            };
            
            flows = new List<Flow>
            {
${model.flows.map(f => `                new Flow("${f.id}", "${f.from}", "${f.to}", "${f.type}", "${f.label || ''}")`).join(',\n')}
            };
            
            financialInfo = new List<FinancialInfo>
            {
${model.financialInfo.map(f => `                new FinancialInfo("${f.participantId}", "${f.billingTo}", "${f.pricingType}", ${f.whtApplicable ? 'true' : 'false'}, ${f.vatGstApplicable ? 'true' : 'false'}, "${f.revenue}")`).join(',\n')}
            };
        }
        
        public Participant GetParticipantById(string id)
        {
            return participants.FirstOrDefault(p => p.Id == id);
        }
        
        public List<Flow> GetFlowsByParticipant(string participantId)
        {
            return flows.Where(f => f.From == participantId || f.To == participantId).ToList();
        }
        
        public FinancialInfo GetFinancialInfo(string participantId)
        {
            return financialInfo.FirstOrDefault(f => f.ParticipantId == participantId);
        }
        
        public List<string> ValidateBusinessModel()
        {
            var issues = new List<string>();
            
            // Check for unassigned roles
            var unassigned = participants.Where(p => string.IsNullOrEmpty(p.Role)).ToList();
            if (unassigned.Any())
            {
                var names = string.Join(", ", unassigned.Select(p => p.EntityName));
                issues.Add($"Participants without roles: {names}");
            }
            
            return issues;
        }
        
        static void Main(string[] args)
        {
            var model = new BusinessModel();
            Console.WriteLine("Business Model created successfully");
            Console.WriteLine($"Validation Issues: {string.Join(", ", model.ValidateBusinessModel())}");
        }
    }
}
`,

  json: (model: BusinessModel) => JSON.stringify({
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "Business Model Schema",
    type: "object",
    properties: {
      participants: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            entityName: { type: "string" },
            country: { type: "string" },
            isBoschEntity: { type: "boolean" },
            isEndCustomer: { type: "boolean" },
            role: { type: "string" }
          },
          required: ["id", "entityName", "country", "isBoschEntity", "isEndCustomer"]
        }
      },
      flows: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            from: { type: "string" },
            to: { type: "string" },
            type: { enum: ["billing", "delivery"] },
            label: { type: "string" }
          },
          required: ["id", "from", "to", "type"]
        }
      },
      financialInfo: {
        type: "array",
        items: {
          type: "object",
          properties: {
            participantId: { type: "string" },
            billingTo: { type: "string" },
            pricingType: { type: "string" },
            whtApplicable: { type: "boolean" },
            vatGstApplicable: { type: "boolean" },
            revenue: { type: "string" }
          },
          required: ["participantId", "billingTo", "pricingType", "whtApplicable", "vatGstApplicable"]
        }
      }
    },
    required: ["participants", "flows", "financialInfo"],
    example: model
  }, null, 2)
};

export const CodeGenerator: React.FC<CodeGeneratorProps> = ({
  businessModel,
  onNotification
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [generatedCode, setGeneratedCode] = useState('');

  const generateCode = () => {
    if (businessModel.participants.length === 0) {
      onNotification('Please add participants before generating code');
      return;
    }

    const template = codeTemplates[selectedLanguage as keyof typeof codeTemplates];
    const code = template(businessModel);
    setGeneratedCode(code);
    onNotification(`Code generated successfully in ${programmingLanguages.find(l => l.id === selectedLanguage)?.name}`);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    onNotification('Code copied to clipboard');
  };

  const downloadCode = () => {
    const language = programmingLanguages.find(l => l.id === selectedLanguage);
    if (!language) return;

    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `business-model.${language.extension}`;
    link.click();
    URL.revokeObjectURL(url);
    onNotification('Code file downloaded');
  };

  const getBusinessModelSummary = () => {
    return {
      totalParticipants: businessModel.participants.length,
      assignedRoles: businessModel.participants.filter(p => p.role).length,
      totalFlows: businessModel.flows.length,
      billingFlows: businessModel.flows.filter(f => f.type === 'billing').length,
      deliveryFlows: businessModel.flows.filter(f => f.type === 'delivery').length,
      financialInfoCount: businessModel.financialInfo.length
    };
  };

  const summary = getBusinessModelSummary();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Code Generation</h3>
          <p className="text-gray-600">Generate implementation code from your business model</p>
        </div>
      </div>

      {/* Business Model Summary */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">Business Model Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{summary.totalParticipants}</div>
            <div className="text-sm text-gray-600">Participants</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{summary.assignedRoles}</div>
            <div className="text-sm text-gray-600">Assigned Roles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{summary.totalFlows}</div>
            <div className="text-sm text-gray-600">Total Flows</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{summary.billingFlows}</div>
            <div className="text-sm text-gray-600">Billing Flows</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{summary.deliveryFlows}</div>
            <div className="text-sm text-gray-600">Delivery Flows</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{summary.financialInfoCount}</div>
            <div className="text-sm text-gray-600">Financial Configs</div>
          </div>
        </div>
      </Card>

      {/* Code Generation Controls */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <Label htmlFor="language">Target Programming Language</Label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {programmingLanguages.map((lang) => (
                  <SelectItem key={lang.id} value={lang.id}>
                    {lang.name} (.{lang.extension})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={generateCode}
            disabled={businessModel.participants.length === 0}
            className="whitespace-nowrap"
          >
            Generate Code
          </Button>
        </div>
      </Card>

      {/* Generated Code */}
      {generatedCode && (
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">Generated Code</h4>
              <Badge variant="secondary">
                {programmingLanguages.find(l => l.id === selectedLanguage)?.name}
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={downloadCode}>
                <Save className="w-4 h-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
          
          <Textarea
            value={generatedCode}
            readOnly
            className="font-mono text-sm min-h-96 resize-none"
            placeholder="Generated code will appear here..."
          />
        </Card>
      )}

      {businessModel.participants.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No business model data available. Please complete the previous steps to generate code.</p>
        </Card>
      )}

      {/* Code Generation Tips */}
      <Card className="p-4 bg-blue-50">
        <h4 className="font-semibold mb-2">💡 Code Generation Tips</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• The generated code includes data models, validation logic, and utility methods</li>
          <li>• Each language implementation follows best practices for that language</li>
          <li>• The code includes examples of how to use the business model classes</li>
          <li>• JSON Schema can be used for API documentation and validation</li>
          <li>• Generated code can be customized and extended for your specific needs</li>
        </ul>
      </Card>
    </div>
  );
};
