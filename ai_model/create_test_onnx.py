"""
Create a minimal ONNX model for testing frontend integration
"""

import numpy as np
import onnx
from onnx import helper, numpy_helper
import os

def create_minimal_onnx_model():
    """Create a minimal ONNX model for testing"""
    
    # Create a simple model: input -> dense -> softmax -> output
    input_shape = [1, 3, 224, 224]  # Batch, Channels, Height, Width
    output_shape = [1, 33]  # Batch, Classes
    
    # Input
    input_tensor = helper.make_tensor_value_info(
        'input', onnx.TensorProto.FLOAT, input_shape
    )
    
    # Output
    output_tensor = helper.make_tensor_value_info(
        'output', onnx.TensorProto.FLOAT, output_shape
    )
    
    # Weights for dense layer (simplified)
    weights = np.random.randn(33, 3 * 224 * 224).astype(np.float32)
    bias = np.random.randn(33).astype(np.float32)
    
    # Create weight tensors
    weights_tensor = numpy_helper.from_array(weights, 'weights')
    bias_tensor = numpy_helper.from_array(bias, 'bias')
    
    # Create nodes
    # Reshape input to 2D
    reshape_node = helper.make_node(
        'Reshape',
        inputs=['input'],
        outputs=['reshaped_input'],
        shape=[1, 3 * 224 * 224]
    )
    
    # Dense layer (Gemm)
    gemm_node = helper.make_node(
        'Gemm',
        inputs=['reshaped_input', 'weights', 'bias'],
        outputs=['dense_output']
    )
    
    # Softmax
    softmax_node = helper.make_node(
        'Softmax',
        inputs=['dense_output'],
        outputs=['output'],
        axis=1
    )
    
    # Create the graph
    graph = helper.make_graph(
        [reshape_node, gemm_node, softmax_node],
        'crop_disease_model',
        [input_tensor],
        [output_tensor],
        [weights_tensor, bias_tensor]
    )
    
    # Create the model
    model = helper.make_model(graph, producer_name='cropcare-ai')
    
    # Save the model
    output_path = '../models/crop_disease_model.onnx'
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'wb') as f:
        f.write(model.SerializeToString())
    
    print(f"✅ Test ONNX model created at {output_path}")
    print(f"📊 Model size: {os.path.getsize(output_path) / 1024:.2f} KB")
    
    return output_path

if __name__ == "__main__":
    create_minimal_onnx_model() 