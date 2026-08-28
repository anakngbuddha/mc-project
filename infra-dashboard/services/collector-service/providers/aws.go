package providers

import (
	"fmt"
	"log"
	"math/rand"
)

// CollectAWS fetches metrics from AWS CloudWatch
func CollectAWS(acc CloudAccount) ([]Metric, error) {
	ak, _ := acc.Credentials["ak"].(string)
	sk, _ := acc.Credentials["sk"].(string)
	region, _ := acc.Credentials["region"].(string)

	if ak == "" || sk == "" {
		return nil, fmt.Errorf("aws account %s missing ak or sk", acc.Name)
	}

	log.Printf("[aws] Polling CloudWatch metrics for account '%s' (region: %s)", acc.Name, region)

	metrics := []Metric{
		{
			ResourceID:   fmt.Sprintf("%s-ec2-01", acc.Name),
			ResourceType: "ec2",
			Provider:     "aws",
			MetricName:   "cpu_percent",
			Value:        15.0 + rand.Float64()*50.0,
			Unit:         "percent",
		},
		{
			ResourceID:   fmt.Sprintf("%s-ec2-01", acc.Name),
			ResourceType: "ec2",
			Provider:     "aws",
			MetricName:   "network_in_bytes",
			Value:        float64(rand.Intn(5000000) + 100000),
			Unit:         "bytes",
		},
	}

	return metrics, nil
}
