
import { useState, useEffect } from 'react';
import { ArrowRight, Heart, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HealthTipProps {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  category: string;
  readTime: string;
}

const HealthTips = ({ tips }: { tips: HealthTipProps[] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const categoryIcons: Record<string, JSX.Element> = {
    'Heart Health': <Heart size={14} className="text-red-500" />,
    'Blood Donation': <Droplets size={14} className="text-red-500" />,
    // Add more categories as needed
  };

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-96 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 -z-10 rounded-[50%] blur-3xl transform translate-x-1/4 -translate-y-1/4" />
      
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 
            className={cn(
              "text-3xl md:text-4xl font-display font-bold mb-4 transition-all duration-700",
              isVisible ? "opacity-100 transform-none" : "opacity-0 translate-y-4"
            )}
          >
            Health Tips & News
          </h2>
          <p 
            className={cn(
              "text-muted-foreground max-w-2xl mx-auto transition-all duration-700 delay-100",
              isVisible ? "opacity-100 transform-none" : "opacity-0 translate-y-4"
            )}
          >
            Stay informed with the latest health tips, news, and medical advancements.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tips.map((tip, index) => (
            <div 
              key={tip.id}
              className={cn(
                "glass-card overflow-hidden transition-all duration-700 card-hover",
                isVisible ? "opacity-100 transform-none" : "opacity-0 translate-y-8",
                { "delay-200": index === 0 || index === 3, "delay-300": index === 1 || index === 4, "delay-400": index === 2 || index === 5 }
              )}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <div className="relative h-48 overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
                  style={{ 
                    backgroundImage: `url(${tip.imageUrl})`,
                    transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/90 text-foreground text-xs font-medium rounded-full">
                    {categoryIcons[tip.category]}
                    {tip.category}
                  </span>
                </div>
              </div>
              
              <div className="p-5">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{tip.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{tip.excerpt}</p>
                
                <div className="flex justify-between items-center pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">{tip.readTime} read</span>
                  <button 
                    className="text-primary text-sm font-medium flex items-center gap-1 group"
                  >
                    <span>Read More</span>
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div 
          className={cn(
            "mt-10 text-center transition-all duration-700 delay-500",
            isVisible ? "opacity-100 transform-none" : "opacity-0 translate-y-4"
          )}
        >
          <a href="/health-news" className="btn-secondary">
            View All Articles
          </a>
        </div>
      </div>
    </section>
  );
};

export default HealthTips;
