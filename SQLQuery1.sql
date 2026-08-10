IF DB_ID(N'OceanCommunityDb') IS NULL
    CREATE DATABASE OceanCommunityDb;
GO
USE OceanCommunityDb;
GO

CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    GoogleId NVARCHAR(255) NULL UNIQUE,
    DisplayName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) NULL UNIQUE,
    Role NVARCHAR(20) NOT NULL CONSTRAINT DF_Users_Role DEFAULT N'User',
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT SYSUTCDATETIME()
);

CREATE TABLE CreatureTemplates (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Type NVARCHAR(50) NOT NULL,
    OutlineImagePath NVARCHAR(500) NOT NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_Templates_Active DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Templates_CreatedAt DEFAULT SYSUTCDATETIME()
);

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

CREATE INDEX IX_ArtworkSubmissions_Status ON ArtworkSubmissions(Status);
GO

-- Nếu bạn đã chạy phiên bản SQL cũ, dòng dưới sẽ bổ sung cột đăng nhập cục bộ.
IF COL_LENGTH('Users', 'PasswordHash') IS NULL
    ALTER TABLE Users ADD PasswordHash NVARCHAR(500) NULL;
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
