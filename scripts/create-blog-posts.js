
require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Check if blog posts exist
    const posts = await prisma.blogPost.findMany();
    console.log('Current blog posts:', posts.length);
    
    // Get first user to use as author
    const firstUser = await prisma.user.findFirst();
    if (!firstUser) {
      console.log('No users found');
      return;
    }
    
    console.log('Found user:', firstUser.email);
    
    // If no posts exist, create sample posts
    if (posts.length === 0) {
      console.log('Creating sample blog posts...');
      
      await prisma.blogPost.createMany({
        data: [
          {
            title: '10 AI-Powered Strategies to 10x Your Lead Generation',
            slug: '10-ai-strategies-lead-generation',
            content: 'Discover how artificial intelligence is revolutionizing the way businesses generate and qualify leads. From automated prospect scoring to personalized outreach at scale, AI is transforming traditional sales processes. In this comprehensive guide, we\'ll explore proven strategies that top companies use to generate 10x more qualified leads while reducing manual effort by 90%.',
            excerpt: 'Learn how top companies are using AI to generate 10x more qualified leads while reducing manual effort by 90%.',
            featuredImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60',
            category: 'Lead Generation',
            status: 'PUBLISHED',
            authorId: firstUser.id,
            publishedAt: new Date(),
            readTime: 8,
            metaTitle: '10 AI-Powered Strategies to 10x Your Lead Generation | AI Reach Out',
            metaDescription: 'Discover proven AI strategies that help businesses generate 10x more qualified leads. Expert tips and case studies included.',
          },
          {
            title: 'The Complete Guide to Multi-Channel Outreach Campaigns',
            slug: 'complete-guide-multi-channel-outreach',
            content: 'Master the art of coordinated email, SMS, and voice campaigns that deliver exceptional results. Modern buyers expect personalized experiences across all touchpoints. This comprehensive guide will show you how to create cohesive multi-channel campaigns that work together to nurture prospects and drive conversions.',
            excerpt: 'A comprehensive guide to creating cohesive multi-channel campaigns that increase response rates by 300%.',
            featuredImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60',
            category: 'Email Marketing',
            status: 'PUBLISHED',
            authorId: firstUser.id,
            publishedAt: new Date(Date.now() - 86400000), // 1 day ago
            readTime: 12,
            metaTitle: 'Complete Guide to Multi-Channel Outreach Campaigns | AI Reach Out',
            metaDescription: 'Learn how to create effective multi-channel campaigns across email, SMS, and voice channels.',
          },
          {
            title: 'How to Personalize Cold Emails Using AI (With Examples)',
            slug: 'personalize-cold-emails-ai-examples',
            content: 'Stop sending generic cold emails that end up in the trash. Learn how AI can help you craft personalized messages that actually get responses. We\'ll show you real examples of AI-personalized cold emails that achieved 45% open rates and 15% response rates, along with the exact techniques used.',
            excerpt: 'Real examples of AI-personalized cold emails that achieved 45% open rates and 15% response rates.',
            featuredImage: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800&auto=format&fit=crop&q=60',
            category: 'Email Marketing',
            status: 'PUBLISHED',
            authorId: firstUser.id,
            publishedAt: new Date(Date.now() - 172800000), // 2 days ago
            readTime: 6,
            metaTitle: 'AI Email Personalization: Examples That Get Results | AI Reach Out',
            metaDescription: 'See real examples of AI-personalized cold emails with high open and response rates.',
          },
          {
            title: 'Building High-Converting Landing Pages for B2B Campaigns',
            slug: 'high-converting-landing-pages-b2b',
            content: 'Your email campaigns are only as good as the landing pages they drive to. A well-designed landing page can make the difference between a 2% conversion rate and a 25% conversion rate. Here\'s how to optimize every element of your B2B landing pages for maximum conversions.',
            excerpt: 'Design principles and conversion optimization tactics for B2B landing pages that convert at 25%+ rates.',
            featuredImage: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&auto=format&fit=crop&q=60',
            category: 'Conversion Optimization',
            status: 'PUBLISHED',
            authorId: firstUser.id,
            publishedAt: new Date(Date.now() - 259200000), // 3 days ago
            readTime: 10,
            metaTitle: 'High-Converting B2B Landing Pages: Design Guide | AI Reach Out',
            metaDescription: 'Learn how to design B2B landing pages that convert visitors into qualified leads.',
          }
        ]
      });
      
      console.log('Created 4 sample blog posts');
    }
    
    // Show current posts
    const updatedPosts = await prisma.blogPost.findMany({
      include: { author: true }
    });
    
    console.log('Blog posts after creation:');
    updatedPosts.forEach(post => {
      console.log(`- ${post.title} (Status: ${post.status})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
