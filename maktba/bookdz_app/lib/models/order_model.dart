enum OrderStatus { pending, accepted, completed, rejected }

class OrderModel {
  final String id;
  final String buyerId;
  final String libraryId;
  final String bookId;
  OrderStatus status;

  OrderModel({
    required this.id,
    required this.buyerId,
    required this.libraryId,
    required this.bookId,
    this.status = OrderStatus.pending,
  });
}
