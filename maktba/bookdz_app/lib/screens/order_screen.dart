import 'package:flutter/material.dart';

/// ==========================================
/// 4. شاشة عملية الطلب (Checkout / Order)
/// ==========================================
class OrderScreen extends StatefulWidget {
  final String bookId;
  final String libraryId;
  const OrderScreen({Key? key, required this.bookId, required this.libraryId}) : super(key: key);

  @override
  _OrderScreenState createState() => _OrderScreenState();
}

class _OrderScreenState extends State<OrderScreen> {
  String deliveryType = 'delivery'; // 'pickup' or 'delivery'
  final _nameCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();

  void submitOrder() async {
    // إرسال الطلب لـ Firebase Firestore
    /*
    await FirebaseFirestore.instance.collection('orders').add({
      'userId': FirebaseAuth.instance.currentUser?.uid,
      'libraryId': widget.libraryId,
      'bookId': widget.bookId,
      'deliveryType': deliveryType,
      'address': _addressCtrl.text,
      'status': 'pending',
      'createdAt': FieldValue.serverTimestamp(),
    });
    */
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم إرسال الطلب بنجاح!')));
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('تأكيد الطلب')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('طريقة الاستلام:', style: TextStyle(fontWeight: FontWeight.bold)),
            RadioListTile(
              title: const Text('توصيل للمنزل'),
              value: 'delivery',
              groupValue: deliveryType,
              onChanged: (val) => setState(() => deliveryType = val.toString()),
            ),
            RadioListTile(
              title: const Text('استلام من المكتبة (Pickup)'),
              value: 'pickup',
              groupValue: deliveryType,
              onChanged: (val) => setState(() => deliveryType = val.toString()),
            ),
            const SizedBox(height: 20),
            TextField(
              controller: _nameCtrl,
              decoration: const InputDecoration(labelText: 'الاسم الكامل', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 10),
            if (deliveryType == 'delivery')
              TextField(
                controller: _addressCtrl,
                decoration: const InputDecoration(labelText: 'العنوان التفصيلي', border: OutlineInputBorder()),
                maxLines: 3,
              ),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: submitOrder,
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981)),
                child: const Text('تأكيد الطلب', style: TextStyle(fontSize: 18, color: Colors.white)),
              ),
            )
          ],
        ),
      ),
    );
  }
}
