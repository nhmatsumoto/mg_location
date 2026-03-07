from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.test import TestCase


class SeedAuthCommandTests(TestCase):
    def test_seed_auth_creates_default_profiles(self):
        call_command('seed_auth')

        user_model = get_user_model()
        admin = user_model.objects.get(username='admin')
        governo = user_model.objects.get(username='governo')
        voluntario = user_model.objects.get(username='voluntario')
        usuario = user_model.objects.get(username='usuario')

        self.assertTrue(admin.is_superuser)
        self.assertTrue(admin.groups.filter(name='sos_admin').exists())

        self.assertTrue(governo.is_staff)
        self.assertTrue(governo.groups.filter(name='sos_operator').exists())

        self.assertFalse(voluntario.is_staff)
        self.assertTrue(voluntario.groups.filter(name='sos_viewer').exists())

        self.assertFalse(usuario.is_staff)
        self.assertFalse(usuario.groups.exists())
