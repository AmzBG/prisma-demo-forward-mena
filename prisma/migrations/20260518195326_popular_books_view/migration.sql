CREATE VIEW "PopularBooks" AS
SELECT
    b.id AS book_id,
    b.title,
    p.name AS publisher_name,
    a.name AS author_name,
    AVG(r.rating) AS avg_rating
FROM 
    "Book" b
LEFT JOIN 
    "Publisher" p ON b."publisherId" = p.id
LEFT JOIN 
    "Author" a ON b."authorId" = a.id
JOIN 
    "Review" r ON r."bookId" = b.id
GROUP BY 
    b.id, b.title, p.name, a.name
HAVING 
    AVG(r.rating) > 4
ORDER BY 
    avg_rating DESC;