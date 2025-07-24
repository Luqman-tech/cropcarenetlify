"""
Confidence Calibration for Crop Disease Detection Model

This module provides methods to calibrate the confidence scores of the trained model
to make them more reliable and accurate representations of true prediction confidence.
"""

import numpy as np
import json
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from sklearn.metrics import brier_score_loss
import tensorflow as tf
from tensorflow import keras

# Import configuration
from config import MODEL_CONFIG, DATASET_CONFIG

class ConfidenceCalibrator:
    """
    Confidence calibration for neural network models
    """
    
    def __init__(self, model_path: str):
        self.model_path = model_path
        self.model = None
        self.calibration_params = {
            'temperature': 1.0,
            'platt_a': 1.0,
            'platt_b': 0.0
        }
        self.calibration_history = []
        
    def load_model(self) -> None:
        """Load the trained model"""
        try:
            self.model = keras.models.load_model(self.model_path)
            print(f"✅ Model loaded from {self.model_path}")
        except Exception as e:
            print(f"❌ Failed to load model: {e}")
            raise
    
    def prepare_calibration_data(self, X_val: np.ndarray, y_val: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare data for confidence calibration"""
        # Get model predictions
        predictions = self.model.predict(X_val, verbose=0)
        
        # Convert to binary labels for calibration
        y_true_binary = np.argmax(y_val, axis=1)
        y_pred_proba = predictions
        
        return y_pred_proba, y_true_binary
    
    def temperature_scaling(self, y_pred_proba: np.ndarray, y_true: np.ndarray) -> float:
        """Find optimal temperature for temperature scaling"""
        from scipy.optimize import minimize
        
        def objective(temperature):
            # Apply temperature scaling
            scaled_logits = np.log(y_pred_proba + 1e-8) / temperature
            scaled_proba = self._softmax(scaled_logits, axis=1)
            
            # Calculate negative log likelihood
            nll = -np.mean(np.sum(y_true * np.log(scaled_proba + 1e-8), axis=1))
            return nll
        
        # Optimize temperature
        result = minimize(objective, x0=1.0, bounds=[(0.1, 10.0)])
        optimal_temperature = result.x[0]
        
        print(f"🎯 Optimal temperature: {optimal_temperature:.4f}")
        return optimal_temperature
    
    def platt_scaling(self, y_pred_proba: np.ndarray, y_true: np.ndarray) -> Tuple[float, float]:
        """Find optimal parameters for Platt scaling"""
        from sklearn.linear_model import LogisticRegression
        
        # Use logistic regression to find Platt parameters
        lr = LogisticRegression()
        
        # Prepare data for Platt scaling
        y_pred_max = np.max(y_pred_proba, axis=1, keepdims=True)
        lr.fit(y_pred_max, np.argmax(y_true, axis=1))
        
        platt_a = lr.coef_[0][0]
        platt_b = lr.intercept_[0]
        
        print(f"📊 Platt parameters - A: {platt_a:.4f}, B: {platt_b:.4f}")
        return platt_a, platt_b
    
    def isotonic_calibration(self, y_pred_proba: np.ndarray, y_true: np.ndarray) -> object:
        """Train isotonic regression for calibration"""
        from sklearn.isotonic import IsotonicRegression
        
        # Use maximum probability for isotonic calibration
        y_pred_max = np.max(y_pred_proba, axis=1)
        y_true_max = np.max(y_true, axis=1)
        
        isotonic = IsotonicRegression(out_of_bounds='clip')
        isotonic.fit(y_pred_max, y_true_max)
        
        print("📈 Isotonic regression fitted")
        return isotonic
    
    def evaluate_calibration(self, y_pred_proba: np.ndarray, y_true: np.ndarray, 
                           method: str = 'temperature') -> Dict:
        """Evaluate calibration quality"""
        results = {}
        
        # Calculate Brier score
        brier_scores = []
        for i in range(y_pred_proba.shape[1]):
            brier = brier_score_loss(y_true[:, i], y_pred_proba[:, i])
            brier_scores.append(brier)
        
        results['brier_score'] = np.mean(brier_scores)
        results['brier_scores_per_class'] = brier_scores
        
        # Calculate ECE (Expected Calibration Error)
        ece = self._calculate_ece(y_pred_proba, y_true)
        results['ece'] = ece
        
        # Calculate reliability diagram
        reliability_data = self._calculate_reliability(y_pred_proba, y_true)
        results['reliability'] = reliability_data
        
        print(f"📊 Calibration Metrics ({method}):")
        print(f"   Brier Score: {results['brier_score']:.4f}")
        print(f"   ECE: {results['ece']:.4f}")
        
        return results
    
    def _calculate_ece(self, y_pred_proba: np.ndarray, y_true: np.ndarray, 
                      n_bins: int = 15) -> float:
        """Calculate Expected Calibration Error"""
        bin_boundaries = np.linspace(0, 1, n_bins + 1)
        bin_lowers = bin_boundaries[:-1]
        bin_uppers = bin_boundaries[1:]
        
        ece = 0.0
        for bin_lower, bin_upper in zip(bin_lowers, bin_uppers):
            # Find predictions in this bin
            in_bin = np.logical_and(y_pred_proba >= bin_lower, y_pred_proba < bin_upper)
            bin_size = np.sum(in_bin)
            
            if bin_size > 0:
                bin_accuracy = np.sum(y_true[in_bin]) / bin_size
                bin_confidence = np.mean(y_pred_proba[in_bin])
                ece += bin_size * np.abs(bin_accuracy - bin_confidence)
        
        return ece / len(y_pred_proba)
    
    def _calculate_reliability(self, y_pred_proba: np.ndarray, y_true: np.ndarray, 
                             n_bins: int = 10) -> Dict:
        """Calculate reliability diagram data"""
        bin_boundaries = np.linspace(0, 1, n_bins + 1)
        bin_lowers = bin_boundaries[:-1]
        bin_uppers = bin_boundaries[1:]
        
        accuracies = []
        confidences = []
        bin_sizes = []
        
        for bin_lower, bin_upper in zip(bin_lowers, bin_uppers):
            in_bin = np.logical_and(y_pred_proba >= bin_lower, y_pred_proba < bin_upper)
            bin_size = np.sum(in_bin)
            
            if bin_size > 0:
                bin_accuracy = np.sum(y_true[in_bin]) / bin_size
                bin_confidence = np.mean(y_pred_proba[in_bin])
                
                accuracies.append(bin_accuracy)
                confidences.append(bin_confidence)
                bin_sizes.append(bin_size)
        
        return {
            'accuracies': accuracies,
            'confidences': confidences,
            'bin_sizes': bin_sizes
        }
    
    def _softmax(self, x: np.ndarray, axis: int = -1) -> np.ndarray:
        """Compute softmax values"""
        exp_x = np.exp(x - np.max(x, axis=axis, keepdims=True))
        return exp_x / np.sum(exp_x, axis=axis, keepdims=True)
    
    def plot_calibration_curves(self, y_pred_proba: np.ndarray, y_true: np.ndarray, 
                               save_path: str = None) -> None:
        """Plot calibration curves"""
        fig, axes = plt.subplots(2, 2, figsize=(15, 12))
        
        # Reliability diagram
        reliability = self._calculate_reliability(y_pred_proba, y_true)
        
        axes[0, 0].plot(reliability['confidences'], reliability['accuracies'], 'o-', label='Model')
        axes[0, 0].plot([0, 1], [0, 1], '--', label='Perfect Calibration')
        axes[0, 0].set_xlabel('Confidence')
        axes[0, 0].set_ylabel('Accuracy')
        axes[0, 0].set_title('Reliability Diagram')
        axes[0, 0].legend()
        axes[0, 0].grid(True, alpha=0.3)
        
        # Confidence histogram
        max_confidences = np.max(y_pred_proba, axis=1)
        axes[0, 1].hist(max_confidences, bins=20, alpha=0.7, edgecolor='black')
        axes[0, 1].set_xlabel('Maximum Confidence')
        axes[0, 1].set_ylabel('Frequency')
        axes[0, 1].set_title('Confidence Distribution')
        axes[0, 1].grid(True, alpha=0.3)
        
        # Brier scores per class
        brier_scores = []
        class_names = []
        for i in range(y_pred_proba.shape[1]):
            brier = brier_score_loss(y_true[:, i], y_pred_proba[:, i])
            brier_scores.append(brier)
            class_names.append(MODEL_CONFIG['class_names'][i].split('___')[1])
        
        axes[1, 0].bar(range(len(brier_scores)), brier_scores)
        axes[1, 0].set_xlabel('Class')
        axes[1, 0].set_ylabel('Brier Score')
        axes[1, 0].set_title('Brier Scores per Class')
        axes[1, 0].set_xticks(range(len(class_names)))
        axes[1, 0].set_xticklabels(class_names, rotation=45, ha='right')
        axes[1, 0].grid(True, alpha=0.3)
        
        # Calibration error distribution
        errors = np.abs(np.max(y_pred_proba, axis=1) - np.max(y_true, axis=1))
        axes[1, 1].hist(errors, bins=20, alpha=0.7, edgecolor='black')
        axes[1, 1].set_xlabel('Calibration Error')
        axes[1, 1].set_ylabel('Frequency')
        axes[1, 1].set_title('Calibration Error Distribution')
        axes[1, 1].grid(True, alpha=0.3)
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            print(f"📊 Calibration plots saved to {save_path}")
        
        plt.show()
    
    def save_calibration_params(self, save_path: str) -> None:
        """Save calibration parameters"""
        calibration_data = {
            'temperature': self.calibration_params['temperature'],
            'platt_a': self.calibration_params['platt_a'],
            'platt_b': self.calibration_params['platt_b'],
            'calibration_history': self.calibration_history
        }
        
        with open(save_path, 'w') as f:
            json.dump(calibration_data, f, indent=2)
        
        print(f"💾 Calibration parameters saved to {save_path}")
    
    def calibrate_model(self, X_val: np.ndarray, y_val: np.ndarray) -> Dict:
        """Perform comprehensive model calibration"""
        print("🔧 Starting model calibration...")
        
        # Load model if not loaded
        if self.model is None:
            self.load_model()
        
        # Prepare calibration data
        y_pred_proba, y_true_binary = self.prepare_calibration_data(X_val, y_val)
        
        # Evaluate original calibration
        print("\n📊 Evaluating original calibration...")
        original_metrics = self.evaluate_calibration(y_pred_proba, y_true_binary, 'original')
        
        # Temperature scaling
        print("\n🌡️ Performing temperature scaling...")
        optimal_temp = self.temperature_scaling(y_pred_proba, y_true_binary)
        self.calibration_params['temperature'] = optimal_temp
        
        # Apply temperature scaling
        temp_scaled_proba = self._apply_temperature_scaling(y_pred_proba, optimal_temp)
        temp_metrics = self.evaluate_calibration(temp_scaled_proba, y_true_binary, 'temperature')
        
        # Platt scaling
        print("\n📈 Performing Platt scaling...")
        platt_a, platt_b = self.platt_scaling(y_pred_proba, y_true_binary)
        self.calibration_params['platt_a'] = platt_a
        self.calibration_params['platt_b'] = platt_b
        
        # Isotonic calibration
        print("\n📊 Performing isotonic calibration...")
        isotonic_model = self.isotonic_calibration(y_pred_proba, y_true_binary)
        
        # Save calibration parameters
        results_dir = Path("results")
        results_dir.mkdir(exist_ok=True)
        
        self.save_calibration_params(str(results_dir / "calibration_params.json"))
        
        # Plot calibration curves
        self.plot_calibration_curves(y_pred_proba, y_true_binary, 
                                   str(results_dir / "calibration_curves.png"))
        
        # Compile results
        calibration_results = {
            'original_metrics': original_metrics,
            'temperature_metrics': temp_metrics,
            'calibration_params': self.calibration_params,
            'improvement': {
                'brier_score': original_metrics['brier_score'] - temp_metrics['brier_score'],
                'ece': original_metrics['ece'] - temp_metrics['ece']
            }
        }
        
        print(f"\n✅ Calibration completed!")
        print(f"📈 Brier Score Improvement: {calibration_results['improvement']['brier_score']:.4f}")
        print(f"📈 ECE Improvement: {calibration_results['improvement']['ece']:.4f}")
        
        return calibration_results
    
    def _apply_temperature_scaling(self, y_pred_proba: np.ndarray, temperature: float) -> np.ndarray:
        """Apply temperature scaling to predictions"""
        scaled_logits = np.log(y_pred_proba + 1e-8) / temperature
        return self._softmax(scaled_logits, axis=1)


def main():
    """Main function to run confidence calibration"""
    # Create necessary directories
    results_dir = Path("results")
    results_dir.mkdir(exist_ok=True)
    
    # Model path
    model_path = "models/mobilenet_v2_final.h5"
    
    if not Path(model_path).exists():
        print(f"❌ Model not found at {model_path}")
        print("Please train the model first using train_real_model.py")
        return
    
    # Initialize calibrator
    calibrator = ConfidenceCalibrator(model_path)
    
    # Load validation data (you would need to prepare this)
    # For demonstration, we'll create synthetic data
    print("📊 Creating synthetic validation data for calibration...")
    
    # Generate synthetic validation data
    n_samples = 1000
    n_classes = MODEL_CONFIG['num_classes']
    
    X_val = np.random.random((n_samples, *MODEL_CONFIG['input_shape'])).astype(np.float32)
    y_val = np.random.randint(0, n_classes, n_samples)
    y_val_onehot = tf.keras.utils.to_categorical(y_val, n_classes)
    
    # Run calibration
    results = calibrator.calibrate_model(X_val, y_val_onehot)
    
    print("\n🎯 Calibration Summary:")
    print(f"Temperature: {results['calibration_params']['temperature']:.4f}")
    print(f"Platt A: {results['calibration_params']['platt_a']:.4f}")
    print(f"Platt B: {results['calibration_params']['platt_b']:.4f}")


if __name__ == "__main__":
    main() 