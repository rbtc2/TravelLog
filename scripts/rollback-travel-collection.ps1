# Travel Collection CSS 롤백 스크립트 (PowerShell)
# 기존 파일로 복원하는 안전한 롤백 도구

Write-Host "🔄 Travel Collection CSS 롤백 시작..." -ForegroundColor Yellow

# 백업 파일 확인
$backupPath = "backup/css/travel-collection-$(Get-Date -Format 'yyyyMMdd')/travel-collection.css"
if (-not (Test-Path $backupPath)) {
    Write-Host "❌ 백업 파일을 찾을 수 없습니다. 수동으로 복원해주세요." -ForegroundColor Red
    exit 1
}

# main.css 복원
Write-Host "📝 main.css 복원 중..." -ForegroundColor Cyan
$mainCssPath = "styles/main.css"
$content = Get-Content $mainCssPath -Raw
$content = $content -replace '@import url.*travel-collection.*', '@import url(''./pages/travel-collection.css'');'
Set-Content $mainCssPath $content

# 기존 파일 복원
Write-Host "📁 기존 travel-collection.css 복원 중..." -ForegroundColor Cyan
Copy-Item $backupPath "styles/pages/travel-collection.css" -Force

# 임시 파일들 정리
Write-Host "🧹 임시 파일들 정리 중..." -ForegroundColor Cyan
Remove-Item "styles/pages/travel-collection-temp.css" -ErrorAction SilentlyContinue
Remove-Item "styles/pages/travel-collection/" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "✅ 롤백 완료! 기존 상태로 복원되었습니다." -ForegroundColor Green
Write-Host "🌐 브라우저를 새로고침하여 변경사항을 확인하세요." -ForegroundColor Blue
