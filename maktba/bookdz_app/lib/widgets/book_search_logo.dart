import 'package:flutter/material.dart';

/// ==========================================
/// شعار التطبيق (كتاب + عدسة بحث)
/// ==========================================
class BookSearchLogo extends StatelessWidget {
  const BookSearchLogo({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 34,
      height: 34,
      child: Stack(
        children: [
          const Center(child: Icon(Icons.menu_book, color: Colors.white, size: 28)),
          Positioned(
            bottom: 0,
            right: 0,
            child: Container(
              decoration: const BoxDecoration(
                color: Color(0xFF1E3A8A), // نفس لون الـ AppBar لدمج الحواف
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.search, color: Color(0xFF10B981), size: 16),
            ),
          ),
        ],
      ),
    );
  }
}
