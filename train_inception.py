import os
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications.inception_v3 import InceptionV3, preprocess_input
from tensorflow.keras.layers import GlobalAveragePooling2D, Dense
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
import splitfolders
import matplotlib.pyplot as plt
import numpy as np
from sklearn.metrics import classification_report
import seaborn as sns

print("All libraries are installed and imported succesfully")

# 1. Prepare Data
input_folder = 'Citrus_Leaves_Raw/Citrus Leaf Disease Image'
output_folder = 'Citrus_Leaves_Split'

if not os.path.exists(output_folder):
    print("Splitting data into train, val, and test sets...")
    splitfolders.ratio(input_folder, output=output_folder, seed=42, ratio=(.7, .15, .15))
    print("Data splitting complete")
else:
    print("Data already split.")

# 2. Setup Data Generators
train_dir = os.path.join(output_folder, 'train')
val_dir = os.path.join(output_folder, 'val')
test_dir = os.path.join(output_folder, 'test')

# --- CHANGED: InceptionV3 requires 299x299 ---
Image_height = 299
Image_width = 299
batch_size = 32

# --- CHANGED: Using InceptionV3's specific preprocess_input ---
train_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input, 
    rotation_range=20, width_shift_range=0.2, height_shift_range=0.2,
    shear_range=0.2, zoom_range=0.2, horizontal_flip=True, fill_mode='nearest')

val_test_datagen = ImageDataGenerator(preprocessing_function=preprocess_input)

train_generator = train_datagen.flow_from_directory(
    train_dir, target_size=(Image_height, Image_width), batch_size=batch_size, class_mode='categorical')

validation_generator = val_test_datagen.flow_from_directory(
    val_dir, target_size=(Image_height, Image_width), batch_size=batch_size, class_mode='categorical')

test_generator = val_test_datagen.flow_from_directory(
    test_dir, target_size=(Image_height, Image_width), batch_size=batch_size, class_mode='categorical')

print("Data generators are ready.")
print("Class Indices", test_generator.class_indices)

# 3. Build Model
print("Building InceptionV3 model...")
# --- CHANGED: Base model swapped to InceptionV3 ---
base_model = InceptionV3(weights='imagenet', include_top=False, input_shape=(Image_height, Image_width, 3))
base_model.trainable = False 

x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(1024, activation='relu')(x)
predictions = Dense(5, activation='softmax')(x)

model = Model(inputs=base_model.input, outputs=predictions)
model.compile(optimizer=Adam(learning_rate=0.0001), loss='categorical_crossentropy', metrics=['accuracy'])

# 4. Train Model
epochs = 15  
print("Starting training...")
history = model.fit(
    train_generator,
    validation_data=validation_generator,
    epochs=epochs
)

# 5. Save the model
# --- CHANGED: Saved under a new name so it doesn't overwrite your MobileNet model ---
model.save('citriscan_inception_model.h5')
print("Model saved successfully as citriscan_inception_model.h5!")