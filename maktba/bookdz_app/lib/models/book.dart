import 'package:cloud_firestore/cloud_firestore.dart';

class Book {
  final String id;
  final String title;
  final String author;
  final String price;
  final String cover;
  final String? category;
  final String? desc;

  Book({
    required this.id,
    required this.title,
    required this.author,
    required this.price,
    required this.cover,
    this.category,
    this.desc,
  });

  factory Book.fromFirestore(DocumentSnapshot doc) {
    Map data = doc.data() as Map<String, dynamic>;
    return Book(
      id: doc.id,
      title: data['title'] ?? '',
      author: data['author'] ?? '',
      price: data['price'] ?? '0',
      cover: data['cover'] ?? 'https://via.placeholder.com/150',
      category: data['category'],
      desc: data['desc'],
    );
  }
}
