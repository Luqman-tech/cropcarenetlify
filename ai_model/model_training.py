"""
Model training module for Crop Disease Detection
"""

import os
import json
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
from typing import Dict, Tuple, Optional
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, models, optimizers
from tensorflow.keras.applications import MobileNetV2, ResNet50, EfficientNetB0
from tensorflow.keras.callbacks import (
    EarlyStopping, ReduceLROnPlateau, ModelCheckpoint, 
    TensorBoard, CSVLogger
)
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.metrics import classification_report, confusion_matrix
import pandas as pd

from .config import MODEL_CONFIG, DATASET_CONFIG, EXPORT_CONFIG
from .data_preprocessing import PlantVillageDataPreprocessor


class CropDiseaseModel:
    """
    CNN model for crop disease detection
    """
    
    def __init__(self, model_type: str = "mobilenet_v2"):
        self.model_type = model_type
        self.input_shape = MODEL_CONFIG["input_shape"]
        self.num_classes = len(MODEL_CONFIG["class_names"])
        self.model = None
        self.history = None
        
    def build_model(self, use_pretrained: bool = True) -> keras.Model:
        """
        Build the CNN model
        """
        if self.model_type == "mobilenet_v2":
            return self._build_mobilenet_v2(use_pretrained)
        elif self.model_type == "resnet50":
            return self._build_resnet50(use_pretrained)
        elif self.model_type == "efficientnet_b0":
            return self._build_efficientnet_b0(use_pretrained)
        elif self.model_type == "custom_cnn":
            return self._build_custom_cnn()
        else:
            raise ValueError(f"Unknown model type: {self.model_type}")
    
    def _build_mobilenet_v2(self, use_pretrained: bool = True) -> keras.Model:
        """
        Build MobileNetV2 model (lightweight for mobile deployment)
        """
        if use_pretrained:
            base_model = MobileNetV2(
                weights='imagenet',
                include_top=False,
                input_shape=self.input_shape
            )
            base_model.trainable = False  # Freeze base model initially
        else:
            base_model = MobileNetV2(
                weights=None,
                include_top=False,
                input_shape=self.input_shape
            )
        
        model = models.Sequential([
            base_model,
            layers.GlobalAveragePooling2D(),
            layers.Dropout(0.5),
            layers.Dense(512, activation='relu'),
            layers.Dropout(0.3),
            layers.Dense(self.num_classes, activation='softmax')
        ])
        
        return model
    
    def _build_resnet50(self, use_pretrained: bool = True) -> keras.Model:
        """
        Build ResNet50 model
        """
        if use_pretrained:
            base_model = ResNet50(
                weights='imagenet',
                include_top=False,
                input_shape=self.input_shape
            )
            base_model.trainable = False
        else:
            base_model = ResNet50(
                weights=None,
                include_top=False,
                input_shape=self.input_shape
            )
        
        model = models.Sequential([
            base_model,
            layers.GlobalAveragePooling2D(),
            layers.Dropout(0.5),
            layers.Dense(512, activation='relu'),
            layers.Dropout(0.3),
            layers.Dense(self.num_classes, activation='softmax')
        ])
        
        return model
    
    def _build_efficientnet_b0(self, use_pretrained: bool = True) -> keras.Model:
        """
        Build EfficientNetB0 model
        """
        if use_pretrained:
            base_model = EfficientNetB0(
                weights='imagenet',
                include_top=False,
                input_shape=self.input_shape
            )
            base_model.trainable = False
        else:
            base_model = EfficientNetB0(
                weights=None,
                include_top=False,
                input_shape=self.input_shape
            )
        
        model = models.Sequential([
            base_model,
            layers.GlobalAveragePooling2D(),
            layers.Dropout(0.5),
            layers.Dense(512, activation='relu'),
            layers.Dropout(0.3),
            layers.Dense(self.num_classes, activation='softmax')
        ])
        
        return model
    
    def _build_custom_cnn(self) -> keras.Model:
        """
        Build a custom CNN architecture
        """
        model = models.Sequential([
            # First Convolutional Block
            layers.Conv2D(32, (3, 3), activation='relu', input_shape=self.input_shape),
            layers.BatchNormalization(),
            layers.MaxPooling2D((2, 2)),
            layers.Dropout(0.25),
            
            # Second Convolutional Block
            layers.Conv2D(64, (3, 3), activation='relu'),
            layers.BatchNormalization(),
            layers.MaxPooling2D((2, 2)),
            layers.Dropout(0.25),
            
            # Third Convolutional Block
            layers.Conv2D(128, (3, 3), activation='relu'),
            layers.BatchNormalization(),
            layers.MaxPooling2D((2, 2)),
            layers.Dropout(0.25),
            
            # Fourth Convolutional Block
            layers.Conv2D(256, (3, 3), activation='relu'),
            layers.BatchNormalization(),
            layers.MaxPooling2D((2, 2)),
            layers.Dropout(0.25),
            
            # Flatten and Dense Layers
            layers.Flatten(),
            layers.Dense(512, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.5),
            layers.Dense(256, activation='relu'),
            layers.Dropout(0.3),
            layers.Dense(self.num_classes, activation='softmax')
        ])
        
        return model


