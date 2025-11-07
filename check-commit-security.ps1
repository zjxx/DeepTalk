# Git Pre-commit Security Check Script
# This script checks for sensitive information before committing

Write-Host "Checking files to be committed..." -ForegroundColor Cyan
Write-Host ""

# Check 1: Sensitive config files
Write-Host "Check 1: Sensitive config files..." -ForegroundColor Yellow
$sensitiveFiles = @(
    "frontend/.env.local",
    "backend/src/main/resources/application-local.yml",
    "test-openrouter-api.ps1"
)

$foundSensitive = $false
foreach ($file in $sensitiveFiles) {
    $status = git status --short $file 2>$null
    if ($status) {
        Write-Host "ERROR: Sensitive file found: $file" -ForegroundColor Red
        $foundSensitive = $true
    }
}

if (-not $foundSensitive) {
    Write-Host "PASS: No sensitive config files" -ForegroundColor Green
}
Write-Host ""

# Check 2: Search for API key patterns
Write-Host "Check 2: Searching for API keys..." -ForegroundColor Yellow
$apiKeyPatterns = @(
    "AIza[0-9A-Za-z_-]{35}",  # Gemini API密钥格式
    "sk-[0-9A-Za-z]{48}",      # OpenAI API密钥格式
    "hf_[0-9A-Za-z]{37}"       # HuggingFace API密钥格式
)

$foundKeys = $false
foreach ($pattern in $apiKeyPatterns) {
    # Search in staged area
    $results = git diff --cached | Select-String -Pattern $pattern
    if ($results) {
        Write-Host "ERROR: Found possible API key pattern!" -ForegroundColor Red
        Write-Host "   Pattern: $pattern" -ForegroundColor Red
        $foundKeys = $true
    }
}

if (-not $foundKeys) {
    Write-Host "PASS: No API key patterns found" -ForegroundColor Green
}
Write-Host ""

# Check 3: Check for hardcoded keys in config files
Write-Host "Check 3: Checking for hardcoded keys in config files..." -ForegroundColor Yellow
$configFiles = @(
    "backend/src/main/resources/application.yml",
    "backend/src/main/java/com/example/deeptalk/modules/community/service/AIReplyService.java",
    "frontend/src/services/GeminiService.ts"
)

$foundHardcoded = $false
foreach ($file in $configFiles) {
    # Check staged content
    $content = git diff --cached $file 2>$null
    if ($content) {
        # Check for newly added lines with actual keys
        $addedLines = $content | Select-String -Pattern "^\+.*AIza[0-9A-Za-z_-]{35}"
        if ($addedLines) {
            Write-Host "ERROR: Found hardcoded API key in $file!" -ForegroundColor Red
            $foundHardcoded = $true
        }
    }
}

if (-not $foundHardcoded) {
    Write-Host "PASS: No hardcoded keys in config files" -ForegroundColor Green
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
if ($foundSensitive -or $foundKeys -or $foundHardcoded) {
    Write-Host "Security check failed! Please fix the issues above." -ForegroundColor Red
    Write-Host ""
    Write-Host "Suggestions:" -ForegroundColor Yellow
    Write-Host "1. Add sensitive files to .gitignore" -ForegroundColor White
    Write-Host "2. Use environment variables or local config files for API keys" -ForegroundColor White
    Write-Host "3. Remove hardcoded keys from code" -ForegroundColor White
    Write-Host "4. Refer to API-KEY-SECURITY-SETUP.md" -ForegroundColor White
    Write-Host ""
    exit 1
} else {
    Write-Host "All security checks passed! Safe to commit." -ForegroundColor Green
    Write-Host ""
    Write-Host "Final checklist:" -ForegroundColor Yellow
    Write-Host "- No sensitive info in commit messages" -ForegroundColor White
    Write-Host "- No keys in code comments" -ForegroundColor White
    Write-Host ""
    exit 0
}
