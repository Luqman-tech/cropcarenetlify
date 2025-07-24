#!/usr/bin/env python3
"""
Real model training script for PlantVillage dataset
"""

import os
import sys
import argparse
import json
import time
import logging
from pathlib import Path
from datetime import datetime

# Add the ai_model directory to Python path
sys.path.append(str(Path(__file__).parent))

try:
    import tensorflow as tf
    import numpy as np
    from sklearn.metrics import classification_report, confusion_matrix
    import matplotlib.pyplot as plt
    import seaborn as sns
except ImportError as e:
    print(f"Required packages not installed: {e}")
    print("Please install: pip install tensorflow scikit-learn matplotlib seaborn")
    sys.exit(1)

from data_preprocessing import PlantVillageDataPreprocessor
from model_training import ModelTrainer
from model_export import ModelExporter
from config import MODEL_CONFIG, DATASET_CONFIG, EXPORT_CONFIG


def setup_logging():
    """Setup comprehensive logging"""
    log_dir = Path("results/logs")
    log_dir.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_file = log_dir / f"training_{timestamp}.log"
    
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_file),
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    return logging.getLogger(__name__)


def download_dataset_if_needed(preprocessor, args):
    """Download dataset if not present"""
    if not preprocessor.data_dir.exists():
        if args.download_data:
            if args.kaggle_username and args.kaggle_key:
                logger.info("Downloading PlantVillage dataset from Kaggle...")
                success = preprocessor.download_dataset(args.kaggle_username, args.kaggle_key)
                if not success:
                    logger.error("Dataset download failed. Please download manually.")
                    return False
            else:
                logger.error("Kaggle credentials required for dataset download.")
                logger.error("Please provide --kaggle-username and --kaggle-key")
                return False
        else:
            logger.error("Dataset not found!")
            logger.error("Please download the PlantVillage dataset from:")
            logger.error("https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset")
            logger.error("Or use --download-data with Kaggle credentials")
            return False
    else:
        logger.info(f"Dataset found at {preprocessor.data_dir}")
    
    return True


def analyze_dataset_distribution(class_counts, logger):
    """Analyze and visualize dataset distribution"""
    logger.info("Analyzing dataset distribution...")
    
    # Create distribution plot
    plt.figure(figsize=(15, 8))
    classes = list(class_counts.keys())
    counts = list(class_counts.values())
    
    plt.bar(range(len(classes)), counts)
    plt.xlabel('Class Index')
    plt.ylabel('Number of Images')
    plt.title('PlantVillage Dataset Distribution')
    plt.xticks(range(len(classes)), classes, rotation=45, ha='right')
    plt.tight_layout()
    
    # Save plot
    plot_path = Path("results/class_distribution.png")
    plt.savefig(plot_path, dpi=300, bbox_inches='tight')
    plt.close()
    
    logger.info(f"Class distribution plot saved to {plot_path}")
    
    # Log statistics
    total_images = sum(counts)
    logger.info(f"Total images: {total_images}")
    logger.info(f"Number of classes: {len(classes)}")
    logger.info(f"Average images per class: {total_images/len(classes):.1f}")
    logger.info(f"Min images per class: {min(counts)}")
    logger.info(f"Max images per class: {max(counts)}")


def train_model_with_validation(trainer, X_train, y_train, X_val, y_val, args, logger):
    """Train model with comprehensive validation"""
    logger.info(f"Training {args.model_type} model...")
    logger.info(f"Training samples: {len(X_train)}")
    logger.info(f"Validation samples: {len(X_val)}")
    logger.info(f"Epochs: {args.epochs}")
    logger.info(f"Batch size: {args.batch_size}")
    
    # Train model
    start_time = time.time()
    history = trainer.train_model(
        X_train, y_train, X_val, y_val,
        epochs=args.epochs, batch_size=args.batch_size
    )
    training_time = time.time() - start_time
    
    logger.info(f"Training completed in {training_time/60:.2f} minutes")
    
    # Plot training history
    plot_training_history(history, logger)
    
    return history


