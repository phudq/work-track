import { useEffect, useState } from "react";

export function useTabUrl() {
  const [currentURL, setCurrentURL] = useState<string>('')

  useEffect(() => {
    chrome.tabs?.query({ active: true, lastFocusedWindow: true }, ([currentTab]) => {
      const url = currentTab.url || ''
      setCurrentURL(url)
    })
  }, [])

  return currentURL
}
