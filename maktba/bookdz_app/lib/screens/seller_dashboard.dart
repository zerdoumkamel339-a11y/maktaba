import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../models/order_model.dart';
import '../models/book_model.dart';
import '../services/backend_service.dart';

class SellerDashboard extends StatefulWidget {
  final UserModel user;
  final VoidCallback onLogout;

  const SellerDashboard({Key? key, required this.user, required this.onLogout}) : super(key: key);

  @override
  State<SellerDashboard> createState() => _SellerDashboardState();
}

class _SellerDashboardState extends State<SellerDashboard> {
  List<OrderModel> _myOrders = [];

  @override
  void initState() {
    super.initState();
    _fetchOrders();
  }

  void _fetchOrders() {
    setState(() {
      _myOrders = BackendService.getLibraryOrders(widget.user.libraryId!);
    });
  }

  void _updateOrder(OrderModel order, OrderStatus newStatus) async {
    // محاكاة تأخير الشبكة
    await Future.delayed(const Duration(milliseconds: 300));
    
    if (!mounted) return;
    
    BackendService.updateOrderStatus(order.id, newStatus);
    
    // تحديث القائمة جزئياً بدل الـ setState العام
    _fetchOrders();
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('تم تحديث حالة الطلب إلى: ${_getStatusLabel(newStatus)}'))
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
        title: Text('لوحة تحكم: ${widget.user.name}'),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _fetchOrders, tooltip: 'تحديث الطلبات'),
          IconButton(icon: const Icon(Icons.logout), onPressed: widget.onLogout, tooltip: 'تسجيل خروج'),
        ],
      ),
      body: _myOrders.isEmpty
          ? const Center(child: Text('لا توجد طلبات جديدة حالياً.'))
          : ListView.builder(
              itemCount: _myOrders.length,
              itemBuilder: (context, index) {
                final order = _myOrders[index];
                
                // البحث عن تفاصيل الكتاب المرتبط بالطلب للعرض بطريقة آمنة
                final book = BackendService.getBookById(order.bookId) 
                  ?? BookModel(id: '', libraryId: '', title: 'غير معروف', author: '', price: 0, stock: 0);
                
                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  elevation: 2,
                  child: ListTile(
                    title: Text('طلب كتاب: ${book.title}', style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text('الكمية المتبقية: ${book.stock}\nالحالة: ${_getStatusLabel(order.status)}'),
                    isThreeLine: true,
                    trailing: _buildOrderActions(order),
                  ),
                );
              },
            ),
    );
  }

  // مترجم حالة الطلب للغة العربية
  String _getStatusLabel(OrderStatus status) {
    switch (status) {
      case OrderStatus.pending: return 'قيد الانتظار ⏳';
      case OrderStatus.accepted: return 'تم القبول ✅';
      case OrderStatus.rejected: return 'مرفوض ❌';
      case OrderStatus.completed: return 'مكتمل 🏁';
    }
  }

  // بناء الأزرار بناءً على حالة الطلب الحالية
  Widget _buildOrderActions(OrderModel order) {
    if (order.status == OrderStatus.pending) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconButton(
            icon: const Icon(Icons.check_circle, color: Colors.green, size: 32),
            tooltip: 'قبول الطلب',
            onPressed: () => _updateOrder(order, OrderStatus.accepted),
          ),
          IconButton(
            icon: const Icon(Icons.cancel, color: Colors.red, size: 32),
            tooltip: 'رفض الطلب',
            onPressed: () => _updateOrder(order, OrderStatus.rejected),
          ),
        ],
      );
    } else {
      // إذا كان الطلب منتهياً، لا نظهر أزراراً، فقط أيقونة تدل على الحالة المحسومة
      Color statusColor = order.status == OrderStatus.accepted ? Colors.green : Colors.red;
      IconData icon = order.status == OrderStatus.accepted ? Icons.done_all : Icons.error_outline;
      return Icon(icon, color: statusColor, size: 30);
    }
  }
}
