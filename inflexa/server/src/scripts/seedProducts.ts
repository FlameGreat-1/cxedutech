import dotenv from 'dotenv';
import path from 'path';
import { Pool } from 'pg';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function createPool(): Pool {
  return new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10),
  });
}

interface SeedProduct {
  title: string;
  description: string;
  min_age: number;
  max_age: number;
  subject: string;
  focus_area: string;
  price: number;
  currency: string;
  format: 'physical' | 'printable';
  included_items: string[];
  inventory_count: number;
}

const PRODUCTS: SeedProduct[] = [
  {
    title: 'Alphabet Adventures',
    description:
      'A fun, colourful set of flashcards that teaches children the alphabet through engaging illustrations and simple words. Each letter comes with an animal, object, and action to reinforce learning.',
    min_age: 3,
    max_age: 5,
    subject: 'Language',
    focus_area: 'Phonics',
    price: 15.00,
    currency: 'GBP',
    format: 'physical',
    included_items: ['52 flashcards', 'Activity guide', 'Storage box'],
    inventory_count: 50,
  },
  {
    title: 'Number Ninjas 1-20',
    description:
      'Master counting from 1 to 20 with vibrant flashcards featuring objects to count, number tracing guides, and simple addition concepts. Perfect for building early numeracy skills.',
    min_age: 3,
    max_age: 5,
    subject: 'Mathematics',
    focus_area: 'Counting',
    price: 15.00,
    currency: 'GBP',
    format: 'physical',
    included_items: ['40 flashcards', 'Counting chart poster', 'Parent guide'],
    inventory_count: 45,
  },
  {
    title: 'Shape Explorers',
    description:
      'Introduce children to basic and intermediate shapes through real-world examples. From circles and squares to hexagons and ovals, each card shows where shapes appear in everyday life.',
    min_age: 3,
    max_age: 6,
    subject: 'Mathematics',
    focus_area: 'Shapes',
    price: 12.00,
    currency: 'GBP',
    format: 'physical',
    included_items: ['36 flashcards', 'Shape matching game', 'Activity sheet'],
    inventory_count: 60,
  },
  {
    title: 'Colour Kingdom',
    description:
      'A vivid flashcard pack that teaches primary, secondary, and tertiary colours through beautiful illustrations. Includes colour mixing concepts and colour-in-nature activities.',
    min_age: 3,
    max_age: 5,
    subject: 'Art',
    focus_area: 'Colours',
    price: 10.00,
    currency: 'GBP',
    format: 'physical',
    included_items: ['30 flashcards', 'Colour wheel poster', 'Colouring sheet'],
    inventory_count: 55,
  },
  {
    title: 'My First Words',
    description:
      'Build vocabulary with 60 essential first words grouped by category: food, animals, family, body parts, clothing, and household items. Large text and clear images for easy recognition.',
    min_age: 3,
    max_age: 4,
    subject: 'Language',
    focus_area: 'Vocabulary',
    price: 18.00,
    currency: 'GBP',
    format: 'physical',
    included_items: ['60 flashcards', 'Word list booklet', 'Storage pouch'],
    inventory_count: 40,
  },
  {
    title: 'Animal Safari',
    description:
      'Explore the animal kingdom with flashcards covering farm animals, wild animals, sea creatures, and insects. Each card includes the animal name, sound, habitat, and a fun fact.',
    min_age: 3,
    max_age: 6,
    subject: 'Science',
    focus_area: 'Animals',
    price: 15.00,
    currency: 'GBP',
    format: 'physical',
    included_items: ['48 flashcards', 'Animal sounds guide', 'Habitat map poster'],
    inventory_count: 50,
  },
  {
    title: 'Phonics Fun Pack',
    description:
      'A structured phonics programme in flashcard form. Covers CVC words, blends, digraphs, and sight words. Designed to align with early reading milestones for ages 4-7.',
    min_age: 4,
    max_age: 7,
    subject: 'Literature',
    focus_area: 'Phonics',
    price: 20.00,
    currency: 'GBP',
    format: 'physical',
    included_items: ['80 flashcards', 'Phonics progression chart', 'Parent instruction guide'],
    inventory_count: 35,
  },
  {
    title: 'Times Tables Mastery',
    description:
      'Make multiplication memorable with trick-based flashcards covering tables 1 through 12. Colour-coded by difficulty with visual patterns that help children spot number relationships.',
    min_age: 5,
    max_age: 8,
    subject: 'Mathematics',
    focus_area: 'Multiplication',
    price: 18.00,
    currency: 'GBP',
    format: 'physical',
    included_items: ['72 flashcards', 'Times table grid poster', 'Quick quiz cards'],
    inventory_count: 40,
  },
  {
    title: 'Solar System Explorers',
    description:
      'Journey through space with flashcards covering all 8 planets, the sun, moon, asteroids, and key space concepts. Stunning illustrations with facts about size, distance, and temperature.',
    min_age: 5,
    max_age: 8,
    subject: 'Science',
    focus_area: 'Space',
    price: 16.00,
    currency: 'GBP',
    format: 'physical',
    included_items: ['36 flashcards', 'Solar system poster', 'Glow-in-the-dark stickers'],
    inventory_count: 30,
  },
  {
    title: 'Emotions & Feelings',
    description:
      'Help children identify and express emotions with beautifully illustrated flashcards. Covers happy, sad, angry, scared, surprised, and 20+ more feelings with coping strategies on each card.',
    min_age: 3,
    max_age: 6,
    subject: 'Social Skills',
    focus_area: 'Emotional Intelligence',
    price: 14.00,
    currency: 'GBP',
    format: 'physical',
    included_items: ['32 flashcards', 'Feelings chart poster', 'Discussion prompt cards'],
    inventory_count: 45,
  },
  {
    title: 'Printable Alphabet Pack',
    description:
      'Instant download alphabet flashcards you can print at home. High-resolution designs with uppercase, lowercase, and picture association for each letter. Print as many copies as you need.',
    min_age: 3,
    max_age: 5,
    subject: 'Language',
    focus_area: 'Phonics',
    price: 5.00,
    currency: 'GBP',
    format: 'printable',
    included_items: ['26 printable flashcard sheets (PDF)', 'Printing instructions', 'Cutting guide'],
    inventory_count: 999,
  },
  {
    title: 'Printable Maths Starter',
    description:
      'A downloadable set of maths flashcards covering numbers 1-50, basic addition, and subtraction. Print on card stock for durability. Includes answer keys on the reverse side.',
    min_age: 4,
    max_age: 7,
    subject: 'Mathematics',
    focus_area: 'Arithmetic',
    price: 6.00,
    currency: 'GBP',
    format: 'printable',
    included_items: ['50 printable flashcard sheets (PDF)', 'Answer key sheet', 'Recommended print settings guide'],
    inventory_count: 999,
  },
  {
    title: 'Sight Words Champions',
    description:
      'The 100 most common sight words every early reader needs to know. Organised by difficulty level with sentence examples on the back of each card. Builds reading fluency fast.',
    min_age: 4,
    max_age: 7,
    subject: 'Literature',
    focus_area: 'Reading',
    price: 20.00,
    currency: 'GBP',
    format: 'physical',
    included_items: ['100 flashcards', 'Progress tracker chart', 'Reward stickers'],
    inventory_count: 35,
  },
  {
    title: 'Body Parts & Senses',
    description:
      'Teach children about the human body with flashcards covering major body parts, the five senses, and basic hygiene. Clear labelled illustrations with simple explanations.',
    min_age: 3,
    max_age: 6,
    subject: 'Science',
    focus_area: 'Human Body',
    price: 13.00,
    currency: 'GBP',
    format: 'physical',
    included_items: ['40 flashcards', 'Body parts poster', 'Senses activity sheet'],
    inventory_count: 50,
  },
  {
    title: 'Printable Story Builders',
    description:
      'Creative storytelling flashcards you can print at home. Includes character cards, setting cards, and plot cards that children combine to create their own stories. Sparks imagination and language skills.',
    min_age: 5,
    max_age: 8,
    subject: 'Literature',
    focus_area: 'Creative Writing',
    price: 7.00,
    currency: 'GBP',
    format: 'printable',
    included_items: ['60 printable story cards (PDF)', 'Story template sheet', 'How-to-play guide'],
    inventory_count: 999,
  },
];

