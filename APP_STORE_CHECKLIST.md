# App Store Connect Submission Checklist

## ✅ Pre-Submission Requirements

### 1. **App Configuration**
- [x] App ID: `com.colinilgen.watchios`
- [x] App Name: "watch-ios" (consider changing to a more user-friendly name)
- [x] Version: 0.0.0 (needs to be updated to 1.0.0 for first release)
- [x] Build: Current build number
- [x] Bundle Identifier matches App Store Connect

### 2. **App Store Connect Setup**
- [ ] Create app in App Store Connect
- [ ] Set up app information (description, keywords, etc.)
- [ ] Upload app screenshots (required: 6.7" iPhone, 5.5" iPhone, 12.9" iPad)
- [ ] Create app preview videos (optional but recommended)
- [ ] Set app category and subcategory
- [ ] Add app privacy policy URL
- [ ] Set up app pricing and availability

### 3. **App Store Review Requirements**
- [ ] **Privacy Policy**: Required for all apps
- [ ] **App Icon**: 1024x1024 pixels, no transparency
- [ ] **Launch Screen**: Properly configured
- [ ] **App Description**: Clear, accurate description
- [ ] **Keywords**: Optimized for App Store search
- [ ] **Support URL**: Working support/contact page
- [ ] **Marketing URL**: Optional but recommended

### 4. **Technical Requirements**
- [x] iOS 14.0+ minimum deployment target
- [x] Universal app (iPhone + iPad)
- [x] No debug code or test data
- [x] Proper error handling
- [x] No hardcoded credentials
- [x] App works offline (local storage)
- [x] No console.log statements in production

### 5. **Legal & Compliance**
- [ ] **Privacy Policy**: Must be accessible and comprehensive
- [ ] **Terms of Service**: Recommended for user agreements
- [ ] **Data Collection**: Disclose any data collection
- [ ] **GDPR Compliance**: If targeting EU users
- [ ] **COPPA Compliance**: If targeting children under 13

## 🔧 Required Fixes Before Submission

### 1. **Update App Version**
```bash
# Update package.json version
npm version 1.0.0
```

### 2. **Update App Display Name**
- Change from "watch-ios" to a user-friendly name
- Update in `capacitor.config.ts` and `Info.plist`

### 3. **Remove Debug Code**
- Remove or comment out debug buttons in auth component
- Remove console.log statements
- Clean up test user functionality

### 4. **App Icon**
- Create 1024x1024 app icon
- Add to `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

### 5. **Privacy Policy**
- Create privacy policy page
- Host it online (GitHub Pages, etc.)
- Add URL to App Store Connect

## 📱 App Store Connect Steps

### 1. **Create App Record**
1. Go to App Store Connect
2. Click "+" → "New App"
3. Fill in app information:
   - **Platform**: iOS
   - **Name**: Your app name
   - **Primary Language**: English
   - **Bundle ID**: `com.colinilgen.watchios`
   - **SKU**: Unique identifier (e.g., `watchios2024`)

### 2. **App Information**
- **Description**: Write compelling app description
- **Keywords**: Optimize for App Store search
- **Support URL**: Your support page
- **Marketing URL**: Your app website (optional)
- **Privacy Policy URL**: Required

### 3. **Screenshots & Media**
- **iPhone 6.7"**: 1290 x 2796 pixels
- **iPhone 5.5"**: 1242 x 2208 pixels  
- **iPad 12.9"**: 2048 x 2732 pixels
- **App Preview Videos**: Optional but recommended

### 4. **App Review Information**
- **Demo Account**: Create test account for reviewers
- **Notes**: Explain any special features or requirements
- **Contact Information**: Your contact details

## 🚀 Submission Process

### 1. **Archive App**
```bash
# Build for release
npm run build
npx cap sync ios

# Open in Xcode
open ios/App/App.xcworkspace
```

### 2. **In Xcode**
1. Select "Any iOS Device" as target
2. Product → Archive
3. Wait for archive to complete
4. Click "Distribute App"

### 3. **Upload to App Store Connect**
1. Select "App Store Connect"
2. Choose "Upload"
3. Select your archive
4. Wait for processing

### 4. **Submit for Review**
1. Go to App Store Connect
2. Select your app
3. Go to "App Store" tab
4. Fill in all required information
5. Submit for review

## ⚠️ Common Rejection Reasons

### 1. **Technical Issues**
- App crashes on launch
- Broken functionality
- Poor performance
- Memory leaks

### 2. **Content Issues**
- Missing privacy policy
- Inappropriate content
- Copyright violations
- Misleading information

### 3. **UI/UX Issues**
- Poor user interface
- Confusing navigation
- Accessibility issues
- Inconsistent design

### 4. **App Store Guidelines**
- Violation of App Store guidelines
- Inappropriate metadata
- Misleading screenshots
- Spam or keyword stuffing

## 📋 Final Checklist

### Before Uploading
- [ ] App version is 1.0.0 or higher
- [ ] App name is user-friendly
- [ ] App icon is 1024x1024 pixels
- [ ] All debug code is removed
- [ ] App works without internet connection
- [ ] No hardcoded test data
- [ ] Privacy policy is accessible
- [ ] App description is complete
- [ ] Screenshots are ready
- [ ] Test account is created for reviewers

### Before Submitting for Review
- [ ] All App Store Connect fields are filled
- [ ] Screenshots are uploaded
- [ ] App preview videos are uploaded (optional)
- [ ] Privacy policy URL is working
- [ ] Support URL is working
- [ ] Demo account credentials are provided
- [ ] App review notes are complete

## 🎯 Recommended Timeline

1. **Week 1**: Fix technical issues, update version, remove debug code
2. **Week 2**: Create app icon, privacy policy, prepare screenshots
3. **Week 3**: Set up App Store Connect, upload build
4. **Week 4**: Submit for review (review takes 1-7 days)

## 📞 Support Resources

- **Apple Developer Documentation**: https://developer.apple.com/app-store/
- **App Store Review Guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **App Store Connect Help**: https://help.apple.com/app-store-connect/

---

**Next Steps:**
1. Update app version to 1.0.0
2. Create app icon
3. Write privacy policy
4. Prepare screenshots
5. Set up App Store Connect account
6. Upload first build 