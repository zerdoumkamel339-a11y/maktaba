import 'package:flutter/material.dart';

/// ==========================================
/// 3. شاشة معلومات المكتبة (Library Profile)
/// ==========================================
class LibraryProfileScreen extends StatelessWidget {
  final String libraryId;
  const LibraryProfileScreen({Key? key, required this.libraryId}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('تفاصيل المكتبة')),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            color: Colors.white,
            child: Row(
              children: [
                const CircleAvatar(radius: 40, child: Icon(Icons.store, size: 40)),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text('مكتبة اقرأ المركزية', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                      SizedBox(height: 5),
                      Text('📍 الجزائر العاصمة، ديدوش مراد', style: TextStyle(color: Colors.grey)),
                      Text('📞 0555-123-456', style: TextStyle(color: Colors.grey)),
                    ],
                  ),
                )
              ],
            ),
          ),
          const Divider(),
          const Expanded(
            child: Center(child: Text('قائمة كتب المكتبة...')),
          )
        ],
      ),
    );
  }
}
