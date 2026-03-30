import 'dotenv/config';
import { PrismaClient, PostType } from '../src/generated/prisma';
import { prisma } from '../src/lib/prisma'

async function main() {
  console.log('Starting seeding...');

  // 1. Create a default user or Find a default user (Prisma Studio)
  const user = {
    id: "user_id",
    email: 'user_email',
    username: 'user_username',
    name: 'user_name',
    accountType: 'user_accountType',
  }

  console.log(`User created/found: ${user.username}`);

  // 2. Seed TEXT posts
  await prisma.post.createMany({
    data: [
      {
        id: 'post_text_1',
        type: PostType.TEXT,
        title: 'The Meaning of Amor Fati',
        content: 'Amor fati is a Latin phrase that may be translated as "love of fate" or "love of one\'s fate". It is used to describe an attitude in which one sees everything that happens in one\'s life, including suffering and loss, as good or, at the very least, necessary.',
        authorId: user.id,
        tags: 'philosophy,stoicism',
      },
      {
        id: 'post_text_2',
        type: PostType.TEXT,
        title: 'Daily Reflection',
        content: 'To live is to suffer, to survive is to find some meaning in the suffering.',
        authorId: user.id,
        tags: 'reflection,life',
      },
      {
        id: 'post_text_3',
        type: PostType.TEXT,
        title: 'The Obstacle is the Way',
        content: 'The impediment to action advances action. What stands in the way becomes the way.',
        authorId: user.id,
        tags: 'marcus-aurelius,action',
      },
      {
        id: 'post_text_4',
        type: PostType.TEXT,
        title: 'Memento Mori',
        content: 'Keep death before your eyes daily and you will never entertain any abject thought or desire anything to excess.',
        authorId: user.id,
        tags: 'epictetus,perspective',
      },
      {
        id: 'post_text_5',
        type: PostType.TEXT,
        title: 'The Inner Citadel',
        content: 'Nowhere can man find a quieter or more untroubled retreat than in his own soul.',
        authorId: user.id,
        tags: 'meditations,peace',
      },
      {
        id: 'post_text_6',
        type: PostType.TEXT,
        title: 'On the Shortness of Life',
        content: 'It is not that we have a short space of time, but that we waste much of it.',
        authorId: user.id,
        tags: 'seneca,time',
      },
      {
        id: 'post_text_7',
        type: PostType.TEXT,
        title: 'The View from Above',
        content: 'Look at the stars and see yourself running with them.',
        authorId: user.id,
        tags: 'cosmos,stoicism',
      },
      {
        id: 'post_text_8',
        type: PostType.TEXT,
        title: 'Premeditatio Malorum',
        content: 'Rehearse them in your mind: exile, torture, war, shipwreck. All the terms of our human lot should be before our eyes.',
        authorId: user.id,
        tags: 'seneca,preparation',
      },
      {
        id: 'post_text_9',
        type: PostType.TEXT,
        title: 'Dichotomy of Control',
        content: 'Some things are within our power, while others are not. Within our power are opinion, motivation, desire, aversion, and, in a word, whatever is of our own doing.',
        authorId: user.id,
        tags: 'epictetus,control',
      },
      {
        id: 'post_text_10',
        type: PostType.TEXT,
        title: 'Sympatheia',
        content: 'What is not good for the beehive cannot be good for the bee.',
        authorId: user.id,
        tags: 'connection,nature',
      },
    ],
  });

  // 3. Seed IMAGE posts
  await prisma.post.createMany({
    data: [
      {
        id: 'post_img_1',
        type: PostType.IMAGE,
        title: 'Eternal Return',
        images: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b'],
        authorId: user.id,
        tags: 'landscape,nature',
      },
      {
        id: 'post_img_2',
        type: PostType.IMAGE,
        title: 'Urban Stoic',
        images: ['https://images.unsplash.com/photo-1514565131-fce0801e5785'],
        authorId: user.id,
        tags: 'city,architecture',
      },
      {
        id: 'post_img_3',
        type: PostType.IMAGE,
        title: 'Mountain Stillness',
        images: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b'],
        authorId: user.id,
        tags: 'mountain,peace',
      },
      {
        id: 'post_img_4',
        type: PostType.IMAGE,
        title: 'Ocean Depths',
        images: ['https://images.unsplash.com/photo-1505118380757-91f5f5632de0'],
        authorId: user.id,
        tags: 'water,vast',
      },
      {
        id: 'post_img_5',
        type: PostType.IMAGE,
        title: 'Forest Path',
        images: ['https://images.unsplash.com/photo-1441974231531-c6227db76b6e'],
        authorId: user.id,
        tags: 'forest,journey',
      },
      {
        id: 'post_img_6',
        type: PostType.IMAGE,
        title: 'Desert Solitude',
        images: ['https://images.unsplash.com/photo-1473580044384-7ba9967e16a0'],
        authorId: user.id,
        tags: 'desert,minimal',
      },
      {
        id: 'post_img_7',
        type: PostType.IMAGE,
        title: 'Ancient Ruins',
        images: ['https://images.unsplash.com/photo-1552832230-c0197dd311b5', 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e'],
        authorId: user.id,
        tags: 'history,rome',
      },
      {
        id: 'post_img_8',
        type: PostType.IMAGE,
        title: 'Modern Brutalism',
        images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab'],
        authorId: user.id,
        tags: 'design,structure',
      },
      {
        id: 'post_img_9',
        type: PostType.IMAGE,
        title: 'Starry Night',
        images: ['https://images.unsplash.com/photo-1534796636912-3b95b3ab5986', 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc'],
        authorId: user.id,
        tags: 'night,cosmos',
      },
      {
        id: 'post_img_10',
        type: PostType.IMAGE,
        title: 'Morning Mist',
        images: ['https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc'],
        authorId: user.id,
        tags: 'morning,soft',
      },
    ],
  });

  // 4. Seed FILM posts
  await prisma.post.createMany({
    data: [
      {
        id: 'post_film_1',
        type: PostType.FILM,
        filmTitle: 'The Seventh Seal',
        year: '1957',
        rating: 5.0,
        content: 'A knight returns from the Crusades and plays a game of chess with Death.',
        authorId: user.id,
        tags: 'classic,bergman',
      },
      {
        id: 'post_film_2',
        type: PostType.FILM,
        filmTitle: 'Wings of Desire',
        year: '1987',
        rating: 4.8,
        content: 'An angel tires of overseeing human activity and wishes to become human.',
        authorId: user.id,
        tags: 'cinema,art',
      },
      {
        id: 'post_film_3',
        type: PostType.FILM,
        filmTitle: 'Stalker',
        year: '1979',
        rating: 4.9,
        content: 'A guide leads two men through a mysterious area known as the Zone.',
        authorId: user.id,
        tags: 'tarkovsky,sci-fi',
      },
      {
        id: 'post_film_4',
        type: PostType.FILM,
        filmTitle: 'Ikiru',
        year: '1952',
        rating: 4.9,
        content: 'A terminally ill bureaucrat searches for meaning in his final days.',
        authorId: user.id,
        tags: 'kurosawa,life',
      },
      {
        id: 'post_film_5',
        type: PostType.FILM,
        filmTitle: '8 1/2',
        year: '1963',
        rating: 4.7,
        content: 'A harried movie director retreats into his memories and fantasies.',
        authorId: user.id,
        tags: 'fellini,surreal',
      },
      {
        id: 'post_film_6',
        type: PostType.FILM,
        filmTitle: 'Tokyo Story',
        year: '1953',
        rating: 5.0,
        content: 'An old couple visit their children and grandchildren in the city.',
        authorId: user.id,
        tags: 'ozu,family',
      },
      {
        id: 'post_film_7',
        type: PostType.FILM,
        filmTitle: 'Mirror',
        year: '1975',
        rating: 4.8,
        content: 'A dying man recalls his childhood, his mother, and the war.',
        authorId: user.id,
        tags: 'tarkovsky,poetic',
      },
      {
        id: 'post_film_8',
        type: PostType.FILM,
        filmTitle: 'Persona',
        year: '1966',
        rating: 4.7,
        content: 'A nurse and her mute patient develop a strange psychological bond.',
        authorId: user.id,
        tags: 'bergman,psychological',
      },
      {
        id: 'post_film_9',
        type: PostType.FILM,
        filmTitle: 'Wild Strawberries',
        year: '1957',
        rating: 4.6,
        content: 'An elderly professor recalls his past while traveling to receive an award.',
        authorId: user.id,
        tags: 'bergman,nostalgia',
      },
      {
        id: 'post_film_10',
        type: PostType.FILM,
        filmTitle: 'The 400 Blows',
        year: '1959',
        rating: 4.8,
        content: 'A young boy in Paris turns to a life of petty crime.',
        authorId: user.id,
        tags: 'truffaut,new-wave',
      },
    ],
  });

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
