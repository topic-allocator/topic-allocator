BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[student] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [neptun] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [student_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [student_neptun_key] UNIQUE NONCLUSTERED ([neptun])
);

-- CreateTable
CREATE TABLE [dbo].[instructor] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [neptun] NVARCHAR(1000) NOT NULL,
    [min] INT NOT NULL,
    [max] INT NOT NULL,
    [is_admin] BIT,
    CONSTRAINT [instructor_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [instructor_neptun_key] UNIQUE NONCLUSTERED ([neptun])
);

-- CreateTable
CREATE TABLE [dbo].[topic] (
    [id] INT NOT NULL IDENTITY(1,1),
    [title] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000) NOT NULL,
    [capacity] INT NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [instructor_id] INT NOT NULL,
    [language] NVARCHAR(1000) NOT NULL CONSTRAINT [topic_language_df] DEFAULT 'hu',
    CONSTRAINT [topic_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [topic_title_instructor_id_key] UNIQUE NONCLUSTERED ([title],[instructor_id])
);

-- CreateTable
CREATE TABLE [dbo].[course] (
    [id] INT NOT NULL IDENTITY(1,1),
    [code] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [credit] INT NOT NULL,
    CONSTRAINT [course_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [course_code_key] UNIQUE NONCLUSTERED ([code])
);

-- CreateTable
CREATE TABLE [dbo].[student_course_completion] (
    [student_id] INT NOT NULL,
    [course_id] INT NOT NULL,
    [grade] INT NOT NULL,
    CONSTRAINT [student_course_completion_pkey] PRIMARY KEY CLUSTERED ([student_id],[course_id])
);

-- CreateTable
CREATE TABLE [dbo].[student_topic_preference] (
    [student_id] INT NOT NULL,
    [topic_id] INT NOT NULL,
    [rank] INT NOT NULL,
    CONSTRAINT [student_topic_preference_pkey] PRIMARY KEY CLUSTERED ([student_id],[topic_id])
);

-- CreateTable
CREATE TABLE [dbo].[topic_course_preference] (
    [topic_id] INT NOT NULL,
    [course_id] INT NOT NULL,
    [weight] DECIMAL(32,16) NOT NULL,
    CONSTRAINT [topic_course_preference_pkey] PRIMARY KEY CLUSTERED ([topic_id],[course_id])
);

-- AddForeignKey
ALTER TABLE [dbo].[topic] ADD CONSTRAINT [topic_instructor_id_fkey] FOREIGN KEY ([instructor_id]) REFERENCES [dbo].[instructor]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[student_course_completion] ADD CONSTRAINT [student_course_completion_course_id_fkey] FOREIGN KEY ([course_id]) REFERENCES [dbo].[course]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[student_course_completion] ADD CONSTRAINT [student_course_completion_student_id_fkey] FOREIGN KEY ([student_id]) REFERENCES [dbo].[student]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[student_topic_preference] ADD CONSTRAINT [student_topic_preference_student_id_fkey] FOREIGN KEY ([student_id]) REFERENCES [dbo].[student]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[student_topic_preference] ADD CONSTRAINT [student_topic_preference_topic_id_fkey] FOREIGN KEY ([topic_id]) REFERENCES [dbo].[topic]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

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