def plot_training_history(history, logger):
    """Plot and save training history"""
    plt.figure(figsize=(15, 5))
    
    # Accuracy plot
    plt.subplot(1, 2, 1)
    plt.plot(history.history['accuracy'], label='Training Accuracy')
    plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
    plt.title('Model Accuracy')
    plt.xlabel('Epoch')
    plt.ylabel('Accuracy')
    plt.legend()
    plt.grid(True)
    
    # Loss plot
    plt.subplot(1, 2, 2)
    plt.plot(history.history['loss'], label='Training Loss')
    plt.plot(history.history['val_loss'], label='Validation Loss')
    plt.title('Model Loss')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()
    plt.grid(True)
    
    plt.tight_layout()
    
    # Save plot
    plot_path = Path("results/training_history.png")
    plt.savefig(plot_path, dpi=300, bbox_inches='tight')
    plt.close()
    
    logger.info(f"Training history plot saved to {plot_path}")


def evaluate_model_comprehensively(trainer, X_test, y_test, logger):
    """Comprehensive model evaluation"""
    logger.info("Evaluating model...")
    
    # Get predictions
    y_pred = trainer.model.predict(X_test)
    y_pred_classes = np.argmax(y_pred, axis=1)
    y_true_classes = np.argmax(y_test, axis=1)
    
    # Calculate metrics
    test_loss, test_accuracy = trainer.model.evaluate(X_test, y_test, verbose=0)
    
    # Top-3 accuracy
    top3_accuracy = tf.keras.metrics.top_k_categorical_accuracy(y_test, y_pred, k=3).numpy()
    
    logger.info(f"Test Accuracy: {test_accuracy:.4f}")
    logger.info(f"Test Loss: {test_loss:.4f}")
    logger.info(f"Top-3 Accuracy: {top3_accuracy:.4f}")
    
    # Classification report
    class_names = MODEL_CONFIG["class_names"]
    report = classification_report(y_true_classes, y_pred_classes, 
                                 target_names=class_names, output_dict=True)
    
    # Save detailed report
    report_path = Path("results/classification_report.json")
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    logger.info(f"Classification report saved to {report_path}")
    
    # Confusion matrix
    plot_confusion_matrix(y_true_classes, y_pred_classes, class_names, logger)
    
    return {
        'test_accuracy': test_accuracy,
        'test_loss': test_loss,
        'top3_accuracy': top3_accuracy,
        'classification_report': report
    }


def plot_confusion_matrix(y_true, y_pred, class_names, logger):
    """Plot and save confusion matrix"""
    cm = confusion_matrix(y_true, y_pred)
    
    plt.figure(figsize=(20, 16))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=class_names, yticklabels=class_names)
    plt.title('Confusion Matrix')
    plt.xlabel('Predicted')
    plt.ylabel('True')
    plt.xticks(rotation=45, ha='right')
    plt.yticks(rotation=0)
    plt.tight_layout()
    
    # Save plot
    plot_path = Path("results/confusion_matrix.png")
    plt.savefig(plot_path, dpi=300, bbox_inches='tight')
    plt.close()
    
    logger.info(f"Confusion matrix saved to {plot_path}")


