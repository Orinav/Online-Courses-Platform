@echo off
:: שורת הקסם: מבטיחה שהקובץ תמיד ירוץ מהתיקייה הנוכחית של הפרויקט
cd /d "%~dp0"

echo Starting Coursori Servers...

:: הפעלת השרת (Backend)
start "Coursori Backend" cmd /k "cd backend && npx tsx src/index.ts"

:: הפעלת צד הלקוח (Frontend) תוך כדי כפיית פורט ספציפי כדי שפייצ'ארם לא יפריע
start "Coursori Frontend" cmd /k "cd frontend && npm run dev -- --port 5173"

echo Servers are launching in separate windows...