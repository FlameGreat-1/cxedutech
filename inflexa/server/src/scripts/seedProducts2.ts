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
    title: 'World Flags & Countries',
    description:
      'Take children on a trip around the globe with flashcards featuring 50 country flags, capital cities, continents, and one fun cultural fact per nation. Builds geography awareness and global curiosity.',
    min_age: 4,
    max_age: 8,
    subject: 'Geography',
    focus_area: 'World Knowledge',
    price: 16.00,
    currency: 'GBP',
    format: 'physical',
    included_items: ['50 flashcards', 'World map poster', 'Continent sorting game'],
    inventory_count: 40,
  },
  {
    title: 'Telling Time',
    description:
      'Teach children to read analogue and digital clocks with step-by-step flashcards. Covers hours, half-past, quarter-past, quarter-to, and 5-minute intervals. Includes daily routine time-matching activities.',
    min_age: 5,
    max_age: 8,
    subject: 'Mathematics',
    focus_area: 'Time',
    price: 14.00,
    currency: 'GBP',
    format: 'physical',
    included_items: ['44 flashcards', 'Paper clock cut-out', 'Daily routine chart'],
    inventory_count: 45,
  },
  {
    title: 'Printable Handwriting Practice',
    description:
      'Downloadable flashcards and tracing sheets for uppercase and lowercase letters plus numbers 0-9. Dotted guidelines help children develop proper letter formation, pencil grip, and fine motor skills.',
    min_age: 3,
    max_age: 6,
    subject: 'Language',
    focus_area: 'Handwriting',
    price: 4.50,
    currency: 'GBP',
    format: 'printable',
    included_items: ['36 printable tracing sheets (PDF)', 'Letter formation guide', 'Pencil grip tips sheet'],
    inventory_count: 999,
  },
];

async function main(): Promise<void> {
  console.log('\n============================================');
  console.log('  Inflexa - Seed Products (Batch 2)');
  console.log('============================================\n');

  const pool = createPool();

  try {
    await pool.query('SELECT NOW()');
    console.log('[OK] Database connected.\n');

    const { rows: countRows } = await pool.query('SELECT COUNT(*) FROM products');
    const existingCount = parseInt(countRows[0].count, 10);
    console.log(`[INFO] Existing products in database: ${existingCount}\n`);

    let inserted = 0;
    let skipped = 0;

    for (const product of PRODUCTS) {
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
