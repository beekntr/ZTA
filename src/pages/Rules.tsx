import React from 'react';
import { ShieldCheck, Plus, ShieldBan } from 'lucide-react';
import { useRules } from '../hooks/useRules';
import { RulesTable } from '../components/rules/RulesTable';
import { AddRuleForm } from '../components/rules/AddRuleForm';
import { QuickBlockPanel } from '../components/rules/QuickBlockPanel';
import { Card, CardHeader } from '../components/ui/Card';

export const Rules: React.FC = () => {
  const { data, isLoading } = useRules();
  const rules = Array.isArray(data) ? data : [];
  const activeRules = rules.filter((r) => r.is_active);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Active rules */}
      <Card>
        <CardHeader
          title="Active Firewall Rules"
          subtitle={`${activeRules.length} rules enforced`}
          icon={<ShieldCheck className="w-4 h-4" />}
        />
        <RulesTable rules={rules} loading={isLoading} />
      </Card>

      {/* Add + Quick block */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Add New Rule"
            subtitle="Define custom firewall policy"
            icon={<Plus className="w-4 h-4" />}
          />
          <AddRuleForm />
        </Card>

        <Card>
          <CardHeader
            title="Quick Block"
            subtitle="Immediately block an IP address"
            icon={<ShieldBan className="w-4 h-4" />}
          />
          <QuickBlockPanel />
        </Card>
      </div>
    </div>
  );
};
