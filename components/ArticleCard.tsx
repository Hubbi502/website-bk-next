import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight } from "lucide-react";

interface ArticleCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  imageUrl: string;
  date: string;
}

const ArticleCard = ({ id, title, description, category, readTime, imageUrl, date }: ArticleCardProps) => {
  return (
    <Link href={`/article-detail?id=${id}`}>
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-elevated group cursor-pointer h-full">
        <div className="relative overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <Badge className="absolute top-3 right-3">{category}</Badge>
        </div>
        <CardHeader>
          <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </CardTitle>
          <CardDescription className="line-clamp-2">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{readTime}</span>
            </div>
            <span className="flex items-center gap-1 text-primary font-medium group-hover:gap-2 transition-all">
              Read More <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ArticleCard;
