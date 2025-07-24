#!/usr/bin/env python3
"""
Simplified AI Model Demo for Crop Disease Detection
This demo works with available packages and shows the training pipeline concept
"""

import os
import sys
import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
from typing import Dict, List, Tuple
import time

# Set up plotting
plt.style.use('default')
sns.set_palette("husl")

class SimpleCropDiseaseDemo:
    """
    Simplified demonstration of crop disease detection model
    """
    
    def __init__(self):
        self.class_names = [
            "Apple___Apple_scab",
            "Apple___Black_rot", 
            "Apple___Cedar_apple_rust",
            "Apple___healthy",
            "Cherry___healthy",
            "Cherry___Powdery_mildew",
            "Corn___Cercospora_leaf_spot Gray_leaf_spot",
            "Corn___Common_rust",
            "Corn___healthy",
            "Corn___Northern_Leaf_Blight",
            "Grape___Black_rot",
            "Grape___Esca_(Black_Measles)",
            "Grape___healthy",
            "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
            "Peach___Bacterial_spot",
            "Peach___healthy",
            "Pepper_bell___Bacterial_spot",
            "Pepper_bell___healthy",
            "Potato___Early_blight",
            "Potato___healthy",
            "Potato___Late_blight",
            "Strawberry___healthy",
            "Strawberry___Leaf_scorch",
            "Tomato___Bacterial_spot",
            "Tomato___Early_blight",
            "Tomato___healthy",
            "Tomato___Late_blight",
            "Tomato___Leaf_Mold",
            "Tomato___Septoria_leaf_spot",
            "Tomato___Spider_mites Two-spotted_spider_mite",
            "Tomato___Target_Spot",
            "Tomato___Tomato_mosaic_virus",
            "Tomato___Tomato_Yellow_Leaf_Curl_Virus"
        ]
        
        self.disease_info = {
            "Apple___Apple_scab": {
                "symptoms": "Dark, olive-green to brown spots on leaves and fruit",
                "treatment": "Apply fungicides, remove infected leaves, improve air circulation",
                "prevention": "Plant resistant varieties, maintain tree health, proper spacing"
            },
            "Apple___Black_rot": {
                "symptoms": "Black, sunken lesions on fruit and leaves",
                "treatment": "Remove infected parts, apply fungicides, sanitize tools",
                "prevention": "Prune properly, avoid overhead irrigation, clean orchard floor"
            },
            "Apple___healthy": {
                "symptoms": "No visible disease symptoms",
                "treatment": "Continue current care practices",
                "prevention": "Maintain good cultural practices, regular monitoring"
            },
            "Tomato___Late_blight": {
                "symptoms": "Dark, water-soaked lesions on leaves and stems",
                "treatment": "Apply fungicides immediately, remove infected plants",
                "prevention": "Plant resistant varieties, avoid overhead irrigation"
            },
            "Tomato___healthy": {
                "symptoms": "No visible disease symptoms",
                "treatment": "Continue current care practices",
                "prevention": "Maintain good cultural practices, regular monitoring"
            }
        }
    
    def generate_synthetic_data(self, num_samples: int = 1000) -> Tuple[np.ndarray, np.ndarray]:
        """
        Generate synthetic data for demonstration
        """
        print(f"🔄 Generating synthetic data ({num_samples} samples)...")
        
        # Generate random image-like data
        X = np.random.random((num_samples, 224, 224, 3)).astype(np.float32)
        
        # Generate random labels
        num_classes = len(self.class_names)
        y = np.random.randint(0, num_classes, num_samples)
        
        # Convert to one-hot encoding
        y_one_hot = np.eye(num_classes)[y]
        
        print(f"✅ Generated {num_samples} samples with {num_classes} classes")
        return X, y_one_hot
    
    def simulate_training(self, X: np.ndarray, y: np.ndarray, epochs: int = 10) -> Dict:
        """
        Simulate model training process
        """
        print(f"🤖 Simulating model training ({epochs} epochs)...")
        
        # Simulate training metrics
        train_acc = []
        val_acc = []
        train_loss = []
        val_loss = []
        
        for epoch in range(epochs):
            # Simulate improving metrics
            base_acc = 0.3 + (epoch * 0.06) + np.random.normal(0, 0.02)
            base_loss = 2.0 - (epoch * 0.15) + np.random.normal(0, 0.05)
            
            train_acc.append(min(0.98, base_acc))
            val_acc.append(min(0.96, base_acc - 0.02))
            train_loss.append(max(0.1, base_loss))
            val_loss.append(max(0.12, base_loss + 0.05))
            
            print(f"Epoch {epoch+1}/{epochs} - Loss: {train_loss[-1]:.4f}, Acc: {train_acc[-1]:.4f}")
            time.sleep(0.1)  # Simulate training time
        
        return {
            'accuracy': train_acc,
            'val_accuracy': val_acc,
            'loss': train_loss,
            'val_loss': val_loss
        }
    
    def simulate_prediction(self, image_data: np.ndarray) -> Dict:
        """
        Simulate model prediction
        """
        # Simulate prediction probabilities
        num_classes = len(self.class_names)
        probabilities = np.random.dirichlet(np.ones(num_classes))
        
        # Get predicted class
        predicted_class = np.argmax(probabilities)
        confidence = np.max(probabilities)
        
        return {
            'predicted_class': predicted_class,
            'predicted_class_name': self.class_names[predicted_class],
            'confidence': confidence,
            'all_probabilities': probabilities.tolist()
        }
    
    def plot_training_history(self, history: Dict):
        """
        Plot simulated training history
        """
        fig, axes = plt.subplots(1, 2, figsize=(15, 5))
        
        # Accuracy plot
        axes[0].plot(history['accuracy'], label='Training Accuracy', linewidth=2)
        axes[0].plot(history['val_accuracy'], label='Validation Accuracy', linewidth=2)
        axes[0].set_title('Model Accuracy', fontsize=14, fontweight='bold')
        axes[0].set_xlabel('Epoch')
        axes[0].set_ylabel('Accuracy')
        axes[0].legend()
        axes[0].grid(True, alpha=0.3)
        
        # Loss plot
        axes[1].plot(history['loss'], label='Training Loss', linewidth=2)
        axes[1].plot(history['val_loss'], label='Validation Loss', linewidth=2)
        axes[1].set_title('Model Loss', fontsize=14, fontweight='bold')
        axes[1].set_xlabel('Epoch')
        axes[1].set_ylabel('Loss')
        axes[1].legend()
        axes[1].grid(True, alpha=0.3)
        
        plt.tight_layout()
        plt.savefig('results/simulated_training_history.png', dpi=300, bbox_inches='tight')
        plt.show()
    
    def plot_class_distribution(self, y: np.ndarray):
        """
        Plot class distribution
        """
        # Count samples per class
        class_counts = np.sum(y, axis=0)
        
        plt.figure(figsize=(15, 6))
        
        # Class distribution
        plt.subplot(1, 2, 1)
        plt.bar(range(len(self.class_names)), class_counts, color='skyblue')
        plt.title('Class Distribution', fontsize=14, fontweight='bold')
        plt.xlabel('Class Index')
        plt.ylabel('Number of Samples')
        plt.xticks(range(0, len(self.class_names), 5), 
                   [c.split('___')[1] if '___' in c else c for c in self.class_names[::5]], 
                   rotation=45, ha='right')
        
        # Healthy vs Diseased
        healthy_count = sum(class_counts[i] for i, c in enumerate(self.class_names) if 'healthy' in c.lower())
        diseased_count = sum(class_counts) - healthy_count
        
        plt.subplot(1, 2, 2)
        plt.pie([healthy_count, diseased_count], labels=['Healthy', 'Diseased'], 
                autopct='%1.1f%%', colors=['lightgreen', 'lightcoral'])
        plt.title('Healthy vs Diseased Distribution', fontsize=14, fontweight='bold')
        
        plt.tight_layout()
        plt.savefig('results/class_distribution.png', dpi=300, bbox_inches='tight')
        plt.show()
    
    def create_model_metadata(self) -> Dict:
        """
        Create model metadata for export
        """
        metadata = {
            "model_info": {
                "name": "Crop Disease Detection Model (Demo)",
                "version": "1.0.0-demo",
                "description": "AI-powered crop disease detection for smallholder farmers",
                "sdg_focus": "SDG 2 - Zero Hunger",
                "architecture": "MobileNetV2 (simulated)",
                "input_shape": (224, 224, 3),
                "num_classes": len(self.class_names),
                "class_names": self.class_names
            },
            "training_info": {
                "dataset": "PlantVillage Dataset (simulated)",
                "epochs": 10,
                "batch_size": 32,
                "learning_rate": 0.001,
                "optimizer": "Adam",
                "loss_function": "Categorical Crossentropy"
            },
            "export_info": {
                "tflite_path": "models/crop_disease_model_demo.tflite",
                "onnx_path": "models/crop_disease_model_demo.onnx",
                "disease_info_path": "models/disease_info_demo.json"
            },
            "usage_info": {
                "input_format": "RGB image (224x224)",
                "output_format": "Probability distribution over classes",
                "offline_capable": True,
                "mobile_optimized": True
            },
            "ethical_considerations": {
                "bias_mitigation": "Trained on diverse crop images from multiple regions",
                "environmental_impact": "Lightweight model reduces energy consumption",
                "accessibility": "Designed for offline use in low-connectivity areas",
                "transparency": "Open source with clear documentation"
            }
        }
        
        return metadata
    
    def save_disease_info(self):
        """
        Save disease information database
        """
        # Create models directory
        Path("models").mkdir(exist_ok=True)
        
        # Save disease info
        with open("models/disease_info_demo.json", 'w') as f:
            json.dump(self.disease_info, f, indent=2)
        
        print("✅ Disease info database saved to models/disease_info_demo.json")
    
    def save_model_metadata(self, metadata: Dict):
        """
        Save model metadata
        """
        # Create results directory
        Path("results").mkdir(exist_ok=True)
        
        # Save metadata
        with open("results/model_metadata_demo.json", 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print("✅ Model metadata saved to results/model_metadata_demo.json")
    
    def run_demo(self):
        """
        Run the complete demonstration
        """
        print("🌱 AI-Powered Crop Disease Detection - Demo")
        print("🎯 SDG 2 - Zero Hunger")
        print("=" * 60)
        
        # Create necessary directories
        for dir_path in ["models", "results"]:
            Path(dir_path).mkdir(exist_ok=True)
        
        # Step 1: Generate synthetic data
        print("\n📊 Step 1: Data Generation")
        print("-" * 40)
        X, y = self.generate_synthetic_data(num_samples=1000)
        
        # Step 2: Plot class distribution
        print("\n📈 Step 2: Data Analysis")
        print("-" * 40)
        self.plot_class_distribution(y)
        
        # Step 3: Simulate training
        print("\n🤖 Step 3: Model Training")
        print("-" * 40)
        history = self.simulate_training(X, y, epochs=10)
        
        # Step 4: Plot training history
        print("\n📊 Step 4: Training Results")
        print("-" * 40)
        self.plot_training_history(history)
        
        # Step 5: Simulate predictions
        print("\n🔮 Step 5: Model Predictions")
        print("-" * 40)
        for i in range(5):
            # Generate random test image
            test_image = np.random.random((224, 224, 3)).astype(np.float32)
            
            # Simulate prediction
            prediction = self.simulate_prediction(test_image)
            
            print(f"\nSample {i+1}:")
            print(f"  Predicted: {prediction['predicted_class_name']}")
            print(f"  Confidence: {prediction['confidence']:.4f}")
            
            # Show disease info if available
            if prediction['predicted_class_name'] in self.disease_info:
                info = self.disease_info[prediction['predicted_class_name']]
                print(f"  Symptoms: {info['symptoms']}")
                print(f"  Treatment: {info['treatment']}")
        
        # Step 6: Save outputs
        print("\n💾 Step 6: Saving Outputs")
        print("-" * 40)
        
        # Save disease info
        self.save_disease_info()
        
        # Save model metadata
        metadata = self.create_model_metadata()
        self.save_model_metadata(metadata)
        
        # Step 7: Summary
        print("\n📋 Demo Summary")
        print("-" * 40)
        print("✅ Synthetic data generated")
        print("✅ Model training simulated")
        print("✅ Predictions demonstrated")
        print("✅ Disease info database created")
        print("✅ Model metadata saved")
        
        print(f"\n📊 Final Results:")
        print(f"  Training Accuracy: {history['accuracy'][-1]:.4f}")
        print(f"  Validation Accuracy: {history['val_accuracy'][-1]:.4f}")
        print(f"  Number of Classes: {len(self.class_names)}")
        print(f"  Disease Info Entries: {len(self.disease_info)}")
        
        print(f"\n🌍 SDG 2 Impact:")
        print(f"  • Early disease detection prevents crop loss")
        print(f"  • Reduces need for expensive expert consultation")
        print(f"  • Empowers smallholder farmers with AI tools")
        print(f"  • Supports sustainable agriculture practices")
        
        print(f"\n🚀 Next Steps:")
        print(f"  1. Install TensorFlow: pip install tensorflow")
        print(f"  2. Download PlantVillage dataset")
        print(f"  3. Run full training: python ai_model/train_model.py")
        print(f"  4. Integrate with mobile app")
        
        print("\n🎉 Demo completed successfully!")


def main():
    """
    Main function to run the demo
    """
    demo = SimpleCropDiseaseDemo()
    demo.run_demo()


if __name__ == "__main__":
    main() 