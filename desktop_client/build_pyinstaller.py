"""
Script Python automatizado para compilar o executável Windows (.exe)
Uso: python build_pyinstaller.py
"""
import os
import sys
import subprocess

def build():
    print("==================================================")
    print("  GESTÃO X · BUILD EXECUTÁVEL WINDOWS (PYINSTALLER)")
    print("==================================================")
    
    # Verifica dependencias
    try:
        import customtkinter
        import requests
        import PyInstaller
    except ImportError as e:
        print(f"Erro: Dependência ausente ({e}). Instale com:")
        print("pip install -r requirements.txt")
        sys.exit(1)

    # Localiza o caminho de dados do CustomTkinter para incluir no binário
    ctk_path = os.path.dirname(customtkinter.__file__)
    
    cmd = [
        sys.executable, "-m", "PyInstaller",
        "--noconfirm",
        "--onefile",      # Gera executável único (.exe)
        "--windowed",     # Não abre janela de terminal preta (GUI nativa Windows)
        "--name=GestaoX_Desktop",
        "--collect-all=customtkinter",
        "main.py"
    ]
    
    print(f"Executando comando de compilação:\n{' '.join(cmd)}\n")
    result = subprocess.run(cmd)
    
    if result.returncode == 0:
        print("\n>> SUCESSO! Executável gerado na pasta 'dist/GestaoX_Desktop/'")
    else:
        print("\n>> Erro durante a compilação do PyInstaller.")

if __name__ == "__main__":
    build()
