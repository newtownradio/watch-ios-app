import { Injectable, inject } from '@angular/core';
import { DataPersistenceService } from './data-persistence.service';
import { User } from '../models/bid.interface';

export interface UserRole {
  role: string;
  permissions: string[];
  description: string;
}

export interface Permission {
  action: string;
  resource: string;
  conditions?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {
  private dataService = inject(DataPersistenceService);

  // Define user roles and their permissions
  private readonly ROLES: Record<string, UserRole> = {
    'user': {
      role: 'user',
      permissions: ['view_discovery', 'create_account', 'edit_profile'],
      description: 'Basic user with limited access'
    },
    'buyer': {
      role: 'buyer',
      permissions: ['view_discovery', 'place_bids', 'view_messages', 'view_notifications', 'edit_profile'],
      description: 'User who can place bids on listings'
    },
    'seller': {
      role: 'seller',
      permissions: ['view_discovery', 'create_listings', 'manage_listings', 'view_messages', 'view_notifications', 'edit_profile'],
      description: 'User who can create and manage listings'
    },
    'verified': {
      role: 'verified',
      permissions: ['view_discovery', 'place_bids', 'create_listings', 'manage_listings', 'view_messages', 'view_notifications', 'edit_profile', 'priority_support'],
      description: 'Verified user with full access'
    }
  };

  constructor() {
    console.log('AuthorizationService initialized');
  }

  /**
   * Get current user's role
   */
  getUserRole(): string {
    const user = this.dataService.getCurrentUser();
    if (!user) {
      return 'guest';
    }

    // Check verification status first
    if (user.idVerified) {
      return 'verified';
    }

    // Check if user has listings (seller)
    const userListings = this.dataService.getListingsBySeller(user.id);
    if (userListings.length > 0) {
      return 'seller';
    }

    // Check if user has bids (buyer)
    const userBids = this.dataService.getBidsByUser(user.id);
    if (userBids.length > 0) {
      return 'buyer';
    }

    return 'user';
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: string): boolean {
    const userRole = this.getUserRole();
    const role = this.ROLES[userRole];
    
    if (!role) {
      return false;
    }

    return role.permissions.includes(permission);
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  /**
   * Check if user has all of the specified permissions
   */
  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  /**
   * Get user's role information
   */
  getUserRoleInfo(): UserRole | null {
    const role = this.getUserRole();
    return this.ROLES[role] || null;
  }

  /**
   * Get all available roles
   */
  getAllRoles(): Record<string, UserRole> {
    return this.ROLES;
  }

  /**
   * Check if user can access a specific route
   */
  canAccessRoute(routePath: string): boolean {
    const userRole = this.getUserRole();
    
    // Define route permissions
    const routePermissions: Record<string, string[]> = {
      '/discovery': ['view_discovery'],
      '/sell': ['create_listings'],
      '/account': ['edit_profile'],
      '/messages': ['view_messages'],
      '/notifications': ['view_notifications']
    };

    const requiredPermissions = routePermissions[routePath];
    if (!requiredPermissions) {
      return true; // No specific permissions required
    }

    return this.hasAnyPermission(requiredPermissions);
  }

  /**
   * Check if user can perform a specific action on a resource
   */
  canPerformAction(action: string, resource: string, resourceId?: string): boolean {
    const user = this.dataService.getCurrentUser();
    if (!user) {
      return false;
    }

    // Define action permissions
    const actionPermissions: Record<string, { permissions: string[], conditions?: string[] }> = {
      'create_listing': {
        permissions: ['create_listings']
      },
      'edit_listing': {
        permissions: ['manage_listings'],
        conditions: ['is_owner']
      },
      'delete_listing': {
        permissions: ['manage_listings'],
        conditions: ['is_owner']
      },
      'place_bid': {
        permissions: ['place_bids']
      },
      'view_bids': {
        permissions: ['manage_listings'],
        conditions: ['is_owner']
      },
      'send_message': {
        permissions: ['view_messages']
      }
    };

    const actionConfig = actionPermissions[action];
    if (!actionConfig) {
      return false;
    }

    // Check permissions
    if (!this.hasAllPermissions(actionConfig.permissions)) {
      return false;
    }

    // Check conditions if specified
    if (actionConfig.conditions && resourceId) {
      return this.checkConditions(actionConfig.conditions, resource, resourceId, user);
    }

    return true;
  }

  /**
   * Check specific conditions for an action
   */
  private checkConditions(conditions: string[], resource: string, resourceId: string, user: User): boolean {
    for (const condition of conditions) {
      switch (condition) {
        case 'is_owner':
          if (resource === 'listing') {
            const listing = this.dataService.getListingById(resourceId);
            return listing?.sellerId === user.id;
          }
          break;
        case 'is_bidder':
          if (resource === 'bid') {
            const bid = this.dataService.getBidById(resourceId);
            return bid?.bidderId === user.id;
          }
          break;
      }
    }
    return false;
  }

  /**
   * Get user's display role name
   */
  getDisplayRoleName(): string {
    const role = this.getUserRole();
    const roleInfo = this.ROLES[role];
    return roleInfo ? roleInfo.description : 'Guest';
  }

  /**
   * Check if user is verified
   */
  isVerified(): boolean {
    const user = this.dataService.getCurrentUser();
    return user?.idVerified || false;
  }

  /**
   * Check if user can upgrade their role
   */
  canUpgradeRole(): boolean {
    const currentRole = this.getUserRole();
    return currentRole === 'user' || currentRole === 'buyer' || currentRole === 'seller';
  }

  /**
   * Get upgrade options for current user
   */
  getUpgradeOptions(): string[] {
    const currentRole = this.getUserRole();
    const upgradeOptions: Record<string, string[]> = {
      'user': ['buyer', 'seller', 'verified'],
      'buyer': ['seller', 'verified'],
      'seller': ['verified']
    };

    return upgradeOptions[currentRole] || [];
  }
} 