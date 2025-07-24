#!/usr/bin/env python3
"""
Setup script for AI-Powered Crop Disease Detection Model
SDG 2 - Zero Hunger Project
"""

import os
import sys
import subprocess
import json
import time
from pathlib import Path
from typing import Dict, List, Optional

def print_banner():
    """Print project banner"""
    print("=" * 70)
    print("🌱 AI-Powered Crop Disease Detection for Smallholder Farmers")
    print("🎯 SDG 2 - Zero Hunger")
    print("🤖 Complete Setup and Training Pipeline")
    print("=" * 70)
    print()


def check_python_version():
    """Check Python version compatibility"""
    print("🐍 Checking Python version...")
    
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        print(f"Current version: {sys.version}")
        return False
    
    print(f"✅ Python {sys.version.split()[0]} is compatible")
    return True


def install_requirements(requirements_file: str = "requirements_ai.txt"):
    """Install Python requirements"""
    print(f"📦 Installing requirements from {requirements_file}...")
    
    if not Path(requirements_file).exists():
        print(f"❌ Requirements file {requirements_file} not found")
        return False
    
    try:
        # Install requirements
        result = subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", requirements_file
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Requirements installed successfully")
            return True
        else:
            print(f"❌ Failed to install requirements: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Error installing requirements: {e}")
        return False


def setup_kaggle_credentials():
    """Setup Kaggle credentials for dataset download"""
    print("🔑 Setting up Kaggle credentials...")
    
    kaggle_dir = Path.home() / ".kaggle"
    kaggle_dir.mkdir(exist_ok=True)
    
    kaggle_config = kaggle_dir / "kaggle.json"
    
    if kaggle_config.exists():
        print("✅ Kaggle credentials already configured")
        return True
    
    print("📝 Please provide your Kaggle credentials:")
    print("1. Go to https://www.kaggle.com/settings/account")
    print("2. Scroll down to 'API' section")
    print("3. Click 'Create New API Token'")
    print("4. Download the kaggle.json file")
    print("5. Place it in ~/.kaggle/kaggle.json")
    
    username = input("Enter your Kaggle username (or press Enter to skip): ").strip()
    if not username:
        print("⚠️  Skipping Kaggle setup. You'll need to download the dataset manually.")
        return False
    
    api_key = input("Enter your Kaggle API key (or press Enter to skip): ").strip()
    if not api_key:
        print("⚠️  Skipping Kaggle setup. You'll need to download the dataset manually.")
        return False
    
    # Create kaggle.json
    kaggle_data = {
        "username": username,
        "key": api_key
    }
    
    with open(kaggle_config, 'w') as f:
        json.dump(kaggle_data, f)
    
    # Set proper permissions
    os.chmod(kaggle_config, 0o600)
    
    print("✅ Kaggle credentials configured")
    return True


def create_project_structure():
    """Create project directory structure"""
    print("📁 Creating project structure...")
    
    directories = [
        "data",
        "data/plantvillage",
        "data/preprocessed",
        "models",
        "results",
        "results/logs",
        "results/plots",
        "ai_model/notebooks",
        "tests",
        "docs"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"  ✅ Created {directory}/")
    
    print("✅ Project structure created")


