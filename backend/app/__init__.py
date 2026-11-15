import os
import sys

# Ensure psycopg uses the PostgreSQL libpq from Program Files on Windows to satisfy Windows Application Control policies
_pg_bin = r"C:\Program Files\PostgreSQL\18\bin"
if os.path.exists(_pg_bin):
    if _pg_bin not in os.environ.get("PATH", ""):
        os.environ["PATH"] = _pg_bin + os.pathsep + os.environ.get("PATH", "")
    os.environ.setdefault("PSYCOPG_IMPL", "python")
    if hasattr(os, "add_dll_directory"):
        try:
            os.add_dll_directory(_pg_bin)
        except Exception:
            pass
