import { Injectable, inject } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { User } from '../models/bid.interface';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface UpdatePasswordRequest {
  email: string;
  newPassword: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  code?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AzureUserService {
  private firebaseService = inject(FirebaseService);

  async registerUser(request: RegisterRequest): Promise<ApiResponse<User>> {
    return await this.firebaseService.registerUser(request.name, request.email, request.password);
  }

  async createUserAccount(request: CreateUserRequest): Promise<ApiResponse<User>> {
    return await this.firebaseService.createUserAccount(request.name, request.email, request.password);
  }

  // Public method to access Firebase service for debugging
  getFirebaseService() {
    return this.firebaseService;
  }

  async loginUser(request: LoginRequest): Promise<ApiResponse<User>> {
    return await this.firebaseService.loginUser(request.email, request.password);
  }

  async resetPassword(request: ResetPasswordRequest): Promise<ApiResponse<void>> {
    return await this.firebaseService.resetPassword(request.email);
  }

  async updateUserPassword(request: UpdatePasswordRequest): Promise<ApiResponse<void>> {
    return await this.firebaseService.updateUserPassword(request.email, request.newPassword);
  }

  async checkUserExists(): Promise<boolean> {
    // Firebase will handle this automatically
    return true;
  }
}
