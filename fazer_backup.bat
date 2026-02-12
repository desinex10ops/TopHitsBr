@echo off
echo ==========================================
echo      SISTEMA DE BACKUP TOP HITS BR
echo ==========================================
echo.
echo Inicializando repositorio se nao existir...
if not exist .git (
    git init
    echo Repositorio Git criado!
)

echo Adicionando arquivos...
git add .
git commit -m "Backup Automatico %date% %time%"

echo.
echo ==========================================
echo      BACKUP REALIZADO COM SUCESSO!
echo ==========================================
echo.
pause
