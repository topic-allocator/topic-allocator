BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[student] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [assigned_topic_id] NVARCHAR(1000),
    CONSTRAINT [student_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [student_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[instructor] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [min] INT NOT NULL,
    [max] INT NOT NULL,
    [is_admin] BIT,
    CONSTRAINT [instructor_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [instructor_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[topic] (
    [id] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000) NOT NULL,
    [capacity] INT NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [instructor_id] NVARCHAR(1000) NOT NULL,
    [language] NVARCHAR(1000) NOT NULL CONSTRAINT [topic_language_df] DEFAULT 'hu',
    CONSTRAINT [topic_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [topic_title_instructor_id_key] UNIQUE NONCLUSTERED ([title],[instructor_id])
);

-- CreateTable
CREATE TABLE [dbo].[course] (
    [id] NVARCHAR(1000) NOT NULL,
    [code] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [credit] INT NOT NULL,
    CONSTRAINT [course_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [course_code_key] UNIQUE NONCLUSTERED ([code])
);

-- CreateTable
CREATE TABLE [dbo].[student_course_completion] (
    [student_id] NVARCHAR(1000) NOT NULL,
    [course_id] NVARCHAR(1000) NOT NULL,
    [grade] INT NOT NULL,
    CONSTRAINT [student_course_completion_pkey] PRIMARY KEY CLUSTERED ([student_id],[course_id])
);

-- CreateTable
CREATE TABLE [dbo].[student_topic_preference] (
    [student_id] NVARCHAR(1000) NOT NULL,
    [topic_id] NVARCHAR(1000) NOT NULL,
    [rank] INT NOT NULL,
    CONSTRAINT [student_topic_preference_pkey] PRIMARY KEY CLUSTERED ([student_id],[topic_id])
);

-- CreateTable
CREATE TABLE [dbo].[topic_course_preference] (
    [topic_id] NVARCHAR(1000) NOT NULL,
    [course_id] NVARCHAR(1000) NOT NULL,
    [weight] DECIMAL(32,16) NOT NULL,
    CONSTRAINT [topic_course_preference_pkey] PRIMARY KEY CLUSTERED ([topic_id],[course_id])
);

-- AddForeignKey
ALTER TABLE [dbo].[student] ADD CONSTRAINT [student_assigned_topic_id_fkey] FOREIGN KEY ([assigned_topic_id]) REFERENCES [dbo].[topic]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[topic] ADD CONSTRAINT [topic_instructor_id_fkey] FOREIGN KEY ([instructor_id]) REFERENCES [dbo].[instructor]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[student_course_completion] ADD CONSTRAINT [student_course_completion_course_id_fkey] FOREIGN KEY ([course_id]) REFERENCES [dbo].[course]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[student_course_completion] ADD CONSTRAINT [student_course_completion_student_id_fkey] FOREIGN KEY ([student_id]) REFERENCES [dbo].[student]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[student_topic_preference] ADD CONSTRAINT [student_topic_preference_student_id_fkey] FOREIGN KEY ([student_id]) REFERENCES [dbo].[student]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[student_topic_preference] ADD CONSTRAINT [student_topic_preference_topic_id_fkey] FOREIGN KEY ([topic_id]) REFERENCES [dbo].[topic]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[topic_course_preference] ADD CONSTRAINT [topic_course_preference_course_id_fkey] FOREIGN KEY ([course_id]) REFERENCES [dbo].[course]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[topic_course_preference] ADD CONSTRAINT [topic_course_preference_topic_id_fkey] FOREIGN KEY ([topic_id]) REFERENCES [dbo].[topic]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
