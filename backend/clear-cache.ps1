# Clear Redis cache script
# Used to clear all post-related cache, force reload from database (will apply new avatars)

Write-Host "Starting to clear Redis cache..." -ForegroundColor Green

# Connect to Redis and clear related cache
try {
    # Use redis-cli to clear cache (assuming Redis is running locally)
    Write-Host "Clearing post list cache..." -ForegroundColor Yellow
    
    # Clear all keys starting with post:
    redis-cli --scan --pattern "post:*" | ForEach-Object {
        redis-cli DEL $_
        Write-Host "Deleted cache: $_" -ForegroundColor Gray
    }
    
    Write-Host "`nRedis cache cleared successfully!" -ForegroundColor Green
    Write-Host "Now restart the backend service, new avatars will take effect." -ForegroundColor Cyan
    
} catch {
    Write-Host "Failed to clear cache: $_" -ForegroundColor Red
    Write-Host "Please make sure Redis service is running and redis-cli is in PATH" -ForegroundColor Yellow
}
