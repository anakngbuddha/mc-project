FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod ./
RUN go mod download || true
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/collector .

FROM alpine:3.19 AS runner
WORKDIR /app
RUN apk --no-cache add ca-certificates tzdata && \
    addgroup -S appgroup -g 10001 && \
    adduser -S appuser -u 10001 -G appgroup
COPY --from=builder --chown=appuser:appgroup /app/collector /app/collector

USER 10001:10001
CMD ["/app/collector"]
