export type Resource = {
  resourceId: string;
  resourceType: string;
  provider: string;
};

export type Metric = {
  id: string;
  resourceId: string;
  resourceType?: string;
  provider?: string;
  metricName: string;
  value: number;
  unit: string | null;
  timestamp: string;
};

export type Alert = {
  id: string;
  ruleId?: string;
  resourceId: string;
  metricName: string;
  value: number;
  threshold: number;
  operator: string;
  triggeredAt: string;
};

export type Rule = {
  id: string;
  metricName: string;
  operator: string;
  threshold: number;
  resourceId?: string | null;
};

export type CloudAccount = {
  id: string;
  name: string;
  provider: "huawei" | "aws" | "azure";
  config: Record<string, any>;
  enabled: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type ResourceGroup = {
  resourceId: string;
  resourceType: string;
  provider: "huawei" | "aws" | "azure" | string;
  latestCpu?: number;
  latestMemory?: number;
  latestNetworkIn?: number;
  latestNetworkOut?: number;
  cpuHistory: { time: string; value: number }[];
  memoryHistory: { time: string; value: number }[];
  lastUpdated?: string;
  hasActiveAlert?: boolean;
};

export type FleetStats = {
  totalNodes: number;
  huaweiCount: number;
  awsCount: number;
  azureCount: number;
  avgCpu: number;
  avgMemory: number;
  activeAlertsCount: number;
  cloudAccountsCount: number;
};