async function main(): Promise<void> {
  console.log('\n============================================');
  console.log('  Inflexa - Seed Products');
  console.log('============================================\n');

  const pool = createPool();

  try {
    // Verify connection
    await pool.query('SELECT NOW()');
    console.log('[OK] Database connected.\n');

    // Check how many products already exist
    const { rows: countRows } = await pool.query('SELECT COUNT(*) FROM products');
    const existingCount = parseInt(countRows[0].count, 10);
    console.log(`[INFO] Existing products in database: ${existingCount}\n`);

    let inserted = 0;
    let skipped = 0;

    for (const product of PRODUCTS) {
      // Skip if a product with the exact same title already exists
      const { rows: existing } = await pool.query(
        'SELECT id FROM products WHERE title = $1',
        [product.title]
      );

      if (existing.length > 0) {
        console.log(`[SKIP] "${product.title}" already exists (id: ${existing[0].id})`);
        skipped++;
        continue;
      }

      const { rows } = await pool.query(
        `INSERT INTO products
           (title, description, min_age, max_age, subject, focus_area,
            price, currency, format, included_items, inventory_count)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING id, title`,
        [
          product.title,
          product.description,
          product.min_age,
          product.max_age,
          product.subject,
          product.focus_area,
          product.price,
          product.currency,
          product.format,
          product.included_items,
          product.inventory_count,
        ]
      );

      console.log(`[OK] Created "${rows[0].title}" (id: ${rows[0].id})`);
      inserted++;
    }

    console.log('\n--------------------------------------------');
    console.log(`  Inserted: ${inserted}`);
    console.log(`  Skipped:  ${skipped} (already existed)`);
    console.log(`  Total:    ${existingCount + inserted} products now in database`);
    console.log('--------------------------------------------\n');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`\n[ERROR] Failed to seed products: ${message}`);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
