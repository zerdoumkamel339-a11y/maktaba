import 'package:flutter/material.dart';
import '../models/user_model.dart';
import 'buyer_home_screen.dart';
import 'seller_dashboard.dart';

class AuthRouter extends StatefulWidget {
  const AuthRouter({Key? key}) : super(key: key);

  @override
  State<AuthRouter> createState() => _AuthRouterState();
}

class _AuthRouterState extends State<AuthRouter> {
  UserModel? currentUser;

  void loginAsBuyer() {
    setState(() {
      currentUser = UserModel(id: 'user_99', name: 'أحمد القارئ', role: UserRole.buyer);
    });
  }

  void loginAsSeller() {
    setState(() {
      currentUser = UserModel(id: 'seller_1', name: 'مكتبة الأمل', role: UserRole.seller, libraryId: 'lib_1');
    });
  }

  void logout() {
    setState(() {
      currentUser = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (currentUser == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('BookDZ - الدخول')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'مرحباً بك في نموذج Multi-User\nالخاص بتطبيق BookDZ',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 40),
                ElevatedButton.icon(
                  icon: const Icon(Icons.person, color: Colors.white),
                  label: const Text('دخول كقارئ (مشتري)'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.all(16),
                    backgroundColor: Colors.blue, // لون المشتري
                    foregroundColor: Colors.white,
                  ),
                  onPressed: loginAsBuyer,
                ),
                const SizedBox(height: 20),
                ElevatedButton.icon(
                  icon: const Icon(Icons.store, color: Colors.white),
                  label: const Text('دخول كمكتبة (تاجر)'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.all(16),
                    backgroundColor: Colors.green, // لون البائع
                    foregroundColor: Colors.white,
                  ),
                  onPressed: loginAsSeller,
                ),
              ],
            ),
          ),
        ),
      );
    }

    // فصل الشاشات بناءً على الصلاحيات
    if (currentUser!.role == UserRole.buyer) {
      return BuyerHomeScreen(user: currentUser!, onLogout: logout);
    } else {
      return SellerDashboard(user: currentUser!, onLogout: logout);
    }
  }
}
