import 'package:flutter/material.dart';

class UserHeaderWidget extends StatelessWidget {
  const UserHeaderWidget({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      color: const Color(0xFF1E3A8A),
      child: Row(
        children: [
          const CircleAvatar(radius: 30, backgroundColor: Colors.white, child: Icon(Icons.person, size: 30, color: Color(0xFF1E3A8A))),
          const SizedBox(width: 15),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              Text('محمد الأمين', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
              Text('mohamed@example.com', style: TextStyle(color: Colors.white70)),
            ],
          )
        ],
      ),
    );
  }
}