def export_models_comprehensively(trainer, logger):
    """Export models in multiple formats"""
    logger.info("Exporting models...")
    
    # Save Keras model
    model_path = Path("models") / f"{trainer.model_type}_final.h5"
    trainer.model.save(model_path)
    logger.info(f"Keras model saved to {model_path}")
    
    # Export to TensorFlow Lite
    exporter = ModelExporter(str(model_path))
    
    # Export standard TFLite
    tflite_path = exporter.export_to_tflite(quantize=False, optimize=False)
    logger.info(f"Standard TFLite model: {tflite_path}")
    
    # Export optimized TFLite
    tflite_opt_path = exporter.export_to_tflite(quantize=False, optimize=True)
    logger.info(f"Optimized TFLite model: {tflite_opt_path}")
    
    # Export quantized TFLite
    tflite_quant_path = exporter.export_to_tflite(quantize=True, optimize=True)
    logger.info(f"Quantized TFLite model: {tflite_quant_path}")
    
    # Export to ONNX
    onnx_path = exporter.export_to_onnx()
    if onnx_path:
        logger.info(f"ONNX model: {onnx_path}")
    
    # Create disease info database
    disease_db_path = exporter.create_disease_info_database()
    logger.info(f"Disease database: {disease_db_path}")
    
    # Create model metadata
    metadata = exporter.create_model_metadata()
    logger.info(f"Model metadata: {EXPORT_CONFIG['model_info_path']}")
    
    # Benchmark models
    benchmarks = exporter.benchmark_models()
    logger.info("Model benchmarking completed")
    
    return {
        'keras_model': str(model_path),
        'tflite_standard': tflite_path,
        'tflite_optimized': tflite_opt_path,
        'tflite_quantized': tflite_quant_path,
        'onnx_model': onnx_path,
        'disease_database': disease_db_path,
        'benchmarks': benchmarks
    }


