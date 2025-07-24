"""
Model export module for converting trained models to mobile/web formats
"""

import os
import json
import numpy as np
from pathlib import Path
from typing import Dict, Optional
import tensorflow as tf
import onnx
import onnxruntime as ort
from tensorflow.keras.models import load_model
import cv2
from PIL import Image

from .config import EXPORT_CONFIG, MODEL_CONFIG, DISEASE_INFO


class ModelExporter:
    """
    Handles model export to TensorFlow Lite and ONNX formats
    """
    
    def __init__(self, model_path: str = None):
        self.model_path = model_path or "models/mobilenet_v2_final.h5"
        self.model = None
        self.tflite_model = None
        self.onnx_model = None
        
    def load_model(self) -> tf.keras.Model:
        """
        Load the trained Keras model
        """
        if not Path(self.model_path).exists():
            raise FileNotFoundError(f"Model not found at {self.model_path}")
        
        print(f"Loading model from {self.model_path}")
        self.model = load_model(self.model_path)
        return self.model
    
    def export_to_tflite(self, quantize: bool = True, optimize: bool = True) -> str:
        """
        Export model to TensorFlow Lite format with multiple optimization levels
        """
        if self.model is None:
            self.load_model()
        
        print("Converting to TensorFlow Lite...")
        
        # Export standard TFLite model
        converter = tf.lite.TFLiteConverter.from_keras_model(self.model)
        tflite_model = converter.convert()
        
        # Save standard model
        tflite_path = EXPORT_CONFIG["tflite_model_path"]
        tflite_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(tflite_path, 'wb') as f:
            f.write(tflite_model)
        
        standard_size = os.path.getsize(tflite_path) / (1024 * 1024)  # MB
        print(f"Standard TFLite model saved to {tflite_path} ({standard_size:.2f} MB)")
        
        # Export optimized model
        if optimize:
            converter_optimized = tf.lite.TFLiteConverter.from_keras_model(self.model)
            converter_optimized.optimizations = [tf.lite.Optimize.DEFAULT]
            
            # Add GPU delegation support
            converter_optimized.target_spec.supported_ops = [
                tf.lite.OpsSet.TFLITE_BUILTINS,
                tf.lite.OpsSet.SELECT_TF_OPS
            ]
            
            optimized_model = converter_optimized.convert()
            
            optimized_path = EXPORT_CONFIG["optimized_tflite_path"]
            with open(optimized_path, 'wb') as f:
                f.write(optimized_model)
            
            optimized_size = os.path.getsize(optimized_path) / (1024 * 1024)  # MB
            print(f"Optimized TFLite model saved to {optimized_path} ({optimized_size:.2f} MB)")
        
        # Export quantized model
        if quantize:
            converter_quantized = tf.lite.TFLiteConverter.from_keras_model(self.model)
            converter_quantized.optimizations = [tf.lite.Optimize.DEFAULT]
            
            # Set representative dataset for quantization
            def representative_dataset():
                # Generate representative data for quantization
                for _ in range(100):
                    data = np.random.random((1,) + MODEL_CONFIG["input_shape"]).astype(np.float32)
                    yield [data]
            
            converter_quantized.representative_dataset = representative_dataset
            converter_quantized.target_spec.supported_ops = [
                tf.lite.OpsSet.TFLITE_BUILTINS_INT8,
                tf.lite.OpsSet.TFLITE_BUILTINS
            ]
            converter_quantized.inference_input_type = tf.int8
            converter_quantized.inference_output_type = tf.int8
            
            quantized_model = converter_quantized.convert()
            
            quantized_path = EXPORT_CONFIG["quantized_tflite_path"]
            with open(quantized_path, 'wb') as f:
                f.write(quantized_model)
            
            quantized_size = os.path.getsize(quantized_path) / (1024 * 1024)  # MB
            print(f"Quantized TFLite model saved to {quantized_path} ({quantized_size:.2f} MB)")
            
            # Use quantized model as primary
            self.tflite_model = quantized_model
            return str(quantized_path)
        
        # Use standard model as primary
        self.tflite_model = tflite_model
        return str(tflite_path)
    
    def export_to_onnx(self) -> str:
        """
        Export model to ONNX format
        """
        if self.model is None:
            self.load_model()
        
        print("Converting to ONNX...")
        
        # Convert to ONNX using tf2onnx
        try:
            import tf2onnx
            
            # Convert model
            onnx_model, _ = tf2onnx.convert.from_keras(
                self.model, 
                input_signature=(tf.TensorSpec((None,) + MODEL_CONFIG["input_shape"], tf.float32),),
                opset=10
            )
            
            # Save model
            onnx_path = EXPORT_CONFIG["onnx_model_path"]
            onnx_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(onnx_path, 'wb') as f:
                f.write(onnx_model.SerializeToString())
            
            self.onnx_model = onnx_model
            print(f"ONNX model saved to {onnx_path}")
            
            # Get model size
            model_size = os.path.getsize(onnx_path) / (1024 * 1024)  # MB
            print(f"Model size: {model_size:.2f} MB")
            
            return str(onnx_path)
            
        except ImportError:
            print("tf2onnx not installed. Install with: pip install tf2onnx")
            return None
    
    def test_tflite_model(self, test_image_path: str = None) -> Dict:
        """
        Test TensorFlow Lite model with a sample image
        """
        if self.tflite_model is None:
            tflite_path = EXPORT_CONFIG["tflite_model_path"]
            if not Path(tflite_path).exists():
                raise FileNotFoundError(f"TFLite model not found at {tflite_path}")
            
            with open(tflite_path, 'rb') as f:
                self.tflite_model = f.read()
        
        # Load TFLite interpreter
        interpreter = tf.lite.Interpreter(model_content=self.tflite_model)
        interpreter.allocate_tensors()
        
        # Get input and output details
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        
        # Prepare test image
        if test_image_path and Path(test_image_path).exists():
            # Load and preprocess test image
            img = cv2.imread(test_image_path)
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            img = cv2.resize(img, MODEL_CONFIG["input_shape"][:2])
            img = img.astype(np.float32) / 255.0
            img = np.expand_dims(img, axis=0)
        else:
            # Use random test data
            img = np.random.random((1,) + MODEL_CONFIG["input_shape"]).astype(np.float32)
        
        # Set input tensor
        interpreter.set_tensor(input_details[0]['index'], img)
        
        # Run inference
        interpreter.invoke()
        
        # Get output
        output = interpreter.get_tensor(output_details[0]['index'])
        
        # Get prediction
        predicted_class = np.argmax(output[0])
        confidence = np.max(output[0])
        
        result = {
            "predicted_class": int(predicted_class),
            "predicted_class_name": MODEL_CONFIG["class_names"][predicted_class],
            "confidence": float(confidence),
            "all_probabilities": output[0].tolist()
        }
        
        print(f"TFLite Test - Predicted: {result['predicted_class_name']} (Confidence: {confidence:.4f})")
        
        return result
    
    def test_onnx_model(self, test_image_path: str = None) -> Dict:
        """
        Test ONNX model with a sample image
        """
        onnx_path = EXPORT_CONFIG["onnx_model_path"]
        if not Path(onnx_path).exists():
            raise FileNotFoundError(f"ONNX model not found at {onnx_path}")
        
        # Create ONNX Runtime session
        session = ort.InferenceSession(str(onnx_path))
        
        # Get input and output names
        input_name = session.get_inputs()[0].name
        output_name = session.get_outputs()[0].name
        
        # Prepare test image
        if test_image_path and Path(test_image_path).exists():
            # Load and preprocess test image
            img = cv2.imread(test_image_path)
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            img = cv2.resize(img, MODEL_CONFIG["input_shape"][:2])
            img = img.astype(np.float32) / 255.0
            img = np.expand_dims(img, axis=0)
        else:
            # Use random test data
            img = np.random.random((1,) + MODEL_CONFIG["input_shape"]).astype(np.float32)
        
        # Run inference
        output = session.run([output_name], {input_name: img})
        
        # Get prediction
        predicted_class = np.argmax(output[0][0])
        confidence = np.max(output[0][0])
        
        result = {
            "predicted_class": int(predicted_class),
            "predicted_class_name": MODEL_CONFIG["class_names"][predicted_class],
            "confidence": float(confidence),
            "all_probabilities": output[0][0].tolist()
        }
        
        print(f"ONNX Test - Predicted: {result['predicted_class_name']} (Confidence: {confidence:.4f})")
        
        return result
    
    def create_disease_info_database(self) -> str:
        """
        Create a local database of disease information for offline use
        """
        disease_db = {}
        
        for class_name in MODEL_CONFIG["class_names"]:
            if class_name in DISEASE_INFO:
                disease_db[class_name] = DISEASE_INFO[class_name]
            else:
                # Create default entry for unknown classes
                disease_db[class_name] = {
                    "symptoms": "Symptoms not available",
                    "treatment": "Consult with agricultural expert",
                    "prevention": "Maintain good cultural practices"
                }
        
        # Save to JSON
        db_path = EXPORT_CONFIG["disease_info_path"]
        db_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(db_path, 'w') as f:
            json.dump(disease_db, f, indent=2)
        
        print(f"Disease info database saved to {db_path}")
        return str(db_path)
    
    def create_model_metadata(self) -> Dict:
        """
        Create metadata for the exported models
        """
        metadata = {
            "model_info": {
                "name": "Crop Disease Detection Model",
                "version": "1.0.0",
                "description": "AI-powered crop disease detection for smallholder farmers",
                "sdg_focus": "SDG 2 - Zero Hunger",
                "architecture": "MobileNetV2",
                "input_shape": MODEL_CONFIG["input_shape"],
                "num_classes": len(MODEL_CONFIG["class_names"]),
                "class_names": MODEL_CONFIG["class_names"]
            },
            "export_info": {
                "tflite_path": str(EXPORT_CONFIG["tflite_model_path"]),
                "onnx_path": str(EXPORT_CONFIG["onnx_model_path"]),
                "disease_info_path": str(EXPORT_CONFIG["disease_info_path"])
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
        
        # Save metadata
        metadata_path = EXPORT_CONFIG["model_info_path"]
        metadata_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"Model metadata saved to {metadata_path}")
        return metadata
    
    def benchmark_models(self) -> Dict:
        """
        Benchmark model performance and size
        """
        benchmarks = {}
        
        # Test TFLite model
        if Path(EXPORT_CONFIG["tflite_model_path"]).exists():
            tflite_size = os.path.getsize(EXPORT_CONFIG["tflite_model_path"]) / (1024 * 1024)
            tflite_result = self.test_tflite_model()
            benchmarks["tflite"] = {
                "size_mb": tflite_size,
                "prediction": tflite_result
            }
        
        # Test ONNX model
        if Path(EXPORT_CONFIG["onnx_model_path"]).exists():
            onnx_size = os.path.getsize(EXPORT_CONFIG["onnx_model_path"]) / (1024 * 1024)
            onnx_result = self.test_onnx_model()
            benchmarks["onnx"] = {
                "size_mb": onnx_size,
                "prediction": onnx_result
            }
        
        # Save benchmarks
        benchmarks_path = Path("results/model_benchmarks.json")
        benchmarks_path.parent.mkdir(exist_ok=True)
        
        with open(benchmarks_path, 'w') as f:
            json.dump(benchmarks, f, indent=2)
        
        print(f"Model benchmarks saved to {benchmarks_path}")
        return benchmarks


def main():
    """
    Main function to run model export
    """
    # Create necessary directories
    for dir_path in ["models", "results"]:
        Path(dir_path).mkdir(exist_ok=True)
    
    # Initialize exporter
    exporter = ModelExporter()
    
    try:
        # Export to TensorFlow Lite
        tflite_path = exporter.export_to_tflite(quantize=True, optimize=True)
        
        # Export to ONNX
        onnx_path = exporter.export_to_onnx()
        
        # Create disease info database
        disease_db_path = exporter.create_disease_info_database()
        
        # Create model metadata
        metadata = exporter.create_model_metadata()
        
        # Benchmark models
        benchmarks = exporter.benchmark_models()
        
        print("\n=== Export Summary ===")
        print(f"TensorFlow Lite: {tflite_path}")
        print(f"ONNX: {onnx_path}")
        print(f"Disease Database: {disease_db_path}")
        print(f"Model Metadata: {EXPORT_CONFIG['model_info_path']}")
        
        print("\n=== Model Sizes ===")
        if "tflite" in benchmarks:
            print(f"TFLite: {benchmarks['tflite']['size_mb']:.2f} MB")
        if "onnx" in benchmarks:
            print(f"ONNX: {benchmarks['onnx']['size_mb']:.2f} MB")
        
        print("\nModel export completed successfully!")
        
    except Exception as e:
        print(f"Error during export: {e}")
        raise


if __name__ == "__main__":
    main() 