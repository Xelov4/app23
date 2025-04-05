-- AlterTable
ALTER TABLE "Feature" ADD COLUMN "metaDescription" TEXT;
ALTER TABLE "Feature" ADD COLUMN "seoTitle" TEXT;

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN "metaDescription" TEXT;
ALTER TABLE "Tag" ADD COLUMN "seoTitle" TEXT;

-- CreateTable
CREATE TABLE "UserType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "seoTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UserTypesOnTools" (
    "toolId" TEXT NOT NULL,
    "userTypeId" TEXT NOT NULL,

    PRIMARY KEY ("toolId", "userTypeId"),
    CONSTRAINT "UserTypesOnTools_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserTypesOnTools_userTypeId_fkey" FOREIGN KEY ("userTypeId") REFERENCES "UserType" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "UserType_slug_key" ON "UserType"("slug");

-- CreateIndex
CREATE INDEX "UserTypesOnTools_userTypeId_idx" ON "UserTypesOnTools"("userTypeId");

-- CreateIndex
CREATE INDEX "UserTypesOnTools_toolId_idx" ON "UserTypesOnTools"("toolId");
