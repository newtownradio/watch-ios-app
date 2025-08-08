# Stripe + Smart Contract + Custom Oracle Integration Design

## 🎯 **Architecture Overview**

```
iOS App → Stripe → Smart Contract → Custom Oracle → Authentication Partners
```

### **Payment Flow:**
1. **Buyer pays with credit card** → Stripe processes payment
2. **Stripe holds funds in escrow** → Smart contract tracks transaction
3. **Watch sent for authentication** → Custom oracle coordinates
4. **Authentication result** → Smart contract verifies and executes
5. **Smart contract triggers** → Stripe releases/refunds funds

---

## 🏗️ **Smart Contract Design**

### **WatchStyleMarketplace Contract (Updated for Stripe)**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WatchStyleMarketplace is ReentrancyGuard, Ownable {
    
    // Structs
    struct Transaction {
        string stripePaymentIntentId;  // Stripe payment intent ID
        address buyer;
        address seller;
        uint256 watchPrice;
        uint256 authenticationFee;
        uint256 platformFee;
        uint256 shippingCost;
        uint256 totalAmount;
        uint256 timestamp;
        bool isAuthenticated;
        bool isShipped;
        bool isCompleted;
        bool isFailed;
        string watchDetails;
        string authenticationResult;
        string selectedAuthenticator;
        TransactionStatus status;
    }
    
    struct OracleResponse {
        string transactionId;
        bool isAuthentic;
        string result;
        string authenticator;
        uint256 timestamp;
        bool isValid;
    }
    
    // Enums
    enum TransactionStatus {
        PENDING,
        AUTHENTICATING,
        AUTHENTICATED,
        SHIPPED,
        COMPLETED,
        FAILED,
        DISPUTED
    }
    
    // State variables
    mapping(string => Transaction) public transactions;
    mapping(address => bool) public registeredSellers;
    mapping(address => bool) public authorizedOracles;
    
    // Events
    event TransactionCreated(
        string indexed transactionId,
        string stripePaymentIntentId,
        address indexed buyer,
        address indexed seller,
        uint256 amount
    );
    
    event AuthenticationRequested(
        string indexed transactionId,
        string authenticator
    );
    
    event AuthenticationCompleted(
        string indexed transactionId,
        bool isAuthentic,
        string result
    );
    
    event PaymentReleased(
        string indexed transactionId,
        address seller,
        uint256 amount
    );
    
    event RefundIssued(
        string indexed transactionId,
        address buyer,
        uint256 amount
    );
    
    event PenaltyCharged(
        string indexed transactionId,
        address seller,
        uint256 penaltyAmount
    );
    
    // Constants
    uint256 public constant PLATFORM_FEE_PERCENTAGE = 3; // 3%
    uint256 public constant FAILED_AUTHENTICATION_PENALTY = 35 * 10**18; // $35
    
    // Modifiers
    modifier onlyAuthorizedOracle() {
        require(authorizedOracles[msg.sender], "Unauthorized oracle");
        _;
    }
    
    modifier onlyTransactionParticipant(string memory transactionId) {
        Transaction storage transaction = transactions[transactionId];
        require(
            msg.sender == transaction.buyer || 
            msg.sender == transaction.seller || 
            authorizedOracles[msg.sender],
            "Not authorized"
        );
        _;
    }
    
    // Core functions
    function createTransaction(
        string memory transactionId,
        string memory stripePaymentIntentId,
        address seller,
        uint256 watchPrice,
        uint256 authenticationFee,
        uint256 shippingCost,
        string memory watchDetails,
        string memory selectedAuthenticator
    ) external {
        require(registeredSellers[seller], "Seller not registered");
        
        uint256 platformFee = (watchPrice * PLATFORM_FEE_PERCENTAGE) / 100;
        uint256 totalAmount = watchPrice + authenticationFee;
        
        transactions[transactionId] = Transaction({
            stripePaymentIntentId: stripePaymentIntentId,
            buyer: msg.sender,
            seller: seller,
            watchPrice: watchPrice,
            authenticationFee: authenticationFee,
            platformFee: platformFee,
            shippingCost: shippingCost,
            totalAmount: totalAmount,
            timestamp: block.timestamp,
            isAuthenticated: false,
            isShipped: false,
            isCompleted: false,
            isFailed: false,
            watchDetails: watchDetails,
            authenticationResult: "",
            selectedAuthenticator: selectedAuthenticator,
            status: TransactionStatus.PENDING
        });
        
        emit TransactionCreated(
            transactionId,
            stripePaymentIntentId,
            msg.sender,
            seller,
            totalAmount
        );
    }
    
    function requestAuthentication(
        string memory transactionId
    ) external onlyTransactionParticipant(transactionId) {
        Transaction storage transaction = transactions[transactionId];
        require(transaction.status == TransactionStatus.PENDING, "Invalid status");
        
        transaction.status = TransactionStatus.AUTHENTICATING;
        
        emit AuthenticationRequested(transactionId, transaction.selectedAuthenticator);
    }
    
    function receiveAuthenticationResult(
        string memory transactionId,
        bool isAuthentic,
        string memory result,
        string memory authenticator
    ) external onlyAuthorizedOracle {
        Transaction storage transaction = transactions[transactionId];
        require(transaction.status == TransactionStatus.AUTHENTICATING, "Invalid status");
        
        transaction.isAuthenticated = isAuthentic;
        transaction.authenticationResult = result;
        transaction.status = TransactionStatus.AUTHENTICATED;
        
        if (isAuthentic) {
            // Trigger Stripe to release payment to seller
            // This will be handled by the oracle service
        } else {
            // Trigger Stripe to refund buyer
            // This will be handled by the oracle service
            _handleFailedAuthentication(transactionId);
        }
        
        emit AuthenticationCompleted(transactionId, isAuthentic, result);
    }
    
    function _handleFailedAuthentication(string memory transactionId) internal {
        Transaction storage transaction = transactions[transactionId];
        
        // Mark transaction as failed
        transaction.status = TransactionStatus.FAILED;
        transaction.isFailed = true;
        
        // Penalties will be handled by Stripe (seller's card charged)
        emit RefundIssued(transactionId, transaction.buyer, transaction.totalAmount);
        emit PenaltyCharged(transactionId, transaction.seller, 
            transaction.authenticationFee + FAILED_AUTHENTICATION_PENALTY + transaction.shippingCost);
    }
    
    // Oracle management
    function addAuthorizedOracle(address oracleAddress) external onlyOwner {
        authorizedOracles[oracleAddress] = true;
    }
    
    function removeAuthorizedOracle(address oracleAddress) external onlyOwner {
        authorizedOracles[oracleAddress] = false;
    }
    
    // Seller management
    function registerSeller(address seller) external onlyOwner {
        registeredSellers[seller] = true;
    }
    
    function unregisterSeller(address seller) external onlyOwner {
        registeredSellers[seller] = false;
    }
    
    // View functions
    function getTransaction(string memory transactionId) external view returns (Transaction memory) {
        return transactions[transactionId];
    }
    
    function isOracleAuthorized(address oracleAddress) external view returns (bool) {
        return authorizedOracles[oracleAddress];
    }
}
```

---

## 🔧 **Custom Oracle Service Design**

### **Node.js/Express Oracle Service**

```typescript
// oracle-service/src/index.ts
import express from 'express';
import { ethers } from 'ethers';
import Stripe from 'stripe';
import axios from 'axios';

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
const wallet = new ethers.Wallet(process.env.ORACLE_PRIVATE_KEY!, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS!, CONTRACT_ABI, wallet);

