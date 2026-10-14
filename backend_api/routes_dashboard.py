from datetime import datetime
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from models import db, Client, Invoice, Budget, User

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/v1/dashboard')

@dashboard_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_dashboard_summary():
    """Retorna estatísticas consolidadas para a tela inicial do sistema e do Desktop"""
    total_clients = Client.query.count()
    active_clients = Client.query.filter_by(status='active').count()
    late_clients = Client.query.filter_by(status='late').count()
    suspended_clients = Client.query.filter_by(status='suspended').count()
    
    # TV vs Fibra vs Combo
    tv_clients = Client.query.filter_by(service_type='tv').count()
    fiber_clients = Client.query.filter_by(service_type='fibra').count()
    combo_clients = Client.query.filter_by(service_type='combo').count()
    
    # Faturas
    paid_invoices = Invoice.query.filter_by(status='paga').all()
    revenue_total = sum(inv.total for inv in paid_invoices)
    
    pending_invoices = Invoice.query.filter_by(status='pendente').all()
    pending_total = sum(inv.total for inv in pending_invoices)
    
    # Orçamentos
    total_budgets = Budget.query.count()
    pending_budgets = Budget.query.filter_by(status='pendente').count()
    approved_budgets = Budget.query.filter_by(status='aprovado').count()
    
    # Últimos clientes cadastrados
    recent_clients = [
        c.to_dict() for c in Client.query.order_by(Client.id.desc()).limit(5).all()
    ]
    
    # Últimas faturas pagas
    recent_payments = [
        inv.to_dict() for inv in Invoice.query.filter_by(status='paga').order_by(Invoice.id.desc()).limit(5).all()
    ]
    
    return jsonify({
        'success': True,
        'timestamp': datetime.utcnow().isoformat(),
        'metrics': {
            'clients': {
                'total': total_clients,
                'active': active_clients,
                'late': late_clients,
                'suspended': suspended_clients,
                'tv': tv_clients,
                'fibra': fiber_clients,
                'combo': combo_clients
            },
            'financial': {
                'revenue_total_kz': revenue_total,
                'pending_total_kz': pending_total,
                'invoices_paid_count': len(paid_invoices),
                'invoices_pending_count': len(pending_invoices)
            },
            'budgets': {
                'total': total_budgets,
                'pending': pending_budgets,
                'approved': approved_budgets
            }
        },
        'recent_clients': recent_clients,
        'recent_payments': recent_payments
    }), 200
