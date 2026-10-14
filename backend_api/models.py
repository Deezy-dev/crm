from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=True)
    password_hash = db.Column(db.String(256), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), default='operador')  # 'admin', 'operador', 'tecnico'
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
        
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'full_name': self.full_name,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Client(db.Model):
    __tablename__ = 'clients'
    
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(30), unique=True, nullable=False, index=True)
    full_name = db.Column(db.String(150), nullable=False, index=True)
    phone = db.Column(db.String(30), nullable=False)
    alternate_phone = db.Column(db.String(30), nullable=True)
    email = db.Column(db.String(100), nullable=True)
    address = db.Column(db.String(255), nullable=True)
    neighborhood = db.Column(db.String(100), nullable=True)
    city = db.Column(db.String(100), default='Luanda')
    document_number = db.Column(db.String(50), nullable=True)
    service_type = db.Column(db.String(30), default='combo')  # 'tv', 'fibra', 'combo'
    status = db.Column(db.String(30), default='active')  # 'active', 'late', 'suspended', 'inactive'
    house_code = db.Column(db.String(50), nullable=True)
    pdo_number = db.Column(db.String(50), nullable=True)
    onu_number = db.Column(db.String(50), nullable=True)
    monthly_fee = db.Column(db.Float, default=4000.0)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    budgets = db.relationship('Budget', backref='client', lazy=True, cascade="all, delete-orphan")
    invoices = db.relationship('Invoice', backref='client', lazy=True, cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'full_name': self.full_name,
            'phone': self.phone,
            'alternate_phone': self.alternate_phone,
            'email': self.email,
            'address': self.address,
            'neighborhood': self.neighborhood,
            'city': self.city,
            'document_number': self.document_number,
            'service_type': self.service_type,
            'status': self.status,
            'house_code': self.house_code,
            'pdo_number': self.pdo_number,
            'onu_number': self.onu_number,
            'monthly_fee': self.monthly_fee,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class Budget(db.Model):
    """Orçamentos para instalação de TV a Cabo ou Internet Fibra"""
    __tablename__ = 'budgets'
    
    id = db.Column(db.Integer, primary_key=True)
    number = db.Column(db.String(30), unique=True, nullable=False, index=True)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=True)
    client_name = db.Column(db.String(150), nullable=False)
    service_type = db.Column(db.String(30), default='fibra')
    description = db.Column(db.Text, nullable=False)
    total_amount = db.Column(db.Float, default=0.0)
    discount = db.Column(db.Float, default=0.0)
    final_amount = db.Column(db.Float, default=0.0)
    status = db.Column(db.String(30), default='pendente')  # 'pendente', 'aprovado', 'rejeitado', 'convertido'
    validity_days = db.Column(db.Integer, default=15)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'number': self.number,
            'client_id': self.client_id,
            'client_name': self.client_name,
            'service_type': self.service_type,
            'description': self.description,
            'total_amount': self.total_amount,
            'discount': self.discount,
            'final_amount': self.final_amount,
            'status': self.status,
            'validity_days': self.validity_days,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Invoice(db.Model):
    """Faturas e Mensalidades de Serviço"""
    __tablename__ = 'invoices'
    
    id = db.Column(db.Integer, primary_key=True)
    number = db.Column(db.String(30), unique=True, nullable=False, index=True)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=False)
    client_name = db.Column(db.String(150), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    penalty = db.Column(db.Float, default=0.0)
    total = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(30), default='pendente')  # 'paga', 'pendente', 'vencida', 'cancelada'
    issue_date = db.Column(db.Date, default=datetime.utcnow)
    due_date = db.Column(db.Date, nullable=False)
    payment_date = db.Column(db.Date, nullable=True)
    payment_method = db.Column(db.String(50), nullable=True)  # 'multicaixa', 'transferencia', 'dinheiro'
    reference_code = db.Column(db.String(50), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'number': self.number,
            'client_id': self.client_id,
            'client_name': self.client_name,
            'amount': self.amount,
            'penalty': self.penalty,
            'total': self.total,
            'status': self.status,
            'issue_date': self.issue_date.isoformat() if self.issue_date else None,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'payment_date': self.payment_date.isoformat() if self.payment_date else None,
            'payment_method': self.payment_method,
            'reference_code': self.reference_code,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class ActivityLog(db.Model):
    """Log de atividades e auditoria"""
    __tablename__ = 'activity_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=True)
    username = db.Column(db.String(50), nullable=True)
    action = db.Column(db.String(50), nullable=False)
    entity = db.Column(db.String(50), nullable=False)
    details = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'username': self.username,
            'action': self.action,
            'entity': self.entity,
            'details': self.details,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
