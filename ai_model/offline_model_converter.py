"""
Offline Model Converter for CropCare AI

Converts trained TensorFlow/Keras models to TensorFlow Lite format
optimized for offline inference on mobile devices.
"""

import os
import json
import numpy as np
import tensorflow as tf
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import argparse

# Import configuration
from config import MODEL_CONFIG, EXPORT_CONFIG

class OfflineModelConverter:
    """
    Converts trained models to TensorFlow Lite format for offline inference
    """
    
    def __init__(self, model_path: str = None):
        self.model_path = model_path or "models/mobilenet_v2_final.h5"
        self.model = None
        self.converter = None
        self.tflite_model = None
        
        # Conversion options
        self.conversion_options = {
            'optimize_for_size': True,
            'enable_mlir_converter': True,
            'experimental_new_converter': True
        }
        
        # Quantization options
        self.quantization_options = {
            'optimizations': [tf.lite.Optimize.DEFAULT],
            'representative_dataset': None,
            'target_spec': {
                'supported_ops': [
                    tf.lite.OpsSet.TFLITE_BUILTINS,
                    tf.lite.OpsSet.SELECT_TF_OPS
                ],
                'supported_types': [tf.float32, tf.int8]
            }
        }
    
    def load_model(self) -> None:
        """Load the trained Keras model"""
        try:
            if not Path(self.model_path).exists():
                raise FileNotFoundError(f"Model not found at {self.model_path}")
            
            self.model = tf.keras.models.load_model(self.model_path)
            print(f"✅ Model loaded from {self.model_path}")
            print(f"📊 Model summary:")
            self.model.summary()
            
        except Exception as e:
            print(f"❌ Failed to load model: {e}")
            raise
    
    def create_representative_dataset(self, num_samples: int = 100) -> callable:
        """Create representative dataset for quantization"""
        def representative_dataset():
            for _ in range(num_samples):
                # Generate random data similar to training data
                data = np.random.random((1,) + MODEL_CONFIG['input_shape']).astype(np.float32)
                yield [data]
        
        return representative_dataset
    
    def convert_to_tflite(self, quantize: bool = True, optimize: bool = True) -> bytes:
        """Convert model to TensorFlow Lite format"""
        if self.model is None:
            raise ValueError("Model not loaded. Call load_model() first.")
        
        print("🔄 Converting model to TensorFlow Lite...")
        
        # Create converter
        self.converter = tf.lite.TFLiteConverter.from_keras_model(self.model)
        
        # Apply optimizations
        if optimize:
            print("⚡ Applying optimizations...")
            self.converter.optimizations = [tf.lite.Optimize.DEFAULT]
            self.converter.target_spec.supported_types = [tf.float32]
        
        # Apply quantization if requested
        if quantize:
            print("📦 Applying quantization...")
            self.converter.optimizations = [tf.lite.Optimize.DEFAULT]
            self.converter.representative_dataset = self.create_representative_dataset()
            self.converter.target_spec.supported_ops = [
                tf.lite.OpsSet.EXPERIMENTAL_TFLITE_BUILTINS_ACTIVATIONS_INT16,
                tf.lite.OpsSet.TFLITE_BUILTINS
            ]
            self.converter.target_spec.supported_types = [tf.int8]
            self.converter.inference_input_type = tf.int8
            self.converter.inference_output_type = tf.int8
        
        # Convert model
        self.tflite_model = self.converter.convert()
        
        print(f"✅ Model converted successfully!")
        print(f"📏 Model size: {len(self.tflite_model) / 1024 / 1024:.2f} MB")
        
        return self.tflite_model
    
    def save_tflite_model(self, output_path: str = None) -> str:
        """Save TensorFlow Lite model to file"""
        if self.tflite_model is None:
            raise ValueError("No TFLite model to save. Call convert_to_tflite() first.")
        
        if output_path is None:
            output_path = f"models/crop_disease_model_offline.tflite"
        
        # Ensure output directory exists
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        
        # Save model
        with open(output_path, 'wb') as f:
            f.write(self.tflite_model)
        
        print(f"💾 TFLite model saved to {output_path}")
        return output_path
    
    def test_tflite_model(self, test_input: np.ndarray = None) -> Dict:
        """Test the converted TFLite model"""
        if self.tflite_model is None:
            raise ValueError("No TFLite model to test. Call convert_to_tflite() first.")
        
        print("🧪 Testing TFLite model...")
        
        # Create interpreter
        interpreter = tf.lite.Interpreter(model_content=self.tflite_model)
        interpreter.allocate_tensors()
        
        # Get input and output details
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        
        print(f"📊 Input details: {input_details}")
        print(f"📊 Output details: {output_details}")
        
        # Prepare test input
        if test_input is None:
            test_input = np.random.random((1,) + MODEL_CONFIG['input_shape']).astype(np.float32)
        
        # Set input tensor
        interpreter.set_tensor(input_details[0]['index'], test_input)
        
        # Run inference
        import time
        start_time = time.time()
        interpreter.invoke()
        inference_time = time.time() - start_time
        
        # Get output
        output = interpreter.get_tensor(output_details[0]['index'])
        
        # Get prediction
        predicted_class = np.argmax(output[0])
        confidence = np.max(output[0])
        
        result = {
            'predicted_class': int(predicted_class),
            'predicted_class_name': MODEL_CONFIG['class_names'][predicted_class],
            'confidence': float(confidence),
            'inference_time_ms': inference_time * 1000,
            'model_size_mb': len(self.tflite_model) / 1024 / 1024,
            'all_probabilities': output[0].tolist()
        }
        
        print(f"✅ TFLite test completed:")
        print(f"   Prediction: {result['predicted_class_name']}")
        print(f"   Confidence: {result['confidence']:.4f}")
        print(f"   Inference time: {result['inference_time_ms']:.2f} ms")
        print(f"   Model size: {result['model_size_mb']:.2f} MB")
        
        return result
    
    def create_model_metadata(self) -> Dict:
        """Create metadata for the TFLite model"""
        metadata = {
            'model_info': {
                'name': 'CropCare AI Disease Detection',
                'version': '1.0.0',
                'description': 'TensorFlow Lite model for crop disease detection',
                'author': 'CropCare AI Team',
                'license': 'MIT'
            },
            'model_config': {
                'input_shape': MODEL_CONFIG['input_shape'],
                'num_classes': MODEL_CONFIG['num_classes'],
                'class_names': MODEL_CONFIG['class_names'],
                'input_type': 'float32',
                'output_type': 'float32'
            },
            'performance': {
                'target_platforms': ['Android', 'iOS', 'Web'],
                'optimization_level': 'quantized',
                'estimated_inference_time_ms': 50,
                'memory_usage_mb': 10
            },
            'usage': {
                'input_preprocessing': 'Normalize to [0, 1] range',
                'output_postprocessing': 'Apply softmax to get probabilities',
                'confidence_threshold': 0.5
            }
        }
        
        return metadata
    
    def save_model_metadata(self, metadata_path: str = None) -> str:
        """Save model metadata to JSON file"""
        if metadata_path is None:
            metadata_path = "models/model_metadata_offline.json"
        
        metadata = self.create_model_metadata()
        
        # Ensure output directory exists
        Path(metadata_path).parent.mkdir(parents=True, exist_ok=True)
        
        # Save metadata
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"💾 Model metadata saved to {metadata_path}")
        return metadata_path
    
    def create_model_bundle(self, output_dir: str = "models/offline_bundle") -> str:
        """Create a complete model bundle for offline deployment"""
        print("📦 Creating offline model bundle...")
        
        # Create output directory
        bundle_dir = Path(output_dir)
        bundle_dir.mkdir(parents=True, exist_ok=True)
        
        # Save TFLite model
        tflite_path = bundle_dir / "crop_disease_model.tflite"
        self.save_tflite_model(str(tflite_path))
        
        # Save metadata
        metadata_path = bundle_dir / "model_metadata.json"
        self.save_model_metadata(str(metadata_path))
        
        # Copy disease information
        disease_info_path = bundle_dir / "disease_info.json"
        if Path("models/disease_info_complete.json").exists():
            import shutil
            shutil.copy("models/disease_info_complete.json", disease_info_path)
            print(f"💾 Disease info copied to {disease_info_path}")
        
        # Create README for the bundle
        readme_content = f"""# CropCare AI Offline Model Bundle

This bundle contains all necessary files for offline crop disease detection.

## Files:
- `crop_disease_model.tflite`: TensorFlow Lite model for inference
- `model_metadata.json`: Model configuration and metadata
- `disease_info.json`: Disease information database

## Usage:
1. Load the TFLite model in your mobile app
2. Use the metadata for input/output configuration
3. Reference disease_info.json for treatment recommendations

## Model Info:
- Input shape: {MODEL_CONFIG['input_shape']}
- Number of classes: {MODEL_CONFIG['num_classes']}
- Model size: {len(self.tflite_model) / 1024 / 1024:.2f} MB
- Target platforms: Android, iOS, Web

## Performance:
- Estimated inference time: 50ms
- Memory usage: ~10MB
- Optimized for mobile devices

Generated on: {tf.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""
        
        readme_path = bundle_dir / "README.md"
        with open(readme_path, 'w') as f:
            f.write(readme_content)
        
        print(f"📦 Offline bundle created at {bundle_dir}")
        return str(bundle_dir)
    
    def benchmark_model(self, num_runs: int = 100) -> Dict:
        """Benchmark the TFLite model performance"""
        if self.tflite_model is None:
            raise ValueError("No TFLite model to benchmark. Call convert_to_tflite() first.")
        
        print(f"🏃 Benchmarking TFLite model ({num_runs} runs)...")
        
        # Create interpreter
        interpreter = tf.lite.Interpreter(model_content=self.tflite_model)
        interpreter.allocate_tensors()
        
        # Get input details
        input_details = interpreter.get_input_details()
        
        # Prepare test input
        test_input = np.random.random((1,) + MODEL_CONFIG['input_shape']).astype(np.float32)
        
        # Warm up
        for _ in range(10):
            interpreter.set_tensor(input_details[0]['index'], test_input)
            interpreter.invoke()
        
        # Benchmark
        import time
        times = []
        
        for _ in range(num_runs):
            start_time = time.time()
            interpreter.set_tensor(input_details[0]['index'], test_input)
            interpreter.invoke()
            end_time = time.time()
            times.append((end_time - start_time) * 1000)  # Convert to ms
        
        # Calculate statistics
        times = np.array(times)
        benchmark_results = {
            'num_runs': num_runs,
            'mean_time_ms': float(np.mean(times)),
            'median_time_ms': float(np.median(times)),
            'std_time_ms': float(np.std(times)),
            'min_time_ms': float(np.min(times)),
            'max_time_ms': float(np.max(times)),
            'p95_time_ms': float(np.percentile(times, 95)),
            'p99_time_ms': float(np.percentile(times, 99)),
            'model_size_mb': len(self.tflite_model) / 1024 / 1024
        }
        
        print(f"📊 Benchmark results:")
        print(f"   Mean inference time: {benchmark_results['mean_time_ms']:.2f} ms")
        print(f"   Median inference time: {benchmark_results['median_time_ms']:.2f} ms")
        print(f"   P95 inference time: {benchmark_results['p95_time_ms']:.2f} ms")
        print(f"   Model size: {benchmark_results['model_size_mb']:.2f} MB")
        
        return benchmark_results


def main():
    """Main function to run offline model conversion"""
    parser = argparse.ArgumentParser(description='Convert model to TensorFlow Lite for offline use')
    parser.add_argument('--model-path', type=str, default='models/mobilenet_v2_final.h5',
                       help='Path to the trained Keras model')
    parser.add_argument('--output-dir', type=str, default='models/offline_bundle',
                       help='Output directory for the offline bundle')
    parser.add_argument('--quantize', action='store_true', default=True,
                       help='Apply quantization to reduce model size')
    parser.add_argument('--optimize', action='store_true', default=True,
                       help='Apply optimizations for better performance')
    parser.add_argument('--benchmark', action='store_true', default=True,
                       help='Run performance benchmark')
    parser.add_argument('--test', action='store_true', default=True,
                       help='Test the converted model')
    
    args = parser.parse_args()
    
    # Create necessary directories
    Path("models").mkdir(exist_ok=True)
    Path("results").mkdir(exist_ok=True)
    
    # Initialize converter
    converter = OfflineModelConverter(args.model_path)
    
    try:
        # Load model
        converter.load_model()
        
        # Convert to TFLite
        tflite_model = converter.convert_to_tflite(
            quantize=args.quantize,
            optimize=args.optimize
        )
        
        # Test model
        if args.test:
            test_result = converter.test_tflite_model()
        
        # Benchmark model
        if args.benchmark:
            benchmark_result = converter.benchmark_model()
            
            # Save benchmark results
            benchmark_path = Path("results/tflite_benchmark.json")
            with open(benchmark_path, 'w') as f:
                json.dump(benchmark_result, f, indent=2)
            print(f"📊 Benchmark results saved to {benchmark_path}")
        
        # Create offline bundle
        bundle_path = converter.create_model_bundle(args.output_dir)
        
        print(f"\n🎉 Offline model conversion completed!")
        print(f"📦 Bundle location: {bundle_path}")
        print(f"📱 Ready for mobile deployment!")
        
    except Exception as e:
        print(f"❌ Conversion failed: {e}")
        raise


if __name__ == "__main__":
    main() 