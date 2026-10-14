import sqlite3
import json
from datetime import datetime
from config import DesktopConfig

class OfflineCache:
    def __init__(self, db_path=DesktopConfig.CACHE_DB_PATH):
        self.db_path = db_path
        self.init_db()
        
    def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
        
    def init_db(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            # Tabela de clientes em cache
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS clients_cache (
                    id INTEGER PRIMARY KEY,
                    code TEXT,
                    full_name TEXT,
                    phone TEXT,
                    service_type TEXT,
                    status TEXT,
                    monthly_fee REAL,
                    neighborhood TEXT,
                    raw_json TEXT,
                    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Tabela de métricas do dashboard em cache
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS dashboard_cache (
                    id INTEGER PRIMARY KEY CHECK (id = 1),
                    raw_json TEXT,
                    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.commit()
            
    def save_clients(self, clients_list):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM clients_cache")
            for c in clients_list:
                cursor.execute("""
                    INSERT OR REPLACE INTO clients_cache 
                    (id, code, full_name, phone, service_type, status, monthly_fee, neighborhood, raw_json)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    c.get('id'),
                    c.get('code'),
                    c.get('full_name'),
                    c.get('phone'),
                    c.get('service_type'),
                    c.get('status'),
                    c.get('monthly_fee', 0.0),
                    c.get('neighborhood'),
                    json.dumps(c)
                ))
            conn.commit()
            
    def get_clients(self, search=""):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            if search:
                cursor.execute("""
                    SELECT raw_json FROM clients_cache
                    WHERE full_name LIKE ? OR phone LIKE ? OR code LIKE ?
                    ORDER BY id DESC
                """, (f"%{search}%", f"%{search}%", f"%{search}%"))
            else:
                cursor.execute("SELECT raw_json FROM clients_cache ORDER BY id DESC")
            rows = cursor.fetchall()
            return [json.loads(r['raw_json']) for r in rows]
            
    def save_single_client(self, client_dict):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO clients_cache 
                (id, code, full_name, phone, service_type, status, monthly_fee, neighborhood, raw_json)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                client_dict.get('id'),
                client_dict.get('code'),
                client_dict.get('full_name'),
                client_dict.get('phone'),
                client_dict.get('service_type'),
                client_dict.get('status'),
                client_dict.get('monthly_fee', 0.0),
                client_dict.get('neighborhood'),
                json.dumps(client_dict)
            ))
            conn.commit()
            
    def delete_client(self, client_id):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM clients_cache WHERE id = ?", (client_id,))
            conn.commit()

    def save_dashboard(self, dashboard_data):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO dashboard_cache (id, raw_json)
                VALUES (1, ?)
            """, (json.dumps(dashboard_data),))
            conn.commit()
            
    def get_dashboard(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT raw_json FROM dashboard_cache WHERE id = 1")
            row = cursor.fetchone()
            if row:
                return json.loads(row['raw_json'])
            return None
