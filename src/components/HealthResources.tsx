import { FileText, Video, Headphones, BookOpen } from 'lucide-react';
import { Card, CardContent } from './ui/card';

const resources = [
  {
    id: 1,
    title: 'Health Guides',
    description: 'Downloadable PDF guides on various health topics',
    icon: FileText,
    count: '50+ Guides',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    id: 2,
    title: 'Video Library',
    description: 'Expert talks and educational health videos',
    icon: Video,
    count: '100+ Videos',
    color: 'bg-purple-100 text-purple-600'
  },
  {
    id: 3,
    title: 'Podcasts',
    description: 'Listen to health experts discuss trending topics',
    icon: Headphones,
    count: '30+ Episodes',
    color: 'bg-green-100 text-green-600'
  },
  {
    id: 4,
    title: 'Medical Dictionary',
    description: 'Look up medical terms and conditions',
    icon: BookOpen,
    count: '1000+ Terms',
    color: 'bg-orange-100 text-orange-600'
  }
];

export function HealthResources() {
  return (
    <section id="resources" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-gray-900 mb-4">
            Health Resources
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Access our comprehensive library of health resources designed to educate and empower
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {resources.map((resource) => {
            const Icon = resource.icon;
            return (
              <Card
                key={resource.id}
                className="border-2 border-gray-100 hover:border-blue-200 transition-all cursor-pointer hover:shadow-md"
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 rounded-full ${resource.color} flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-gray-900 mb-2">{resource.title}</h3>
                  <p className="text-gray-600 mb-3">{resource.description}</p>
                  <span className="text-blue-600">{resource.count}</span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
