#!/bin/bash

# Travel Collection CSS 롤백 스크립트
# 기존 파일로 복원하는 안전한 롤백 도구

echo "🔄 Travel Collection CSS 롤백 시작..."

# 백업 파일 확인
if [ ! -f "backup/css/travel-collection-$(date +%Y%m%d)/travel-collection.css" ]; then
    echo "❌ 백업 파일을 찾을 수 없습니다. 수동으로 복원해주세요."
    exit 1
fi

# main.css 복원
echo "📝 main.css 복원 중..."
sed -i 's|@import url.*travel-collection.*|@import url('\''./pages/travel-collection.css'\'');|g' styles/main.css

# 기존 파일 복원
echo "📁 기존 travel-collection.css 복원 중..."
cp backup/css/travel-collection-$(date +%Y%m%d)/travel-collection.css styles/pages/travel-collection.css

# 임시 파일들 정리
echo "🧹 임시 파일들 정리 중..."
rm -f styles/pages/travel-collection-temp.css
rm -rf styles/pages/travel-collection/

echo "✅ 롤백 완료! 기존 상태로 복원되었습니다."
echo "🌐 브라우저를 새로고침하여 변경사항을 확인하세요."
