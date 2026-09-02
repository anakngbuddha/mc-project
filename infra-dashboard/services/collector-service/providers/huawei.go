package providers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"
)

// Huawei Cloud ECS / CES endpoint pattern:
//   https://ecs.<region>.myhuaweicloud.com
//   https://ces.<region>.myhuaweicloud.com

// CollectHuawei fetches real metrics from Huawei Cloud (ECS + CES / Cloud Eye).
// Project ID is optional — the API accepts requests scoped to the region token.
func CollectHuawei(acc CloudAccount) ([]Metric, error) {
	ak, _ := acc.Credentials["ak"].(string)
	sk, _ := acc.Credentials["sk"].(string)
	projectId, _ := acc.Credentials["projectId"].(string)
	regionStr, _ := acc.Credentials["region"].(string)

	if ak == "" || sk == "" {
		return nil, fmt.Errorf("huawei account %s: missing ak or sk", acc.Name)
	}
	if projectId == "" {
		return nil, fmt.Errorf("huawei account %s: missing projectId (required for Huawei Cloud API calls)", acc.Name)
	}
	if regionStr == "" {
		regionStr = "ap-southeast-3"
	}

	log.Printf("[huawei] Polling ECS+CES for account '%s' (region: %s, projectId: %q)", acc.Name, regionStr, projectId)

	client := &http.Client{Timeout: 15 * time.Second}

	// ── 1. List ECS servers ──────────────────────────────────────────────────
	servers, err := listECSServers(client, ak, sk, regionStr, projectId)
	if err != nil {
		return nil, fmt.Errorf("[huawei] ECS list failed: %w", err)
	}
	if len(servers) == 0 {
		log.Printf("[huawei] No ECS servers found in account '%s' (region: %s)", acc.Name, regionStr)
		return []Metric{}, nil
	}
	log.Printf("[huawei] Found %d ECS server(s) in account '%s'", len(servers), acc.Name)

	// ── 2. Fetch CES metrics for each server ─────────────────────────────────
	var metrics []Metric
	for _, srv := range servers {
		m, err := fetchCESMetrics(client, ak, sk, regionStr, projectId, srv.ID, srv.Name)
		if err != nil {
			log.Printf("[huawei] CES metrics failed for server '%s': %v", srv.Name, err)
			continue
		}
		metrics = append(metrics, m...)
	}

	log.Printf("[huawei] Collected %d real metric(s) for account '%s'", len(metrics), acc.Name)
	return metrics, nil
}

// ── ECS ──────────────────────────────────────────────────────────────────────

type ecsServer struct {
	ID   string
	Name string
}

func listECSServers(client *http.Client, ak, sk, region, projectId string) ([]ecsServer, error) {
	// Determine URL — projectId is embedded in path when provided
	var url string
	if projectId != "" {
		url = fmt.Sprintf("https://ecs.%s.myhuaweicloud.com/v1/%s/cloudservers/detail", region, projectId)
	} else {
		// Without project ID, use the v2 endpoint that accepts token-scoped requests
		url = fmt.Sprintf("https://ecs.%s.myhuaweicloud.com/v2/servers/detail", region)
	}

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	hwSign(req, ak, sk)

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("HTTP GET %s: %w", url, err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("ECS API returned %d: %s", resp.StatusCode, truncate(string(body), 500))
	}

	// Parse response — v1 wraps in {"servers":[]}, v2 same structure
	var result struct {
		Servers []struct {
			ID   string `json:"id"`
			Name string `json:"name"`
		} `json:"servers"`
	}
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("ECS response parse error: %w", err)
	}

	out := make([]ecsServer, 0, len(result.Servers))
	for _, s := range result.Servers {
		if s.ID != "" {
			out = append(out, ecsServer{ID: s.ID, Name: s.Name})
		}
	}
	return out, nil
}

// ── CES ──────────────────────────────────────────────────────────────────────

type cesMetricReq struct {
	Metrics []cesMetricInfo `json:"metrics"`
	From    int64           `json:"from"`
	To      int64           `json:"to"`
	Period  string          `json:"period"`
	Filter  string          `json:"filter"`
}

type cesMetricInfo struct {
	Namespace  string         `json:"namespace"`
	MetricName string         `json:"metric_name"`
	Dimensions []cesDimension `json:"dimensions"`
}

type cesDimension struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

type cesResponse struct {
	Metrics []struct {
		MetricName string `json:"metric_name"`
		Datapoints []struct {
			Average *float64 `json:"average"`
			Max     *float64 `json:"max"`
			Min     *float64 `json:"min"`
		} `json:"datapoints"`
	} `json:"metrics"`
}

func fetchCESMetrics(client *http.Client, ak, sk, region, projectId, serverID, serverName string) ([]Metric, error) {
	var url string
	if projectId != "" {
		url = fmt.Sprintf("https://ces.%s.myhuaweicloud.com/V1.0/%s/batch-query-metric-data", region, projectId)
	} else {
		url = fmt.Sprintf("https://ces.%s.myhuaweicloud.com/V1.0/batch-query-metric-data", region)
	}

	now := time.Now().UTC()
	fromMs := now.Add(-10 * time.Minute).UnixMilli()
	toMs := now.UnixMilli()

	dim := cesDimension{Name: "instance_id", Value: serverID}
	reqBody := cesMetricReq{
		From:   fromMs,
		To:     toMs,
		Period: "1",
		Filter: "average",
		Metrics: []cesMetricInfo{
			{Namespace: "SYS.ECS", MetricName: "cpu_util", Dimensions: []cesDimension{dim}},
			{Namespace: "SYS.ECS", MetricName: "mem_util", Dimensions: []cesDimension{dim}},
			{Namespace: "SYS.ECS", MetricName: "network_incoming_bytes_rate_inband", Dimensions: []cesDimension{dim}},
			{Namespace: "SYS.ECS", MetricName: "network_outgoing_bytes_rate_inband", Dimensions: []cesDimension{dim}},
		},
	}

	bodyBytes, _ := json.Marshal(reqBody)
	req, err := http.NewRequest("POST", url, bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	hwSign(req, ak, sk)

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("HTTP POST %s: %w", url, err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("CES API returned %d: %s", resp.StatusCode, truncate(string(respBody), 500))
	}

	var cesResp cesResponse
	if err := json.Unmarshal(respBody, &cesResp); err != nil {
		return nil, fmt.Errorf("CES response parse error: %w", err)
	}

	var metrics []Metric
	for _, m := range cesResp.Metrics {
		if len(m.Datapoints) == 0 {
			continue
		}
		latest := m.Datapoints[len(m.Datapoints)-1]
		val := latest.Average
		if val == nil {
			val = latest.Max
		}
		if val == nil {
			val = latest.Min
		}
		if val == nil {
			continue
		}
		metricName, unit := cesMetricToStd(m.MetricName)
		metrics = append(metrics, Metric{
			ResourceID:   serverName,
			ResourceType: "ecs",
			Provider:     "huawei",
			MetricName:   metricName,
			Value:        *val,
			Unit:         unit,
		})
	}
	return metrics, nil
}

// cesMetricToStd normalises Huawei CES metric names to dashboard-internal names.
func cesMetricToStd(cesName string) (metricName, unit string) {
	switch cesName {
	case "cpu_util":
		return "cpu_percent", "percent"
	case "mem_util":
		return "memory_percent", "percent"
	case "network_incoming_bytes_rate_inband":
		return "network_in_bytes", "bytes/s"
	case "network_outgoing_bytes_rate_inband":
		return "network_out_bytes", "bytes/s"
	default:
		return cesName, ""
	}
}

func truncate(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n] + "..."
}
