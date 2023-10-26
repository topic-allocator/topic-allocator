BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[student_topic_preference] DROP CONSTRAINT [student_topic_preference_topic_id_fkey];

-- AlterTable
ALTER TABLE [dbo].[student] ADD [assigned_topic_id] INT;

-- AddForeignKey
ALTER TABLE [dbo].[student] ADD CONSTRAINT [student_assigned_topic_id_fkey] FOREIGN KEY ([assigned_topic_id]) REFERENCES [dbo].[topic]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[student_topic_preference] ADD CONSTRAINT [student_topic_preference_topic_id_fkey] FOREIGN KEY ([topic_id]) REFERENCES [dbo].[topic]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
