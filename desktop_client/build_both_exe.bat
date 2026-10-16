@echo off
echo ========================================================
echo   COMPILADOR GESTAO X · GERAR OS DOIS EXECUTAVEIS (.EXE)
echo   1. GestaoX_TV.exe    (Modulo TV a Cabo)
echo   2. GestaoX_Fibra.exe (Modulo Internet Fibra)
echo ========================================================
echo.
echo Instalando dependencias necessarias...
pip install -r requirements.txt
echo.
echo [1/2] Compilando GestaoX_TV.exe...
pyinstaller --noconfirm --onefile --windowed --name "GestaoX_TV" --collect-all customtkinter main_tv.py
echo.
echo [2/2] Compilando GestaoX_Fibra.exe...
pyinstaller --noconfirm --onefile --windowed --name "GestaoX_Fibra" --collect-all customtkinter main_fibra.py
echo.
echo ========================================================
echo   TODOS OS EXECUTAVEIS FORAM GERADOS COM SUCESSO!
echo   Pasta de saida: dist\
echo     - dist\GestaoX_TV.exe
echo     - dist\GestaoX_Fibra.exe
echo ========================================================
pause
