from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, ActivityLog

users_bp = Blueprint('users', __name__, url_prefix='/api/v1/users')

@users_bp.route('', methods=['GET'])
@jwt_required()
def list_users():
    users = User.query.order_by(User.id.asc()).all()
    return jsonify({
        'success': True,
        'count': len(users),
        'items': [u.to_dict() for u in users]
    }), 200

@users_bp.route('', methods=['POST'])
@jwt_required()
def create_user():
    data = request.get_json() or {}
    username = data.get('username', '').strip().lower()
    password = data.get('password', '')
    full_name = data.get('full_name', '').strip()
    email = data.get('email', '').strip().lower() or None
    role = data.get('role', 'operador')
    
    if not username or not password or not full_name:
        return jsonify({
            'success': False,
            'message': 'Campos obrigatórios: username, password, full_name'
        }), 400
        
    if User.query.filter_by(username=username).first():
        return jsonify({
            'success': False,
            'message': f'Nome de usuário "{username}" já cadastrado.'
        }), 409
        
    new_user = User(
        username=username,
        email=email,
        full_name=full_name,
        role=role,
        is_active=True
    )
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Usuário cadastrado com sucesso!',
        'user': new_user.to_dict()
    }), 201

@users_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify({
        'success': True,
        'user': user.to_dict()
    }), 200

@users_bp.route('/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}
    
    if 'full_name' in data and data['full_name'].strip():
        user.full_name = data['full_name'].strip()
    if 'email' in data:
        user.email = data['email'].strip() or None
    if 'role' in data:
        user.role = data['role']
    if 'is_active' in data:
        user.is_active = bool(data['is_active'])
    if 'password' in data and data['password']:
        user.set_password(data['password'])
        
    db.session.commit()
    return jsonify({
        'success': True,
        'message': 'Usuário atualizado com sucesso!',
        'user': user.to_dict()
    }), 200

@users_bp.route('/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    current_uid = get_jwt_identity()
    if int(current_uid) == user_id:
        return jsonify({
            'success': False,
            'message': 'Não é permitido excluir o próprio usuário logado.'
        }), 400
        
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({
        'success': True,
        'message': f'Usuário {user.username} excluído com sucesso.'
    }), 200
