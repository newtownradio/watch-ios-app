import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  seller: string;
  rating: number;
  image: string;
}

@Component({
  selector: 'app-discovery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './discovery.component.html',
  styleUrl: './discovery.component.scss'
})
export class DiscoveryComponent {
  products: Product[] = [
    {
      id: '1',
      title: 'Rolex Submariner',
      price: 8500,
      description: 'Classic dive watch in excellent condition',
      seller: 'John Smith',
      rating: 4.8,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzM4NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg=='
    },
    {
      id: '2',
      title: 'Omega Speedmaster',
      price: 4200,
      description: 'Moonwatch in good condition',
      seller: 'Sarah Johnson',
      rating: 4.9,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzM4NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg=='
    },
    {
      id: '3',
      title: 'Cartier Santos',
      price: 6500,
      description: 'Elegant dress watch in mint condition',
      seller: 'Mike Wilson',
      rating: 4.7,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzM4NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg=='
    },
    {
      id: '4',
      title: 'Seiko Prospex',
      price: 1200,
      description: 'Professional dive watch, excellent value',
      seller: 'Lisa Chen',
      rating: 4.6,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzM4NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg=='
    }
  ];

  favorites: string[] = [];
  searchTerm = '';
  minPrice = 0;
  maxPrice = 10000;
  showFavoritesOnly = false;

  get filteredProducts(): Product[] {
    return this.products.filter(product => {
      // Search term filter
      const matchesSearch = !this.searchTerm || 
        product.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.seller.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Price range filter
      const matchesPrice = product.price >= this.minPrice && product.price <= this.maxPrice;

      // Favorites filter
      const matchesFavorites = !this.showFavoritesOnly || this.isFavorited(product.id);

      return matchesSearch && matchesPrice && matchesFavorites;
    });
  }

  toggleFavorite(productId: string) {
    const index = this.favorites.indexOf(productId);
    if (index > -1) {
      this.favorites.splice(index, 1);
    } else {
      this.favorites.push(productId);
    }
  }

  isFavorited(productId: string): boolean {
    return this.favorites.includes(productId);
  }

  clearFilters() {
    this.searchTerm = '';
    this.minPrice = 0;
    this.maxPrice = 10000;
    this.showFavoritesOnly = false;
  }
}
