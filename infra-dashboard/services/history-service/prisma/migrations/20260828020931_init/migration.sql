-- CreateTable
CREATE TABLE "Metric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resourceId" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "unit" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Metric_resourceId_metricName_timestamp_idx" ON "Metric"("resourceId", "metricName", "timestamp");
