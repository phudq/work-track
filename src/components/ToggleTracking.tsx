import React, { useEffect, useState } from 'react'
import clsx from 'clsx'

export default function ToggleTracking({ className = '' }: { className?: string }) {
  const [enable, setEnable] = useState(false)

  useEffect(() => {
    chrome.storage?.local?.get('enable-track', (res: any) => {
      setEnable(res['enable-track'])
    })
  }, [])

  useEffect(() => {
    chrome.storage?.local?.set({ 'enable-track': enable })
  }, [enable])

  return <div className={clsx('cursor-pointer flex items-center', className)} >
    <label className='mr-2 select-none' htmlFor='enable-track'>Enable Track</label>
    <input
      id='enable-track'
      className=''
      onChange={(e) => {
        setEnable(e.target.checked)
      }}
      checked={enable}
      type="checkbox"
    />
  </div>
}

