#!/bin/bash
set -e

CERT_DIR="infra/certs"
mkdir -p "$CERT_DIR"

echo "Generating Root CA..."
openssl genrsa -out "$CERT_DIR/rootCA.key" 4096
openssl req -x509 -new -nodes -key "$CERT_DIR/rootCA.key" -sha256 -days 1024 -out "$CERT_DIR/rootCA.crt" -subj "/CN=SOSLocationDevRootCA"

echo "Generating Server Certificate for localhost, 127.0.0.1, 0.0.0.0, backend, keycloak..."
openssl genrsa -out "$CERT_DIR/server.key" 2048
openssl req -new -key "$CERT_DIR/server.key" -out "$CERT_DIR/server.csr" -subj "/CN=localhost"

cat > "$CERT_DIR/server.ext" <<EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = backend
DNS.3 = keycloak
IP.1 = 127.0.0.1
IP.2 = 0.0.0.0
EOF

openssl x509 -req -in "$CERT_DIR/server.csr" -CA "$CERT_DIR/rootCA.crt" -CAkey "$CERT_DIR/rootCA.key" -CAcreateserial \
-out "$CERT_DIR/server.crt" -days 825 -sha256 -extfile "$CERT_DIR/server.ext"

echo "Creating .pfx for .NET Backend..."
# Password is set to 'dev-password' by default
openssl pkcs12 -export -out "$CERT_DIR/server.pfx" -inkey "$CERT_DIR/server.key" -in "$CERT_DIR/server.crt" -password pass:dev-password

echo "Creating .pem for Keycloak..."
cat "$CERT_DIR/server.crt" > "$CERT_DIR/server.crt.pem"
cat "$CERT_DIR/server.key" > "$CERT_DIR/server.key.pem"

echo "Certificates generated in $CERT_DIR"
