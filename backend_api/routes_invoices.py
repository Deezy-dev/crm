from datetime import datetime, date
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Invoice, Client, ActivityLog, User

invoices_bp = Blueprint('invoices', __name__, url_prefix='/api/v1/invoices')

def generate_invoice_number():
    last_inv = Invoice.query.order_by(Invoice.id.desc()).first()
    next_num = (last_inv.id + 1) if last_inv else 1
    return f"FT-{next_num:05d}"

@invoices_bp.route('', methods=['GET'])
@jwt_required()
def list_invoices():
    """Lista faturas com filtros por status e cliente"""
    status = request.args.get('status', '').strip().lower()
    client_id = request.args.get('client_id', type=int)
    
    query = Invoice.query
    if status and status != 'todos':
        query = query.filter_by(status=status)
    if client_id:
        query = query.filter_by(client_id=client_id)
        
    invoices = query.order_by(Invoice.id.desc()).all()
    return jsonify({
        'success': True,
        'count': len(invoices),
        'items': [inv.to_dict() for inv in invoices]
    }), 200

@invoices_bp.route('/<int:invoice_id>', methods=['GET'])
@jwt_required()
def get_invoice(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    return jsonify({
        'success': True,
        'invoice': invoice.to_dict()
    }), 200

@invoices_bp.route('', methods=['POST'])
@jwt_required()
def create_invoice():
    data = request.get_json() or {}
    client_id = data.get('client_id')
    amount = float(data.get('amount', 0.0))
    
    if not client_id or amount <= 0:
        return jsonify({
            'success': False,
            'message': 'client_id e amount > 0 são obrigatórios.'
        }), 400
        
    client = Client.query.get_or_404(client_id)
    penalty = float(data.get('penalty', 0.0))
    total = amount + penalty
    
    # Datas
    due_date_str = data.get('due_date')
    if due_date_str:
        due_date = datetime.strptime(due_date_str, '%Y-%m-%d').date()
    else:
        # Padrão: dia 5 do mês seguinte ou 30 dias depois
        due_date = date.today()
        
    new_invoice = Invoice(
        number=generate_invoice_number(),
        client_id=client.id,
        client_name=client.full_name,
        amount=amount,
        penalty=penalty,
        total=total,
        status=data.get('status', 'pendente'),
        issue_date=date.today(),
        due_date=due_date,
        reference_code=data.get('reference_code') or f"REF-{client.id:04d}",
        notes=data.get('notes')
    )
    
    db.session.add(new_invoice)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Fatura gerada com sucesso!',
        'invoice': new_invoice.to_dict()
    }), 201

@invoices_bp.route('/<int:invoice_id>/pay', methods=['POST'])
@jwt_required()
def pay_invoice(invoice_id):
    """Liquida a fatura e atualiza status do cliente"""
    invoice = Invoice.query.get_or_404(invoice_id)
    data = request.get_json() or {}
    
    invoice.status = 'paga'
    invoice.payment_date = date.today()
    invoice.payment_method = data.get('payment_method', 'multicaixa')
    invoice.reference_code = data.get('reference_code', invoice.reference_code)
    
    # Atualiza o cliente para status 'active' se estiver em atraso
    if invoice.client and invoice.client.status == 'late':
        invoice.client.status = 'active'
        
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': f'Fatura {invoice.number} liquidada com sucesso!',
        'invoice': invoice.to_dict()
    }), 200

@invoices_bp.route('/<int:invoice_id>', methods=['DELETE'])
@jwt_required()
def delete_invoice(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    db.session.delete(invoice)
    db.session.commit()
    return jsonify({
        'success': True,
        'message': f'Fatura {invoice.number} cancelada e removida.'
    }), 200
