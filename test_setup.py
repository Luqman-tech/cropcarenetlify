#!/usr/bin/env python3
"""
Test script to verify AI model setup
"""

import sys
from pathlib import Path

def test_imports():
    """Test if all required modules can be imported"""
    print("🧪 Testing AI Model Setup")
    print("=" * 40)
    
    try:
        # Test basic imports
        print("📦 Testing basic imports...")
        import numpy as np
        import pandas as pd
        import matplotlib.pyplot as plt
        import seaborn as sns
        import cv2
        import tensorflow as tf
        print("✅ Basic imports successful")
        
        # Test our custom modules
        print("\n🔧 Testing custom modules...")
        sys.path.append('ai_model')
        
        from config import MODEL_CONFIG, DATASET_CONFIG, DISEASE_INFO
        print("✅ Config module imported")
        
        from data_preprocessing import PlantVillageDataPreprocessor
        print("✅ Data preprocessing module imported")
        
        from model_training import ModelTrainer, CropDiseaseModel
        print("✅ Model training module imported")
        
        from model_export import ModelExporter
        print("✅ Model export module imported")
        
        print("\n✅ All imports successful!")
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False
    
    return True

def test_configuration():
    """Test configuration parameters"""
    print("\n⚙️ Testing configuration...")
    
    try:
        from ai_model.config import MODEL_CONFIG, DATASET_CONFIG, DISEASE_INFO
        
        # Test model config
        assert 'architecture' in MODEL_CONFIG
        assert 'input_shape' in MODEL_CONFIG
        assert 'class_names' in MODEL_CONFIG
        print("✅ Model configuration valid")
        
        # Test dataset config
        assert 'image_size' in DATASET_CONFIG
        assert 'batch_size' in DATASET_CONFIG
        print("✅ Dataset configuration valid")
        
        # Test disease info
        assert len(DISEASE_INFO) > 0
        print("✅ Disease information loaded")
        
        print(f"📊 Configuration Summary:")
        print(f"  Model architecture: {MODEL_CONFIG['architecture']}")
        print(f"  Input shape: {MODEL_CONFIG['input_shape']}")
        print(f"  Number of classes: {len(MODEL_CONFIG['class_names'])}")
        print(f"  Image size: {DATASET_CONFIG['image_size']}")
        print(f"  Batch size: {DATASET_CONFIG['batch_size']}")
        print(f"  Disease info entries: {len(DISEASE_INFO)}")
        
    except Exception as e:
        print(f"❌ Configuration error: {e}")
        return False
    
    return True

def test_directories():
    """Test if required directories exist or can be created"""
    print("\n📁 Testing directories...")
    
    required_dirs = [
        "models",
        "results", 
        "data",
        "data/preprocessed",
        "ai_model/notebooks"
    ]
    
    for dir_path in required_dirs:
        path = Path(dir_path)
        try:
            path.mkdir(parents=True, exist_ok=True)
            print(f"✅ {dir_path}")
        except Exception as e:
            print(f"❌ {dir_path}: {e}")
            return False
    
    return True

def test_tensorflow():
    """Test TensorFlow installation and GPU availability"""
    print("\n🤖 Testing TensorFlow...")
    
    try:
        import tensorflow as tf
        
        print(f"✅ TensorFlow version: {tf.__version__}")
        
        # Check for GPU
        gpus = tf.config.list_physical_devices('GPU')
        if gpus:
            print(f"✅ GPU available: {len(gpus)} device(s)")
            for gpu in gpus:
                print(f"  - {gpu.name}")
        else:
            print("⚠️  No GPU detected, will use CPU")
        
        # Test basic TensorFlow operations
        a = tf.constant([1, 2, 3])
        b = tf.constant([4, 5, 6])
        c = tf.add(a, b)
        print(f"✅ TensorFlow operations working: {c.numpy()}")
        
    except Exception as e:
        print(f"❌ TensorFlow error: {e}")
        return False
    
    return True

def main():
    """Run all tests"""
    print("🌱 AI-Powered Crop Disease Detection - Setup Test")
    print("🎯 SDG 2 - Zero Hunger")
    print("=" * 60)
    
    tests = [
        ("Imports", test_imports),
        ("Configuration", test_configuration),
        ("Directories", test_directories),
        ("TensorFlow", test_tensorflow)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
            else:
                print(f"❌ {test_name} test failed")
        except Exception as e:
            print(f"❌ {test_name} test error: {e}")
    
    print("\n" + "=" * 60)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Setup is ready.")
        print("\n🚀 Next steps:")
        print("1. Download PlantVillage dataset")
        print("2. Run: python ai_model/train_model.py")
        print("3. Or use the Jupyter notebook: ai_model/notebooks/model_training.ipynb")
    else:
        print("❌ Some tests failed. Please check the errors above.")
        print("\n🔧 Troubleshooting:")
        print("1. Install missing dependencies: pip install -r requirements.txt")
        print("2. Check Python version (3.8+ required)")
        print("3. Verify TensorFlow installation")
    
    return passed == total

if __name__ == "__main__":
    main() 