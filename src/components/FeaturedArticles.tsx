import { Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

const articles = [
  {
    id: 1,
    title: '10 Simple Ways to Boost Your Immune System',
    excerpt: 'Discover evidence-based strategies to strengthen your immune system naturally through diet, exercise, and lifestyle changes.',
    category: 'Wellness',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1634144646738-809a0f8897c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwbGlmZXN0eWxlJTIwZml0bmVzc3xlbnwxfHx8fDE3NjE2MTk3MzB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    date: 'Oct 25, 2025'
  },
  {
    id: 2,
    title: 'Understanding Heart Health: Prevention and Care',
    excerpt: 'Learn about cardiovascular health, risk factors, and how to maintain a healthy heart through proper nutrition and exercise.',
    category: 'Cardiology',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFydCUyMGhlYWx0aCUyMGNhcmRpb3xlbnwxfHx8fDE3NjE1NjY2MjN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    date: 'Oct 22, 2025'
  },
  {
    id: 3,
    title: 'Nutrition Guide: Building a Balanced Diet',
    excerpt: 'Expert advice on creating a nutritious meal plan that supports your health goals and provides essential nutrients.',
    category: 'Nutrition',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1640718153995-db4d3f0a6337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxudXRyaXRpb24lMjB2ZWdldGFibGVzJTIwaGVhbHRoeXxlbnwxfHx8fDE3NjE1NDc1MzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    date: 'Oct 20, 2025'
  },
  {
    id: 4,
    title: 'Mental Health Matters: Managing Stress and Anxiety',
    excerpt: 'Practical techniques and professional insights for managing stress, anxiety, and maintaining mental wellness in daily life.',
    category: 'Mental Health',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1692200089487-9344c09e64c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW50YWwlMjBoZWFsdGglMjBtZWRpdGF0aW9ufGVufDF8fHx8MTc2MTU4MTQ2MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    date: 'Oct 18, 2025'
  },
  {
    id: 5,
    title: 'The Importance of Quality Sleep for Overall Health',
    excerpt: 'Explore the science of sleep and learn how to improve your sleep quality for better physical and mental health.',
    category: 'Sleep Health',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1631312113214-8f2f03a6962f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbGVlcCUyMHdlbGxuZXNzJTIwcmVzdHxlbnwxfHx8fDE3NjE2MTk3MzF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    date: 'Oct 15, 2025'
  },
  {
    id: 6,
    title: 'Exercise Benefits: Finding the Right Workout for You',
    excerpt: 'Comprehensive guide to different types of exercise and how to create a fitness routine that fits your lifestyle.',
    category: 'Fitness',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1634144646738-809a0f8897c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwbGlmZXN0eWxlJTIwZml0bmVzc3xlbnwxfHx8fDE3NjE2MTk3MzB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    date: 'Oct 12, 2025'
  }
];

export function FeaturedArticles() {
  return (
    <section id="articles" className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-gray-900 mb-4">
              Featured Articles
            </h2>
            <p className="text-gray-600 max-w-2xl">
              Expert-reviewed content to help you make informed health decisions
            </p>
          </div>
          <Button variant="outline" className="hidden md:flex items-center gap-2">
            View All Articles
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <div className="relative h-48 overflow-hidden">
                <ImageWithFallback
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-4 left-4 bg-white text-gray-900">
                  {article.category}
                </Badge>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-gray-500 mb-3">
                  <Clock className="w-4 h-4" />
                  <span>{article.readTime}</span>
                  <span>•</span>
                  <span>{article.date}</span>
                </div>
                <h3 className="text-gray-900 mb-2 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {article.excerpt}
                </p>
                <Button variant="ghost" className="text-blue-600 hover:text-blue-700 p-0">
                  Read More <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Button variant="outline" className="flex items-center gap-2 mx-auto">
            View All Articles
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
