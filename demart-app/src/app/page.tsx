import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      {/* Hero Section */}
      <section className="py-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to DeMart</h1>
        <p className="text-lg text-gray-600 mb-8">
          Your Decentralized Marketplace for Digital Assets
        </p>
        <div className="max-w-2xl mx-auto flex gap-2">
          <div className="flex-1">
            <Input 
              type="search" 
              placeholder="Search for digital assets..." 
              className="w-full"
            />
          </div>
          <Button>
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-12">
        <h2 className="text-2xl font-semibold mb-6">Featured Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Digital Art', 'Music NFTs', 'Virtual Real Estate'].map((category) => (
            <div 
              key={category}
              className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-medium mb-2">{category}</h3>
              <p className="text-gray-600">
                Explore unique {category.toLowerCase()} from talented creators
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12">
        <h2 className="text-2xl font-semibold mb-6">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div 
              key={item}
              className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-square bg-gray-100"></div>
              <div className="p-4">
                <h3 className="font-medium mb-2">Digital Asset #{item}</h3>
                <p className="text-sm text-gray-600 mb-2">By Creator Name</p>
                <p className="font-semibold">0.5 ETH</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 text-center">
        <h2 className="text-2xl font-semibold mb-4">Start Creating</h2>
        <p className="text-gray-600 mb-6">
          Join our community of creators and start selling your digital assets
        </p>
        <Button size="lg">Create Your First NFT</Button>
      </section>
    </div>
  );
}
