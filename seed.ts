import { faker } from "@faker-js/faker";

import { prisma } from "./lib/prisma";

async function main() {
  // Create couple of book publishers
  const publishers = await Promise.all(
    Array.from({ length: 5 }).map(() =>
      prisma.publisher.create({
        data: {
          name: faker.company.name()
        },
      }),
    ),
  );
  console.log(`Created ${publishers.length} publishers.`);

  // Create couple of genres
  const genres = await Promise.all(
    Array.from({ length: 5 }).map(() =>
      prisma.genre.create({
        data: {
          name: faker.music.genre()
        },
      }),
    ),
  );
  console.log(`Created ${genres.length} genres.`);

  // Create couple of new authors with a book each
  const users = await Promise.all(
    Array.from({ length: 5 }).map(() =>
      prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
        },
      }),
    ),
  );
  console.log(`Created ${users.length} users.`);

  // Create couple of new authors with a book each
  const authors = await Promise.all(
    Array.from({ length: 5 }).map(async (_, i) => {
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
          books: true
        },
      });
      return author;
    }),
  );
  console.log(`Created ${authors.length} authors with books.`);

  // Add 2 reviews per book
  const books = await prisma.book.findMany();

  await Promise.all(
    books.map(async (book) => {
      await Promise.all(
        Array.from({ length: 2 }).map((_, i) =>
          prisma.review.create({
            data: {
              bookId: book.id,
              userId: users[i % users.length].id,
              rating: faker.number.int({ min: 1, max: 5 }),
              comment: faker.lorem.sentence(),
            },
          }),
        ),
      );
    }),
  );
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
