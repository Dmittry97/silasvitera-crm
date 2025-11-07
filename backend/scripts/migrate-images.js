const mongoose = require('mongoose');

// Подключение к MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/silasvitera';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✓ Connected to MongoDB'))
  .catch(err => {
    console.error('✗ MongoDB connection error:', err);
    process.exit(1);
  });

// Схема продукта
const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema);

async function migrateImages() {
  try {
    console.log('\n🔄 Starting image migration...\n');

    const products = await Product.find({});
    console.log(`Found ${products.length} products to migrate\n`);

    let migrated = 0;
    let skipped = 0;

    for (const product of products) {
      // Skip if already migrated
      if (product.mainImage || product.backImage || product.otherImages) {
        console.log(`⏭️  Skipping ${product.title} (already migrated)`);
        skipped++;
        continue;
      }

      // Skip if no images
      if (!product.images || product.images.length === 0) {
        console.log(`⏭️  Skipping ${product.title} (no images)`);
        skipped++;
        continue;
      }

      // Extract filename from URL
      const extractFilename = (url) => {
        if (!url) return null;
        // Extract filename from URL like "https://silasvitera.up.railway.app/api/image/3050_1855_0_2025-11-07T14-01-30-506Z.jpg"
        const match = url.match(/\/([^\/]+\.(jpg|jpeg|png|gif|webp))$/i);
        return match ? match[1] : null;
      };

      const filenames = product.images.map(extractFilename).filter(Boolean);

      if (filenames.length === 0) {
        console.log(`⚠️  Warning: ${product.title} has images but couldn't extract filenames`);
        skipped++;
        continue;
      }

      // Assign images
      const mainImage = filenames[0] || null;
      const backImage = filenames[1] || null;
      const otherImages = filenames.slice(2);

      // Update product
      await Product.updateOne(
        { _id: product._id },
        {
          $set: {
            mainImage,
            backImage,
            otherImages,
          },
        }
      );

      console.log(`✓ Migrated ${product.title}:`);
      console.log(`  - Main: ${mainImage}`);
      console.log(`  - Back: ${backImage}`);
      console.log(`  - Other: ${otherImages.length} images`);
      console.log('');

      migrated++;
    }

    console.log('\n✅ Migration completed!');
    console.log(`   Migrated: ${migrated}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${products.length}\n`);

  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✓ MongoDB connection closed');
  }
}

// Run migration
migrateImages();
