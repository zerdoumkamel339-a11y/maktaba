class BookModel {
  final String id;
  final String libraryId;
  final String title;
  final String author;
  final double price;
  int stock;

  BookModel({
    required this.id,
    required this.libraryId,
    required this.title,
    required this.author,
    required this.price,
    required this.stock,
  });
}
