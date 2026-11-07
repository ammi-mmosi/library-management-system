import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const catalog = [
  {
    "genre": "Fiction",
    "books": [
      {
        "title": "Things Fall Apart",
        "author": "Chinua Achebe",
        "isbn": "9780385474542"
      },
      {
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "isbn": "9780743273565"
      },
      {
        "title": "To Kill a Mockingbird",
        "author": "Harper Lee",
        "isbn": "9780061120084"
      },
      {
        "title": "The Alchemist",
        "author": "Paulo Coelho",
        "isbn": "9780061122415"
      }
    ]
  },
  {
    "genre": "Science Fiction",
    "books": [
      {
        "title": "Dune",
        "author": "Frank Herbert",
        "isbn": "9780441172719"
      },
      {
        "title": "Foundation",
        "author": "Isaac Asimov",
        "isbn": "9780553293357"
      },
      {
        "title": "Neuromancer",
        "author": "William Gibson",
        "isbn": "9780441569595"
      },
      {
        "title": "The Left Hand of Darkness",
        "author": "Ursula K. Le Guin",
        "isbn": "9780441478125"
      }
    ]
  },
  {
    "genre": "Mystery",
    "books": [
      {
        "title": "The Hound of the Baskervilles",
        "author": "Arthur Conan Doyle",
        "isbn": "9780140437867"
      },
      {
        "title": "The Big Sleep",
        "author": "Raymond Chandler",
        "isbn": "9780394758282"
      },
      {
        "title": "Gone Girl",
        "author": "Gillian Flynn",
        "isbn": "9780307588371"
      },
      {
        "title": "The Girl with the Dragon Tattoo",
        "author": "Stieg Larsson",
        "isbn": "9780307454546"
      }
    ]
  },
  {
    "genre": "Technology",
    "books": [
      {
        "title": "The Pragmatic Programmer",
        "author": "Andrew Hunt and David Thomas",
        "isbn": "9780135957059"
      },
      {
        "title": "Clean Code",
        "author": "Robert C. Martin",
        "isbn": "9780132350884"
      },
      {
        "title": "Designing Data-Intensive Applications",
        "author": "Martin Kleppmann",
        "isbn": "9781449373320"
      },
      {
        "title": "The Phoenix Project",
        "author": "Gene Kim, Kevin Behr and George Spafford",
        "isbn": "9781942788294"
      }
    ]
  },
  {
    "genre": "History",
    "books": [
      {
        "title": "Sapiens",
        "author": "Yuval Noah Harari",
        "isbn": "9780062316097"
      },
      {
        "title": "A Short History of Nearly Everything",
        "author": "Bill Bryson",
        "isbn": "9780767908184"
      },
      {
        "title": "The Silk Roads",
        "author": "Peter Frankopan",
        "isbn": "9781101912379"
      },
      {
        "title": "Guns, Germs, and Steel",
        "author": "Jared Diamond",
        "isbn": "9780393354324"
      }
    ]
  }
] as const;

async function main() {
  for (const entry of catalog) {
    const genre = await prisma.genre.upsert({
      where: { name: entry.genre },
      update: {},
      create: { name: entry.genre },
    });

    for (const book of entry.books) {
      await prisma.book.upsert({
        where: { isbn: book.isbn },
        update: { title: book.title, author: book.author, genreId: genre.id },
        create: { ...book, genreId: genre.id },
      });
    }
  }

  console.log('Seed complete: 5 genres and 20 books.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
