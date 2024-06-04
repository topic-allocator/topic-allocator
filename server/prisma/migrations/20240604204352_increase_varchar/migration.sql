/*
  Warnings:

  - You are about to alter the column `description` on the `topic` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `VarChar(4000)`.
  - You are about to alter the column `recommended_literature` on the `topic` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `VarChar(4000)`.
  - You are about to alter the column `research_question` on the `topic` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `VarChar(4000)`.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[topic] ALTER COLUMN [description] VARCHAR(4000) NOT NULL;
ALTER TABLE [dbo].[topic] ALTER COLUMN [recommended_literature] VARCHAR(4000) NULL;
ALTER TABLE [dbo].[topic] ALTER COLUMN [research_question] VARCHAR(4000) NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
