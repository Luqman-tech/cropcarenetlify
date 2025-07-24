#!/usr/bin/env python3
"""
Test script for validating trained models and exported formats
"""

import os
import sys
import argparse
import numpy as np
import cv2
from pathlib import Path
import json
import time

# Add the ai_model directory to Python path
sys.path.append(str(Path(__file__).parent))

from model_export import ModelExporter
from config import MODEL_CONFIG, DISEASE_INFO


def load_test_image(image_path: str, target_size: tuple = (224, 224)) -> np.ndarray:
    """
    Load and preprocess a test image
    """
    # Load image
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not load image from {image_path}")
    
    # Convert BGR to RGB
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # Resize image
    img = cv2.resize(img, target_size)
    
    # Normalize pixel values
    img = img.astype(np.float32) / 255.0
    
    return img


def test_keras_model(model_path: str, test_image_path: str = None) -> dict:
    """
    Test the original Keras model
    """
    print("Testing Keras model...")
    
    # Load model
    from tensorflow.keras.models import load_model
    model = load_model(model_path)
    
    # Prepare test input
    if test_image_path and Path(test_image_path).exists():
        img = load_test_image(test_image_path)
        img = np.expand_dims(img, axis=0)
    else:
        # Use random test data
        img = np.random.random((1,) + MODEL_CONFIG["input_shape"]).astype(np.float32)
    
    # Run inference
    start_time = time.time()
    predictions = model.predict(img, verbose=0)
    inference_time = time.time() - start_time
    
    # Get results
    predicted_class = np.argmax(predictions[0])
    confidence = np.max(predictions[0])
    
    result = {
        "model_type": "Keras",
        "predicted_class": int(predicted_class),
        "predicted_class_name": MODEL_CONFIG["class_names"][predicted_class],
        "confidence": float(confidence),
        "inference_time": inference_time,
        "all_probabilities": predictions[0].tolist()
    }
    
    return result


def test_tflite_model(tflite_path: str, test_image_path: str = None) -> dict:
    """
    Test TensorFlow Lite model
    """
    print("Testing TensorFlow Lite model...")
    
    import tensorflow as tf
    
    # Load TFLite interpreter
    interpreter = tf.lite.Interpreter(model_path=tflite_path)
    interpreter.allocate_tensors()
    
    # Get input and output details
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    
    # Prepare test input
    if test_image_path and Path(test_image_path).exists():
        img = load_test_image(test_image_path)
        img = np.expand_dims(img, axis=0)
    else:
        # Use random test data
        img = np.random.random((1,) + MODEL_CONFIG["input_shape"]).astype(np.float32)
    
    # Set input tensor
    interpreter.set_tensor(input_details[0]['index'], img)
    
    # Run inference
    start_time = time.time()
    interpreter.invoke()
    inference_time = time.time() - start_time
    
    # Get output
    output = interpreter.get_tensor(output_details[0]['index'])
    
    # Get results
    predicted_class = np.argmax(output[0])
    confidence = np.max(output[0])
    
    result = {
        "model_type": "TensorFlow Lite",
        "predicted_class": int(predicted_class),
        "predicted_class_name": MODEL_CONFIG["class_names"][predicted_class],
        "confidence": float(confidence),
        "inference_time": inference_time,
        "all_probabilities": output[0].tolist()
    }
    
    return result


def test_onnx_model(onnx_path: str, test_image_path: str = None) -> dict:
    """
    Test ONNX model
    """
    print("Testing ONNX model...")
    
    import onnxruntime as ort
    
    # Create ONNX Runtime session
    session = ort.InferenceSession(onnx_path)
    
    # Get input and output names
    input_name = session.get_inputs()[0].name
    output_name = session.get_outputs()[0].name
    
    # Prepare test input
    if test_image_path and Path(test_image_path).exists():
        img = load_test_image(test_image_path)
        img = np.expand_dims(img, axis=0)
    else:
        # Use random test data
        img = np.random.random((1,) + MODEL_CONFIG["input_shape"]).astype(np.float32)
    
    # Run inference
    start_time = time.time()
    output = session.run([output_name], {input_name: img})
    inference_time = time.time() - start_time
    
    # Get results
    predicted_class = np.argmax(output[0][0])
    confidence = np.max(output[0][0])
    
    result = {
        "model_type": "ONNX",
        "predicted_class": int(predicted_class),
        "predicted_class_name": MODEL_CONFIG["class_names"][predicted_class],
        "confidence": float(confidence),
        "inference_time": inference_time,
        "all_probabilities": output[0][0].tolist()
    }
    
    return result


