@echo off
echo Iniciando TopHitsBr...

start "TopHitsBr - Backend" cmd /k "cd server && echo Iniciando Servidor... && npm start"
timeout /t 3
start "TopHitsBr - Frontend" cmd /k "cd client && echo Iniciando Frontend... && npm run dev"

echo Tudo pronto! O navegador deve abrir em instantes.
pause
