from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, 
    create_refresh_token, 
    jwt_required, 
    get_jwt_identity
)
from models import db, User, ActivityLog

auth_bp = Blueprint('auth', __name__, url_prefix='/api/v1/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    """Registra um novo usuário no sistema"""
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
        
    if email and User.query.filter_by(email=email).first():
        return jsonify({
            'success': False,
            'message': f'Email "{email}" já cadastrado.'
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
    
    # Log de auditoria
    log = ActivityLog(
        user_id=new_user.id,
        username=new_user.username,
        action='REGISTER',
        entity='USER',
        details=f'Usuário {username} registrado com perfil {role}'
    )
    db.session.add(log)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Usuário cadastrado com sucesso!',
        'user': new_user.to_dict()
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """Autentica usuário e retorna tokens JWT (Access e Refresh)"""
    data = request.get_json() or {}
    
    username = data.get('username', '').strip().lower()
    password = data.get('password', '')
    
    if not username or not password:
        return jsonify({
            'success': False,
            'message': 'Informe username e password.'
        }), 400
        
    user = User.query.filter_by(username=username).first()
    
    if not user or not user.check_password(password):
        return jsonify({
            'success': False,
            'message': 'Credenciais inválidas. Verifique seu usuário e palavra-passe.'
        }), 401
        
    if not user.is_active:
        return jsonify({
            'success': False,
            'message': 'Conta inativa. Contacte o administrador do sistema.'
        }), 403
        
    # Gera tokens JWT
    identity = str(user.id)
    access_token = create_access_token(identity=identity)
    refresh_token = create_refresh_token(identity=identity)
    
    # Log de auditoria
    log = ActivityLog(
        user_id=user.id,
        username=user.username,
        action='LOGIN',
        entity='AUTH',
        details=f'Login efetuado com sucesso via API'
    )
    db.session.add(log)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Login realizado com sucesso!',
        'access_token': access_token,
        'refresh_token': refresh_token,
        'token_type': 'Bearer',
        'user': user.to_dict()
    }), 200


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Gera um novo access_token usando o refresh_token"""
    identity = get_jwt_identity()
    user = User.query.get(int(identity))
    
    if not user or not user.is_active:
        return jsonify({
            'success': False,
            'message': 'Usuário não encontrado ou inativo.'
        }), 403
        
    new_access_token = create_access_token(identity=identity)
    
    return jsonify({
        'success': True,
        'access_token': new_access_token,
        'token_type': 'Bearer'
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    """Retorna os dados do usuário autenticado no token"""
    identity = get_jwt_identity()
    user = User.query.get(int(identity))
    
    if not user:
        return jsonify({
            'success': False,
            'message': 'Usuário não encontrado.'
        }), 404
        
    return jsonify({
        'success': True,
        'user': user.to_dict()
    }), 200
