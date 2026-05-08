import { trpc } from "@/lib/trpc";
import DashboardShell from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Heart, ShoppingCart, Trash2, Star, Package } from "lucide-react";
import { Link } from "wouter";

export default function DashboardWishlist() {
  const { data: items = [], isLoading, refetch } = trpc.wishlist.get.useQuery();
  const remove = trpc.wishlist.remove.useMutation({
    onSuccess: () => { refetch(); toast.success("Removed from wishlist"); },
  });

  return (
    <DashboardShell title="Wishlist">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Heart className="w-6 h-6 text-pink-400" />
              My Wishlist
            </h1>
            <p className="text-gray-400 text-sm mt-1">{items.length} saved items</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
                <div className="h-32 bg-white/5 rounded-lg mb-3" />
                <div className="h-4 bg-white/5 rounded w-3/4 mb-2" />
                <div className="h-4 bg-white/5 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Your wishlist is empty</h3>
            <p className="text-gray-400 mb-6">Save products you love to buy them later</p>
            <Link href="/marketplace">
              <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500">
                Browse Marketplace
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => {
              const product = item.product;
              if (!product) return null;
              return (
                <div key={item.id} className="glass-card rounded-xl overflow-hidden group hover:border-violet-500/50 transition-all duration-300">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-xs">
                        {product.category?.replace(/_/g, " ")}
                      </Badge>
                      <button
                        onClick={() => remove.mutate({ productId: product.id })}
                        className="text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">{product.title}</h3>

                    <div className="flex items-center gap-1 mb-3">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-yellow-400 text-xs">{product.avgRating ?? "0.0"}</span>
                      <span className="text-gray-500 text-xs">({product.reviewCount})</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-white font-bold">${product.price}</span>
                        {product.originalPrice && (
                          <span className="text-gray-500 text-xs line-through ml-2">${product.originalPrice}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="w-3 h-3 text-green-400" />
                        <span className="text-green-400 text-xs">{product.stock} left</span>
                      </div>
                    </div>

                    <Link href={`/product/${product.id}`}>
                      <Button size="sm" className="w-full mt-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-xs">
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        View & Buy
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
