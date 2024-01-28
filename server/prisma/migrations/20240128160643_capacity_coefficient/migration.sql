BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[instructor] ADD [capacity_coefficient] FLOAT(53) NOT NULL CONSTRAINT [instructor_capacity_coefficient_df] DEFAULT 1;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
