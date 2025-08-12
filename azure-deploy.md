# 🚀 Azure Deployment Guide for Watch Style iOS

## **📋 Prerequisites**
- Azure subscription
- Azure CLI installed
- Node.js and npm

## **🔧 Azure Resources Setup**

### 1. **Azure Cosmos DB Setup**
```bash
# Create resource group
az group create --name watch-ios-rg --location eastus

# Create Cosmos DB account
az cosmosdb create \
  --name watch-ios-cosmos \
  --resource-group watch-ios-rg \
  --kind GlobalDocumentDB \
  --capabilities EnableServerless

# Create database
az cosmosdb sql database create \
  --account-name watch-ios-cosmos \
  --resource-group watch-ios-rg \
  --name watch-ios-db

# Create containers
az cosmosdb sql container create \
  --account-name watch-ios-cosmos \
  --resource-group watch-ios-rg \
  --database-name watch-ios-db \
  --name listings \
  --partition-key-path "/id"

az cosmosdb sql container create \
  --account-name watch-ios-cosmos \
  --resource-group watch-ios-rg \
  --database-name watch-ios-db \
  --name users \
  --partition-key-path "/id"

az cosmosdb sql container create \
  --account-name watch-ios-cosmos \
  --resource-group watch-ios-rg \
  --database-name watch-ios-db \
  --name orders \
  --partition-key-path "/id"

az cosmosdb sql container create \
  --account-name watch-ios-cosmos \
  --resource-group watch-ios-rg \
  --database-name watch-ios-db \
  --name bids \
  --partition-key-path "/id"

az cosmosdb sql container create \
  --account-name watch-ios-cosmos \
  --resource-group watch-ios-rg \
  --database-name watch-ios-db \
  --name messages \
  --partition-key-path "/id"
```

### 2. **Azure Blob Storage Setup**
```bash
# Create storage account
az storage account create \
  --name watchiosstorage \
  --resource-group watch-ios-rg \
  --location eastus \
  --sku Standard_LRS \
  --encryption-services blob

# Create container for watch images
az storage container create \
  --name watch-images \
  --account-name watchiosstorage
```

### 3. **Get Connection Strings and Keys**
```bash
# Get Cosmos DB endpoint and key
az cosmosdb keys list \
  --name watch-ios-cosmos \
  --resource-group watch-ios-rg

# Get storage account connection string
az storage account show-connection-string \
  --name watchiosstorage \
  --resource-group watch-ios-rg
```

## **🔐 Environment Variables**

Create a `.env` file in your project root:
```env
AZURE_COSMOS_ENDPOINT=https://watch-ios-cosmos.documents.azure.com:443/
AZURE_COSMOS_KEY=your_cosmos_db_key_here
AZURE_COSMOS_DATABASE_ID=watch-ios-db
AZURE_BLOB_CONNECTION_STRING=your_blob_storage_connection_string_here
```

## **📱 App Configuration**

The app will automatically:
1. **Initialize Azure services** on startup
2. **Fall back to localStorage** if Azure is unavailable
3. **Migrate data** from localStorage to Azure when possible

## **🚀 Deployment Steps**

1. **Set up Azure resources** using the commands above
2. **Configure environment variables**
3. **Test locally** with Azure services
4. **Deploy to production** (Azure App Service, etc.)

## **✅ Benefits of Azure Integration**

- **Scalable data storage** with Cosmos DB
- **Reliable image storage** with Blob Storage
- **Automatic fallback** to localStorage
- **Production-ready** infrastructure
- **Cost-effective** serverless options

## **🔍 Monitoring**

- **Azure Monitor** for performance metrics
- **Application Insights** for app telemetry
- **Cosmos DB metrics** for database performance
- **Blob Storage analytics** for storage usage
