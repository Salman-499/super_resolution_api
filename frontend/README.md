# Super Resolution Frontend

A modern Next.js frontend for the Super Resolution image enhancement API.

## Features

- **Image Enhancement**: Upload and enhance images using AI models
- **Multiple Models**: Support for HRNet, ESRGAN, and SRCNN
- **Before/After Comparison**: Side-by-side comparison of original and enhanced images
- **Real-time Processing**: Live processing status and results
- **Download Enhanced Images**: Save enhanced images locally
- **Responsive Design**: Modern UI with Tailwind CSS and Framer Motion

## Tech Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations and transitions
- **Lucide React**: Beautiful icons
- **Axios**: HTTP client for API calls

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd super_resolution_api/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## API Integration

The frontend is designed to work with the Super Resolution API running on port 8002. Make sure the API is running before testing the frontend.

### Environment Variables

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8002
```

## Project Structure

```
frontend/
├── app/
│   ├── globals.css          # Global styles with Tailwind
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Main enhancement page
├── public/                  # Static assets
├── package.json             # Dependencies and scripts
├── tailwind.config.js       # Tailwind configuration
├── next.config.js           # Next.js configuration
└── tsconfig.json           # TypeScript configuration
```

## Features Overview

### Image Upload
- Drag and drop or click to upload
- Support for PNG, JPG, TIFF formats
- File size validation (up to 10MB)
- Image preview before processing

### Enhancement Process
- Model selection (HRNet, ESRGAN, SRCNN)
- Real-time processing status
- Progress indicators
- Processing time estimation

### Results Display
- Side-by-side comparison view
- Enhanced image with resolution info
- Quality metrics and improvements
- Download enhanced image

### Model Information
- Model accuracy comparison
- Processing statistics
- Performance metrics
- Technical details

## Supported Models

### HRNet (High-Resolution Network)
- **Accuracy**: 94%
- **Best for**: High-quality enhancement
- **Processing Time**: ~3.2s

### ESRGAN (Enhanced Super-Resolution GAN)
- **Accuracy**: 91%
- **Best for**: Realistic texture enhancement
- **Processing Time**: ~4.1s

### SRCNN (Super-Resolution CNN)
- **Accuracy**: 89%
- **Best for**: Fast processing
- **Processing Time**: ~2.8s

## Customization

### Colors
The theme uses purple colors for AI/ML focus. Modify `tailwind.config.js` to change the color scheme.

### API Endpoints
Update the API calls in `page.tsx` to match your backend endpoints.

### Model Configuration
Add or modify models in the `modelInfo` array in `page.tsx`.

## Deployment

### Docker
```bash
docker build -t super-resolution-frontend .
docker run -p 3000:3000 super-resolution-frontend
```

### Vercel
1. Connect your repository to Vercel
2. Set environment variables
3. Deploy automatically

## Performance Optimization

- Image compression before upload
- Lazy loading for large images
- Optimized bundle size
- Efficient state management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the AI APIs portfolio. 