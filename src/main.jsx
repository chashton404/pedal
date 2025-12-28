import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { WebGPUCanvas } from './WebGPUCanvas.jsx'

createRoot(document.getElementById('root')).render(

  <div className='canvas-container'>
      <Suspense fallback={false}>
      <WebGPUCanvas />
      </Suspense>
      <div className="version">v0.3.4</div>
    </div>
)
