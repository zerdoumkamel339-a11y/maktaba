import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'screens/auth_router.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    // تتطلب Firebase Options في التطبيقات الحديثة:
    // قم باستبدال السطر التالي عند تجهيز إعدادات فايربيس
    // await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
    await Firebase.initializeApp();
  } catch (e) {
    debugPrint("Firebase init logic error: $e");
  }
  runApp(const BookDZApp());
}

class BookDZApp extends StatelessWidget {
  const BookDZApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'BookDZ Architecture Test',
      builder: (context, child) {
        return Directionality(
          textDirection: TextDirection.rtl, // دعم اللغة العربية (يمين لليسار)
          child: child!,
        );
      },
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: const AuthRouter(),
    );
  }
}