// Authentication partner configurations
const AUTHENTICATION_PARTNERS = {
  watchbox: {
    name: 'WatchBox',
    apiUrl: 'https://api.watchbox.com/authentication',
    apiKey: process.env.WATCHBOX_API_KEY,
    fee: 50
  },
  gia: {
    name: 'GIA',
    apiUrl: 'https://api.gia.edu/authentication',
    apiKey: process.env.GIA_API_KEY,
    fee: 75
  },
  rolex: {
    name: 'Rolex Service Center',
    apiUrl: 'https://api.rolex.com/service/authentication',
    apiKey: process.env.ROLEX_API_KEY,
    fee: 100
  }
  // ... more partners
};

// Routes
app.post('/api/authentication/request', async (req, res) => {
  try {
    const { transactionId, authenticator, watchDetails } = req.body;
    
    // 1. Verify transaction exists on blockchain
    const transaction = await contract.getTransaction(transactionId);
    
    // 2. Request authentication from partner
    const partner = AUTHENTICATION_PARTNERS[authenticator];
    const authResult = await requestAuthenticationFromPartner(partner, watchDetails);
    
    // 3. Update smart contract with result
    await contract.receiveAuthenticationResult(
      transactionId,
      authResult.isAuthentic,
      authResult.result,
      authenticator
    );
    
    // 4. Handle Stripe payment based on result
    if (authResult.isAuthentic) {
      await releasePaymentToSeller(transaction.stripePaymentIntentId, transaction.seller);
    } else {
      await refundBuyer(transaction.stripePaymentIntentId, transaction.buyer);
      await chargeSellerPenalty(transaction.seller, transaction.authenticationFee + 35 + transaction.shippingCost);
    }
    
    res.json({ success: true, result: authResult });
  } catch (error) {
    console.error('Authentication request error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

async function requestAuthenticationFromPartner(partner: any, watchDetails: any) {
  const response = await axios.post(partner.apiUrl, {
    watchDetails,
    timestamp: new Date().toISOString()
  }, {
    headers: {
      'Authorization': `Bearer ${partner.apiKey}`,
      'Content-Type': 'application/json'
    }
  });
  
  return {
    isAuthentic: response.data.isAuthentic,
    result: response.data.result,
    timestamp: new Date()
  };
}

async function releasePaymentToSeller(paymentIntentId: string, sellerAddress: string) {
  // Create transfer to seller's connected account
  await stripe.transfers.create({
    amount: amount,
    currency: 'usd',
    destination: sellerAddress,
    source_transaction: paymentIntentId
  });
}

async function refundBuyer(paymentIntentId: string, buyerAddress: string) {
  await stripe.refunds.create({
    payment_intent: paymentIntentId
  });
}

async function chargeSellerPenalty(sellerAddress: string, amount: number) {
  // Charge seller's saved payment method
  await stripe.paymentIntents.create({
    amount: amount * 100, // Convert to cents
    currency: 'usd',
    customer: sellerAddress,
    payment_method_types: ['card']
  });
}

app.listen(3000, () => {
  console.log('Oracle service running on port 3000');
});
```

---

## 📱 **iOS App Integration**

### **Updated Api3Service for Custom Oracle**

```typescript
// src/app/services/api3.service.ts (Updated)
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuthenticationRequest {
  transactionId: string;
  authenticator: string;
  watchDetails: string;
  sellerAddress: string;
  buyerAddress: string;
  watchPrice: number;
  authenticationFee: number;
  shippingCost: number;
}

export interface AuthenticationResult {
  transactionId: string;
  isAuthentic: boolean;
  result: string;
  authenticator: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CustomOracleService {
  private apiUrl = 'https://your-oracle-service.com/api';

  constructor(private http: HttpClient) {}

  requestAuthentication(request: AuthenticationRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/authentication/request`, {
      ...request,
      timestamp: new Date().toISOString()
    });
  }

  getAuthenticationStatus(transactionId: string): Observable<AuthenticationResult> {
    return this.http.get<AuthenticationResult>(`${this.apiUrl}/authentication/status/${transactionId}`);
  }

  getTransactionHistory(address: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/transactions/${address}`);
  }
}
```

---

## 💳 **Stripe Integration**

### **Payment Flow Implementation**

```typescript
// src/app/services/stripe.service.ts
import { Injectable } from '@angular/core';
import { loadStripe, Stripe } from '@stripe/stripe-js';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private stripe: Stripe | null = null;

  async initialize() {
    this.stripe = await loadStripe(environment.stripe.publishableKey);
  }

  async createPaymentIntent(amount: number, currency: string = 'usd') {
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount, currency })
    });
    
    return response.json();
  }

  async confirmPayment(paymentIntentId: string, paymentMethod: any) {
    if (!this.stripe) throw new Error('Stripe not initialized');
    
    const { error } = await this.stripe.confirmCardPayment(paymentIntentId, {
      payment_method: paymentMethod
    });
    
    return { error };
  }
}
```

---

## 🔄 **Complete Payment Flow**

### **Step-by-Step Process:**

1. **Buyer Initiates Purchase**
   ```typescript
   // iOS app creates payment intent
   const paymentIntent = await stripeService.createPaymentIntent(totalAmount);
   ```

2. **Smart Contract Records Transaction**
   ```solidity
   // Smart contract records transaction details
   contract.createTransaction(transactionId, paymentIntentId, seller, amount, ...);
   ```

3. **Watch Sent for Authentication**
   ```typescript
   // Oracle service requests authentication
   await oracleService.requestAuthentication({
     transactionId,
     authenticator: 'watchbox',
     watchDetails: {...}
   });
   ```

4. **Authentication Partner Processes**
   ```typescript
   // WatchBox/GIA/Rolex processes authentication
   const result = await watchboxApi.authenticate(watchDetails);
   ```

5. **Oracle Updates Smart Contract**
   ```solidity
   // Smart contract receives result
   contract.receiveAuthenticationResult(transactionId, isAuthentic, result);
   ```

6. **Stripe Executes Payment**
   ```typescript
   // If authentic: release to seller
   // If fake: refund buyer, charge seller penalty
   ```

---

## 🚀 **Implementation Plan**

### **Phase 1: Smart Contract (Week 1)**
- Deploy WatchStyleMarketplace contract to Polygon testnet
- Test basic transaction creation and status updates
- Verify oracle authorization system

### **Phase 2: Oracle Service (Week 2)**
- Build Node.js oracle service
- Integrate with 2-3 authentication partners
- Test authentication request/response flow
- Implement Stripe payment handling

### **Phase 3: iOS Integration (Week 3)**
- Update iOS app to use custom oracle service
- Implement Stripe payment flow
- Add real-time status updates
- Test end-to-end authentication

### **Phase 4: Production Deployment (Week 4)**
- Deploy to Polygon mainnet
- Set up production oracle service
- Configure production Stripe account
- Go live with authentication partners

---

## 💰 **Cost Structure**

### **Per Transaction:**
- **Authentication Fee:** $40-150 (partner dependent)
- **Platform Fee:** 3% of watch price
- **Stripe Fee:** 2.9% + $0.30
- **Gas Fee:** ~$0.01-0.05 (Polygon)

### **Example for $10,000 Watch:**
- Watch Price: $10,000
- Authentication Fee: $75 (GIA)
- Platform Fee: $300 (3%)
- Stripe Fee: $290.30
- Gas Fee: $0.05
- **Total Cost:** $665.35

---

## 🔒 **Security Considerations**

### **Smart Contract Security:**
- Only authorized oracles can update authentication results
- Immutable transaction terms
- Automated penalty execution
- Public audit trail

### **Oracle Service Security:**
- HTTPS encryption for all API calls
- API key management for authentication partners
- Rate limiting and DDoS protection
- Secure private key storage

### **Stripe Security:**
- PCI compliance for payment processing
- Fraud detection and prevention
- Secure webhook handling
- Dispute resolution support

**This design gives us the automation and trust of smart contracts with the convenience of traditional payments!** 🎯
