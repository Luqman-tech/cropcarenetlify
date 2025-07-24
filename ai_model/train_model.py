#!/usr/bin/env python3
"""
Main script for training and exporting the Crop Disease Detection model
"""

import os
import sys
import argparse
from pathlib import Path
import json
import time

# Add the ai_model directory to Python path
sys.path.append(str(Path(__file__).parent))

from data_preprocessing import PlantVillageDataPreprocessor
from model_training import ModelTrainer
from model_export import ModelExporter
from config import MODEL_CONFIG, DATASET_CONFIG


def main():
    """
    Main training and export pipeline
    """
    parser = argparse.ArgumentParser(description="Train and export Crop Disease Detection model")
    parser.add_argument("--model-type", default="mobilenet_v2", 
                       choices=["mobilenet_v2", "resnet50", "efficientnet_b0", "custom_cnn"],
                       help="Model architecture to use")
    parser.add_argument("--epochs", type=int, default=MODEL_CONFIG["epochs"],
                       help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=DATASET_CONFIG["batch_size"],
                       help="Training batch size")
    parser.add_argument("--skip-training", action="store_true",
                       help="Skip training and only export existing model")
    parser.add_argument("--skip-export", action="store_true",
                       help="Skip export and only train model")
    parser.add_argument("--download-data", action="store_true",
                       help="Download dataset from Kaggle")
    parser.add_argument("--kaggle-username", type=str,
                       help="Kaggle username for dataset download")
    parser.add_argument("--kaggle-key", type=str,
                       help="Kaggle API key for dataset download")
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("🌱 AI-Powered Crop Disease Detection for Smallholder Farmers")
    print("🎯 SDG 2 - Zero Hunger")
    print("=" * 60)
    
    start_time = time.time()
    
    # Create necessary directories
    for dir_path in ["models", "results", "data/preprocessed"]:
        Path(dir_path).mkdir(parents=True, exist_ok=True)
    
    try:
        # Step 1: Data Preprocessing
        if not args.skip_training:
            print("\n📊 Step 1: Data Preprocessing")
            print("-" * 40)
            
            preprocessor = PlantVillageDataPreprocessor()
            
            # Download dataset if requested
            if args.download_data:
                if args.kaggle_username and args.kaggle_key:
                    success = preprocessor.download_dataset(args.kaggle_username, args.kaggle_key)
                    if not success:
                        print("❌ Dataset download failed. Please download manually.")
                        return
                else:
                    print("❌ Kaggle credentials required for dataset download.")
                    print("Please provide --kaggle-username and --kaggle-key")
                    return
            
            # Check if dataset exists
            if not preprocessor.data_dir.exists():
                print("❌ Dataset not found!")
                print("Please download the PlantVillage dataset from:")
                print("https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset")
                print("Or use --download-data with Kaggle credentials")
                return
            
            # Load and preprocess data
            print("Loading and preprocessing dataset...")
            X, y, class_counts = preprocessor.load_and_preprocess_data()
            
            # Split data
            X_train, X_val, X_test, y_train, y_val, y_test = preprocessor.split_data(X, y)
            
            # Analyze dataset
            preprocessor.analyze_dataset(class_counts)
            
            # Save preprocessed data
            preprocessor.save_preprocessed_data(X_train, X_val, X_test, y_train, y_val, y_test)
            
            print("✅ Data preprocessing completed!")
        
        # Step 2: Model Training
        if not args.skip_training:
            print("\n🤖 Step 2: Model Training")
            print("-" * 40)
            
            trainer = ModelTrainer(model_type=args.model_type)
            
            # Prepare data
            X_train, X_val, X_test, y_train, y_val, y_test = trainer.prepare_data()
            
            # Train model
            print(f"Training {args.model_type} model...")
            history = trainer.train_model(
                X_train, y_train, X_val, y_val,
                epochs=args.epochs, batch_size=args.batch_size
            )
            
            # Evaluate model
            print("Evaluating model...")
            results = trainer.evaluate_model(X_test, y_test)
            
            # Save model
            trainer.save_model()
            
            print(f"✅ Model training completed!")
            print(f"📈 Test Accuracy: {results['test_accuracy']:.4f}")
            print(f"📈 Test Top-3 Accuracy: {results['test_top3_accuracy']:.4f}")
        
        # Step 3: Model Export
        if not args.skip_export:
            print("\n📱 Step 3: Model Export")
            print("-" * 40)
            
            exporter = ModelExporter(f"models/{args.model_type}_final.h5")
            
            # Export to TensorFlow Lite
            print("Exporting to TensorFlow Lite...")
            tflite_path = exporter.export_to_tflite(quantize=True, optimize=True)
            
            # Export to ONNX
            print("Exporting to ONNX...")
            onnx_path = exporter.export_to_onnx()
            
            # Create disease info database
            print("Creating disease info database...")
            disease_db_path = exporter.create_disease_info_database()
            
            # Create model metadata
            print("Creating model metadata...")
            metadata = exporter.create_model_metadata()
            
            # Benchmark models
            print("Benchmarking models...")
            benchmarks = exporter.benchmark_models()
            
            print("✅ Model export completed!")
        
        # Step 4: Generate Report
        print("\n📋 Step 4: Generating Report")
        print("-" * 40)
        
        generate_training_report(args.model_type, start_time)
        
        print("\n🎉 Pipeline completed successfully!")
        print("=" * 60)
        
        # Print summary
        print("\n📊 Summary:")
        print(f"Model Architecture: {args.model_type}")
        if not args.skip_training:
            print(f"Training Epochs: {args.epochs}")
            print(f"Batch Size: {args.batch_size}")
        if not args.skip_export:
            print(f"TensorFlow Lite: {tflite_path}")
            print(f"ONNX: {onnx_path}")
            print(f"Disease Database: {disease_db_path}")
        
        print("\n📁 Output Files:")
        print("- models/: Trained models and metadata")
        print("- results/: Training plots and evaluation metrics")
        print("- data/preprocessed/: Preprocessed dataset")
        
        print("\n🚀 Next Steps:")
        print("1. Integrate TFLite model into mobile app")
        print("2. Deploy ONNX model for web inference")
        print("3. Test offline functionality")
        print("4. Collect farmer feedback")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        raise


