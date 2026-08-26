import os
import sys
import torch
import numpy as np
from torch.utils.data import DataLoader

# Import MONAI utilities for medical deep learning
import monai
from monai.transforms import (
    Compose,
    LoadImaged,
    EnsureChannelFirstd,
    Orientationd,
    Spacingd,
    ScaleIntensityRanged,
    CropForegroundd,
    RandCropByPosNegLabeld,
    RandFlipd,
    RandRotate90d,
    EnsureTyped,
)
from monai.losses import DiceLoss
from monai.metrics import DiceMetric
from monai.utils import first, set_determinism

# Append backend app directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from models.unet import UNet

def train_shoulder_unet(data_dir: str, model_save_path: str = "shoulder_unet.pth", epochs: int = 50, batch_size: int = 2):
    """
    Train a 3D UNet model on medical volumes (CT/MRI) for shoulder bone segmentation (scapula/humerus).
    
    Expected folder structure in data_dir:
        data_dir/
            imagesTr/
                patient_001.nii.gz
                patient_002.nii.gz
                ...
            labelsTr/
                patient_001.nii.gz
                patient_002.nii.gz
                ...
    """
    set_determinism(seed=0)
    print("Preparing dataset paths...")
    
    images_dir = os.path.join(data_dir, "imagesTr")
    labels_dir = os.path.join(data_dir, "labelsTr")
    
    if not os.path.exists(images_dir) or not os.path.exists(labels_dir):
        print(f"Error: Could not find 'imagesTr' or 'labelsTr' folders in {data_dir}.")
        print("Please structure your dataset directories for training as instructed.")
        return
        
    image_files = sorted([os.path.join(images_dir, f) for f in os.listdir(images_dir) if f.endswith((".nii", ".nii.gz"))])
    label_files = sorted([os.path.join(labels_dir, f) for f in os.listdir(labels_dir) if f.endswith((".nii", ".nii.gz"))])
    
    data_dicts = [{"image": img, "label": lbl} for img, lbl in zip(image_files, label_files)]
    
    # Split into train and validation
    train_files, val_files = data_dicts[:-5], data_dicts[-5:] if len(data_dicts) > 5 else (data_dicts, data_dicts)
    
    # Define MONAI preprocessing & data augmentation transforms
    # 3D Volumes are typically large; patch-based cropping helps fit inputs into GPU VRAM
    train_transforms = Compose([
        LoadImaged(keys=["image", "label"]),
        EnsureChannelFirstd(keys=["image", "label"]),
        Orientationd(keys=["image", "label"], axcodes="RAS"),
        # Standardize voxel spacing to 1mm x 1mm x 1mm for uniform scale invariance
        Spacingd(keys=["image", "label"], pixdim=(1.0, 1.0, 1.0), mode=("bilinear", "nearest")),
        # Normalize bone intensities (typically 200 to 1000 HU for bone structures in CT scans)
        ScaleIntensityRanged(keys="image", a_min=-200, a_max=1000, b_min=0.0, b_max=1.0, clip=True),
        CropForegroundd(keys=["image", "label"], source_key="image"),
        # RandCropByPosNegLabeld crops patches around bone boundaries to handle class imbalance
        RandCropByPosNegLabeld(
            keys=["image", "label"],
            label_key="label",
            spatial_size=(96, 96, 96),
            pos=1,
            neg=1,
            num_samples=4,
            image_key="image",
            image_threshold=0,
        ),
        RandFlipd(keys=["image", "label"], prob=0.5, spatial_axis=0),
        RandFlipd(keys=["image", "label"], prob=0.5, spatial_axis=1),
        RandFlipd(keys=["image", "label"], prob=0.5, spatial_axis=2),
        RandRotate90d(keys=["image", "label"], prob=0.5, max_k=3),
        EnsureTyped(keys=["image", "label"]),
    ])
    
    val_transforms = Compose([
        LoadImaged(keys=["image", "label"]),
        EnsureChannelFirstd(keys=["image", "label"]),
        Orientationd(keys=["image", "label"], axcodes="RAS"),
        Spacingd(keys=["image", "label"], pixdim=(1.0, 1.0, 1.0), mode=("bilinear", "nearest")),
        ScaleIntensityRanged(keys="image", a_min=-200, a_max=1000, b_min=0.0, b_max=1.0, clip=True),
        CropForegroundd(keys=["image", "label"], source_key="image"),
        EnsureTyped(keys=["image", "label"]),
    ])
    
    # Create MONAI datasets
    train_ds = monai.data.Dataset(data=train_files, transform=train_transforms)
    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=4, collate_fn=monai.data.list_data_collate)
    
    val_ds = monai.data.Dataset(data=val_files, transform=val_transforms)
    val_loader = DataLoader(val_ds, batch_size=1, shuffle=False, num_workers=2)
    
    # Initialize the model, loss, optimizer, and metrics
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Training on device: {device}")
    
    # Instantiate the 3D UNet model
    model = UNet(in_channels=1, out_channels=1, features=32).to(device)
    
    loss_function = DiceLoss(sigmoid=True)
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-4, weight_decay=1e-5)
    dice_metric = DiceMetric(include_background=False, reduction="mean")
    
    best_metric = -1
    best_metric_epoch = -1
    
    # Training Loop
    for epoch in range(epochs):
        print("-" * 10)
        print(f"epoch {epoch + 1}/{epochs}")
        model.train()
        epoch_loss = 0
        step = 0
        
        for batch_data in train_loader:
            step += 1
            inputs, labels = batch_data["image"].to(device), batch_data["label"].to(device)
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = loss_function(outputs, labels)
            loss.backward()
            optimizer.step()
            epoch_loss += loss.item()
            
        epoch_loss /= step
        print(f"epoch {epoch + 1} average loss: {epoch_loss:.4f}")
        
        # Validation
        model.eval()
        with torch.no_grad():
            for val_data in val_loader:
                val_inputs, val_labels = val_data["image"].to(device), val_data["label"].to(device)
                # Slide window inference to segment high resolution 3D volumes in validation
                roi_size = (96, 96, 96)
                sw_batch_size = 4
                val_outputs = monai.inferers.sliding_window_inference(
                    val_inputs, roi_size, sw_batch_size, model
                )
                val_outputs = [torch.sigmoid(val_outputs) > 0.5]
                dice_metric(y_pred=val_outputs, y=val_labels)
                
            metric = dice_metric.aggregate().item()
            dice_metric.reset()
            print(f"epoch {epoch + 1} Mean Dice Score: {metric:.4f}")
            
            if metric > best_metric:
                best_metric = metric
                best_metric_epoch = epoch + 1
                torch.save(model.state_dict(), model_save_path)
                print(f"Saved new best model checkpoint to {model_save_path}!")
                
    print(f"Training completed. Best validation Mean Dice: {best_metric:.4f} at epoch {best_metric_epoch}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Train a 3D UNet model for shoulder bone segmentation.")
    parser.add_argument("--data_dir", type=str, required=True, help="Path to the training dataset root folder.")
    parser.add_argument("--save_path", type=str, default="shoulder_unet.pth", help="Path to save the best model weights.")
    parser.add_argument("--epochs", type=int, default=50, help="Number of training epochs.")
    parser.add_argument("--batch_size", type=int, default=2, help="DataLoader batch size.")
    args = parser.parse_args()
    
    train_shoulder_unet(
        data_dir=args.data_dir,
        model_save_path=args.save_path,
        epochs=args.epochs,
        batch_size=args.batch_size
    )
