IF DB_ID(N'OceanCommunityDb') IS NULL
    CREATE DATABASE OceanCommunityDb;
GO
USE OceanCommunityDb;
GO

IF OBJECT_ID('Users', 'U') IS NULL
BEGIN
    CREATE TABLE Users (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        GoogleId NVARCHAR(255) NULL,
        DisplayName NVARCHAR(100) NOT NULL,
        Email NVARCHAR(255) NULL UNIQUE,
        PasswordHash NVARCHAR(500) NULL,
        Role NVARCHAR(20) NOT NULL CONSTRAINT DF_Users_Role DEFAULT N'User',
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT SYSUTCDATETIME()
    );
END
GO

-- Index lọc cho GoogleId (cho phép nhiều tài khoản có GoogleId là NULL)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_GoogleId' AND object_id = OBJECT_ID('Users'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX IX_Users_GoogleId ON Users(GoogleId) WHERE GoogleId IS NOT NULL;
END
GO

-- Bổ sung cột PasswordHash nếu DB cũ chưa có
IF COL_LENGTH('Users', 'PasswordHash') IS NULL
BEGIN
    ALTER TABLE Users ADD PasswordHash NVARCHAR(500) NULL;
END
GO

IF OBJECT_ID('CreatureTemplates', 'U') IS NULL
BEGIN
    CREATE TABLE CreatureTemplates (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL,
        Type NVARCHAR(50) NOT NULL,
        OutlineImagePath NVARCHAR(500) NOT NULL,
        IsActive BIT NOT NULL CONSTRAINT DF_Templates_Active DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Templates_CreatedAt DEFAULT SYSUTCDATETIME()
    );
END
GO

IF OBJECT_ID('ArtworkSubmissions', 'U') IS NULL
BEGIN
    CREATE TABLE ArtworkSubmissions (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        TemplateId INT NOT NULL,
        Title NVARCHAR(120) NULL,
        ImagePath NVARCHAR(500) NOT NULL,
        Status NVARCHAR(20) NOT NULL CONSTRAINT DF_Submissions_Status DEFAULT N'Pending',
        ReviewNote NVARCHAR(500) NULL,
        ReviewedAt DATETIME2 NULL,
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Submissions_CreatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Submissions_User FOREIGN KEY (UserId) REFERENCES Users(Id),
        CONSTRAINT FK_Submissions_Template FOREIGN KEY (TemplateId) REFERENCES CreatureTemplates(Id),
        CONSTRAINT CK_Submissions_Status CHECK (Status IN (N'Pending', N'Approved', N'Rejected', N'RemovedFromOcean'))
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ArtworkSubmissions_Status' AND object_id = OBJECT_ID('ArtworkSubmissions'))
BEGIN
    CREATE INDEX IX_ArtworkSubmissions_Status ON ArtworkSubmissions(Status);
END
GO

IF NOT EXISTS (SELECT 1 FROM CreatureTemplates)
BEGIN
    INSERT INTO CreatureTemplates (Name, Type, OutlineImagePath)
    VALUES
        (N'Cá cầu vồng', N'Fish', N'/images/templates/fish.svg'),
        (N'Rùa nhỏ', N'Turtle', N'/images/templates/turtle.svg'),
        (N'Sao biển ấm áp', N'Starfish', N'/images/templates/starfish.svg');
END
GO

-- Sau khi tự tạo tài khoản, chạy lệnh này để cấp quyền vào trang /Admin:
-- UPDATE Users SET Role = N'Admin' WHERE Email = N'email-cua-ban@example.com';
