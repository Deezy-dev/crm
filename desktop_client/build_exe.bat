@echo off
echo ========================================================
echo   COMPILADOR GESTAO X DESKTOP - EXECUTAVEL WINDOWS
echo ========================================================
echo.
echo 1. Instalando dependencias necessarias...
pip install -r requirements.txt
echo.
echo 2. Compilando com PyInstaller (--onefile --windowed)...
pyinstaller --noconfirm --onefile --windowed --name "GestaoX_Desktop" --collect-all customtkinter main.py
echo.
echo ========================================================
echo   COMPILACAO CONCLUIDA!
echo   O executavel gerado encontra-se na pasta: dist\GestaoX_Desktop.exe
echo ========================================================
pause
