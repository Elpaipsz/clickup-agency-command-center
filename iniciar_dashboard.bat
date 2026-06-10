@echo off
title Erika Dashboard Server
echo ============================================
echo Iniciando el Servidor del Dashboard de Erika...
echo ============================================
echo.

:: Obtener la ruta del directorio del script
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

:: Lanzar el servidor de desarrollo en segundo plano
start "" /b npm run dev

echo Servidor iniciado en segundo plano.
echo Abriendo el navegador en http://localhost:3000...
echo.

:: Esperar 3 segundos para que el servidor levante
timeout /t 3 /nobreak >nul

:: Abrir navegador predeterminado
start http://localhost:3000

echo Proceso terminado. Puedes minimizar esta ventana.
pause
