package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"strconv"
	"time"

	"collector-service/providers"
)

type Metric = providers.Metric
type CloudAccount = providers.CloudAccount

type mockResource struct {
	id   string
	typ  string
	prov string
}

var mockResources = []mockResource{
	{id: "ecs-web-01", typ: "ecs", prov: "huawei"},
	{id: "ecs-db-01", typ: "ecs", prov: "huawei"},
	{id: "vm-app-01", typ: "vm", prov: "azure"},
}

func collectMock() []Metric {
	metrics := make([]Metric, 0, len(mockResources)*2)
	for _, r := range mockResources {
		cpu := 20 + rand.Float64()*40
		if rand.Float64() < 0.15 {
			cpu = 80 + rand.Float64()*20
		}
		metrics = append(metrics, Metric{
			ResourceID: r.id, ResourceType: r.typ, Provider: r.prov,
			MetricName: "cpu_percent", Value: round2(cpu), Unit: "percent",
		})

		mem := 30 + rand.Float64()*50
		metrics = append(metrics, Metric{
			ResourceID: r.id, ResourceType: r.typ, Provider: r.prov,
			MetricName: "memory_percent", Value: round2(mem), Unit: "percent",
		})
	}
	return metrics
}

func round2(v float64) float64 {
	return float64(int(v*100)) / 100
}

func postJSON(url string, payload any) error {
	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		return fmt.Errorf("%s returned status %d", url, resp.StatusCode)
	}
	return nil
}

func fetchCloudAccounts(url string) ([]CloudAccount, error) {
	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code %d", resp.StatusCode)
	}

	var accounts []CloudAccount
	if err := json.NewDecoder(resp.Body).Decode(&accounts); err != nil {
		return nil, err
	}
	return accounts, nil
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func run() {
	baseURL := getenv("HISTORY_SERVICE_BASE", "http://localhost:4000")
	historyURL := baseURL + "/metrics"
	accountsURL := baseURL + "/internal/cloud-accounts"
	alertURL := getenv("ALERT_SERVICE_URL", "http://localhost:5000/metrics")

	intervalSec, err := strconv.Atoi(getenv("POLL_INTERVAL_SECONDS", "10"))
	if err != nil {
		intervalSec = 10
	}

	log.Printf("collector-service starting, polling every %ds", intervalSec)
	log.Printf("  -> history-service: %s", historyURL)
	log.Printf("  -> cloud-accounts:  %s", accountsURL)
	log.Printf("  -> alert-service:   %s", alertURL)

	ticker := time.NewTicker(time.Duration(intervalSec) * time.Second)
	defer ticker.Stop()

	for {
		// 1. Fetch configured & active cloud accounts
		accounts, err := fetchCloudAccounts(accountsURL)
		var metrics []Metric

		if err != nil {
			log.Printf("[warning] Failed to fetch cloud accounts from history-service: %v (falling back to mock)", err)
			metrics = collectMock()
		} else if len(accounts) == 0 {
			// No accounts registered in UI -> fallback to synthetic mock data
			log.Printf("[info] No active cloud accounts configured in UI. Running mock generator.")
			metrics = collectMock()
		} else {
			log.Printf("[info] Polling metrics for %d active cloud account(s)", len(accounts))
			for _, acc := range accounts {
				var accMetrics []Metric
				var pollErr error

				switch acc.Provider {
				case "huawei":
					accMetrics, pollErr = providers.CollectHuawei(acc)
				case "aws":
					accMetrics, pollErr = providers.CollectAWS(acc)
				case "azure":
					accMetrics, pollErr = providers.CollectAzure(acc)
				default:
					log.Printf("[warning] Unknown provider: %s", acc.Provider)
				}

				if pollErr != nil {
					log.Printf("[error] Failed to collect metrics for %s (%s): %v", acc.Name, acc.Provider, pollErr)
				} else {
					metrics = append(metrics, accMetrics...)
				}
			}
		}

		if len(metrics) > 0 {
			// Batch to history-service
			if err := postJSON(historyURL, metrics); err != nil {
				log.Printf("failed to post batch to history-service: %v", err)
			}

			// alert-service evaluates one metric at a time
			for _, m := range metrics {
				if err := postJSON(alertURL, m); err != nil {
					log.Printf("failed to post metric to alert-service: %v", err)
				}
			}

			log.Printf("successfully collected + forwarded %d metrics", len(metrics))
		}

		<-ticker.C
	}
}

func main() {
	run()
}
