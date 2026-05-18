import { faker } from "@faker-js/faker";

import { prisma } from "./lib/prisma";

async function main() {
  // Create couple of book publishers
  const publishers = [];
  for (let i = 0; i < 5; ++i) {
    const publisher = await prisma.publisher.create({
      data: {
        name: faker.company.name(),
      },
    });
    publishers.push(publisher);
  }
  console.log(`Created ${publishers.length} publishers.`);

  // Create couple of genres
  const genres = [];
  for (let i = 0; i < 5; ++i) {
    const genre = await prisma.genre.create({
      data: {
        name: faker.music.genre(),
      },
    });
    genres.push(genre);
  }
  console.log(`Created ${genres.length} genres.`);
  
  
  // Create couple of new authors with a book each
  for (let i = 0; i < 5; ++i) {
    const author = await prisma.author.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        books: {
          create: [
            {
              title: faker.book.title(),
              publisherId: publishers[i % publishers.length].id,
              genres: {
                connect: [
                  { id: genres[i % genres.length].id },
                  { id: genres[(i + 1) % genres.length].id },
                ],
              },
            },
            {
              title: faker.book.title(),
              publisherId: publishers[(i + 1) % publishers.length].id,
              genres: {
                connect: [
                  { id: genres[(i + 2) % genres.length].id },
                  { id: genres[(i + 3) % genres.length].id },
                ],
              },
            },
          ],
        },
      },
      include: {
        books: true,
      },
    });
    console.log(`Created author: ${author.name} with ${author.books.length} books.`);
  }

  // Add 2 reviews per book
  const books = await prisma.book.findMany();
  for (const book of books) {
    for (let i = 0; i < 2; ++i) {
      await prisma.review.create({
        data: {
          bookId: book.id,
          author: faker.person.fullName(),
          rating: faker.number.int({ min: 1, max: 5 }),
          comment: faker.lorem.sentence(),
        },
      });
    }
  }
  console.log(`Created reviews for ${books.length} books.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
