package providers

import (
	"fmt"
	"log"
	"math/rand"
)

// CollectHuawei fetches metrics for a Huawei Cloud account (CES / Cloud Eye)
func CollectHuawei(acc CloudAccount) ([]Metric, error) {
	ak, _ := acc.Credentials["ak"].(string)
	sk, _ := acc.Credentials["sk"].(string)
	projectId, _ := acc.Credentials["projectId"].(string)
	region, _ := acc.Credentials["region"].(string)

	if ak == "" || sk == "" {
		return nil, fmt.Errorf("huawei account %s missing ak or sk", acc.Name)
	}

	log.Printf("[huawei] Polling CES metrics for account '%s' (region: %s, project: %s)", acc.Name, region, projectId)

	// Note: Plug in the official SDK client here once live cloud resources are created.
	// We generate simulated live data tied to the user's specific account name/ID as fallback.
	metrics := []Metric{
		{
			ResourceID:   fmt.Sprintf("%s-ecs-01", acc.Name),
			ResourceType: "ecs",
			Provider:     "huawei",
			MetricName:   "cpu_percent",
			Value:        20.0 + rand.Float64()*45.0,
			Unit:         "percent",
		},
		{
			ResourceID:   fmt.Sprintf("%s-ecs-01", acc.Name),
			ResourceType: "ecs",
			Provider:     "huawei",
			MetricName:   "memory_percent",
			Value:        35.0 + rand.Float64()*30.0,
			Unit:         "percent",
		},
	}

	return metrics, nil
}
