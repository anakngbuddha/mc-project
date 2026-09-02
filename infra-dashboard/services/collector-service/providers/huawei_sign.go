package providers

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"sort"
	"strings"
	"time"
)

const hwDateFmt = "20060102T150405Z"

// hwSign signs an HTTP request using Huawei Cloud AK/SK (SDK-HMAC-SHA256).
// Compatible with Huawei Cloud API Gateway signature specifications.
func hwSign(req *http.Request, ak, sk string) {
	now := time.Now().UTC()
	amzDate := now.Format(hwDateFmt)

	req.Header.Set("X-Sdk-Date", amzDate)
	if req.Header.Get("Host") == "" {
		if req.Host != "" {
			req.Header.Set("Host", req.Host)
		} else {
			req.Header.Set("Host", req.URL.Host)
		}
	}

	// 1. Canonical URI: Must start and end with a '/'
	uri := canonicalURI(req)

	// 2. Canonical Query String: Sorted query parameters
	var queryStr string
	if req.URL.RawQuery != "" {
		params := req.URL.Query()
		keys := make([]string, 0, len(params))
		for k := range params {
			keys = append(keys, k)
		}
		sort.Strings(keys)
		var pairs []string
		for _, k := range keys {
			vals := params[k]
			sort.Strings(vals)
			escapedKey := escapeRFC3986(k)
			for _, v := range vals {
				pairs = append(pairs, escapedKey+"="+escapeRFC3986(v))
			}
		}
		queryStr = strings.Join(pairs, "&")
	}

	// 3. Canonical Headers (host + x-sdk-date, sorted)
	signedHeaders := []string{"host", "x-sdk-date"}
	sort.Strings(signedHeaders)

	var canonHeaders strings.Builder
	for _, h := range signedHeaders {
		canonHeaders.WriteString(strings.ToLower(h))
		canonHeaders.WriteByte(':')
		canonHeaders.WriteString(strings.TrimSpace(getHeader(req, h)))
		canonHeaders.WriteByte('\n')
	}
	signedHeadersStr := strings.Join(signedHeaders, ";")

	// 4. Request Payload Hash
	bodyHash := "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" // SHA256("")
	if req.Body != nil {
		bodyBytes, err := io.ReadAll(req.Body)
		if err == nil {
			if len(bodyBytes) > 0 {
				bodyHash = hexSHA256(bodyBytes)
			}
			req.Body = io.NopCloser(bytes.NewReader(bodyBytes))
		}
	}

	// 5. Canonical Request
	canonReq := fmt.Sprintf("%s\n%s\n%s\n%s\n%s\n%s",
		req.Method,
		uri,
		queryStr,
		canonHeaders.String(),
		signedHeadersStr,
		bodyHash,
	)

	// 6. String to Sign
	strToSign := fmt.Sprintf("SDK-HMAC-SHA256\n%s\n%s", amzDate, hexSHA256([]byte(canonReq)))

	// 7. Calculate Signature using SK directly
	signature := hex.EncodeToString(hmacSHA256([]byte(sk), strToSign))

	// 8. Authorization Header
	auth := fmt.Sprintf(
		"SDK-HMAC-SHA256 Access=%s, SignedHeaders=%s, Signature=%s",
		ak, signedHeadersStr, signature,
	)
	req.Header.Set("Authorization", auth)
}

func canonicalURI(req *http.Request) string {
	path := req.URL.Path
	if path == "" {
		return "/"
	}
	segments := strings.Split(path, "/")
	var encoded []string
	for _, seg := range segments {
		encoded = append(encoded, escapeRFC3986(seg))
	}
	res := strings.Join(encoded, "/")
	if !strings.HasPrefix(res, "/") {
		res = "/" + res
	}
	if !strings.HasSuffix(res, "/") {
		res += "/"
	}
	return res
}

func escapeRFC3986(s string) string {
	encoded := url.QueryEscape(s)
	return strings.ReplaceAll(encoded, "+", "%20")
}

func getHeader(req *http.Request, key string) string {
	if strings.ToLower(key) == "host" {
		if h := req.Header.Get("Host"); h != "" {
			return h
		}
		if req.Host != "" {
			return req.Host
		}
		return req.URL.Host
	}
	return req.Header.Get(key)
}

func hexSHA256(data []byte) string {
	h := sha256.Sum256(data)
	return hex.EncodeToString(h[:])
}

func hmacSHA256(key []byte, data string) []byte {
	mac := hmac.New(sha256.New, key)
	mac.Write([]byte(data))
	return mac.Sum(nil)
}
