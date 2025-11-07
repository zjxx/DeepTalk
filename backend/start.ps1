# DeepTalk 后端启动脚本 (Windows PowerShell)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DeepTalk Backend Startup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 切换到后端目录
$backendPath = "E:\deeptalk_zt\DeepTalk_zt\backend"
Set-Location $backendPath

Write-Host "[1/4] 检查Java环境..." -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1 | Select-Object -First 1
    Write-Host "✓ Java已安装: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ 错误: 未找到Java，请先安装JDK" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[2/4] 检查Maven环境..." -ForegroundColor Yellow
try {
    $mvnVersion = mvn -version 2>&1 | Select-Object -First 1
    Write-Host "✓ Maven已安装: $mvnVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ 错误: 未找到Maven，请先安装Maven" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[3/4] 检查MySQL服务..." -ForegroundColor Yellow
$mysqlService = Get-Service -Name "MySQL*" -ErrorAction SilentlyContinue

if ($mysqlService) {
    if ($mysqlService.Status -eq "Running") {
        Write-Host "✓ MySQL服务正在运行" -ForegroundColor Green
    } else {
        Write-Host "⚠ MySQL服务未运行，尝试启动..." -ForegroundColor Yellow
        try {
            Start-Service $mysqlService.Name
            Write-Host "✓ MySQL服务已启动" -ForegroundColor Green
        } catch {
            Write-Host "✗ 无法启动MySQL服务（权限不足或服务异常）" -ForegroundColor Red
            Write-Host "  请手动启动MySQL服务或以管理员身份运行此脚本" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "⚠ 未检测到MySQL服务" -ForegroundColor Yellow
    Write-Host "  如果使用外部MySQL，请确保数据库已启动并配置正确" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[4/4] 启动Spring Boot应用..." -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "正在运行: mvn spring-boot:run" -ForegroundColor Gray
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host ""
Write-Host "提示: 按 Ctrl+C 可以停止应用" -ForegroundColor Gray
Write-Host ""

# 启动Spring Boot应用
mvn spring-boot:run
