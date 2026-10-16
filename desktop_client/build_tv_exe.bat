@echo off
echo ========================================================
echo   COMPILADOR GESTAO X · MODULO TV POR CABO (.EXE)
echo ========================================================
echo.
echo 1. Verificando dependencias...
pip install -r requirements.txt
echo.
echo 2. Compilando executavel especializado para TV (GestaoX_TV.exe)...
pyinstaller --noconfirm --onefile --windowed --name "GestaoX_TV" --collect-all customtkinter main_tv.py
echo.
echo ========================================================
echo   COMPILACAO CONCLUIDA COM SUCESSO!
echo   Arquivo gerado: dist\GestaoX_TV.exe
echo ========================================================
pause
