-- CreateTable
CREATE TABLE "Search" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "keyword" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "seoTitle" TEXT,
    "metaDescription" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "searchCount" INTEGER NOT NULL DEFAULT 0,
    "lastSearchedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SearchData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "searchId" TEXT NOT NULL,
    "searchTerm" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "lastSearchedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SearchData_searchId_fkey" FOREIGN KEY ("searchId") REFERENCES "Search" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ToolsOnSearches" (
    "toolId" TEXT NOT NULL,
    "searchId" TEXT NOT NULL,
    "relevance" REAL NOT NULL DEFAULT 1.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("toolId", "searchId"),
    CONSTRAINT "ToolsOnSearches_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ToolsOnSearches_searchId_fkey" FOREIGN KEY ("searchId") REFERENCES "Search" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tool" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "logoUrl" TEXT,
    "websiteUrl" TEXT NOT NULL,
    "features" TEXT NOT NULL,
    "pricingType" TEXT NOT NULL,
    "pricingDetails" TEXT,
    "rating" REAL,
    "reviewCount" INTEGER,
    "httpCode" INTEGER,
    "twitterUrl" TEXT,
    "instagramUrl" TEXT,
    "facebookUrl" TEXT,
    "linkedinUrl" TEXT,
    "githubUrl" TEXT,
    "youtubeUrl" TEXT,
    "appStoreUrl" TEXT,
    "playStoreUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "httpChain" TEXT,
    "affiliateUrl" TEXT,
    "hasAffiliateProgram" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Tool" ("createdAt", "description", "facebookUrl", "features", "githubUrl", "httpChain", "httpCode", "id", "instagramUrl", "isActive", "linkedinUrl", "logoUrl", "name", "pricingDetails", "pricingType", "rating", "reviewCount", "slug", "twitterUrl", "updatedAt", "websiteUrl") SELECT "createdAt", "description", "facebookUrl", "features", "githubUrl", "httpChain", "httpCode", "id", "instagramUrl", "isActive", "linkedinUrl", "logoUrl", "name", "pricingDetails", "pricingType", "rating", "reviewCount", "slug", "twitterUrl", "updatedAt", "websiteUrl" FROM "Tool";
DROP TABLE "Tool";
ALTER TABLE "new_Tool" RENAME TO "Tool";
CREATE UNIQUE INDEX "Tool_slug_key" ON "Tool"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Search_keyword_key" ON "Search"("keyword");

-- CreateIndex
CREATE UNIQUE INDEX "Search_slug_key" ON "Search"("slug");

-- CreateIndex
CREATE INDEX "SearchData_searchId_idx" ON "SearchData"("searchId");

-- CreateIndex
CREATE INDEX "ToolsOnSearches_searchId_idx" ON "ToolsOnSearches"("searchId");

-- CreateIndex
CREATE INDEX "ToolsOnSearches_toolId_idx" ON "ToolsOnSearches"("toolId");
