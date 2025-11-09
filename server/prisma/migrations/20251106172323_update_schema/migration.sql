/*
  Warnings:

  - You are about to drop the column `subjects` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `divisionId` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the `ProfessorSubject` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name,semesterId,departmentId]` on the table `Division` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,semesterId,departmentId]` on the table `Subject` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Professor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Made the column `departmentId` on table `Student` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `code` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."ProfessorSubject" DROP CONSTRAINT "ProfessorSubject_professorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProfessorSubject" DROP CONSTRAINT "ProfessorSubject_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Student" DROP CONSTRAINT "Student_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Subject" DROP CONSTRAINT "Subject_divisionId_fkey";

-- DropIndex
DROP INDEX "public"."Division_semesterId_departmentId_idx";

-- DropIndex
DROP INDEX "public"."Subject_divisionId_semesterId_departmentId_idx";

-- DropIndex
DROP INDEX "public"."Subject_name_key";

-- AlterTable
ALTER TABLE "Professor" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "subjects",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "departmentId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Subject" DROP COLUMN "divisionId",
ADD COLUMN     "code" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."ProfessorSubject";

-- CreateTable
CREATE TABLE "DivisionSubjectAssignment" (
    "id" TEXT NOT NULL,
    "divisionId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "professorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DivisionSubjectAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DivisionSubjectAssignment_professorId_idx" ON "DivisionSubjectAssignment"("professorId");

-- CreateIndex
CREATE UNIQUE INDEX "DivisionSubjectAssignment_divisionId_subjectId_key" ON "DivisionSubjectAssignment"("divisionId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "Division_name_semesterId_departmentId_key" ON "Division"("name", "semesterId", "departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_name_semesterId_departmentId_key" ON "Subject"("name", "semesterId", "departmentId");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DivisionSubjectAssignment" ADD CONSTRAINT "DivisionSubjectAssignment_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DivisionSubjectAssignment" ADD CONSTRAINT "DivisionSubjectAssignment_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DivisionSubjectAssignment" ADD CONSTRAINT "DivisionSubjectAssignment_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Professor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
