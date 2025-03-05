-- DropForeignKey
ALTER TABLE "HiringGoal" DROP CONSTRAINT "HiringGoal_departmentId_fkey";

-- CreateTable
CREATE TABLE "CompletedHiringGoal" (
    "id" SERIAL NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "targetHeadcount" INTEGER NOT NULL,
    "actualHeadcount" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "achieved" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "year" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedBy" INTEGER,

    CONSTRAINT "CompletedHiringGoal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompletedHiringGoal_departmentId_idx" ON "CompletedHiringGoal"("departmentId");

-- CreateIndex
CREATE INDEX "CompletedHiringGoal_year_idx" ON "CompletedHiringGoal"("year");

-- CreateIndex
CREATE INDEX "HiringGoal_departmentId_idx" ON "HiringGoal"("departmentId");

-- AddForeignKey
ALTER TABLE "HiringGoal" ADD CONSTRAINT "HiringGoal_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompletedHiringGoal" ADD CONSTRAINT "CompletedHiringGoal_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;
