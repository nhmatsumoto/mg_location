from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient


class AuthLoggingTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_emits_success_log(self):
        with self.assertLogs('apps.api.views_auth', level='INFO') as logs:
            response = self.client.post(
                reverse('api:auth_register'),
                {'username': 'logger_user', 'password': 'segredo123', 'email': 'logger@example.com'},
                format='json',
            )

        self.assertEqual(response.status_code, 201)
        self.assertTrue(any('auth_register_success' in record for record in logs.output))

    def test_failed_login_emits_warning_log(self):
        with self.assertLogs('apps.api.views_auth', level='WARNING') as logs:
            response = self.client.post(
                reverse('api:auth_login'),
                {'username': 'nao_existe', 'password': 'senha_errada'},
                format='json',
            )

        self.assertEqual(response.status_code, 401)
        self.assertTrue(any('auth_login_failed' in record for record in logs.output))
