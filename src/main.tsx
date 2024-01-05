import React from 'react'
import ReactDOM from 'react-dom/client'
import App, { ConfigType } from './App'
import './index.css'

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

const queryClient = new QueryClient()

const defaultConfig = {
  'enable-track': true,
  'filter-states': [0, 1, 2, 3],
}

function Root() {
  const [config, setConfig] = React.useState<ConfigType>({})

  React.useEffect(() => {
    chrome.storage?.local?.get(
      ['enable-track', 'filter-states'],
    ).then((data) => {
      setConfig({ ...defaultConfig, ...data })
      console.log('config', data, defaultConfig)
    })

    if (!chrome.storage?.local) {
      setConfig(defaultConfig)
    }
  }, [])

  if (!Object.keys(config).length) {
    return null
  }

  return (
    <QueryClientProvider client={queryClient}>
      {Object.keys(config).length && <App config={config} />}
    </QueryClientProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<Root />)
