import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DataPersistenceService } from './data-persistence.service';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  listingId?: string;
  bidId?: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantNames: string[];
  listingId?: string;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageResponse {
  success: boolean;
  message: string;
  data?: Message | Conversation;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  private activeConversationSubject = new BehaviorSubject<Conversation | null>(null);

  constructor(private dataService: DataPersistenceService) {
    this.loadConversations();
    this.loadMessages();
  }

  // Observable getters
  get conversations$(): Observable<Conversation[]> {
    return this.conversationsSubject.asObservable();
  }

  get messages$(): Observable<Message[]> {
    return this.messagesSubject.asObservable();
  }

  get activeConversation$(): Observable<Conversation | null> {
    return this.activeConversationSubject.asObservable();
  }

  /**
   * Start a new conversation or get existing one
   */
  async startConversation(
    participant1Id: string,
    participant2Id: string,
    listingId?: string
  ): Promise<MessageResponse> {
    try {
      // Check if conversation already exists
      const existingConversation = this.findConversation(participant1Id, participant2Id, listingId);
      if (existingConversation) {
        this.setActiveConversation(existingConversation);
        return {
          success: true,
          message: 'Conversation found',
          data: existingConversation
        };
      }

      // Get participant names
      const participant1 = this.dataService.getUserById(participant1Id);
      const participant2 = this.dataService.getUserById(participant2Id);

      if (!participant1 || !participant2) {
        return {
          success: false,
          message: 'One or both participants not found',
          error: 'PARTICIPANTS_NOT_FOUND'
        };
      }

      // Create new conversation
      const conversation: Conversation = {
        id: this.generateId(),
        participants: [participant1Id, participant2Id],
        participantNames: [participant1.name, participant2.name],
        listingId,
        unreadCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save conversation
      this.dataService.saveConversation(conversation);
      this.addConversationToList(conversation);
      this.setActiveConversation(conversation);

      return {
        success: true,
        message: 'Conversation started',
        data: conversation
      };

    } catch (error) {
      console.error('Error starting conversation:', error);
      return {
        success: false,
        message: 'Failed to start conversation',
        error: 'START_CONVERSATION_ERROR'
      };
    }
  }

  /**
   * Send a message
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    listingId?: string,
    bidId?: string
  ): Promise<MessageResponse> {
    try {
      const conversation = this.dataService.getConversationById(conversationId);
      if (!conversation) {
        return {
          success: false,
          message: 'Conversation not found',
          error: 'CONVERSATION_NOT_FOUND'
        };
      }

      const sender = this.dataService.getUserById(senderId);
      if (!sender) {
        return {
          success: false,
          message: 'Sender not found',
          error: 'SENDER_NOT_FOUND'
        };
      }

      // Create message
      const message: Message = {
        id: this.generateId(),
        conversationId,
        senderId,
        senderName: sender.name,
        receiverId: conversation.participants.find(id => id !== senderId) || '',
        receiverName: conversation.participantNames.find((_, index) => 
          conversation.participants[index] !== senderId
        ) || '',
        content,
        timestamp: new Date(),
        isRead: false,
        listingId,
        bidId
      };

      // Save message
      this.dataService.saveMessage(message);
      this.addMessageToList(message);

      // Update conversation
      conversation.lastMessage = message;
      conversation.updatedAt = new Date();
      conversation.unreadCount++;
      this.dataService.updateConversation(conversation);
      this.updateConversationInList(conversation);

      return {
        success: true,
        message: 'Message sent',
        data: message
      };

    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        message: 'Failed to send message',
        error: 'SEND_MESSAGE_ERROR'
      };
    }
  }

  /**
   * Mark messages as read
   */
  async markAsRead(conversationId: string, userId: string): Promise<MessageResponse> {
    try {
      const messages = this.dataService.getMessagesByConversation(conversationId);
      const unreadMessages = messages.filter(m => 
        m.receiverId === userId && !m.isRead
      );

      // Mark messages as read
      unreadMessages.forEach(message => {
        message.isRead = true;
        this.dataService.updateMessage(message);
      });

      // Update conversation unread count
      const conversation = this.dataService.getConversationById(conversationId);
      if (conversation) {
        conversation.unreadCount = Math.max(0, conversation.unreadCount - unreadMessages.length);
        this.dataService.updateConversation(conversation);
        this.updateConversationInList(conversation);
      }

      return {
        success: true,
        message: 'Messages marked as read'
      };

    } catch (error) {
      console.error('Error marking messages as read:', error);
      return {
        success: false,
        message: 'Failed to mark messages as read',
        error: 'MARK_READ_ERROR'
      };
    }
  }

  /**
   * Get messages for a conversation
   */
  getMessages(conversationId: string): Message[] {
    return this.dataService.getMessagesByConversation(conversationId);
  }

  /**
   * Set active conversation
   */
  setActiveConversation(conversation: Conversation | null): void {
    this.activeConversationSubject.next(conversation);
  }

  /**
   * Find conversation between two participants
   */
  private findConversation(
    participant1Id: string, 
    participant2Id: string, 
    listingId?: string
  ): Conversation | null {
    const conversations = this.dataService.getAllConversations();
    return conversations.find(c => {
      const hasParticipants = c.participants.includes(participant1Id) && 
                            c.participants.includes(participant2Id);
      const hasListing = listingId ? c.listingId === listingId : true;
      return hasParticipants && hasListing;
    }) || null;
  }

  /**
   * Add conversation to list
   */
  private addConversationToList(conversation: Conversation): void {
    const currentConversations = this.conversationsSubject.value;
    this.conversationsSubject.next([conversation, ...currentConversations]);
  }

  /**
   * Update conversation in list
   */
  private updateConversationInList(conversation: Conversation): void {
    const currentConversations = this.conversationsSubject.value;
    const updatedConversations = currentConversations.map(c => 
      c.id === conversation.id ? conversation : c
    );
    this.conversationsSubject.next(updatedConversations);
  }

  /**
   * Add message to list
   */
  private addMessageToList(message: Message): void {
    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([message, ...currentMessages]);
  }

  /**
   * Load conversations from storage
   */
  private loadConversations(): void {
    const conversations = this.dataService.getAllConversations();
    this.conversationsSubject.next(conversations);
  }

  /**
   * Load messages from storage
   */
  private loadMessages(): void {
    const messages = this.dataService.getAllMessages();
    this.messagesSubject.next(messages);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}
