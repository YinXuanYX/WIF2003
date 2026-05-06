import { useEffect, useState } from 'react'
import pigIcon from '../assets/PigIcon.png'

export default function Splash(){
  const [fade, setFade] = useState(false)
  const [removed, setRemoved] = useState(false)

  useEffect(()=>{
    // small delay to ensure initial paint, then start fade-out (1s)
    const t1 = setTimeout(()=> setFade(true), 80)
    // remove from DOM after fade completes
    const t2 = setTimeout(()=> setRemoved(true), 80 + 1000)
    return ()=>{ clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (removed) return null

  return (
    <div style={{
      position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
      background: '#000', zIndex:9999, pointerEvents:'none',
      opacity: fade ? 0 : 1, transition:'opacity 1s ease'
    }}>
      <div style={{width:240, height:240, display:'flex', alignItems:'center', justifyContent:'center'}}>
        <img src={pigIcon} alt="splash" style={{width:'100%', height:'100%', objectFit:'contain', display:'block'}} />
      </div>
    </div>
  )
}
