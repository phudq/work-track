import axios from "axios";
axios.defaults.baseURL = 'http://localhost:8000'

export async function updateState(words: { word: string, state: number }[]) {
  return await axios.post('/update-state', { words })
}

export async function ignoreWords(words: string[]) {
  return await axios.post('/update-state', {
    words: words.map(word => ({ word, state: 3 }))
  })
}

export async function getWordsFromYbVideo(url: string) {
  return await axios.post('/yb-track', {}, {
    params: { url }
  })
}