def generate_comprehensive_report(args, training_time, evaluation_results, export_results, logger):
    """Generate comprehensive training report"""
    logger.info("Generating comprehensive report...")
    
    report = {
        "project_info": {
            "name": "AI-Powered Crop Disease Detection",
            "sdg_focus": "SDG 2 - Zero Hunger",
            "description": "Deep learning model for early crop disease detection",
            "target_users": "Smallholder farmers in low-connectivity areas",
            "training_date": datetime.now().isoformat()
        },
        "model_info": {
            "architecture": args.model_type,
            "input_shape": MODEL_CONFIG["input_shape"],
            "num_classes": len(MODEL_CONFIG["class_names"]),
            "dataset": "PlantVillage Dataset (Penn State University)",
            "class_names": MODEL_CONFIG["class_names"]
        },
        "training_info": {
            "epochs": args.epochs,
            "batch_size": args.batch_size,
            "learning_rate": MODEL_CONFIG["learning_rate"],
            "optimizer": "Adam",
            "loss_function": "Categorical Crossentropy",
            "training_time_minutes": training_time / 60
        },
        "performance_metrics": {
            "test_accuracy": evaluation_results['test_accuracy'],
            "test_loss": evaluation_results['test_loss'],
            "top3_accuracy": evaluation_results['top3_accuracy'],
            "classification_report": evaluation_results['classification_report']
        },
        "export_info": export_results,
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
    report_path = Path("results/comprehensive_training_report.json")
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    logger.info(f"Comprehensive report saved to {report_path}")
    
    return report


def main():
    """Main training pipeline"""
    parser = argparse.ArgumentParser(description="Train Crop Disease Detection model on PlantVillage dataset")
    parser.add_argument("--model-type", default="mobilenet_v2", 
                       choices=["mobilenet_v2", "resnet50", "efficientnet_b0", "custom_cnn"],
                       help="Model architecture to use")
    parser.add_argument("--epochs", type=int, default=MODEL_CONFIG["epochs"],
                       help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=DATASET_CONFIG["batch_size"],
                       help="Training batch size")
    parser.add_argument("--download-data", action="store_true",
                       help="Download dataset from Kaggle")
    parser.add_argument("--kaggle-username", type=str,
                       help="Kaggle username for dataset download")
    parser.add_argument("--kaggle-key", type=str,
                       help="Kaggle API key for dataset download")
    parser.add_argument("--skip-training", action="store_true",
                       help="Skip training and only export existing model")
    parser.add_argument("--skip-export", action="store_true",
                       help="Skip export and only train model")
    
    args = parser.parse_args()
    
    # Setup logging
    logger = setup_logging()
    
    logger.info("=" * 60)
    logger.info("🌱 AI-Powered Crop Disease Detection for Smallholder Farmers")
    logger.info("🎯 SDG 2 - Zero Hunger")
    logger.info("=" * 60)
    
    start_time = time.time()
    
    # Create necessary directories
    for dir_path in ["models", "results", "data/preprocessed"]:
        Path(dir_path).mkdir(parents=True, exist_ok=True)
    
    try:
        if not args.skip_training:
            # Step 1: Data Preprocessing
            logger.info("📊 Step 1: Data Preprocessing")
            logger.info("-" * 40)
            
            preprocessor = PlantVillageDataPreprocessor()
            
            # Check and download dataset
            if not download_dataset_if_needed(preprocessor, args):
                return
            
            # Load and preprocess data
            logger.info("Loading and preprocessing dataset...")
            X, y, class_counts = preprocessor.load_and_preprocess_data()
            
            # Split data
            X_train, X_val, X_test, y_train, y_val, y_test = preprocessor.split_data(X, y)
            
            # Analyze dataset
            analyze_dataset_distribution(class_counts, logger)
            
            # Save preprocessed data
            preprocessor.save_preprocessed_data(X_train, X_val, X_test, y_train, y_val, y_test)
            
            logger.info("✅ Data preprocessing completed!")
            
            # Step 2: Model Training
            logger.info("🤖 Step 2: Model Training")
            logger.info("-" * 40)
            
            trainer = ModelTrainer(model_type=args.model_type)
            
            # Train model
            history = train_model_with_validation(trainer, X_train, y_train, X_val, y_val, args, logger)
            
            # Evaluate model
            logger.info("📊 Step 3: Model Evaluation")
            logger.info("-" * 40)
            
            evaluation_results = evaluate_model_comprehensively(trainer, X_test, y_test, logger)
            
            # Save model
            trainer.save_model()
            
            logger.info("✅ Model training and evaluation completed!")
        
        # Step 4: Model Export
        if not args.skip_export:
            logger.info("📱 Step 4: Model Export")
            logger.info("-" * 40)
            
            if args.skip_training:
                # Load existing model
                trainer = ModelTrainer(model_type=args.model_type)
                trainer.load_model()
            
            export_results = export_models_comprehensively(trainer, logger)
            
            logger.info("✅ Model export completed!")
        
        # Step 5: Generate Report
        logger.info("📋 Step 5: Generating Report")
        logger.info("-" * 40)
        
        total_time = time.time() - start_time
        
        if not args.skip_training:
            report = generate_comprehensive_report(
                args, total_time, evaluation_results, export_results, logger
            )
        else:
            logger.info("Skipping report generation (training was skipped)")
        
        logger.info("🎉 Pipeline completed successfully!")
        logger.info("=" * 60)
        
        # Print summary
        logger.info("📊 Summary:")
        logger.info(f"Model Architecture: {args.model_type}")
        if not args.skip_training:
            logger.info(f"Training Epochs: {args.epochs}")
            logger.info(f"Batch Size: {args.batch_size}")
            logger.info(f"Test Accuracy: {evaluation_results['test_accuracy']:.4f}")
            logger.info(f"Top-3 Accuracy: {evaluation_results['top3_accuracy']:.4f}")
        if not args.skip_export:
            logger.info(f"TensorFlow Lite Models: {len([k for k in export_results.keys() if 'tflite' in k])}")
            logger.info(f"ONNX Model: {'Yes' if export_results['onnx_model'] else 'No'}")
            logger.info(f"Disease Database: {export_results['disease_database']}")
        
        logger.info(f"⏱️  Total execution time: {total_time/60:.2f} minutes")
        
        logger.info("\n📁 Output Files:")
        logger.info("- models/: Trained models and metadata")
        logger.info("- results/: Training plots and evaluation metrics")
        logger.info("- data/preprocessed/: Preprocessed dataset")
        
        logger.info("\n🚀 Next Steps:")
        logger.info("1. Integrate TFLite model into mobile app")
        logger.info("2. Deploy ONNX model for web inference")
        logger.info("3. Test offline functionality")
        logger.info("4. Collect farmer feedback")
        
    except Exception as e:
        logger.error(f"❌ Error: {e}")
        raise


if __name__ == "__main__":
    main() 