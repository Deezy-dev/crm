import random
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Client, User, ActivityLog

clients_bp = Blueprint('clients', __name__, url_prefix='/api/v1/clients')

def generate_client_code():
    """Gera código único para o cliente (ex: CLI-00124)"""
    last_client = Client.query.order_by(Client.id.desc()).first()
    next_num = (last_client.id + 1) if last_client else 1
    return f"CLI-{next_num:05d}"

@clients_bp.route('', methods=['GET'])
@jwt_required()
def list_clients():
    """Lista clientes com filtros de pesquisa, status, modalidade e paginação"""
    search = request.args.get('search', '').strip().lower()
    status = request.args.get('status', '').strip().lower()
    service_type = request.args.get('service_type', '').strip().lower()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    
    query = Client.query
    
    if search:
        query = query.filter(
            db.or_(
                Client.full_name.ilike(f'%{search}%'),
                Client.phone.ilike(f'%{search}%'),
                Client.code.ilike(f'%{search}%'),
                Client.document_number.ilike(f'%{search}%'),
                Client.neighborhood.ilike(f'%{search}%')
            )
        )
        
    if status and status != 'todos':
        query = query.filter(Client.status == status)
        
    if service_type and service_type != 'todos':
        query = query.filter(Client.service_type == service_type)
        
    query = query.order_by(Client.id.desc())
    
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    clients_list = [c.to_dict() for c in pagination.items]
    
    return jsonify({
        'success': True,
        'total': pagination.total,
        'page': pagination.page,
        'pages': pagination.pages,
        'per_page': pagination.per_page,
        'items': clients_list
    }), 200


@clients_bp.route('/<int:client_id>', methods=['GET'])
@jwt_required()
def get_client(client_id):
    """Retorna detalhes de um cliente específico"""
    client = Client.query.get_or_404(client_id)
    
    client_dict = client.to_dict()
    client_dict['invoices'] = [inv.to_dict() for inv in client.invoices]
    client_dict['budgets'] = [b.to_dict() for b in client.budgets]
    
    return jsonify({
        'success': True,
        'client': client_dict
    }), 200


@clients_bp.route('', methods=['POST'])
@jwt_required()
def create_client():
    """Cadastra um novo cliente no sistema"""
    data = request.get_json() or {}
    
    full_name = data.get('full_name', '').strip()
    phone = data.get('phone', '').strip()
    
    if not full_name or not phone:
        return jsonify({
            'success': False,
            'message': 'Campos obrigatórios: full_name e phone.'
        }), 400
        
    code = data.get('code') or generate_client_code()
    
    # Verifica duplicidade de código
    if Client.query.filter_by(code=code).first():
        code = generate_client_code()
        
    new_client = Client(
        code=code,
        full_name=full_name,
        phone=phone,
        alternate_phone=data.get('alternate_phone', '').strip() or None,
        email=data.get('email', '').strip() or None,
        address=data.get('address', '').strip() or None,
        neighborhood=data.get('neighborhood', '').strip() or None,
        city=data.get('city', 'Luanda').strip(),
        document_number=data.get('document_number', '').strip() or None,
        service_type=data.get('service_type', 'combo'),
        status=data.get('status', 'active'),
        house_code=data.get('house_code', '').strip() or None,
        pdo_number=data.get('pdo_number', '').strip() or None,
        onu_number=data.get('onu_number', '').strip() or None,
        monthly_fee=float(data.get('monthly_fee', 4000.0)),
        notes=data.get('notes', '').strip() or None
    )
    
    db.session.add(new_client)
    db.session.commit()
    
    # Auditoria
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id)) if user_id else None
    log = ActivityLog(
        user_id=int(user_id) if user_id else None,
        username=user.username if user else 'sistema',
        action='CREATE_CLIENT',
        entity='CLIENT',
        details=f'Criado cliente {new_client.full_name} ({new_client.code})'
    )
    db.session.add(log)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Cliente cadastrado com sucesso!',
        'client': new_client.to_dict()
    }), 201


@clients_bp.route('/<int:client_id>', methods=['PUT'])
@jwt_required()
def update_client(client_id):
    """Atualiza dados cadastrais de um cliente"""
    client = Client.query.get_or_404(client_id)
    data = request.get_json() or {}
    
    if 'full_name' in data and data['full_name'].strip():
        client.full_name = data['full_name'].strip()
    if 'phone' in data and data['phone'].strip():
        client.phone = data['phone'].strip()
    if 'alternate_phone' in data:
        client.alternate_phone = data['alternate_phone'].strip() or None
    if 'email' in data:
        client.email = data['email'].strip() or None
    if 'address' in data:
        client.address = data['address'].strip() or None
    if 'neighborhood' in data:
        client.neighborhood = data['neighborhood'].strip() or None
    if 'city' in data and data['city'].strip():
        client.city = data['city'].strip()
    if 'document_number' in data:
        client.document_number = data['document_number'].strip() or None
    if 'service_type' in data:
        client.service_type = data['service_type']
    if 'status' in data:
        client.status = data['status']
    if 'house_code' in data:
        client.house_code = data['house_code'].strip() or None
    if 'pdo_number' in data:
        client.pdo_number = data['pdo_number'].strip() or None
    if 'onu_number' in data:
        client.onu_number = data['onu_number'].strip() or None
    if 'monthly_fee' in data:
        client.monthly_fee = float(data['monthly_fee'])
    if 'notes' in data:
        client.notes = data['notes']
        
    db.session.commit()
    
    # Auditoria
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id)) if user_id else None
    log = ActivityLog(
        user_id=int(user_id) if user_id else None,
        username=user.username if user else 'sistema',
        action='UPDATE_CLIENT',
        entity='CLIENT',
        details=f'Atualizados dados do cliente {client.full_name} ({client.code})'
    )
    db.session.add(log)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Cliente atualizado com sucesso!',
        'client': client.to_dict()
    }), 200


@clients_bp.route('/<int:client_id>', methods=['DELETE'])
@jwt_required()
def delete_client(client_id):
    """Exclui um cliente do sistema"""
    client = Client.query.get_or_404(client_id)
    client_name = client.full_name
    client_code = client.code
    
    db.session.delete(client)
    db.session.commit()
    
    # Auditoria
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id)) if user_id else None
    log = ActivityLog(
        user_id=int(user_id) if user_id else None,
        username=user.username if user else 'sistema',
        action='DELETE_CLIENT',
        entity='CLIENT',
        details=f'Excluído cliente {client_name} ({client_code})'
    )
    db.session.add(log)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': f'Cliente "{client_name}" excluído com sucesso.'
    }), 200
