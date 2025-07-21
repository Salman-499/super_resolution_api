from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import torch
import torch.nn as nn
import numpy as np
import io
import tempfile
import os
import logging
from typing import List, Optional
import json

# Import HRNet model
from HRNet import HRNet

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Super Resolution API",
    description="Multi-frame super resolution using HRNet",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
hrnet_model = None
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# HRNet configuration
HRNET_CONFIG = {
    "encoder": {
        "in_channels": 2,
        "num_layers": 8,
        "kernel_size": 3,
        "channel_size": 64
    },
    "recursive": {
        "in_channels": 64,
        "num_layers": 8,
        "alpha_residual": True,
        "kernel_size": 3
    },
    "decoder": {
        "deconv": {
            "in_channels": 64,
            "out_channels": 64,
            "kernel_size": 4,
            "stride": 2
        },
        "final": {
            "in_channels": 64,
            "out_channels": 1,
            "kernel_size": 3
        }
    }
}

def load_hrnet_model(model_path: str = None):
    """Load HRNet model"""
    global hrnet_model
    try:
        # Initialize HRNet model
        hrnet_model = HRNet(HRNET_CONFIG)
        
        # Load weights if provided
        if model_path and os.path.exists(model_path):
            hrnet_model.load_state_dict(torch.load(model_path, map_location=device))
            logger.info(f"Loaded HRNet weights from {model_path}")
        
        hrnet_model.to(device)
        hrnet_model.eval()
        logger.info("HRNet model loaded successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to load HRNet model: {e}")
        return False

def preprocess_images(images: List[np.ndarray], target_size: tuple = (64, 64)) -> torch.Tensor:
    """Preprocess images for HRNet input"""
    processed_images = []
    
    for img in images:
        # Convert to grayscale if needed
        if len(img.shape) == 3:
            img = np.mean(img, axis=2)
        
        # Resize to target size
        img_pil = Image.fromarray(img.astype(np.uint8))
        img_resized = img_pil.resize(target_size, Image.LANCZOS)
        img_array = np.array(img_resized).astype(np.float32) / 255.0
        
        processed_images.append(img_array)
    
    # Stack images
    stacked = np.stack(processed_images, axis=0)
    tensor = torch.from_numpy(stacked).unsqueeze(1)  # Add channel dimension
    
    return tensor.to(device)

def postprocess_output(output: torch.Tensor) -> np.ndarray:
    """Postprocess HRNet output"""
    # Remove batch and channel dimensions
    output = output.squeeze(0).squeeze(0)
    
    # Convert to numpy and scale to [0, 255]
    output_np = output.cpu().detach().numpy()
    output_scaled = np.clip(output_np * 255, 0, 255).astype(np.uint8)
    
    return output_scaled

@app.on_event("startup")
async def startup_event():
    """Initialize the API on startup"""
    logger.info("🚀 Starting Super Resolution API...")
    
    # Get model path from environment variable
    model_path = os.getenv('MODEL_PATH')
    
    # Load model
    if load_hrnet_model(model_path):
        logger.info("✅ API ready for super resolution requests")
    else:
        logger.warning("⚠️ Failed to load model - API may not function properly")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Super Resolution API",
        "version": "1.0.0",
        "status": "running",
        "model_loaded": hrnet_model is not None
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "model_loaded": hrnet_model is not None,
        "gpu_available": torch.cuda.is_available(),
        "device": str(device)
    }

@app.post("/super_resolve")
async def super_resolve(
    files: List[UploadFile] = File(...),
    target_size: Optional[str] = "64,64",
    scale_factor: int = 3
):
    """Super resolve multiple low-resolution images"""
    if hrnet_model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="At least 2 images required for multi-frame super resolution")
    
    try:
        # Parse target size
        target_height, target_width = map(int, target_size.split(','))
        
        # Load and preprocess images
        images = []
        for file in files:
            contents = await file.read()
            img = Image.open(io.BytesIO(contents)).convert('L')  # Convert to grayscale
            img_array = np.array(img)
            images.append(img_array)
        
        logger.info(f"Processing {len(images)} images for super resolution")
        
        # Preprocess images
        input_tensor = preprocess_images(images, (target_width, target_height))
        
        # Create alpha tensor (all images are valid)
        batch_size, seq_len = input_tensor.shape[:2]
        alphas = torch.ones(batch_size, seq_len).to(device)
        
        # Run inference
        with torch.no_grad():
            output = hrnet_model(input_tensor, alphas)
        
        # Postprocess output
        result_image = postprocess_output(output)
        
        # Convert to PIL Image and then to bytes
        result_pil = Image.fromarray(result_image)
        img_bytes = io.BytesIO()
        result_pil.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        
        logger.info("Super resolution completed successfully")
        
        return StreamingResponse(
            img_bytes,
            media_type="image/png",
            headers={"Content-Disposition": "attachment; filename=super_resolved.png"}
        )
        
    except Exception as e:
        logger.error(f"Error in super_resolve: {e}")
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

@app.post("/super_resolve_single")
async def super_resolve_single(
    file: UploadFile = File(...),
    target_size: Optional[str] = "64,64",
    scale_factor: int = 3
):
    """Super resolve a single low-resolution image (duplicates it for multi-frame input)"""
    if hrnet_model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        # Parse target size
        target_height, target_width = map(int, target_size.split(','))
        
        # Load image
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert('L')  # Convert to grayscale
        img_array = np.array(img)
        
        # Duplicate image for multi-frame input
        images = [img_array] * 9  # Use 9 frames as in HRNet paper
        
        logger.info(f"Processing single image for super resolution (duplicated to {len(images)} frames)")
        
        # Preprocess images
        input_tensor = preprocess_images(images, (target_width, target_height))
        
        # Create alpha tensor (all images are valid)
        batch_size, seq_len = input_tensor.shape[:2]
        alphas = torch.ones(batch_size, seq_len).to(device)
        
        # Run inference
        with torch.no_grad():
            output = hrnet_model(input_tensor, alphas)
        
        # Postprocess output
        result_image = postprocess_output(output)
        
        # Convert to PIL Image and then to bytes
        result_pil = Image.fromarray(result_image)
        img_bytes = io.BytesIO()
        result_pil.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        
        logger.info("Single image super resolution completed successfully")
        
        return StreamingResponse(
            img_bytes,
            media_type="image/png",
            headers={"Content-Disposition": "attachment; filename=super_resolved_single.png"}
        )
        
    except Exception as e:
        logger.error(f"Error in super_resolve_single: {e}")
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002) 