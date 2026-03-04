from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand


SEED_USERS = [
    {
        'username': 'admin',
        'password': 'admin123456',
        'email': 'admin@sos-location.local',
        'first_name': 'Admin',
        'last_name': 'Sistema',
        'is_staff': True,
        'is_superuser': True,
        'groups': ['mg_admin'],
    },
    {
        'username': 'governo',
        'password': 'governo123456',
        'email': 'governo@sos-location.local',
        'first_name': 'Operador',
        'last_name': 'Governo',
        'is_staff': True,
        'is_superuser': False,
        'groups': ['mg_operator'],
    },
    {
        'username': 'voluntario',
        'password': 'voluntario123456',
        'email': 'voluntario@sos-location.local',
        'first_name': 'Equipe',
        'last_name': 'Voluntária',
        'is_staff': False,
        'is_superuser': False,
        'groups': ['mg_viewer'],
    },
    {
        'username': 'usuario',
        'password': 'usuario123456',
        'email': 'usuario@sos-location.local',
        'first_name': 'Usuário',
        'last_name': 'Público',
        'is_staff': False,
        'is_superuser': False,
        'groups': [],
    },
]


class Command(BaseCommand):
    help = 'Cria seed inicial para autenticação local com perfis admin, governo, voluntário e usuário público.'

    def handle(self, *args, **options):
        user_model = get_user_model()

        for group_name in ['mg_admin', 'mg_operator', 'mg_viewer']:
            Group.objects.get_or_create(name=group_name)

        summary = []
        for seed in SEED_USERS:
            defaults = {
                'email': seed['email'],
                'first_name': seed['first_name'],
                'last_name': seed['last_name'],
                'is_staff': seed['is_staff'],
                'is_superuser': seed['is_superuser'],
            }
            user, created = user_model.objects.get_or_create(username=seed['username'], defaults=defaults)

            changed = created
            for field, value in defaults.items():
                if getattr(user, field) != value:
                    setattr(user, field, value)
                    changed = True

            if not user.check_password(seed['password']):
                user.set_password(seed['password'])
                changed = True

            if changed:
                user.save()

            groups = list(Group.objects.filter(name__in=seed['groups']))
            user.groups.set(groups)

            summary.append(f"{seed['username']}={seed['password']}")

        self.stdout.write(self.style.SUCCESS('Seed auth garantido: ' + ', '.join(summary)))
