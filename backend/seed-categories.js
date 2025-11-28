// backend/seed-categories.js
// Run this to add categories to your database: node seed-categories.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './src/models/categoryModel.js';

dotenv.config();

const categories = [
  {
    name: 'Technology',
    description: 'Software development, IT, and tech-related jobs',
    icon: '💻',
    color: '#3B82F6'
  },
  {
    name: 'Design',
    description: 'UI/UX, graphic design, and creative roles',
    icon: '🎨',
    color: '#EC4899'
  },
  {
    name: 'Marketing',
    description: 'Digital marketing, SEO, content, and advertising',
    icon: '📱',
    color: '#8B5CF6'
  },
  {
    name: 'Sales',
    description: 'Business development, account management, and sales',
    icon: '💼',
    color: '#10B981'
  },
  {
    name: 'Finance',
    description: 'Accounting, financial analysis, and banking',
    icon: '💰',
    color: '#F59E0B'
  },
  {
    name: 'Healthcare',
    description: 'Medical, nursing, and healthcare services',
    icon: '⚕️',
    color: '#EF4444'
  },
  {
    name: 'Education',
    description: 'Teaching, training, and educational services',
    icon: '📚',
    color: '#06B6D4'
  },
  {
    name: 'Engineering',
    description: 'Mechanical, electrical, civil, and other engineering',
    icon: '⚙️',
    color: '#6366F1'
  },
  {
    name: 'Customer Service',
    description: 'Support, help desk, and customer relations',
    icon: '🎧',
    color: '#14B8A6'
  },
  {
    name: 'Human Resources',
    description: 'Recruitment, HR management, and people operations',
    icon: '👥',
    color: '#A855F7'
  },
  {
    name: 'Legal',
    description: 'Law, compliance, and legal services',
    icon: '⚖️',
    color: '#64748B'
  },
  {
    name: 'Operations',
    description: 'Project management, logistics, and operations',
    icon: '📊',
    color: '#F97316'
  },
  {
    name: 'Data Science',
    description: 'Data analysis, machine learning, and AI',
    icon: '📈',
    color: '#0EA5E9'
  },
  {
    name: 'Writing',
    description: 'Content writing, copywriting, and editorial',
    icon: '✍️',
    color: '#84CC16'
  },
  {
    name: 'Hospitality',
    description: 'Hotels, restaurants, tourism, and events',
    icon: '🏨',
    color: '#F43F5E'
  },
  {
    name: 'Construction',
    description: 'Building, architecture, and construction',
    icon: '🏗️',
    color: '#78716C'
  },
  {
    name: 'Retail',
    description: 'Store management, merchandising, and retail sales',
    icon: '🛍️',
    color: '#FB923C'
  },
  {
    name: 'Media',
    description: 'Journalism, broadcasting, and media production',
    icon: '📺',
    color: '#DC2626'
  },
  {
    name: 'Agriculture',
    description: 'Farming, agribusiness, and agricultural services',
    icon: '🌾',
    color: '#22C55E'
  },
  {
    name: 'Other',
    description: 'Jobs that don\'t fit other categories',
    icon: '📦',
    color: '#94A3B8'
  }
];

const seedCategories = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing categories (optional - comment out if you want to keep existing)
    console.log('🗑️  Clearing existing categories...');
    await Category.deleteMany({});
    console.log('✅ Cleared existing categories\n');

    // Insert categories
    console.log('📝 Creating categories...');
    const createdCategories = await Category.insertMany(categories);
    
    console.log(`✅ Successfully created ${createdCategories.length} categories:\n`);
    
    createdCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.icon} ${cat.name} (${cat.color})`);
    });

    console.log('\n🎉 Seeding completed successfully!');
    console.log('📊 Check MongoDB Compass in the "categories" collection');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();