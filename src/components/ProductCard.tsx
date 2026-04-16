import { Link } from "react-router-dom";
import { Star } from "lucide-react";

interface ProductCardProps {
  product: {
    _id: string;
    title: string;
    price: number;
    discountedPrice: number;
    image: string[];
    rating: number;
    category: string;
    stock: number;
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const discount = Math.round(((product.price - product.discountedPrice) / product.price) * 100);
  const imgSrc = product.image?.[0] || "https://via.placeholder.com/400x500?text=No+Image";

  return (
    <Link to={`/products/${product._id}`} className="group cursor-pointer animate-fade-in">
      <div className="overflow-hidden rounded-sm bg-secondary mb-4 aspect-[4/5] flex justify-center items-center">
        <img
          src={imgSrc}
          alt={product.title}
          className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{product.category}</p>
        <h3 className="text-base font-medium text-foreground truncate">{product.title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-foreground font-semibold tabular-nums">₹{product.discountedPrice.toLocaleString()}</span>
          {discount > 0 && (
            <>
              <span className="text-muted-foreground line-through text-sm tabular-nums">₹{product.price.toLocaleString()}</span>
              <span className="text-accent text-xs font-medium">{discount}% off</span>
            </>
          )}
        </div>
        {product.rating > 0 && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
            <span>{product.rating.toFixed(1)}</span>
          </div>
        )}
        {product.stock === 0 && (
          <span className="text-xs text-destructive font-medium">Out of stock</span>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
