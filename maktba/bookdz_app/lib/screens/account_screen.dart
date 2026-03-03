import 'package:bookdz_app/services/auth_service.dart';
import 'package:flutter/material.dart';
import '../widgets/user_header_widget.dart';

/// ==========================================
/// 5. و 6. شاشة حساب المستخدم/المكتبة (Account)
/// ==========================================
class AccountScreen extends StatelessWidget {
  const AccountScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // يمكن التحقق من نوع الحساب (Role) لمعرفة أي قوائم سنظهر
    bool isLibraryAccount = false; // افتراضياً

    return Scaffold(
      appBar: AppBar(title: const Text('حسابي')),
      body: ListView(
        children: [
          const UserHeaderWidget(),
          if (!isLibraryAccount) ...[
            ListTile(leading: const Icon(Icons.shopping_bag), title: const Text('طلباتي السابقة'), onTap: () {}),
            ListTile(leading: const Icon(Icons.favorite), title: const Text('المفضلة'), onTap: () {}),
          ] else ...[
            // خيارات المكتبة لإدارة المهام
            ListTile(leading: const Icon(Icons.add_box), title: const Text('إضافة كتاب جديد'), onTap: () {}),
            ListTile(leading: const Icon(Icons.inbox), title: const Text('الطلبات الواردة (الجديدة)'), onTap: () {}),
            ListTile(leading: const Icon(Icons.inventory), title: const Text('إدارة المخزون والأسعار'), onTap: () {}),
          ],
          const Divider(),
          ListTile(leading: const Icon(Icons.settings), title: const Text('الإعدادات'), onTap: () {}),
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.red),
            title: const Text('تسجيل الخروج', style: TextStyle(color: Colors.red)),
            onTap: () async {
              await AuthService().signOut();
              // The AuthWrapper will handle navigation
            },
          ),
        ],
      ),
    );
  }
}
