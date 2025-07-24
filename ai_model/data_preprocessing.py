"""
Data preprocessing module for PlantVillage dataset
"""

import os
import zipfile
import json
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Tuple, Dict, List
import cv2
from PIL import Image
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.utils import to_categorical

from .config import DATASET_CONFIG, MODEL_CONFIG, AUGMENTATION_CONFIG, DISEASE_INFO


class PlantVillageDataPreprocessor:
    """
    Handles data preprocessing for PlantVillage dataset
    """
    
    def __init__(self, data_dir: Path = None):
        self.data_dir = data_dir or DATASET_CONFIG["local_path"]
        self.image_size = DATASET_CONFIG["image_size"]
        self.batch_size = DATASET_CONFIG["batch_size"]
        self.class_names = MODEL_CONFIG["class_names"]
        self.label_encoder = LabelEncoder()
        
    def download_dataset(self, kaggle_username: str = None, kaggle_key: str = None) -> bool:
        """
        Download PlantVillage dataset from Kaggle
        """
        try:
            # Set Kaggle credentials if provided
            if kaggle_username and kaggle_key:
                os.environ['KAGGLE_USERNAME'] = kaggle_username
                os.environ['KAGGLE_KEY'] = kaggle_key
            
            # Create data directory
            self.data_dir.mkdir(parents=True, exist_ok=True)
            
            # Download dataset using kaggle CLI
            import kaggle
            kaggle.api.authenticate()
            kaggle.api.dataset_download_files(
                DATASET_CONFIG["kaggle_dataset"],
                path=str(self.data_dir),
                unzip=True
            )
            
            print(f"Dataset downloaded successfully to {self.data_dir}")
            return True
            
        except Exception as e:
            print(f"Error downloading dataset: {e}")
            print("Please ensure you have kaggle CLI installed and configured")
            return False
    
    def load_and_preprocess_data(self) -> Tuple[np.ndarray, np.ndarray, Dict]:
        """
        Load and preprocess the PlantVillage dataset
        """
        print("Loading and preprocessing PlantVillage dataset...")
        
        images = []
        labels = []
        class_counts = {}
        
        # Walk through the dataset directory
        for class_name in self.class_names:
            class_path = self.data_dir / class_name
            if not class_path.exists():
                print(f"Warning: Class directory {class_name} not found")
                continue
                
            class_count = 0
            for img_file in class_path.glob("*.jpg"):
                try:
                    # Load and preprocess image
                    img = cv2.imread(str(img_file))
                    if img is None:
                        continue
                        
                    # Convert BGR to RGB
                    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                    
                    # Resize image
                    img = cv2.resize(img, self.image_size)
                    
                    # Normalize pixel values
                    img = img.astype(np.float32) / 255.0
                    
                    images.append(img)
                    labels.append(class_name)
                    class_count += 1
                    
                except Exception as e:
                    print(f"Error processing {img_file}: {e}")
                    continue
            
            class_counts[class_name] = class_count
            print(f"Loaded {class_count} images for class: {class_name}")
        
        # Convert to numpy arrays
        X = np.array(images)
        y = np.array(labels)
        
        # Encode labels
        y_encoded = self.label_encoder.fit_transform(y)
        y_categorical = to_categorical(y_encoded, num_classes=len(self.class_names))
        
        print(f"Total images loaded: {len(X)}")
        print(f"Total classes: {len(self.class_names)}")
        
        return X, y_categorical, class_counts
    
    def split_data(self, X: np.ndarray, y: np.ndarray) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """
        Split data into train, validation, and test sets
        """
        # First split: train+val and test
        X_temp, X_test, y_temp, y_test = train_test_split(
            X, y, 
            test_size=DATASET_CONFIG["test_split"],
            random_state=DATASET_CONFIG["random_seed"],
            stratify=y
        )
        
        # Second split: train and validation
        X_train, X_val, y_train, y_val = train_test_split(
            X_temp, y_temp,
            test_size=DATASET_CONFIG["validation_split"],
            random_state=DATASET_CONFIG["random_seed"],
            stratify=y_temp
        )
        
        print(f"Train set: {X_train.shape[0]} samples")
        print(f"Validation set: {X_val.shape[0]} samples")
        print(f"Test set: {X_test.shape[0]} samples")
        
        return X_train, X_val, X_test, y_train, y_val, y_test
    
    def create_data_generators(self, X_train: np.ndarray, y_train: np.ndarray,
                             X_val: np.ndarray, y_val: np.ndarray) -> Tuple[ImageDataGenerator, ImageDataGenerator]:
        """
        Create data generators with augmentation for training
        """
        # Training data generator with augmentation
        train_datagen = ImageDataGenerator(
            rotation_range=AUGMENTATION_CONFIG["rotation_range"],
            width_shift_range=AUGMENTATION_CONFIG["width_shift_range"],
            height_shift_range=AUGMENTATION_CONFIG["height_shift_range"],
            shear_range=AUGMENTATION_CONFIG["shear_range"],
            zoom_range=AUGMENTATION_CONFIG["zoom_range"],
            horizontal_flip=AUGMENTATION_CONFIG["horizontal_flip"],
            fill_mode=AUGMENTATION_CONFIG["fill_mode"]
        )
        
        # Validation data generator (no augmentation)
        val_datagen = ImageDataGenerator()
        
        return train_datagen, val_datagen
    
    def analyze_dataset(self, class_counts: Dict) -> None:
        """
        Analyze and visualize dataset statistics
        """
        print("\n=== Dataset Analysis ===")
        
        # Class distribution
        plt.figure(figsize=(15, 8))
        classes = list(class_counts.keys())
        counts = list(class_counts.values())
        
        plt.subplot(1, 2, 1)
        plt.bar(range(len(classes)), counts)
        plt.title("Class Distribution")
        plt.xlabel("Class Index")
        plt.ylabel("Number of Images")
        plt.xticks(range(len(classes)), [c.split('___')[1] if '___' in c else c for c in classes], rotation=45, ha='right')
        
        # Pie chart of healthy vs diseased
        healthy_count = sum(counts[i] for i, c in enumerate(classes) if 'healthy' in c.lower())
        diseased_count = sum(counts) - healthy_count
        
        plt.subplot(1, 2, 2)
        plt.pie([healthy_count, diseased_count], labels=['Healthy', 'Diseased'], autopct='%1.1f%%')
        plt.title("Healthy vs Diseased Distribution")
        
        plt.tight_layout()
        plt.savefig('results/dataset_analysis.png', dpi=300, bbox_inches='tight')
        plt.show()
        
        print(f"Total images: {sum(counts)}")
        print(f"Healthy images: {healthy_count}")
        print(f"Diseased images: {diseased_count}")
        print(f"Number of classes: {len(classes)}")
        
        # Save class counts to JSON
        analysis_data = {
            "total_images": sum(counts),
            "healthy_images": healthy_count,
            "diseased_images": diseased_count,
            "num_classes": len(classes),
            "class_distribution": class_counts
        }
        
        with open('results/dataset_analysis.json', 'w') as f:
            json.dump(analysis_data, f, indent=2)
    
    def save_preprocessed_data(self, X_train: np.ndarray, X_val: np.ndarray, X_test: np.ndarray,
                             y_train: np.ndarray, y_val: np.ndarray, y_test: np.ndarray) -> None:
        """
        Save preprocessed data to disk for later use
        """
        data_path = Path("data/preprocessed")
        data_path.mkdir(parents=True, exist_ok=True)
        
        # Save numpy arrays
        np.save(data_path / "X_train.npy", X_train)
        np.save(data_path / "X_val.npy", X_val)
        np.save(data_path / "X_test.npy", X_test)
        np.save(data_path / "y_train.npy", y_train)
        np.save(data_path / "y_val.npy", y_val)
        np.save(data_path / "y_test.npy", y_test)
        
        # Save label encoder
        import pickle
        with open(data_path / "label_encoder.pkl", 'wb') as f:
            pickle.dump(self.label_encoder, f)
        
        print(f"Preprocessed data saved to {data_path}")
    
    def load_preprocessed_data(self) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """
        Load preprocessed data from disk
        """
        data_path = Path("data/preprocessed")
        
        if not data_path.exists():
            raise FileNotFoundError("Preprocessed data not found. Run preprocessing first.")
        
        # Load numpy arrays
        X_train = np.load(data_path / "X_train.npy")
        X_val = np.load(data_path / "X_val.npy")
        X_test = np.load(data_path / "X_test.npy")
        y_train = np.load(data_path / "y_train.npy")
        y_val = np.load(data_path / "y_val.npy")
        y_test = np.load(data_path / "y_test.npy")
        
        # Load label encoder
        import pickle
        with open(data_path / "label_encoder.pkl", 'rb') as f:
            self.label_encoder = pickle.load(f)
        
        print("Preprocessed data loaded successfully")
        return X_train, X_val, X_test, y_train, y_val, y_test


def main():
    """
    Main function to run data preprocessing
    """
    # Create results directory
    Path("results").mkdir(exist_ok=True)
    
    # Initialize preprocessor
    preprocessor = PlantVillageDataPreprocessor()
    
    # Check if dataset exists, if not download it
    if not preprocessor.data_dir.exists():
        print("Dataset not found. Please download it manually or provide Kaggle credentials.")
        print("You can download from: https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset")
        return
    
    # Load and preprocess data
    X, y, class_counts = preprocessor.load_and_preprocess_data()
    
    # Split data
    X_train, X_val, X_test, y_train, y_val, y_test = preprocessor.split_data(X, y)
    
    # Analyze dataset
    preprocessor.analyze_dataset(class_counts)
    
    # Save preprocessed data
    preprocessor.save_preprocessed_data(X_train, X_val, X_test, y_train, y_val, y_test)
    
    print("Data preprocessing completed successfully!")


if __name__ == "__main__":
    main() 