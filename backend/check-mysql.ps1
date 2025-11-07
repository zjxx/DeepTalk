# ============================================
# DeepTalk MySQL环境检查与配置脚本
# ============================================
# 功能：
# 1. 检查MySQL是否安装
# 2. 检查MySQL服务是否运行
# 3. 自动创建数据库
# 4. 验证配置文件
# 5. 编译项目并下载MySQL驱动
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   DeepTalk MySQL环境检查工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 步骤1：检查MySQL是否安装
Write-Host "[1/6] 检查MySQL安装..." -ForegroundColor Yellow

$mysqlPaths = @(
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe",
    "C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\mysql\bin\mysql.exe"
)

$mysqlExe = $null
foreach ($path in $mysqlPaths) {
    if (Test-Path $path) {
        $mysqlExe = $path
        Write-Host "   ✓ 找到MySQL: $path" -ForegroundColor Green
        break
    }
}

if (-not $mysqlExe) {
    # 尝试从PATH中查找
    try {
        $mysqlExe = (Get-Command mysql -ErrorAction Stop).Source
        Write-Host "   ✓ 从PATH找到MySQL: $mysqlExe" -ForegroundColor Green
    } catch {
        Write-Host "   ✗ 未找到MySQL安装" -ForegroundColor Red
        Write-Host "   请先安装MySQL: https://dev.mysql.com/downloads/mysql/" -ForegroundColor Yellow
        exit 1
    }
}

# 步骤2：检查MySQL服务状态
Write-Host "`n[2/6] 检查MySQL服务状态..." -ForegroundColor Yellow

$mysqlServices = Get-Service | Where-Object { $_.Name -like "MySQL*" }

if ($mysqlServices.Count -eq 0) {
    Write-Host "   ✗ 未找到MySQL服务" -ForegroundColor Red
    Write-Host "   请检查MySQL是否正确安装" -ForegroundColor Yellow
    exit 1
}

$runningService = $mysqlServices | Where-Object { $_.Status -eq "Running" } | Select-Object -First 1

if ($runningService) {
    Write-Host "   ✓ MySQL服务正在运行: $($runningService.Name)" -ForegroundColor Green
} else {
    Write-Host "   ⚠ MySQL服务未运行" -ForegroundColor Yellow
    Write-Host "   正在尝试启动MySQL服务..." -ForegroundColor Yellow
    
    $serviceToStart = $mysqlServices | Select-Object -First 1
    try {
        Start-Service $serviceToStart.Name -ErrorAction Stop
        Write-Host "   ✓ MySQL服务启动成功" -ForegroundColor Green
    } catch {
        Write-Host "   ✗ 无法启动MySQL服务（需要管理员权限）" -ForegroundColor Red
        Write-Host "   请手动启动服务或以管理员身份运行此脚本" -ForegroundColor Yellow
        exit 1
    }
}

# 步骤3：创建数据库
Write-Host "`n[3/6] 创建数据库..." -ForegroundColor Yellow

Write-Host "   请输入MySQL root密码（默认：DeepTalk@2024）: " -ForegroundColor Cyan -NoNewline
$password = Read-Host -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

if ([string]::IsNullOrWhiteSpace($passwordPlain)) {
    $passwordPlain = "DeepTalk@2024"
    Write-Host "   使用默认密码: DeepTalk@2024" -ForegroundColor Gray
}

$sqlScript = @"
CREATE DATABASE IF NOT EXISTS deeptalk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SELECT 'Database created successfully!' as Status;
SHOW DATABASES LIKE 'deeptalk';
"@

$tempSqlFile = [System.IO.Path]::GetTempFileName() + ".sql"
$sqlScript | Out-File -FilePath $tempSqlFile -Encoding UTF8

try {
    & $mysqlExe -u root "-p$passwordPlain" -e "source $tempSqlFile" 2>&1 | Out-Null
    
    # 验证数据库是否创建成功
    $checkDb = & $mysqlExe -u root "-p$passwordPlain" -e "SHOW DATABASES LIKE 'deeptalk';" 2>&1
    
    if ($checkDb -match "deeptalk") {
        Write-Host "   ✓ 数据库 'deeptalk' 创建成功" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ 数据库可能已存在或创建失败" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ✗ 数据库创建失败: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   请检查MySQL密码是否正确" -ForegroundColor Yellow
} finally {
    Remove-Item $tempSqlFile -ErrorAction SilentlyContinue
}

# 步骤4：验证配置文件
Write-Host "`n[4/6] 验证配置文件..." -ForegroundColor Yellow

$backendPath = Split-Path -Parent $PSScriptRoot
$configFile = Join-Path $backendPath "src\main\resources\application.yml"
$pomFile = Join-Path $backendPath "pom.xml"

if (Test-Path $configFile) {
    $configContent = Get-Content $configFile -Raw
    if ($configContent -match "mysql") {
        Write-Host "   ✓ application.yml 已配置MySQL" -ForegroundColor Green
    } else {
        Write-Host "   ✗ application.yml 仍为PostgreSQL配置" -ForegroundColor Red
    }
} else {
    Write-Host "   ✗ 找不到配置文件: $configFile" -ForegroundColor Red
}

if (Test-Path $pomFile) {
    $pomContent = Get-Content $pomFile -Raw
    if ($pomContent -match "mysql-connector") {
        Write-Host "   ✓ pom.xml 已配置MySQL驱动" -ForegroundColor Green
    } else {
        Write-Host "   ✗ pom.xml 仍为PostgreSQL驱动" -ForegroundColor Red
    }
} else {
    Write-Host "   ✗ 找不到pom.xml: $pomFile" -ForegroundColor Red
}

# 步骤5：编译项目
Write-Host "`n[5/6] 编译项目并下载MySQL驱动..." -ForegroundColor Yellow

Push-Location $backendPath

try {
    Write-Host "   正在执行: mvn clean compile" -ForegroundColor Gray
    $compileOutput = & mvn clean compile 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ 项目编译成功" -ForegroundColor Green
    } else {
        Write-Host "   ✗ 项目编译失败" -ForegroundColor Red
        Write-Host "   详细信息请查看编译输出" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ✗ Maven命令执行失败: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    Pop-Location
}

# 步骤6：显示后续步骤
Write-Host "`n[6/6] 后续操作指南" -ForegroundColor Yellow
Write-Host "   ========================================" -ForegroundColor Cyan
Write-Host "   ✓ MySQL环境检查完成" -ForegroundColor Green
Write-Host ""
Write-Host "   下一步操作：" -ForegroundColor White
Write-Host "   1. 启动后端项目：" -ForegroundColor White
Write-Host "      cd backend" -ForegroundColor Gray
Write-Host "      mvn spring-boot:run" -ForegroundColor Gray
Write-Host ""
Write-Host "   2. 验证表是否自动创建：" -ForegroundColor White
Write-Host "      mysql -u root -p" -ForegroundColor Gray
Write-Host "      USE deeptalk;" -ForegroundColor Gray
Write-Host "      SHOW TABLES;" -ForegroundColor Gray
Write-Host ""
Write-Host "   3. 预期看到6个表：" -ForegroundColor White
Write-Host "      - users (用户表)" -ForegroundColor Gray
Write-Host "      - products (商品表)" -ForegroundColor Gray
Write-Host "      - orders (订单表)" -ForegroundColor Gray
Write-Host "      - user_models (用户模型表)" -ForegroundColor Gray
Write-Host "      - posts (帖子表)" -ForegroundColor Gray
Write-Host "      - post_likes (点赞表)" -ForegroundColor Gray
Write-Host "   ========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "按任意键退出..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
