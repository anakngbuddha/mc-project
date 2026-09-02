package providers

import (
	"bytes"
	"net/http"
	"strings"
	"testing"
)

func TestCanonicalURI(t *testing.T) {
	tests := []struct {
		name     string
		url      string
		expected string
	}{
		{
			name:     "standard path without trailing slash",
			url:      "https://ecs.ap-southeast-4.myhuaweicloud.com/v1/0b964be4/cloudservers/detail",
			expected: "/v1/0b964be4/cloudservers/detail/",
		},
		{
			name:     "standard path with trailing slash",
			url:      "https://ecs.ap-southeast-4.myhuaweicloud.com/v1/0b964be4/cloudservers/detail/",
			expected: "/v1/0b964be4/cloudservers/detail/",
		},
		{
			name:     "root path",
			url:      "https://ecs.ap-southeast-4.myhuaweicloud.com",
			expected: "/",
		},
		{
			name:     "root slash path",
			url:      "https://ecs.ap-southeast-4.myhuaweicloud.com/",
			expected: "/",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			req, err := http.NewRequest("GET", tc.url, nil)
			if err != nil {
				t.Fatalf("failed to create req: %v", err)
			}
			got := canonicalURI(req)
			if got != tc.expected {
				t.Errorf("expected canonicalURI %q, got %q", tc.expected, got)
			}
		})
	}
}

func TestHWSign(t *testing.T) {
	req, err := http.NewRequest("GET", "https://ecs.ap-southeast-4.myhuaweicloud.com/v1/asdsad/cloudservers/detail", nil)
	if err != nil {
		t.Fatalf("failed to create request: %v", err)
	}
	ak := "TEST_AK"
	sk := "TEST_SK"

	hwSign(req, ak, sk)

	auth := req.Header.Get("Authorization")
	if !strings.HasPrefix(auth, "SDK-HMAC-SHA256 Access=TEST_AK, SignedHeaders=host;x-sdk-date, Signature=") {
		t.Errorf("unexpected Authorization header format: %s", auth)
	}

	date := req.Header.Get("X-Sdk-Date")
	if date == "" {
		t.Errorf("missing X-Sdk-Date header")
	}

	host := req.Header.Get("Host")
	if host != "ecs.ap-southeast-4.myhuaweicloud.com" {
		t.Errorf("expected host ecs.ap-southeast-4.myhuaweicloud.com, got %s", host)
	}
}

func TestHWSignWithBody(t *testing.T) {
	body := []byte(`{"metrics":[]}`)
	req, err := http.NewRequest("POST", "https://ces.ap-southeast-4.myhuaweicloud.com/v1.0/asdsad/metric-data/batch-query", bytes.NewReader(body))
	if err != nil {
		t.Fatalf("failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")
	ak := "TEST_AK"
	sk := "TEST_SK"

	hwSign(req, ak, sk)

	auth := req.Header.Get("Authorization")
	if !strings.HasPrefix(auth, "SDK-HMAC-SHA256 Access=TEST_AK, SignedHeaders=host;x-sdk-date, Signature=") {
		t.Errorf("unexpected Authorization header format: %s", auth)
	}
}
