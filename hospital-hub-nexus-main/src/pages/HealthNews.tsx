import HealthNewsDummy from "./HealthNewsCards.tsx";

const HealthNews = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="mt-7 text-3xl md:text-4xl font-display font-bold mb-8 text-center">
        Health News
      </h1>

      <HealthNewsDummy />
    </div>
  );
};

export default HealthNews;