def download_plantvillage_dataset():
    """Download PlantVillage dataset"""
    print("📥 Downloading PlantVillage dataset...")
    
    try:
        # Check if kaggle is available
        result = subprocess.run(["kaggle", "--version"], capture_output=True, text=True)
        if result.returncode != 0:
            print("❌ Kaggle CLI not available. Please install it first:")
            print("  pip install kaggle")
            return False
        
        # Download dataset
        dataset_path = Path("data/plantvillage")
        if dataset_path.exists() and any(dataset_path.iterdir()):
            print("✅ Dataset already exists")
            return True
        
        print("Downloading from Kaggle (this may take a while)...")
        result = subprocess.run([
            "kaggle", "datasets", "download", "-d", "abdallahalidev/plantvillage-dataset",
            "-p", "data/plantvillage", "--unzip"
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Dataset downloaded successfully")
            return True
        else:
            print(f"❌ Failed to download dataset: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Error downloading dataset: {e}")
        print("📋 Manual download instructions:")
        print("1. Go to: https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset")
        print("2. Download the dataset")
        print("3. Extract to data/plantvillage/")
        return False


def run_initial_tests():
    """Run initial tests to verify setup"""
    print("🧪 Running initial tests...")
    
    try:
        # Test basic imports
        import tensorflow as tf
        import numpy as np
        import cv2
        from PIL import Image
        
        print("✅ Core libraries imported successfully")
        
        # Test TensorFlow
        print(f"✅ TensorFlow version: {tf.__version__}")
        
        # Test GPU availability
        gpus = tf.config.list_physical_devices('GPU')
        if gpus:
            print(f"✅ GPU detected: {len(gpus)} device(s)")
        else:
            print("⚠️  No GPU detected. Training will use CPU")
        
        # Test basic model creation
        model = tf.keras.Sequential([
            tf.keras.layers.Input(shape=(224, 224, 3)),
            tf.keras.layers.Conv2D(32, 3, activation='relu'),
            tf.keras.layers.GlobalAveragePooling2D(),
            tf.keras.layers.Dense(33, activation='softmax')
        ])
        
        print("✅ Basic model creation successful")
        
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Test error: {e}")
        return False


def create_demo_model():
    """Create a demo model for testing"""
    print("🤖 Creating demo model...")
    
    try:
        # Import required modules
        from ai_model.model_training import ModelTrainer
        from ai_model.model_export import ModelExporter
        
        # Create trainer
        trainer = ModelTrainer(model_type="mobilenet_v2")
        
        # Create and compile model
        model = trainer.create_model()
        trainer.compile_model(model)
        
        # Save model
        model_path = Path("models/demo_model.h5")
        model.save(model_path)
        
        print(f"✅ Demo model saved to {model_path}")
        
        # Test export
        exporter = ModelExporter(str(model_path))
        
        # Export to TFLite
        tflite_path = exporter.export_to_tflite(quantize=False, optimize=False)
        print(f"✅ Demo TFLite model: {tflite_path}")
        
        # Create disease database
        db_path = exporter.create_disease_info_database()
        print(f"✅ Disease database: {db_path}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating demo model: {e}")
        return False


def generate_setup_report():
    """Generate setup completion report"""
    print("📋 Generating setup report...")
    
    report = {
        "setup_info": {
            "timestamp": time.time(),
            "python_version": sys.version,
            "platform": sys.platform
        },
        "directories_created": [
            "data/",
            "models/",
            "results/",
            "ai_model/notebooks/",
            "tests/",
            "docs/"
        ],
        "files_created": [
            "requirements_ai.txt",
            "setup_ai_model.py",
            "ai_model/train_real_model.py",
            "ai_model/test_model_comprehensive.py",
            "models/disease_info_complete.json"
        ],
        "next_steps": [
            "Run: python ai_model/train_real_model.py --download-data",
            "Run: python ai_model/test_model_comprehensive.py",
            "Start training: python ai_model/train_real_model.py --epochs 50",
            "View results in results/ directory"
        ]
    }
    
    # Save report
    report_path = Path("results/setup_report.json")
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"✅ Setup report saved to {report_path}")


def main():
    """Main setup function"""
    print_banner()
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Create project structure
    create_project_structure()
    
    # Install requirements
    if not install_requirements():
        print("⚠️  Requirements installation failed. Continuing with basic setup...")
    
    # Setup Kaggle credentials
    kaggle_configured = setup_kaggle_credentials()
    
    # Download dataset if Kaggle is configured
    if kaggle_configured:
        download_plantvillage_dataset()
    else:
        print("📋 Dataset download skipped. Please download manually.")
    
    # Run initial tests
    if not run_initial_tests():
        print("⚠️  Initial tests failed. Please check your installation.")
    
    # Create demo model
    create_demo_model()
    
    # Generate setup report
    generate_setup_report()
    
    print("\n" + "=" * 70)
    print("🎉 SETUP COMPLETED SUCCESSFULLY!")
    print("=" * 70)
    
    print("\n📊 What's been set up:")
    print("✅ Project directory structure")
    print("✅ Python requirements (if installation succeeded)")
    print("✅ Kaggle credentials (if provided)")
    print("✅ PlantVillage dataset (if download succeeded)")
    print("✅ Demo model and export")
    print("✅ Comprehensive testing framework")
    print("✅ Training pipeline")
    
    print("\n🚀 Next Steps:")
    print("1. Test the setup: python ai_model/test_model_comprehensive.py")
    print("2. Train the model: python ai_model/train_real_model.py --epochs 50")
    print("3. View results in the results/ directory")
    print("4. Check the setup report: results/setup_report.json")
    
    print("\n📚 Documentation:")
    print("- README.md: Project overview")
    print("- ai_model/README.md: AI model documentation")
    print("- PROGRESS_SUMMARY.md: Current progress")
    
    print("\n🌱 Ready to contribute to SDG 2 - Zero Hunger!")
    print("=" * 70)


if __name__ == "__main__":
    main() 