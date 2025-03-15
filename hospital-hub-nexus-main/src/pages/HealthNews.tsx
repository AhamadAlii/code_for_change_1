
import { Card } from "@/components/ui/card";

const HealthNews = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl md:text-4xl font-display font-bold mb-8 text-center">Health News</h1>
      
      <Card className="p-6 shadow-md max-w-3xl mx-auto text-center">
        <p className="text-lg text-muted-foreground">
          Health news page is under development. Check back soon for the latest health-related articles, tips, and medical updates.
        </p>
      </Card>
    </div>
  );
};

export default HealthNews;
