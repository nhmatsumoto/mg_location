import 'dart:convert';
import 'dart:io';

import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';

const apiBaseUrl = 'http://localhost:5031/api';

void main() {
  runApp(const MgLocationCaptureApp());
}

class MgLocationCaptureApp extends StatelessWidget {
  const MgLocationCaptureApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MG LOCATION Capture',
      theme: ThemeData.dark(useMaterial3: true),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String status = 'Pronto para enviar relatórios.';

  Future<void> _sendMissingReport() async {
    final response = await http.post(
      Uri.parse('$apiBaseUrl/report-info'),
      body: {
        'kind': 'person',
        'name': 'Relato via Flutter',
        'lastSeen': 'Área demarcada no app',
        'contact': 'App MG LOCATION',
      },
    );
    setState(() => status = 'Desaparecido enviado: ${response.statusCode}');
  }

  Future<void> _sendPushSubscription() async {
    final response = await http.post(
      Uri.parse('$apiBaseUrl/push/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'deviceId': 'flutter-local-device',
        'token': 'flutter-${Platform.operatingSystem}-${DateTime.now().millisecondsSinceEpoch}',
        'platform': Platform.operatingSystem,
        'topics': ['attention-alerts', 'splat-jobs'],
      }),
    );
    setState(() => status = 'Push registrado: ${response.statusCode}');
  }

  Future<void> _captureAndConvertToSplat() async {
    final picker = ImagePicker();
    final video = await picker.pickVideo(source: ImageSource.camera);
    if (video == null) {
      setState(() => status = 'Captura cancelada.');
      return;
    }

    final request = http.MultipartRequest('POST', Uri.parse('$apiBaseUrl/splat/convert'));
    request.fields['latitude'] = '-21.1215';
    request.fields['longitude'] = '-42.9427';
    request.files.add(await http.MultipartFile.fromPath('video', video.path));
    final response = await request.send();
    final payload = await response.stream.bytesToString();

    setState(() => status = 'Splat job: ${response.statusCode} $payload');
  }

  Future<void> _sendLandslideAlert() async {
    final response = await http.post(
      Uri.parse('$apiBaseUrl/attention-alerts'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'title': 'Deslizamento reportado via app Flutter',
        'message': 'Área exige reforço de busca e triagem.',
        'severity': 'critical',
        'lat': -21.1215,
        'lng': -42.9427,
        'radiusMeters': 500,
      }),
    );

    setState(() => status = 'Alerta criado: ${response.statusCode}');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('MG LOCATION Capture')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            FilledButton.icon(
              onPressed: _captureAndConvertToSplat,
              icon: const Icon(Icons.camera_alt),
              label: const Text('Capturar vídeo e converter para .splat'),
            ),
            const SizedBox(height: 12),
            FilledButton.icon(
              onPressed: _sendLandslideAlert,
              icon: const Icon(Icons.warning_amber_rounded),
              label: const Text('Reportar deslizamento'),
            ),
            const SizedBox(height: 12),
            FilledButton.icon(
              onPressed: _sendMissingReport,
              icon: const Icon(Icons.person_search),
              label: const Text('Reportar desaparecido'),
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: _sendPushSubscription,
              icon: const Icon(Icons.notifications_active),
              label: const Text('Registrar push notifications'),
            ),
            const SizedBox(height: 20),
            Text(status),
            const SizedBox(height: 8),
            const Text(
              'Observação: a renderização do .splat pode ser exibida no app e no web consumindo o splatUrl retornado pelo backend.',
              style: TextStyle(color: Colors.white70),
            ),
          ],
        ),
      ),
    );
  }
}
