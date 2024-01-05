import React from 'react'
import { useTabUrl } from '../hooks/useTabUrl'

import { getWordsFromYbVideo } from '../api'
import clsx from 'clsx'

export default function GetYoutubeWords() {
  const [loading, setLoading] = React.useState(false)
  const currentURL = useTabUrl()
  //https://www.youtube.com/watch?v=[videoId]
  if (!currentURL || !currentURL.includes('youtube.com/watch?v=')) {
    return null
  }

  const onClick = async () => {
    if (loading) return
    setLoading(true)
    getWordsFromYbVideo(currentURL).finally(() => {
      setLoading(false)
    })
  }

  return <button
    className={clsx({
      'cursor-not-allowed': loading,
    })}
    onClick={onClick}
  >
    {loading ? 'Loading...' : 'Get words'}
  </button>
}
