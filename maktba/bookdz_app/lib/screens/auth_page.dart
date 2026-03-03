import 'package:bookdz_app/screens/login_screen.dart';
import 'package:bookdz_app/screens/register_screen.dart';
import 'package:flutter/material.dart';

class AuthPage extends StatefulWidget {
  const AuthPage({Key? key}) : super(key: key);

  @override
  _AuthPageState createState() => _AuthPageState();
}

class _AuthPageState extends State<AuthPage> {
  // initially, show the login screen
  bool _showLoginScreen = true;

  void toggleScreens() {
    setState(() {
      _showLoginScreen = !_showLoginScreen;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_showLoginScreen) {
      return LoginScreen(showRegisterScreen: toggleScreens);
    } else {
      return RegisterScreen(showLoginScreen: toggleScreens);
    }
  }
}
