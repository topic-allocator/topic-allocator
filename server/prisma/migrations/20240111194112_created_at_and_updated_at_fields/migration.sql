/*
  Warnings:

  - Added the required column `updated_at` to the `course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `instructor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `student_course_completion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `student_topic_preference` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `topic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `topic_course_preference` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[course] ADD [created_at] DATETIME2 NOT NULL CONSTRAINT [course_created_at_df] DEFAULT CURRENT_TIMESTAMP,
[updated_at] DATETIME2 NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[instructor] ADD [created_at] DATETIME2 NOT NULL CONSTRAINT [instructor_created_at_df] DEFAULT CURRENT_TIMESTAMP,
[updated_at] DATETIME2 NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[student] ADD [created_at] DATETIME2 NOT NULL CONSTRAINT [student_created_at_df] DEFAULT CURRENT_TIMESTAMP,
[updated_at] DATETIME2 NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[student_course_completion] ALTER COLUMN [grade] FLOAT(53) NOT NULL;
ALTER TABLE [dbo].[student_course_completion] ADD [created_at] DATETIME2 NOT NULL CONSTRAINT [student_course_completion_created_at_df] DEFAULT CURRENT_TIMESTAMP,
[updated_at] DATETIME2 NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[student_topic_preference] ADD [created_at] DATETIME2 NOT NULL CONSTRAINT [student_topic_preference_created_at_df] DEFAULT CURRENT_TIMESTAMP,
[updated_at] DATETIME2 NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[topic] ADD [created_at] DATETIME2 NOT NULL CONSTRAINT [topic_created_at_df] DEFAULT CURRENT_TIMESTAMP,
[updated_at] DATETIME2 NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[topic_course_preference] ADD [created_at] DATETIME2 NOT NULL CONSTRAINT [topic_course_preference_created_at_df] DEFAULT CURRENT_TIMESTAMP,
[updated_at] DATETIME2 NOT NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
