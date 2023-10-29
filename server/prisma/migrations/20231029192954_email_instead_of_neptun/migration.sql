/*
  Warnings:

  - You are about to drop the column `neptun` on the `instructor` table. All the data in the column will be lost.
  - You are about to drop the column `neptun` on the `student` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `instructor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `instructor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `student` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- DropIndex
ALTER TABLE [dbo].[instructor] DROP CONSTRAINT [instructor_neptun_key];

-- DropIndex
ALTER TABLE [dbo].[student] DROP CONSTRAINT [student_neptun_key];

-- AlterTable
ALTER TABLE [dbo].[instructor] DROP COLUMN [neptun];
ALTER TABLE [dbo].[instructor] ADD [email] NVARCHAR(1000) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[student] DROP COLUMN [neptun];
ALTER TABLE [dbo].[student] ADD [email] NVARCHAR(1000) NOT NULL;

-- CreateIndex
ALTER TABLE [dbo].[instructor] ADD CONSTRAINT [instructor_email_key] UNIQUE NONCLUSTERED ([email]);

-- CreateIndex
ALTER TABLE [dbo].[student] ADD CONSTRAINT [student_email_key] UNIQUE NONCLUSTERED ([email]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