def display_disease_info(class_name: str) -> None:
    """
    Display disease information for a given class
    """
    if class_name in DISEASE_INFO:
        info = DISEASE_INFO[class_name]
        print(f"\n🌿 Disease Information for {class_name}:")
        print(f"   Symptoms: {info['symptoms']}")
        print(f"   Treatment: {info['treatment']}")
        print(f"   Prevention: {info['prevention']}")
    else:
        print(f"\n⚠️  No disease information available for {class_name}")


def compare_models(results: list) -> None:
    """
    Compare results from different model formats
    """
    print("\n" + "="*60)
    print("📊 MODEL COMPARISON")
    print("="*60)
    
    print(f"{'Model Type':<15} {'Prediction':<30} {'Confidence':<12} {'Time (ms)':<10}")
    print("-" * 70)
    
    for result in results:
        model_type = result["model_type"]
        prediction = result["predicted_class_name"]
        confidence = f"{result['confidence']:.4f}"
        time_ms = f"{result['inference_time']*1000:.2f}"
        
        print(f"{model_type:<15} {prediction:<30} {confidence:<12} {time_ms:<10}")
    
    print("\n" + "="*60)


def main():
    """
    Main test function
    """
    parser = argparse.ArgumentParser(description="Test trained models and exported formats")
    parser.add_argument("--model-type", default="mobilenet_v2",
                       help="Model architecture type")
    parser.add_argument("--test-image", type=str,
                       help="Path to test image")
    parser.add_argument("--compare", action="store_true",
                       help="Compare all available model formats")
    
    args = parser.parse_args()
    
    print("🧪 Model Testing Suite")
    print("=" * 40)
    
    # Define model paths
    keras_path = f"models/{args.model_type}_final.h5"
    tflite_path = "models/crop_disease_model.tflite"
    onnx_path = "models/crop_disease_model.onnx"
    
    results = []
    
    try:
        # Test Keras model
        if Path(keras_path).exists():
            result = test_keras_model(keras_path, args.test_image)
            results.append(result)
            print(f"✅ Keras: {result['predicted_class_name']} ({result['confidence']:.4f})")
            display_disease_info(result['predicted_class_name'])
        else:
            print("❌ Keras model not found")
        
        # Test TensorFlow Lite model
        if Path(tflite_path).exists():
            result = test_tflite_model(tflite_path, args.test_image)
            results.append(result)
            print(f"✅ TFLite: {result['predicted_class_name']} ({result['confidence']:.4f})")
        else:
            print("❌ TensorFlow Lite model not found")
        
        # Test ONNX model
        if Path(onnx_path).exists():
            result = test_onnx_model(onnx_path, args.test_image)
            results.append(result)
            print(f"✅ ONNX: {result['predicted_class_name']} ({result['confidence']:.4f})")
        else:
            print("❌ ONNX model not found")
        
        # Compare models if requested
        if args.compare and len(results) > 1:
            compare_models(results)
        
        # Save test results
        if results:
            test_results = {
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                "test_image": args.test_image,
                "results": results
            }
            
            results_path = Path("results/test_results.json")
            results_path.parent.mkdir(exist_ok=True)
            
            with open(results_path, 'w') as f:
                json.dump(test_results, f, indent=2)
            
            print(f"\n📄 Test results saved to {results_path}")
        
        print("\n✅ Model testing completed!")
        
    except Exception as e:
        print(f"\n❌ Error during testing: {e}")
        raise


if __name__ == "__main__":
    main() 