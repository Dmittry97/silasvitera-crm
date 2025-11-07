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

async function cleanupOldImages() {
  try {
    console.log('\n🧹 Starting cleanup of old images field...\n');

    const products = await Product.find({});
    console.log(`Found ${products.length} products\n`);

    let cleaned = 0;

    for (const product of products) {
      // Check if product has new image fields
      if (product.mainImage || product.backImage || product.otherImages) {
        // Remove old images field
        await Product.updateOne(
          { _id: product._id },
          { $unset: { images: "" } }
        );
        
        console.log(`✓ Cleaned ${product.title}`);
        cleaned++;
      }
    }

    console.log('\n✅ Cleanup completed!');
    console.log(`   Cleaned: ${cleaned}`);
    console.log(`   Total: ${products.length}\n`);

  } catch (error) {
    console.error('❌ Cleanup error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✓ MongoDB connection closed');
  }
}

// Run cleanup
cleanupOldImages();
