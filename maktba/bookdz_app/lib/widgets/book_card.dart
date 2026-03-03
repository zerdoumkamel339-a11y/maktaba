import 'package:bookdz_app/models/book.dart';
import 'package:flutter/material.dart';

class BookCard extends StatelessWidget {
  final Book book;

  const BookCard({Key? key, required this.book}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [BoxShadow(color: Colors.grey.withOpacity(0.1), blurRadius: 5)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: Colors.grey,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                image: DecorationImage(
                  image: NetworkImage(book.cover),
                  fit: BoxFit.cover,
                )
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(book.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14), maxLines: 1, overflow: TextOverflow.ellipsis),
                Text(book.author, style: const TextStyle(color: Colors.grey, fontSize: 12)),
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('${book.price} د.ج', style: const TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.bold)),
                    const Icon(Icons.add_shopping_cart, size: 20, color: Color(0xFF1E3A8A)),
                  ],
                ),
                // This information is not in the simple book model, so I will comment it out for now.
                // Text('متوفر في: $libraryName', style: const TextStyle(fontSize: 10, color: Colors.grey)),
              ],
            ),
          )
        ],
      ),
    );
  }
}
