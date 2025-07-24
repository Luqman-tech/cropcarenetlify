# 🌱 AI-Powered Crop Disease Detection for Smallholder Farmers

## 🎯 SDG 2 - Zero Hunger

**Problem**: Many smallholder farmers cannot identify crop diseases early due to lack of expert access, resulting in reduced yields and food insecurity.

**Solution**: AI-powered crop disease detection system with offline capability for use in low-connectivity areas.

## 🏗️ Project Architecture

This project consists of two main components:

### 1. 🤖 AI Model Training & Export (`ai_model/`)
- **Dataset**: PlantVillage Dataset (Penn State University)
- **Model**: Convolutional Neural Network (MobileNetV2, ResNet50, EfficientNetB0)
- **Export**: TensorFlow Lite & ONNX for mobile/web deployment
- **Features**: Offline inference, disease information database

### 2. 📱 Frontend Application (`src/`)
- **Framework**: React + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Features**: Image upload, disease detection, offline capability

## 🚀 Quick Start

### Prerequisites
- Python 3.8+ (for AI model)
- Node.js 18+ (for frontend)
- TensorFlow 2.15.0
- PlantVillage Dataset

### 1. AI Model Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Test setup
python test_setup.py

# Download dataset (optional - can be done manually)
# Visit: https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset

# Train and export model
python ai_model/train_model.py --model-type mobilenet_v2 --epochs 50
```

### 2. Frontend Setup

```bash
# Install Node.js dependencies
npm install

# Start development server
npm run dev
```

## 📊 AI Model Training

### Available Models
- **MobileNetV2** (Recommended): Lightweight, mobile-optimized
- **ResNet50**: High accuracy, larger model
- **EfficientNetB0**: Balanced accuracy/speed
- **Custom CNN**: Simple architecture

### Training Pipeline
```bash
# Complete pipeline
python ai_model/train_model.py --model-type mobilenet_v2 --epochs 50

# Data preprocessing only
python ai_model/data_preprocessing.py

# Model training only
python ai_model/model_training.py

# Model export only
python ai_model/model_export.py

# Model testing
python ai_model/test_model.py --compare
```

### Jupyter Notebook
```bash
# Interactive training and experimentation
jupyter notebook ai_model/notebooks/model_training.ipynb
```

## 📱 Model Export & Deployment

### Export Formats
- **TensorFlow Lite**: Mobile/Android deployment (~3-5 MB)
- **ONNX**: Cross-platform deployment (~5-8 MB)

### Output Files
```
models/
├── mobilenet_v2_final.h5          # Trained Keras model
├── crop_disease_model.tflite      # TensorFlow Lite model
├── crop_disease_model.onnx        # ONNX model
├── model_info.json               # Model metadata
└── disease_info.json             # Disease information database
```

## 🌍 SDG 2 Impact

### Food Security
- Early disease detection prevents crop loss
- Reduces food waste and improves yields
- Supports sustainable agriculture

### Economic Benefits
- Reduces need for expensive expert consultation
- Empowers smallholder farmers with AI tools
- Improves farming efficiency

### Environmental Impact
- Reduces unnecessary pesticide use
- Promotes precision agriculture
- Lightweight models reduce energy consumption

## 🔒 Ethical Considerations

### Bias Mitigation
- Diverse dataset from multiple regions
- Balanced class distribution
- Regular model retraining

### Accessibility
- Offline-capable for remote areas
- Lightweight models for low-resource devices
- Open source with clear documentation

### Transparency
- Clear model documentation
- Explainable AI features
- Open source codebase

## 📁 Project Structure

```
crop-vision-guide/
├── ai_model/                     # AI model training and export
│   ├── config.py                # Configuration parameters
│   ├── data_preprocessing.py    # Dataset loading and preprocessing
│   ├── model_training.py        # Model training and evaluation
│   ├── model_export.py          # Model export to TFLite/ONNX
│   ├── train_model.py           # Main training pipeline
│   ├── test_model.py            # Model testing and validation
│   ├── notebooks/               # Jupyter notebooks
│   └── README.md               # AI model documentation
├── src/                         # Frontend application
│   ├── components/             # React components
│   ├── pages/                  # Application pages
│   ├── hooks/                  # Custom React hooks
│   └── lib/                    # Utility functions
├── models/                      # Trained models (generated)
├── results/                     # Training results (generated)
├── data/                        # Dataset storage
├── requirements.txt             # Python dependencies
└── README.md                   # This file
```

## 🧪 Testing

### AI Model Testing
```bash
# Test all model formats
python ai_model/test_model.py --compare

# Test with specific image
python ai_model/test_model.py --test-image path/to/image.jpg

# Run unit tests
pytest tests/
```

### Frontend Testing
```bash
# Run linting
npm run lint

# Build for production
npm run build
```

## 📈 Model Performance

### Typical Results (MobileNetV2)
- **Test Accuracy**: 95-98%
- **Top-3 Accuracy**: 98-99%
- **Inference Time**: <100ms (mobile)
- **Model Size**: ~3.5 MB (TFLite)

### Supported Crops
- Apple, Cherry, Corn, Grape, Peach
- Pepper, Potato, Strawberry, Tomato

## 🚀 Deployment

### Mobile App Integration
1. Use TensorFlow Lite model
2. Integrate disease info database
3. Implement offline image capture
4. Add feedback collection

### Web App Integration
1. Use ONNX model with TensorFlow.js
2. Implement Progressive Web App (PWA)
3. Add service workers for offline caching
4. Optimize for mobile browsers

## 🔧 Configuration

### Model Configuration
```python
MODEL_CONFIG = {
    "architecture": "mobilenet_v2",
    "input_shape": (224, 224, 3),
    "learning_rate": 0.001,
    "epochs": 50,
    "batch_size": 32
}
```

### Dataset Configuration
```python
DATASET_CONFIG = {
    "image_size": (224, 224),
    "batch_size": 32,
    "validation_split": 0.2,
    "test_split": 0.1
}
```

## 📊 Monitoring & Improvement

### Model Monitoring
- Track prediction accuracy
- Monitor inference performance
- Collect user feedback
- Identify edge cases

### Continuous Improvement
- Retrain with new data
- Update disease information
- Optimize model architecture
- Expand crop coverage

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Submit pull request

### Code Standards
- Follow PEP 8 (Python) and ESLint (JavaScript)
- Add docstrings to functions
- Include type hints
- Write comprehensive tests

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **PlantVillage Dataset**: Penn State University
- **TensorFlow**: Google Research
- **ONNX**: Microsoft, Facebook, Amazon
- **SDG 2**: United Nations Sustainable Development Goals

## 📞 Support

For questions and support:
- Create an issue on GitHub
- Check the documentation
- Review the training logs

---

**🌱 Empowering smallholder farmers with AI for a hunger-free world! 🌱**

## 🛠️ Development

### Using Lovable
Visit the [Lovable Project](https://lovable.dev/projects/1666e698-984e-473b-9bc0-188b84427c64) and start prompting.

### Local Development
```bash
# Clone repository
git clone <YOUR_GIT_URL>
cd crop-vision-guide

# Install dependencies
npm install
pip install -r requirements.txt

# Start development
npm run dev
```

### Technologies Used
- **Frontend**: Vite, TypeScript, React, shadcn/ui, Tailwind CSS
- **AI/ML**: TensorFlow, PyTorch, OpenCV, scikit-learn
- **Export**: TensorFlow Lite, ONNX
- **Deployment**: Progressive Web App (PWA)
