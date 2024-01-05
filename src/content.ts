import axios from "axios"
import browser from "webextension-polyfill"
import { correctWords, getList, saveWords, syncList } from "./voc-api"

import { get } from "./utils"

axios.defaults.headers.post['Content-Type'] = 'application/json'
axios.defaults.baseURL = 'http://localhost:8000'

// NEW = 0
// LEARNED = 1
// LEARNING = 2
// IGNORED = 3

// Helpers
export function debounce(func: (...arg: any[]) => void, timeout = 300) {
  let timer: number
  return (...args: any[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      // @ts-ignore
      func.apply(this, args)
    }, timeout)
  }
}

function send(data: object) {
  axios.post('/', data).then(res => {
    console.log(res, 'CHECK')
  }).catch(err => console.error(err, 'CHECK'))
}

// Handle
const handleSelection = debounce((event: Event) => {
  const selection = window.getSelection()
  if (!selection) return
  const content = selection.toString().trim()
  if (content === '') return

  let context = selection.anchorNode?.textContent ?? ''
  // selection.

  if (context.length < content.length) {
    context = content
  }

  if (context.length > 1000) return

  const words = content
    .replace(/[^A-Za-z\s]+/g, '')
    .split(/\s+/)
    .map((word) => word?.toLowerCase())
    .filter((word) => !!word)

  chrome.storage?.local?.get('enable-track', (res: any) => {
    if (!res?.['enable-track']) return
    send({ words, context, metadata: { site: window.location.href } })
  })

}, 1000)

// Attach
// document.addEventListener('mouseup', handleSelection)
document.addEventListener('selectionchange', handleSelection)

async function updateWordsState(words: { word: string, state: number }[]) {
  console.log(JSON.stringify(words, null, 2))
  return axios.post('/update-state', { words })
}


browser.runtime.onMessage.addListener((message: any) => {
  if (message.action === 'ADD_TO_VOCAB') {
    if (!message.words || !message.words.length) {
      console.error('No words to add')
      return
    }

    correctWords(message.words).then(async ({ wordsToAdd, wordsRejection }) => {
      await updateWordsState(
        wordsRejection.map((word) => ({ word, state: 3 })).concat(
          wordsToAdd.map((word) => ({ word, state: 2 }))
        )
      ).then(() => {
        // ADD_TO_VOCAB_SUCCESS
        saveWords(wordsToAdd)
        browser.runtime.sendMessage({ action: 'ADD_TO_VOCAB_SUCCESS' })
      })
    })
  }

  if (message.action === 'GET_WORDS_FROM_YB_VIDEO') {
    const ytdApp = document.querySelector('ytd-app')

    if (!ytdApp) {
      console.error('No ytd-app found')
      return
    }

    const captionTracks = get(
      ytdApp,
      [
        'data',
        'playerResponse',
        'captions',
        'playerCaptionsTracklistRenderer',
        'captionTracks',
      ],
      []
    )
    const check = get(
      window,
      [
        'ytInitialPlayerResponse',
        'captions',
        'playerCaptionsTracklistRenderer',
        'captionTracks',
      ],
      []
    )

    if (!captionTracks.length) {
      console.error('No caption tracks found')
      return
    }

    const captionTrack = captionTracks.find((c: any) => c.languageCode === 'en')

    if (!captionTrack) {
      console.error('No caption track en found')
      return
    }
  }

  if (message.action === 'SYNC_VOCAB') {
    syncList()
  }

  if (message.action === 'CHECK_LEARNABLE') {
    if (!message.words || !message.words.length) {
      console.error('No words to check')
      return
    }

    correctWords(message.words).then(async ({ wordsToAdd, wordsRejection }) => {
      await updateWordsState(wordsRejection.map((word) => ({ word, state: 3 }))).then(() => {
        browser.runtime.sendMessage({ action: 'ADD_TO_VOCAB_SUCCESS' })
      })
    })
  }

})
