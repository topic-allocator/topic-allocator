BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[topic] ADD CONSTRAINT [topic_capacity_df] DEFAULT 1 FOR [capacity], CONSTRAINT [topic_type_df] DEFAULT 'normal' FOR [type];
ALTER TABLE [dbo].[topic] ADD [recommended_literature] NVARCHAR(1000),
[research_question] NVARCHAR(1000);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
