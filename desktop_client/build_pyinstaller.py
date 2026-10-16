"""
Script Python automatizado para compilar os executáveis separados:
- python build_pyinstaller.py tv      -> Gera dist/GestaoX_TV.exe
- python build_pyinstaller.py fibra   -> Gera dist/GestaoX_Fibra.exe
- python build_pyinstaller.py both    -> Gera ambos os executáveis
"""
import os
import sys
import subprocess

def compile_target(name, script_file):
    print(f"\n>> Compilando {name} a partir de {script_file}...")
    cmd = [
        sys.executable, "-m", "PyInstaller",
        "--noconfirm",
        "--onefile",
        "--windowed",
        f"--name={name}",
        "--collect-all=customtkinter",
        script_file
    ]
    res = subprocess.run(cmd)
    if res.returncode == 0:
        print(f">> SUCESSO: dist/{name}.exe criado!")
        return True
    else:
        print(f">> ERRO ao compilar {name}.")
        return False

def main():
    print("==================================================")
    print("  GESTÃO X · BUILD EXECUTÁVEIS WINDOWS SEPARADOS")
    print("==================================================")
    
    target = sys.argv[1].lower() if len(sys.argv) > 1 else "both"
    
    if target in ["tv", "cabo"]:
        compile_target("GestaoX_TV", "main_tv.py")
    elif target in ["fibra", "internet"]:
        compile_target("GestaoX_Fibra", "main_fibra.py")
    else:
        # Compila ambos
        ok_tv = compile_target("GestaoX_TV", "main_tv.py")
        ok_fibra = compile_target("GestaoX_Fibra", "main_fibra.py")
        print("\n==================================================")
        if ok_tv and ok_fibra:
            print(">> Ambos os executáveis foram compilados em 'dist/':")
            print("   - dist/GestaoX_TV.exe")
            print("   - dist/GestaoX_Fibra.exe")
        print("==================================================")

if __name__ == "__main__":
    main()
