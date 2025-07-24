/**
 * Test script for ONNX model integration
 */

import * as ort from 'onnxruntime-web';
import * as tf from '@tensorflow/tfjs';

export async function testOnnxIntegration() {
  console.log('🧪 Testing ONNX integration...');
  
  try {
    // Test ONNX model loading
    console.log('📥 Loading ONNX model...');
    const session = await ort.InferenceSession.create('/models/crop_disease_model.onnx');
    console.log('✅ ONNX model loaded successfully');
    
    // Test input/output details
    const inputName = session.get_inputs()[0].name;
    const outputName = session.get_outputs()[0].name;
    console.log('📊 Input name:', inputName);
    console.log('📊 Output name:', outputName);
    
    // Create test input tensor
    const testInput = new Float32Array(1 * 3 * 224 * 224);
    for (let i = 0; i < testInput.length; i++) {
      testInput[i] = Math.random();
    }
    
    const inputTensor = new ort.Tensor('float32', testInput, [1, 3, 224, 224]);
    
    // Run inference
    console.log('🚀 Running inference...');
    const feeds: Record<string, ort.Tensor> = {};
    feeds[inputName] = inputTensor;
    
    const results = await session.run(feeds);
    const output = results[outputName].data as Float32Array;
    
    console.log('✅ Inference successful');
    console.log('📊 Output shape:', results[outputName].dims);
    console.log('📊 Output values:', output.slice(0, 5)); // Show first 5 values
    
    // Find predicted class
    const classIndex = output.indexOf(Math.max(...output));
    const confidence = output[classIndex];
    console.log('🎯 Predicted class index:', classIndex);
    console.log('🎯 Confidence:', confidence);
    
    return {
      success: true,
      classIndex,
      confidence,
      outputShape: results[outputName].dims
    };
    
  } catch (error) {
    console.error('❌ ONNX test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Test TensorFlow.js fallback
export async function testTensorFlowFallback() {
  console.log('🧪 Testing TensorFlow.js fallback...');
  
  try {
    // Create a simple test tensor
    const testTensor = tf.randomNormal([1, 224, 224, 3]);
    
    // Test tensor operations
    const result = tf.tidy(() => {
      return testTensor.mean();
    });
    
    console.log('✅ TensorFlow.js test successful');
    console.log('📊 Test result:', result.dataSync()[0]);
    
    return {
      success: true,
      result: result.dataSync()[0]
    };
    
  } catch (error) {
    console.error('❌ TensorFlow.js test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run both tests
export async function runAllTests() {
  console.log('🚀 Starting integration tests...');
  
  const onnxResult = await testOnnxIntegration();
  const tfResult = await testTensorFlowFallback();
  
  console.log('📋 Test Results:');
  console.log('ONNX:', onnxResult);
  console.log('TensorFlow.js:', tfResult);
  
  return {
    onnx: onnxResult,
    tensorflow: tfResult
  };
} 