class ModelTrainer:
    """
    Handles model training, evaluation, and export
    """
    
    def __init__(self, model_type: str = "mobilenet_v2"):
        self.model_type = model_type
        self.model = None
        self.history = None
        self.preprocessor = PlantVillageDataPreprocessor()
        
    def prepare_data(self) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """
        Prepare training data
        """
        try:
            # Try to load preprocessed data
            X_train, X_val, X_test, y_train, y_val, y_test = self.preprocessor.load_preprocessed_data()
        except FileNotFoundError:
            # If not found, run preprocessing
            print("Preprocessed data not found. Running preprocessing...")
            X, y, class_counts = self.preprocessor.load_and_preprocess_data()
            X_train, X_val, X_test, y_train, y_val, y_test = self.preprocessor.split_data(X, y)
            self.preprocessor.save_preprocessed_data(X_train, X_val, X_test, y_train, y_val, y_test)
        
        return X_train, X_val, X_test, y_train, y_val, y_test
    
    def train_model(self, X_train: np.ndarray, y_train: np.ndarray,
                   X_val: np.ndarray, y_val: np.ndarray,
                   epochs: int = None, batch_size: int = None) -> Dict:
        """
        Train the model
        """
        epochs = epochs or MODEL_CONFIG["epochs"]
        batch_size = batch_size or DATASET_CONFIG["batch_size"]
        
        # Build model
        crop_model = CropDiseaseModel(self.model_type)
        self.model = crop_model.build_model(use_pretrained=True)
        
        # Compile model
        self.model.compile(
            optimizer=optimizers.Adam(learning_rate=MODEL_CONFIG["learning_rate"]),
            loss='categorical_crossentropy',
            metrics=['accuracy', 'top_3_accuracy']
        )
        
        # Print model summary
        self.model.summary()
        
        # Create callbacks
        callbacks = self._create_callbacks()
        
        # Create data generators
        train_datagen, val_datagen = self.preprocessor.create_data_generators(
            X_train, y_train, X_val, y_val
        )
        
        # Train model
        print(f"Training {self.model_type} model...")
        self.history = self.model.fit(
            train_datagen.flow(X_train, y_train, batch_size=batch_size),
            validation_data=(X_val, y_val),
            epochs=epochs,
            callbacks=callbacks,
            verbose=1
        )
        
        return self.history.history
    
    def _create_callbacks(self) -> list:
        """
        Create training callbacks
        """
        # Create callbacks directory
        callbacks_dir = Path("models/callbacks")
        callbacks_dir.mkdir(parents=True, exist_ok=True)
        
        callbacks = [
            # Early stopping
            EarlyStopping(
                monitor='val_loss',
                patience=MODEL_CONFIG["early_stopping_patience"],
                restore_best_weights=True,
                verbose=1
            ),
            
            # Reduce learning rate
            ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.2,
                patience=MODEL_CONFIG["reduce_lr_patience"],
                min_lr=1e-7,
                verbose=1
            ),
            
            # Model checkpoint
            ModelCheckpoint(
                filepath=str(callbacks_dir / f"{self.model_type}_best.h5"),
                monitor='val_accuracy',
                save_best_only=True,
                verbose=1
            ),
            
            # TensorBoard
            TensorBoard(
                log_dir=str(callbacks_dir / "logs"),
                histogram_freq=1
            ),
            
            # CSV Logger
            CSVLogger(
                filename=str(callbacks_dir / f"{self.model_type}_training.log"),
                separator=',',
                append=False
            )
        ]
        
        return callbacks
    
    def evaluate_model(self, X_test: np.ndarray, y_test: np.ndarray) -> Dict:
        """
        Evaluate the trained model
        """
        print("Evaluating model...")
        
        # Predict on test set
        y_pred = self.model.predict(X_test)
        y_pred_classes = np.argmax(y_pred, axis=1)
        y_true_classes = np.argmax(y_test, axis=1)
        
        # Calculate metrics
        test_loss, test_accuracy, test_top3_accuracy = self.model.evaluate(X_test, y_test, verbose=0)
        
        # Classification report
        class_names = [name.split('___')[1] if '___' in name else name for name in MODEL_CONFIG["class_names"]]
        report = classification_report(
            y_true_classes, y_pred_classes,
            target_names=class_names,
            output_dict=True
        )
        
        # Confusion matrix
        cm = confusion_matrix(y_true_classes, y_pred_classes)
        
        # Save results
        results = {
            "test_loss": float(test_loss),
            "test_accuracy": float(test_accuracy),
            "test_top3_accuracy": float(test_top3_accuracy),
            "classification_report": report,
            "confusion_matrix": cm.tolist()
        }
        
        # Save results to JSON
        results_dir = Path("results")
        results_dir.mkdir(exist_ok=True)
        
        with open(results_dir / f"{self.model_type}_evaluation.json", 'w') as f:
            json.dump(results, f, indent=2)
        
        # Plot confusion matrix
        self._plot_confusion_matrix(cm, class_names)
        
        # Plot training history
        self._plot_training_history()
        
        return results
    
    def _plot_confusion_matrix(self, cm: np.ndarray, class_names: list) -> None:
        """
        Plot confusion matrix
        """
        plt.figure(figsize=(20, 16))
        sns.heatmap(
            cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=class_names, yticklabels=class_names
        )
        plt.title(f'Confusion Matrix - {self.model_type}')
        plt.xlabel('Predicted')
        plt.ylabel('True')
        plt.xticks(rotation=45, ha='right')
        plt.yticks(rotation=0)
        plt.tight_layout()
        plt.savefig(f'results/{self.model_type}_confusion_matrix.png', dpi=300, bbox_inches='tight')
        plt.show()
    
    def _plot_training_history(self) -> None:
        """
        Plot training history
        """
        if self.history is None:
            return
        
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        
        # Accuracy
        axes[0, 0].plot(self.history.history['accuracy'], label='Training Accuracy')
        axes[0, 0].plot(self.history.history['val_accuracy'], label='Validation Accuracy')
        axes[0, 0].set_title('Model Accuracy')
        axes[0, 0].set_xlabel('Epoch')
        axes[0, 0].set_ylabel('Accuracy')
        axes[0, 0].legend()
        axes[0, 0].grid(True)
        
        # Loss
        axes[0, 1].plot(self.history.history['loss'], label='Training Loss')
        axes[0, 1].plot(self.history.history['val_loss'], label='Validation Loss')
        axes[0, 1].set_title('Model Loss')
        axes[0, 1].set_xlabel('Epoch')
        axes[0, 1].set_ylabel('Loss')
        axes[0, 1].legend()
        axes[0, 1].grid(True)
        
        # Top-3 Accuracy
        if 'top_3_accuracy' in self.history.history:
            axes[1, 0].plot(self.history.history['top_3_accuracy'], label='Training Top-3 Accuracy')
            axes[1, 0].plot(self.history.history['val_top_3_accuracy'], label='Validation Top-3 Accuracy')
            axes[1, 0].set_title('Model Top-3 Accuracy')
            axes[1, 0].set_xlabel('Epoch')
            axes[1, 0].set_ylabel('Top-3 Accuracy')
            axes[1, 0].legend()
            axes[1, 0].grid(True)
        
        # Learning Rate
        if 'lr' in self.history.history:
            axes[1, 1].plot(self.history.history['lr'], label='Learning Rate')
            axes[1, 1].set_title('Learning Rate')
            axes[1, 1].set_xlabel('Epoch')
            axes[1, 1].set_ylabel('Learning Rate')
            axes[1, 1].legend()
            axes[1, 1].grid(True)
            axes[1, 1].set_yscale('log')
        
        plt.tight_layout()
        plt.savefig(f'results/{self.model_type}_training_history.png', dpi=300, bbox_inches='tight')
        plt.show()
    
    def save_model(self) -> None:
        """
        Save the trained model
        """
        if self.model is None:
            raise ValueError("No model to save. Train the model first.")
        
        # Create models directory
        models_dir = Path("models")
        models_dir.mkdir(exist_ok=True)
        
        # Save Keras model
        model_path = models_dir / f"{self.model_type}_final.h5"
        self.model.save(str(model_path))
        
        # Save model info
        model_info = {
            "model_type": self.model_type,
            "input_shape": self.input_shape,
            "num_classes": self.num_classes,
            "class_names": MODEL_CONFIG["class_names"],
            "training_config": {
                "learning_rate": MODEL_CONFIG["learning_rate"],
                "batch_size": DATASET_CONFIG["batch_size"],
                "epochs": MODEL_CONFIG["epochs"]
            }
        }
        
        with open(models_dir / "model_info.json", 'w') as f:
            json.dump(model_info, f, indent=2)
        
        print(f"Model saved to {model_path}")
        print(f"Model info saved to {models_dir / 'model_info.json'}")


def main():
    """
    Main function to run model training
    """
    # Create necessary directories
    for dir_path in ["models", "results", "data/preprocessed"]:
        Path(dir_path).mkdir(parents=True, exist_ok=True)
    
    # Initialize trainer
    trainer = ModelTrainer(model_type="mobilenet_v2")
    
    # Prepare data
    X_train, X_val, X_test, y_train, y_val, y_test = trainer.prepare_data()
    
    # Train model
    history = trainer.train_model(X_train, y_train, X_val, y_val)
    
    # Evaluate model
    results = trainer.evaluate_model(X_test, y_test)
    
    # Save model
    trainer.save_model()
    
    print("Model training completed successfully!")
    print(f"Test Accuracy: {results['test_accuracy']:.4f}")
    print(f"Test Top-3 Accuracy: {results['test_top3_accuracy']:.4f}")


if __name__ == "__main__":
    main() 