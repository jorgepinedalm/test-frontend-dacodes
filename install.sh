#!/bin/bash

echo "🚀 Installing Modular People Portal Dependencies..."

# Install shell dependencies
echo "📦 Installing Shell dependencies..."
cd shell && npm install --silent
if [ $? -eq 0 ]; then
    echo "✅ Shell dependencies installed successfully"
else
    echo "❌ Failed to install Shell dependencies"
    exit 1
fi

# Install auth-mfe dependencies  
echo "📦 Installing Auth MFE dependencies..."
cd ../auth-mfe && npm install --silent
if [ $? -eq 0 ]; then
    echo "✅ Auth MFE dependencies installed successfully"
else
    echo "❌ Failed to install Auth MFE dependencies"
    exit 1
fi

# Install directory-mfe dependencies
echo "📦 Installing Directory MFE dependencies..."
cd ../directory-mfe && npm install --silent
if [ $? -eq 0 ]; then
    echo "✅ Directory MFE dependencies installed successfully"
else
    echo "❌ Failed to install Directory MFE dependencies"
    exit 1
fi

# Install memory-game-mfe dependencies
echo "📦 Installing Memory Game MFE dependencies..."
cd ../memory-game-mfe && npm install --silent
if [ $? -eq 0 ]; then
    echo "✅ Memory Game MFE dependencies installed successfully"
else
    echo "❌ Failed to install Memory Game MFE dependencies"
    exit 1
fi

cd ..

echo "🎉 All dependencies installed successfully!"
echo "📝 Next steps:"
echo "   1. Run 'npm run start:all' to start all applications"
echo "   2. Open http://localhost:3000 in your browser"
echo "   3. Use demo credentials: username 'kminchelle', password '0lelplR'"
