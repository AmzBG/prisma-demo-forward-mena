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
            },
            {
              title: faker.book.title(),
              publisherId: publishers[(i + 1) % publishers.length].id,
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
