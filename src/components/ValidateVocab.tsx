import { useTabUrl } from '../hooks/useTabUrl'

export default function ValidateVocab({ words }: { words: string[] }) {
  const currentURL = useTabUrl()

  if (!currentURL || !currentURL.includes('vocabulary.com')) {
    return null
  }

  if (!words.length) return null

  const checkLeanable = () => {
    chrome.runtime?.sendMessage({ action: 'CHECK_LEARNABLE', words })
  }

  return <button className='mx-2' onClick={() => checkLeanable()}>Validate words</button>
}
