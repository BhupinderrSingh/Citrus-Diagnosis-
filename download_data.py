import kaggle

print("Authenticating with kaggle.json from C:\\Users\\bhupi\\.kaggle ...")

# Download the dataset and automatically unzip it
kaggle.api.dataset_download_files(
    'myprojectdictionary/citrus-leaf-disease-image', 
    path='Citrus_Leaves_Raw', 
    unzip=True
)

print("Download and extraction complete! You are ready to train.")