import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataPersistenceService } from '../../services/data-persistence.service';
import { Message, Notification, User } from '../../models/bid.interface';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {
  activeTab: 'inbox' | 'sent' | 'notifications' = 'inbox';
  selectedMessage: Message | null = null;
  showCompose = false;
  
  messages: Message[] = [];
  notifications: Notification[] = [];
  currentUser: User | null = null;
  
  composeData = {
    to: '',
    subject: '',
    content: ''
  };

  searchTerm = '';
  selectedUsers: User[] = [];
  filteredUsers: User[] = [];
  selectedIndex = 0;

  get availableUsers(): User[] {
    const allUsers = this.dataService.getAllUsers();
    const currentUserId = this.currentUser?.id;
    // Return all users except the current user
    return allUsers.filter(user => user.id !== currentUserId);
  }

  constructor(
    private dataService: DataPersistenceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is authenticated
    if (!this.dataService.isAuthenticated()) {
      this.router.navigate(['/auth']);
      return;
    }
    
    this.loadData();
    this.createDemoDataIfNeeded();
  }

  loadData(): void {
    this.currentUser = this.dataService.getCurrentUser();
    this.messages = this.dataService.getAllMessages();
    this.notifications = this.dataService.getAllNotifications();
  }

  get filteredMessages(): Message[] {
    const currentUserId = this.currentUser?.id;
    if (!currentUserId) return [];

    switch (this.activeTab) {
      case 'inbox':
        return this.messages.filter(msg => msg.receiverId === currentUserId);
      case 'sent':
        return this.messages.filter(msg => msg.senderId === currentUserId);
      case 'notifications':
        return this.notifications.map(notif => ({
          id: notif.id,
          senderId: 'system',
          senderName: 'System',
          receiverId: currentUserId,
          receiverName: this.currentUser?.name || '',
          content: notif.message,
          timestamp: notif.timestamp,
          isRead: notif.isRead,
          type: notif.type === 'message' ? 'general' : notif.type === 'listing' ? 'general' : notif.type
        }));
      default:
        return [];
    }
  }

  setActiveTab(tab: 'inbox' | 'sent' | 'notifications'): void {
    this.activeTab = tab;
    this.selectedMessage = null;
    this.showCompose = false;
  }

  openCompose(): void {
    this.showCompose = true;
    this.selectedMessage = null;
    // Reset compose form
    this.composeData = {
      to: '',
      subject: '',
      content: ''
    };
    this.selectedUsers = [];
    this.searchTerm = '';
    this.filteredUsers = [];
  }

  selectMessage(message: Message): void {
    this.selectedMessage = message;
    this.showCompose = false;
    
    if (!message.isRead) {
      this.markAsRead(message.id);
    }
  }

  markAsRead(messageId: string): void {
    this.dataService.markMessageAsRead(messageId);
    this.loadData();
  }

  markAsUnread(messageId: string): void {
    this.dataService.markMessageAsUnread(messageId);
    this.loadData();
  }

  deleteMessage(messageId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    if (confirm('Are you sure you want to delete this message?')) {
      this.dataService.deleteMessage(messageId);
      this.loadData();
      
      if (this.selectedMessage?.id === messageId) {
        this.selectedMessage = null;
      }
    }
  }

  sendMessage(): void {
    if (this.selectedUsers.length === 0 || !this.composeData.subject || !this.composeData.content) {
      alert('Please select a recipient and fill in all fields');
      return;
    }

    if (!this.currentUser) {
      alert('Please log in to send messages');
      return;
    }

    // Send message to the selected user
    const recipientUser = this.selectedUsers[0];
    
    const newMessage: Message = {
      id: this.dataService.generateId(),
      senderId: this.currentUser!.id,
      senderName: this.currentUser!.name,
      receiverId: recipientUser.id,
      receiverName: recipientUser.name,
      content: this.composeData.content,
      timestamp: new Date(),
      isRead: false,
      type: 'general'
    };

    this.dataService.saveMessage(newMessage);
    this.loadData();
    
    // Reset compose form
    this.composeData = {
      to: '',
      subject: '',
      content: ''
    };
    this.selectedUsers = [];
    this.searchTerm = '';
    this.filteredUsers = [];
    
    this.showCompose = false;
    alert('Message sent successfully!');
  }

  getDisplayName(message: Message): string {
    if (this.activeTab === 'sent') {
      return message.receiverName;
    }
    return message.senderName;
  }

  getSenderEmail(message: Message): string {
    if (this.activeTab === 'sent') {
      // Find the receiver user to get their email
      const receiverUser = this.dataService.getAllUsers().find(u => u.id === message.receiverId);
      return receiverUser?.email || message.receiverName;
    }
    // Find the sender user to get their email
    const senderUser = this.dataService.getAllUsers().find(u => u.id === message.senderId);
    return senderUser?.email || message.senderName;
  }

  getMessageSubject(message: Message): string {
    if (this.activeTab === 'notifications') {
      return message.content.split('\n')[0]; // Use first line as subject
    }
    return `Message from ${message.senderName}`;
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  formatTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return new Date(timestamp).toLocaleDateString();
  }

  getEmptyStateMessage(): string {
    switch (this.activeTab) {
      case 'inbox':
        return 'No messages in your inbox';
      case 'sent':
        return 'No sent messages';
      case 'notifications':
        return 'No notifications';
      default:
        return 'No messages';
    }
  }

  filterUsers(): void {
    if (!this.searchTerm.trim()) {
      this.filteredUsers = [];
      return;
    }

    const searchLower = this.searchTerm.toLowerCase();
    this.filteredUsers = this.availableUsers.filter(user => 
      (user.name.toLowerCase().includes(searchLower) || 
       user.email.toLowerCase().includes(searchLower))
    );
    this.selectedIndex = 0;
  }

  selectUser(user: User): void {
    // Limit to only one recipient
    this.selectedUsers = [user];
    this.searchTerm = '';
    this.filteredUsers = [];
  }

  removeSelectedUser(user: User): void {
    this.selectedUsers = this.selectedUsers.filter(u => u.id !== user.id);
  }

  handleKeydown(event: KeyboardEvent): void {
    if (this.filteredUsers.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredUsers.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.filteredUsers[this.selectedIndex]) {
          this.selectUser(this.filteredUsers[this.selectedIndex]);
        }
        break;
      case 'Escape':
        this.searchTerm = '';
        this.filteredUsers = [];
        break;
    }
  }

  createDemoDataIfNeeded(): void {
    const currentUser = this.dataService.getCurrentUser();
    if (!currentUser) return;

    const allUsers = this.dataService.getAllUsers();
    const existingMessages = this.dataService.getAllMessages();
    
    // Only create demo data if no messages exist
    if (existingMessages.length > 0) return;

    // Create demo users if needed
    if (allUsers.length <= 1) {
      const demoUsers = [
        {
          id: this.dataService.generateId(),
          name: 'Sarah Mitchell',
          email: 'sarah.m@test.com',
          password: 'TestPass456!',
          idVerified: false,
          disclaimerSigned: true,
          policySigned: true,
          termsSigned: true,
          createdAt: new Date()
        },
        {
          id: this.dataService.generateId(),
          name: 'Marcus Rodriguez',
          email: 'm.rodriguez@test.com',
          password: 'TestPass789!',
          idVerified: false,
          disclaimerSigned: true,
          policySigned: true,
          termsSigned: true,
          createdAt: new Date()
        }
      ];
      
      demoUsers.forEach(user => this.dataService.saveUser(user));
    }

    // Get updated user list
    const updatedUsers = this.dataService.getAllUsers();
    const otherUsers = updatedUsers.filter(u => u.id !== currentUser.id);
    
    if (otherUsers.length === 0) return;

    // Create demo messages
    const demoMessages: Message[] = [
      {
        id: this.dataService.generateId(),
        senderId: otherUsers[0].id,
        senderName: otherUsers[0].name,
        receiverId: currentUser.id,
        receiverName: currentUser.name,
        content: 'Hi! I\'m very interested in your Rolex Submariner. Is it still available? I\'m ready to make an offer of $8,800.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isRead: false,
        type: 'bid'
      },
      {
        id: this.dataService.generateId(),
        senderId: otherUsers[1]?.id || otherUsers[0].id,
        senderName: otherUsers[1]?.name || otherUsers[0].name,
        receiverId: currentUser.id,
        receiverName: currentUser.name,
        content: 'Thank you for the counteroffer. I\'ve accepted your price of $9,500. When can we complete the transaction?',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        isRead: true,
        type: 'counteroffer'
      },
      {
        id: this.dataService.generateId(),
        senderId: currentUser.id,
        senderName: currentUser.name,
        receiverId: otherUsers[0].id,
        receiverName: otherUsers[0].name,
        content: 'Thank you for your interest! I can offer you the Rolex Submariner for $9,200. This is a great price for this model.',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        isRead: true,
        type: 'general'
      }
    ];

    // Create demo notifications
    const demoNotifications: Notification[] = [
      {
        id: this.dataService.generateId(),
        userId: currentUser.id,
        title: 'New Bid Received',
        message: `${otherUsers[0].name} placed a bid of $8,800 on your Rolex Submariner`,
        type: 'bid',
        isRead: false,
        timestamp: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        id: this.dataService.generateId(),
        userId: currentUser.id,
        title: 'Counteroffer Accepted',
        message: `${otherUsers[1]?.name || otherUsers[0].name} accepted your counteroffer of $9,500`,
        type: 'counteroffer',
        isRead: false,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: this.dataService.generateId(),
        userId: currentUser.id,
        title: 'System Update',
        message: 'Your account verification has been completed successfully',
        type: 'system',
        isRead: true,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ];

    demoMessages.forEach(msg => this.dataService.saveMessage(msg));
    demoNotifications.forEach(notif => this.dataService.saveNotification(notif));
    
    this.loadData();
  }
} 