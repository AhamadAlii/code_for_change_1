import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExternalLink, Heart } from "lucide-react";
import { motion } from "framer-motion";

// const API_URL = "https://api.mediastack.com/v1/news?access_key=a20d1232277c6a30d2a8699a75dd677d&categories=health&languages=en&limit=50";

const API_URL = "https://code-for-change.onrender.com/health-news";

const PLACEHOLDER_IMAGES = [
  "https://source.unsplash.com/400x300/?health,medical",
  "https://th.bing.com/th/id/R.f5a297730d65ee87706d5d9afb0a628a?rik=asfcgSZ8gp5Zlw&riu=http%3a%2f%2fi.huffpost.com%2fgen%2f1321941%2fimages%2fo-BEST-HEALTHCARE-facebook.jpg&ehk=qpux9eaIuRUkGQjJGSx8qE%2fOCt5B27nWF%2bBJ50U2v8c%3d&risl=&pid=ImgRaw&r=0",
  "https://c0.wallpaperflare.com/preview/360/533/202/health-medical-healthcare-health.jpg",
  "https://th.bing.com/th/id/OIP.LtBsDxmnfbPP3duuddR2hQHaE8?rs=1&pid=ImgDetMain",
  "https://s3.amazonaws.com/utep-uploads/wp-content/uploads/2017/09/07101640/need-healthcare-professionals.jpg",
  "https://th.bing.com/th/id/OIP.ZwBH-6fjmY2RuT5mwaj_VgHaEd?rs=1&pid=ImgDetMain",
  "https://th.bing.com/th/id/OIP.5-ukEAV5S6Bf6MhU6RCJZQHaE8?rs=1&pid=ImgDetMain",
  "https://as1.ftcdn.net/v2/jpg/01/11/75/56/1000_F_111755682_lL0qdCITRiPtS7Ytmr8LGydLd28nk9xM.jpg",
];

const getRandomImage = () =>
  PLACEHOLDER_IMAGES[Math.floor(Math.random() * PLACEHOLDER_IMAGES.length)];

const HealthNewsCards = () => {
  const [articles, setArticles] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(API_URL)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch news articles");
        return response.json();
      })
      .then((data) => {
        // Ensure data structure is correct before filtering
        const filteredArticles = (data?.data || []).filter(
          (article) => article.image
        );
        setArticles(filteredArticles);
      })
      .catch((error) => {
        console.error("Error fetching news:", error);
        setError(error.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleShowMore = () => {
    setVisibleCount((prevCount) => Math.min(prevCount + 10, articles.length));
  };

  return (
    <div className="container mx-auto px-4 py-16">
      {loading && (
        <p className="text-center text-lg font-semibold">Loading news...</p>
      )}
      {error && (
        <p className="text-center text-red-500 font-semibold">{error}</p>
      )}

      {!loading && !error && (
        <>
          <motion.div
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {articles.slice(0, visibleCount).map((article, index) => (
              <motion.div key={index} whileHover={{ y: -5 }} className="h-full">
                <Card className="h-full overflow-hidden bg-white hover:shadow-xl transition-all duration-300 transform">
                  <motion.div
                    className="overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                  >
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-56 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getRandomImage();
                      }}
                    />
                  </motion.div>
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-xl font-bold line-clamp-2 hover:text-blue-600 transition-colors duration-200">
                      {article.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="line-clamp-3 text-gray-600">
                      {article.description}
                    </CardDescription>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-medium text-gray-600">
                          {article.source}
                        </span>
                      </div>
                      <motion.a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 group"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Read more
                        <ExternalLink className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                      </motion.a>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          {visibleCount < articles.length && (
            <div className="text-center mt-8">
              <button
                onClick={handleShowMore}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
              >
                Show More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HealthNewsCards;
