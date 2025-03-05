-- AlterTable
ALTER TABLE "HiringGoal" ADD COLUMN     "budget" DOUBLE PRECISION,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "priority" TEXT DEFAULT 'medium',
ADD COLUMN     "status" TEXT DEFAULT 'in_progress';

-- CreateTable
CREATE TABLE "HiringGoalRecruiter" (
    "id" SERIAL NOT NULL,
    "hiringGoalId" INTEGER NOT NULL,
    "recruiterId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HiringGoalRecruiter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HiringGoalRecruiter_recruiterId_idx" ON "HiringGoalRecruiter"("recruiterId");

-- CreateIndex
CREATE UNIQUE INDEX "HiringGoalRecruiter_hiringGoalId_recruiterId_key" ON "HiringGoalRecruiter"("hiringGoalId", "recruiterId");

-- AddForeignKey
ALTER TABLE "HiringGoalRecruiter" ADD CONSTRAINT "HiringGoalRecruiter_hiringGoalId_fkey" FOREIGN KEY ("hiringGoalId") REFERENCES "HiringGoal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiringGoalRecruiter" ADD CONSTRAINT "HiringGoalRecruiter_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
