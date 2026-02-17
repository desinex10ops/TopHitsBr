@echo off
cd /d "%~dp0"
echo ==========================================
echo      Iniciando TopHitsBr (Local)
echo ==========================================

echo.
echo [1/2] Iniciando Servidor Backend (Porta 3000)...
start "TopHitsBr - Backend" cmd /k "cd .. && cd server && npm install && npm start"

timeout /t 5 >nul

echo.
echo [2/2] Iniciando Site Frontend (Porta 5173)...
start "TopHitsBr - Frontend" cmd /k "cd .. && cd client && npm install && npm run dev"

echo.
echo TUDO PRONTO!
echo Se as janelas pretas permanecerem abertas, o sistema esta rodando.
echo Acesse no navegador: http://localhost:5173
echo.
pause
