# 🛰️ Super Resolution API

[![Python](https://img.shields.io/badge/Python-3.9%2B-blue?logo=python)](https://www.python.org/) [![FastAPI](https://img.shields.io/badge/FastAPI-API-green?logo=fastapi)](https://fastapi.tiangolo.com/) [![HRNet](https://img.shields.io/badge/HRNet-superres-purple?logo=github)](https://github.com/HRNet) [![Docker](https://img.shields.io/badge/Docker-ready-blue?logo=docker)](https://www.docker.com/)

## Overview

**Super Resolution API** is a high-performance image enhancement system for satellite and aerial imagery. It leverages multi-frame super resolution using HRNet to reconstruct high-quality, high-detail images from multiple low-resolution inputs. Designed for geospatial, remote sensing, and scientific applications, the API supports both single-image and multi-frame enhancement workflows, and is fully containerized for easy deployment.

---

## 🚀 Key Features
- **Multi-frame super resolution** for maximum detail recovery
- **HRNet** backbone for state-of-the-art image enhancement
- **Single-image fallback**: Enhance even with one input
- **FastAPI** backend with async endpoints and auto-generated docs
- **Dockerized** for seamless deployment
- **Nginx reverse proxy** for production
- **Flexible**: Supports batch processing and custom target sizes

---

## 🏗️ Architecture
- **Model**: HRNet (PyTorch, multi-frame super resolution)
- **Backend**: FastAPI (Python 3.9+)
- **Deployment**: Docker Compose, Nginx (optional)
- **Workflow**:
  1. Upload 2+ low-res images (or single image)
  2. Model fuses frames for super-res output
  3. Return enhanced PNG image

---

## 📦 API Endpoints
- `GET /` — API info
- `GET /health` — Health check
- `POST /super_resolve` — Multi-frame super resolution (2+ images)
- `POST /super_resolve_single` — Single image super resolution

---

## 💡 Example Use Cases
- **Satellite imagery**: Enhance resolution for mapping, analysis, or visualization
- **Remote sensing**: Improve scientific data quality
- **Aerial surveys**: Sharpen drone or aircraft images
- **Research**: Benchmarking, dataset creation

---

## 🏃‍♂️ Quickstart

### Prerequisites
- Docker & Docker Compose
- Model files in the `models/` directory

### 1. Build & Run (API only)
```bash
docker-compose up --build super-resolution
```

### 2. Build & Run (API + nginx proxy)
```bash
docker-compose up --build
```
- API: http://localhost:8002/
- Via nginx: http://localhost/super-resolution/

---

## 📁 File Structure
```
super_resolution_api/
├── super_resolution_api.py
├── HRNet.py
├── utils.py
├── Dockerfile.super-resolution
├── requirements.super-resolution.txt
├── models/
├── docker-compose.yml
├── nginx.conf
└── README.md
```

---

## 📈 Example Request
```bash
curl -X POST "http://localhost:8002/super_resolve_single" -F "file=@test.jpg"
```

---

> _Sharper images. Smarter science. Built for the future of geospatial AI._ 