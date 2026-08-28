package providers

type Metric struct {
	ResourceID   string  `json:"resourceId"`
	ResourceType string  `json:"resourceType"`
	Provider     string  `json:"provider"`
	MetricName   string  `json:"metricName"`
	Value        float64 `json:"value"`
	Unit         string  `json:"unit,omitempty"`
}

type CloudAccount struct {
	ID          string                 `json:"id"`
	Name        string                 `json:"name"`
	Provider    string                 `json:"provider"`
	Credentials map[string]interface{} `json:"credentials"`
}