def generate_training_report(model_type: str, start_time: float):
    """
    Generate a comprehensive training report
    """
    report = {
        "project_info": {
            "name": "AI-Powered Crop Disease Detection",
            "sdg_focus": "SDG 2 - Zero Hunger",
            "description": "Deep learning model for early crop disease detection",
            "target_users": "Smallholder farmers in low-connectivity areas"
        },
        "model_info": {
            "architecture": model_type,
            "input_shape": MODEL_CONFIG["input_shape"],
            "num_classes": len(MODEL_CONFIG["class_names"]),
            "dataset": "PlantVillage Dataset (Penn State University)"
        },
        "training_info": {
            "epochs": MODEL_CONFIG["epochs"],
            "batch_size": DATASET_CONFIG["batch_size"],
            "learning_rate": MODEL_CONFIG["learning_rate"],
            "optimizer": "Adam",
            "loss_function": "Categorical Crossentropy"
        },
        "ethical_considerations": {
            "bias_mitigation": "Diverse dataset from multiple regions",
            "environmental_impact": "Lightweight model reduces energy consumption",
            "accessibility": "Offline-capable for remote areas",
            "transparency": "Open source with clear documentation"
        },
        "sustainability_impact": {
            "food_security": "Early disease detection prevents crop loss",
            "economic_benefit": "Reduces need for expensive expert consultation",
            "environmental_benefit": "Reduces unnecessary pesticide use",
            "social_impact": "Empowers smallholder farmers with AI tools"
        }
    }
    
    # Save report
    report_path = Path("results/training_report.json")
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    # Calculate total time
    total_time = time.time() - start_time
    print(f"⏱️  Total execution time: {total_time/60:.2f} minutes")
    
    print(f"📄 Training report saved to {report_path}")


if __name__ == "__main__":
    main() 