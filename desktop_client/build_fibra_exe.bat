@echo off
echo ========================================================
echo   COMPILADOR GESTAO X · MODULO INTERNET FIBRA (.EXE)
echo ========================================================
echo.
echo 1. Verificando dependencias...
pip install -r requirements.txt
echo.
echo 2. Compilando executavel especializado para Fibra (GestaoX_Fibra.exe)...
pyinstaller --noconfirm --onefile --windowed --name "GestaoX_Fibra" --collect-all customtkinter main_fibra.py
echo.
echo ========================================================
echo   COMPILACAO CONCLUIDA COM SUCESSO!
echo   Arquivo gerado: dist\GestaoX_Fibra.exe
echo ========================================================
pause
