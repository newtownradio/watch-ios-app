# Listing Persistence Test Plan

## Overview
Test the complete flow from creating a listing in the Sell component to viewing it in the Discovery component.

## Test Steps

### 1. Clear Existing Data
- Open browser console
- Run: `localStorage.clear()`
- Refresh the page

### 2. Test Discovery Page (Empty State)
- Navigate to `/discovery`
- Should see demo listings created automatically
- Note the seller IDs used (seller-1, seller-2, etc.)

### 3. Test Sell Page
- Navigate to `/sell`
- Fill out the form:
  - Title: "Test Watch"
  - Starting Price: 1000
  - Description: "Test description"
  - Brand: "Rolex"
  - Model: "Submariner"
  - Condition: "Excellent"
- Click "List Item for Bidding"
- Should see success message with start/end times

### 4. Verify Listing Persistence
- Check localStorage: `localStorage.getItem('watch_ios_listings')`
- Should see the new listing with sellerId: 'seller1'

### 5. Test Discovery Page (With User Listing)
- Navigate back to `/discovery`
- Should see both demo listings AND the user-created listing
- User listing should have seller name "John Seller"

### 6. Test AI Pricing Integration
- Go back to `/sell`
- Use AI Pricing Assistant:
  - Select Brand: "Rolex"
  - Select Model: "Submariner"
  - Set Condition: "Excellent"
  - Click "Get AI Pricing Recommendation"
- Should see modal with pricing analysis
- Click "Apply Suggested Price"
- Verify starting price is updated

### 7. Test Listing Deletion
- In `/sell` page, find the created listing
- Click the delete button (🗑️)
- Confirm deletion
- Go to `/discovery` and verify listing is removed

## Expected Results

✅ **Discovery Page**: Shows both demo listings and user-created listings  
✅ **Sell Page**: Successfully creates and saves listings  
✅ **AI Pricing**: Provides recommendations and applies to form  
✅ **Persistence**: Listings survive page refresh  
✅ **Deletion**: Listings can be deleted from both pages  

## Potential Issues to Check

1. **Date Handling**: Ensure `endTime` is properly set to 2 months from creation
2. **Seller ID Consistency**: User listings use 'seller1', demo listings use 'seller-1', 'seller-2', etc.
3. **Status Filtering**: Only 'active' listings with future end times should appear
4. **LocalStorage**: Data should persist across browser sessions

## Debug Commands

```javascript
// Check all listings
JSON.parse(localStorage.getItem('watch_ios_listings'))

// Check active listings only
const listings = JSON.parse(localStorage.getItem('watch_ios_listings') || '[]')
listings.filter(l => l.status === 'active' && new Date(l.endTime) > new Date())

// Clear all data
localStorage.clear()
```