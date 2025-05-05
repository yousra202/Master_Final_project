import os
import django

# Configurer l'environnement Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medical_portal.settings')
django.setup()

from users.models import User, AdminProfile

def create_admin_user(username, email, password):
    # Vérifier si l'utilisateur existe déjà
    if User.objects.filter(username=username).exists():
        print(f"L'utilisateur {username} existe déjà.")
        return
    
    # Créer un nouvel utilisateur admin
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        user_type='admin'
    )
    
    # Créer un profil admin
    AdminProfile.objects.create(
        user=user,
        role='Super Admin'
    )
    
    print(f"Utilisateur admin '{username}' créé avec succès!")

if __name__ == "__main__":
    username = input("Nom d'utilisateur: ")
    email = input("Email: ")
    password = input("Mot de passe: ")
    
    create_admin_user(username, email, password)