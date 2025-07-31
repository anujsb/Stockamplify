import { Card, CardContent } from '@/components/ui/card';

export function NewsGrid({ articles }: { articles: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article, idx) => (
        <Card key={idx} className="hover:shadow-lg transition-shadow">
          {article.urlToImage ? (
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              <img
                src={article.urlToImage}
                alt={article.title}
                className="w-full h-48 object-cover rounded-t-lg"
                loading="lazy"
              />
            </a>
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-t-lg text-gray-400 text-sm">
              No Image
            </div>
          )}
          <CardContent className="p-4">
            <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-lg font-semibold text-blue-700 hover:underline line-clamp-2">
              {article.title}
            </a>
            <div className="text-xs text-gray-500 mt-1 mb-2">
              {article.source?.name} &middot; {article.publishedAt ? new Date(article.publishedAt).toLocaleString() : ''}
            </div>
            {article.description && <p className="mt-1 text-gray-700 text-sm line-clamp-3">{article.description}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 