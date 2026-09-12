import { useEffect } from 'react'
import { createPageSnapController } from '../lib/pageSnap'

export default function PageSnap({ children }) {
  useEffect(() => createPageSnapController(), [])
  return children
}
