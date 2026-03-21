const { connectDatabase } = require('./database');
const { config } = require('./environment');
const logger = require('../utils/logger');
const User = require('../models/User');
const Material = require('../models/Material');
const Product = require('../models/Product');
const Machine = require('../models/Machine');
const Supplier = require('../models/Supplier');

async function seed() {
  await connectDatabase();

  const adminEmail = (config.adminEmail || process.env.ADMIN_EMAIL || 'admin@bikepartsystem.com').toLowerCase();
  const adminPassword = config.adminPassword || process.env.ADMIN_PASSWORD || 'Change@123';

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: 'System Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });
    logger.info('Seeded default admin user');
  }

  const materials = [
    { name: 'Polypropylene', code: 'MAT-PP', type: 'PP', quantityInStock: 500, reorderLevel: 100, unitCost: 280 },
    { name: 'ABS Granules', code: 'MAT-ABS', type: 'ABS', quantityInStock: 300, reorderLevel: 80, unitCost: 420 },
    { name: 'Polyethylene', code: 'MAT-PE', type: 'PE', quantityInStock: 350, reorderLevel: 90, unitCost: 260 },
    { name: 'Polycarbonate', code: 'MAT-PC', type: 'PC', quantityInStock: 200, reorderLevel: 60, unitCost: 680 },
    { name: 'POM Resin', code: 'MAT-POM', type: 'POM', quantityInStock: 180, reorderLevel: 50, unitCost: 710 },
  ];
  for (const item of materials) {
    await Material.updateOne({ code: item.code }, { $setOnInsert: item }, { upsert: true });
  }

  const products = [
    { name: 'Mud Flap', code: 'PRD-MF-CD70', bikeModel: 'Honda CD70', category: 'Mud Flap', sellingPrice: 450, currentStock: 120 },
    { name: 'Footrest', code: 'PRD-FR-CD125', bikeModel: 'Honda CD125', category: 'Footrest', sellingPrice: 650, currentStock: 80 },
    { name: 'Headlight Mirror', code: 'PRD-HM-CD70', bikeModel: 'Honda CD70', category: 'Mirror', sellingPrice: 520, currentStock: 95 },
  ];
  for (const item of products) {
    await Product.updateOne({ code: item.code }, { $setOnInsert: item }, { upsert: true });
  }

  const machines = [
    { name: 'Injection Machine 1', code: 'MCH-01', status: 'active' },
    { name: 'Injection Machine 2', code: 'MCH-02', status: 'active' },
  ];
  for (const item of machines) {
    await Machine.updateOne({ code: item.code }, { $setOnInsert: item }, { upsert: true });
  }

  const suppliers = [
    { name: 'Karachi Polymer Traders', contactPerson: 'Ahsan Ali', phone: '03001234567' },
    { name: 'Lahore Plastic Hub', contactPerson: 'Bilal Khan', phone: '03007654321' },
  ];
  for (const item of suppliers) {
    await Supplier.updateOne({ name: item.name }, { $setOnInsert: item }, { upsert: true });
  }

  logger.info('Seed data completed successfully');
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error('Seed failed: %s', error.message);
      process.exit(1);
    });
}

module.exports = { seed };
