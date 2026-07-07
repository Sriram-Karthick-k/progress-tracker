-- CreateTable
CREATE TABLE "Progress" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "confidence" INTEGER NOT NULL DEFAULT 0,
    "revisit" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT NOT NULL DEFAULT '',
    "updatedAt" DATETIME NOT NULL
);
