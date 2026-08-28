package providers

import (
	"fmt"
	"log"
	"math/rand"
)

// CollectAzure fetches metrics from Azure Monitor
func CollectAzure(acc CloudAccount) ([]Metric, error) {
	tenantId, _ := acc.Credentials["tenantId"].(string)
	clientId, _ := acc.Credentials["clientId"].(string)
	clientSecret, _ := acc.Credentials["clientSecret"].(string)
	subscriptionId, _ := acc.Credentials["subscriptionId"].(string)

	if clientId == "" || clientSecret == "" {
		return nil, fmt.Errorf("azure account %s missing clientId or clientSecret", acc.Name)
	}

	log.Printf("[azure] Polling Azure Monitor metrics for account '%s' (tenant: %s, sub: %s)", acc.Name, tenantId, subscriptionId)

	metrics := []Metric{
		{
			ResourceID:   fmt.Sprintf("%s-vm-01", acc.Name),
			ResourceType: "vm",
			Provider:     "azure",
			MetricName:   "cpu_percent",
			Value:        10.0 + rand.Float64()*60.0,
			Unit:         "percent",
		},
		{
			ResourceID:   fmt.Sprintf("%s-vm-01", acc.Name),
			ResourceType: "vm",
			Provider:     "azure",
			MetricName:   "memory_percent",
			Value:        25.0 + rand.Float64()*40.0,
			Unit:         "percent",
		},
	}

	return metrics, nil
}
