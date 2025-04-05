-- CreateTable
CREATE TABLE "Feature" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FeaturesOnTools" (
    "toolId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,

    PRIMARY KEY ("toolId", "featureId"),
    CONSTRAINT "FeaturesOnTools_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FeaturesOnTools_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Feature_slug_key" ON "Feature"("slug");

-- CreateIndex
CREATE INDEX "FeaturesOnTools_featureId_idx" ON "FeaturesOnTools"("featureId");

-- CreateIndex
CREATE INDEX "FeaturesOnTools_toolId_idx" ON "FeaturesOnTools"("toolId");
