# Super-Resolution API

API and web front ends from my final year project at NUST, *Super-Resolution for Early Detection of Forest Health Decline* (TUKL Lab, supervised by Prof. Faisal Shafait; with Hanan Abid).

The project used multi-image super-resolution to sharpen 10 m Sentinel-2 imagery of forests in Pakistan, using 1 m PRSS-1 imagery from SUPARCO as the high-resolution reference. We then looked at fire damage with vegetation indices (EVI, MSAVI2) and segmentation.

## Model

The model is **HighRes-net** ([Deudon et al., 2020](https://arxiv.org/abs/2002.06460)), which fuses several low-resolution images of the same scene into one sharper image. `HRNet.py` is the PyTorch implementation from the [original HighRes-net code](https://github.com/ElementAI/HighRes-net), where the model class is named `HRNet`. It is not the HRNet pose and segmentation network.

The API works on grayscale images. Each input is resized (64×64 by default) before the frames are fused. The model settings are at the top of `super_resolution_api.py`.

## Endpoints

| Method | Path | Input | Output |
|---|---|---|---|
| GET | `/health` | | Whether the model is loaded |
| POST | `/super_resolve` | 2 or more images of the same scene | Super-resolved PNG |
| POST | `/super_resolve_single` | One image | Super-resolved PNG |

## Front ends

- `frontend/`: a Next.js page for uploading images and comparing them before and after.
- `client/`: the static dashboard from the project's web portal. It shows burned area by forest division and Google Earth Engine map layers and index time series. `utils.py` has the Earth Engine helpers its back end used; the back-end server itself is not in this repo.

## Running it

Model weights are not included. Set `MODEL_PATH` to a trained HighRes-net checkpoint.

```bash
docker-compose up --build super-resolution   # API on http://localhost:8002
cd frontend && npm install && npm run dev    # Next.js front end
```

## Credits

HighRes-net: M. Deudon, A. Kalaitzis, I. Goytom, M. R. Arefin, Z. Lin, K. Sankaran, V. Michalski, S. E. Kahou, J. Cornebise and Y. Bengio, *HighRes-net: Recursive Fusion for Multi-Frame Super-Resolution of Satellite Imagery*, 2020.
