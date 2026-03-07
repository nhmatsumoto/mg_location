from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings

from apps.api.auth_keycloak import get_user_auth_context, provision_user_from_keycloak


class KeycloakAuthTests(TestCase):
    @override_settings(
        KEYCLOAK_ROLE_ADMIN='sos_admin',
        KEYCLOAK_ROLE_OPERATOR='sos_operator',
        KEYCLOAK_ROLE_VIEWER='sos_viewer',
        KEYCLOAK_CLIENT_ID='sos-location-web',
    )
    def test_provision_user_syncs_operator_role(self):
        claims = {
            'sub': 'abc123',
            'email': 'op@example.com',
            'preferred_username': 'operator.one',
            'given_name': 'Operator',
            'family_name': 'One',
            'realm_access': {'roles': ['sos_operator']},
        }

        user = provision_user_from_keycloak(claims)
        user.refresh_from_db()

        self.assertEqual(user.email, 'op@example.com')
        self.assertTrue(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertTrue(user.groups.filter(name='sos_operator').exists())

        authz = get_user_auth_context(user)
        self.assertEqual(authz['level'], 'operator')

    @override_settings(
        KEYCLOAK_ROLE_ADMIN='sos_admin',
        KEYCLOAK_ROLE_OPERATOR='sos_operator',
        KEYCLOAK_ROLE_VIEWER='sos_viewer',
    )
    def test_auth_context_admin_precedence(self):
        user = get_user_model().objects.create_user(username='admin_role', password='x')
        user.groups.create(name='sos_admin')
        user.is_staff = True
        user.is_superuser = True
        user.save(update_fields=['is_staff', 'is_superuser'])

        authz = get_user_auth_context(user)
        self.assertEqual(authz['level'], 'admin')
