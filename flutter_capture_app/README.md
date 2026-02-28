# MG LOCATION Capture (Flutter)

Aplicativo Flutter para:
- reportar deslizamentos
- cadastrar pessoas desaparecidas
- capturar vídeo nativo via câmera
- enviar vídeo para pipeline de Gaussian Splatting (`/api/splat/convert`)
- registrar push notifications (`/api/push/register`)

## Rodar
```bash
cd flutter_capture_app
flutter pub get
flutter run
```

> Configure `apiBaseUrl` em `lib/main.dart` para o backend Python acessível pelo dispositivo.
