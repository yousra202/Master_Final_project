# brain_diagnostics/tumor_detection.py
import tensorflow as tf
from tensorflow.keras.preprocessing.image import load_img, img_to_array
import numpy as np

# Constants
IMAGE_SIZE = 128

def predict_tumor(image_path):
    """
    Predict if the image contains a tumor and return the result and confidence.
    
    Args:
        image_path: Path to the uploaded image
        
    Returns:
        tuple: (result, confidence)
    """
    # Load the model
    model = tf.keras.models.load_model('brain_diagnostics/model/model.h5')
    
    # Load and preprocess the image
    img = load_img(image_path, target_size=(IMAGE_SIZE, IMAGE_SIZE))
    img_array = img_to_array(img)
    img_array = img_array / 255.0  # Normalize
    img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
    
    # Make prediction
    predictions = model.predict(img_array)
    
    # Get the class with highest probability
    class_labels = ['glioma', 'meningioma', 'notumor', 'pituitary']
    predicted_class = class_labels[np.argmax(predictions[0])]
    confidence = float(np.max(predictions[0]) * 100)
    
    # Format the result
    if predicted_class == 'notumor':
        result = "No tumor detected"
    else:
        result = f"{predicted_class.capitalize()} tumor detected"
    
    return result, confidence


