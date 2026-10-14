"""
Script para inicializar o banco de dados SQLite com dados padrão de Angola
Execução: python seed_db.py
"""
from datetime import datetime, date, timedelta
from app import create_app
from models import db, User, Client, Budget, Invoice

app = create_app()

with app.app_context():
    print(">> Criando tabelas no banco de dados...")
    db.create_all()
    
    # Cria usuários padrão se não existirem
    if not User.query.filter_by(username='admin').first():
        u1 = User(
            username='admin',
            email='admin@osdel.ao',
            full_name='Albert (Administrador Geral)',
            role='admin',
            is_active=True
        )
        u1.set_password('admin123')
        db.session.add(u1)
        print(">> Usuário 'admin' criado (senha: admin123)")
        
    if not User.query.filter_by(username='operador1').first():
        u2 = User(
            username='operador1',
            email='maria.santos@osdel.ao',
            full_name='Maria Teresa dos Santos',
            role='operador',
            is_active=True
        )
        u2.set_password('123456')
        db.session.add(u2)
        print(">> Usuário 'operador1' criado (senha: 123456)")

    # Cria clientes de teste
    if Client.query.count() == 0:
        c1 = Client(
            code='CLI-00001',
            full_name='António Domingos Pedro',
            phone='+244 923 456 789',
            alternate_phone='+244 992 111 222',
            email='antonio.pedro@gmail.com',
            address='Rua 12, Casa 45B, Bairro Golf I',
            neighborhood='Golf I',
            city='Luanda',
            document_number='004829104LA041',
            service_type='tv',
            status='active',
            house_code='G1-C45B',
            pdo_number='PDO-04',
            monthly_fee=4000.0,
            notes='Cliente antigo de TV a Cabo Comunitária.'
        )
        c2 = Client(
            code='CLI-00002',
            full_name='Maria Teresa Sebastião',
            phone='+244 945 882 103',
            email='mteresa.sebastiao@hotmail.com',
            address='Rua Principal, Vivenda 12, Palanca',
            neighborhood='Palanca',
            city='Luanda',
            document_number='007193845LA039',
            service_type='fibra',
            status='late',
            house_code='PAL-V12',
            pdo_number='PDO-02',
            onu_number='ONU-OSD-8821',
            monthly_fee=8500.0,
            notes='Sinal de internet em atraso. Enviar alerta antes do corte.'
        )
        c3 = Client(
            code='CLI-00003',
            full_name='Mateus Manuel da Silva',
            phone='+244 926 555 777',
            address='Bloco B, Apt 201, Talatona',
            neighborhood='Talatona',
            city='Luanda',
            document_number='009283741LA045',
            service_type='combo',
            status='active',
            house_code='TAL-B4-201',
            pdo_number='PDO-08',
            onu_number='ONU-OSD-5577',
            monthly_fee=12500.0,
            notes='Pacote integrado TV a Cabo + Internet Fibra.'
        )
        
        db.session.add_all([c1, c2, c3])
        db.session.commit()
        print(">> 3 Clientes criados.")
        
        # Cria faturas
        inv1 = Invoice(
            number='FT-00001',
            client_id=c1.id,
            client_name=c1.full_name,
            amount=4000.0,
            penalty=0.0,
            total=4000.0,
            status='paga',
            issue_date=date.today() - timedelta(days=5),
            due_date=date.today() + timedelta(days=25),
            payment_date=date.today() - timedelta(days=2),
            payment_method='multicaixa',
            reference_code='MCX-94821',
            notes='Mensalidade TV Cabo liquidada'
        )
        inv2 = Invoice(
            number='FT-00002',
            client_id=c2.id,
            client_name=c2.full_name,
            amount=8500.0,
            penalty=1000.0,
            total=9500.0,
            status='pendente',
            issue_date=date.today() - timedelta(days=20),
            due_date=date.today() - timedelta(days=5),
            reference_code='REF-0002',
            notes='Fatura com multa por atraso contratual'
        )
        
        # Cria orçamentos
        b1 = Budget(
            number='ORC-00001',
            client_id=c3.id,
            client_name=c3.full_name,
            service_type='fibra',
            description='Instalação de cabo drop óptico 80m + ONU Huawei GPON + Conectores SC/APC',
            total_amount=25000.0,
            discount=2500.0,
            final_amount=22500.0,
            status='aprovado',
            validity_days=15
        )
        
        db.session.add_all([inv1, inv2, b1])
        db.session.commit()
        print(">> Faturas e orçamentos iniciais inseridos com sucesso.")
        
    print(">> Inicialização do banco concluída com sucesso!")
