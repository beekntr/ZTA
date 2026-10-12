import React from 'react';
import { useRules } from '../hooks/useRules';
import { RulesTable } from '../components/rules/RulesTable';
import { AddRuleForm } from '../components/rules/AddRuleForm';
import { QuickBlockPanel } from '../components/rules/QuickBlockPanel';
import { Card, CardHeader } from '../components/ui/Card';
import { ReadOnlyNotice } from '../components/ui/ReadOnlyNotice';

export const Rules: React.FC = () => {
  const { data, isLoading } = useRules();
  const rules = Array.isArray(data) ? data : [];
  const activeRules = rules.filter((r) => r.is_active);

  return (
    <div className="space-y-6 animate-fade-in">
      <ReadOnlyNotice />

      <Card>
        <CardHeader
          title="Rules"
          subtitle={`${activeRules.length} active · ${rules.length - activeRules.length} inactive`}
        />
        <RulesTable rules={rules} loading={isLoading} />
      </Card>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader title="Add a rule" subtitle="Applied to nftables immediately" />
          <AddRuleForm />
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="Quick block" subtitle="Drop all traffic from one source" />
          <QuickBlockPanel />
        </Card>
      </div>
    </div>
  );
};
