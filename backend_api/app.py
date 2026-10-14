import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db, User

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Habilita CORS completo (obrigatorio para integracao Desktop e Web)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Inicializa SQLAlchemy e JWT
    db.init_app(app)
    jwt = JWTManager(app)
    
    # Customizacoes de erro JWT
    @jwt.unauthorized_loader
    def unauthorized_callback(callback):
        return jsonify({
            'success': False,
            'message': 'Token de autorização não fornecido ou cabeçalho ausente.'
        }), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'success': False,
            'message': 'O token JWT expirou. Utilize o refresh token para renovar.'
        }), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(callback):
        return jsonify({
            'success': False,
            'message': 'Token JWT inválido ou corrompido.'
        }), 422
        
    # Registro de Blueprints
    from auth import auth_bp
    from routes_clients import clients_bp
    from routes_budgets import budgets_bp
    from routes_invoices import invoices_bp
    from routes_dashboard import dashboard_bp
    from routes_users import users_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(clients_bp)
    app.register_blueprint(budgets_bp)
    app.register_blueprint(invoices_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(users_bp)
    
    # Rotas de status e boas-vindas
    @app.route('/')
    def root():
        return jsonify({
            'name': 'Gestão X API REST',
            'version': '1.0.0',
            'status': 'online',
            'platform': 'PythonAnywhere / Local',
            'database': 'SQLite',
            'endpoints': {
                'auth': '/api/v1/auth',
                'clients': '/api/v1/clients',
                'budgets': '/api/v1/budgets',
                'invoices': '/api/v1/invoices',
                'dashboard': '/api/v1/dashboard/summary',
                'users': '/api/v1/users',
                'health': '/api/v1/health'
            }
        }), 200

    @app.route('/api/v1/health')
    def health():
        return jsonify({
            'success': True,
            'status': 'healthy',
            'engine': 'Flask + SQLAlchemy + SQLite'
        }), 200
        
    # Handlers de erro globais
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({
            'success': False,
            'message': 'Endpoint não encontrado.'
        }), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({
            'success': False,
            'message': 'Erro interno do servidor.'
        }), 500

    # Cria tabelas no SQLite se não existirem
    with app.app_context():
        db.create_all()
        # Cria usuario admin padrao se tabela vazia
        if not User.query.filter_by(username='admin').first():
            default_admin = User(
                username='admin',
                email='admin@gestaox.ao',
                full_name='Administrador Geral',
                role='admin',
                is_active=True
            )
            default_admin.set_password('admin123')
            db.session.add(default_admin)
            db.session.commit()
            print(">> Usuário padrão 'admin' criado com senha 'admin123'")
            
    return app

# Instancia da aplicacao para servidores WSGI (como PythonAnywhere e Gunicorn)
app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
