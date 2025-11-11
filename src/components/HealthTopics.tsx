import { Heart, Brain, Utensils, Activity, Moon, Stethoscope } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import React from 'react';

const topics = [
  {
    id: 1,
    title: 'Heart Health',
    description: 'Learn about cardiovascular wellness and prevention',
    icon: Heart,
    color: 'bg-red-100 text-red-600',
    hoverColor: 'hover:bg-red-50'
  },
  {
    id: 2,
    title: 'Mental Wellness',
    description: 'Mental health resources and stress management',
    icon: Brain,
    color: 'bg-purple-100 text-purple-600',
    hoverColor: 'hover:bg-purple-50'
  },
  {
    id: 3,
    title: 'Nutrition',
    description: 'Healthy eating habits and dietary guidance',
    icon: Utensils,
    color: 'bg-green-100 text-green-600',
    hoverColor: 'hover:bg-green-50'
  },
  {
    id: 4,
    title: 'Fitness & Exercise',
    description: 'Stay active with personalized fitness tips',
    icon: Activity,
    color: 'bg-orange-100 text-orange-600',
    hoverColor: 'hover:bg-orange-50'
  },
  {
    id: 5,
    title: 'Sleep Health',
    description: 'Improve sleep quality and manage disorders',
    icon: Moon,
    color: 'bg-indigo-100 text-indigo-600',
    hoverColor: 'hover:bg-indigo-50'
  },
  {
    id: 6,
    title: 'General Medicine',
    description: 'Common conditions and treatment information',
    icon: Stethoscope,
    color: 'bg-blue-100 text-blue-600',
    hoverColor: 'hover:bg-blue-50'
  }
];

export function HealthTopics() {
  return (
    <section id="topics" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-gray-900 mb-4">
            Explore Health Topics
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover comprehensive information across a wide range of health topics 
            to support your wellness journey
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => {
            const Icon = topic.icon;
            return (
              <Card
                key={topic.id}
                className={`border-2 border-gray-100 transition-all cursor-pointer ${topic.hoverColor} hover:shadow-lg`}
              >
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg ${topic.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-gray-900 mb-2">{topic.title}</h3>
                  <p className="text-gray-600">{topic.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
