import React, { useEffect, useState, useMemo } from 'react'

import { DropdownMenu, DropdownContent, DropdownTrigger } from './components/DropdownMenu'
import ListSource from './components/ListSource'
import Setting from './components/Setting'

import CheckIcon from './components/CheckIcon'

import { useTabUrl } from './hooks/useTabUrl'

import axios from 'axios'
import { useInfiniteQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { ignoreWords, updateState } from './api'

import './App.css'

axios.defaults.baseURL = 'http://localhost:8000'

axios.defaults.paramsSerializer = { indexes: null }

const STATE = {
  NEW: 0,
  FAMILIAR: 1,
  KNOWN: 2,
  MASTERED: 3
}

type WordState = typeof STATE[keyof typeof STATE]

type Word = {
  word: string
  freq: number
  state: WordState
}

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

async function fetchWords({ pageParam: offset = 0, queryKey }: { pageParam: number, queryKey: any[] }) {
  const [_, params] = queryKey

  return axios.get<{ data: Word[], nextOffset: number }>(`/${params.listId}`, {
    params: {
      limit: 100,
      offset,
      states: params.states,
    },
  }).then((res) => res.data)
}


export type ConfigType = {
  'enable-track'?: boolean,
  'filter-states'?: number[],
}

function App({ config }: { config: ConfigType }) {
  const [selectedWords, setSelectedWords] = useState<string[]>([])
  const [currentList, setCurrentList] = useState<number>(0)
  const [mapWordState, setMapWordState] = useState<{ [word: string]: WordState }>({})
  const [selectedWordsState, setSelectedWordsState] = useState<WordState[]>(config['filter-states'] || [])

  const currentURL = useTabUrl()

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    refetch,
    status,
  } = useInfiniteQuery({
    queryKey: ['words', {
      listId: currentList,
      states: selectedWordsState,
    }],
    queryFn: fetchWords,
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => lastPage.nextOffset,
  })

  useEffect(() => {
    chrome.storage?.local?.set({
      ...config,
      'filter-states': selectedWordsState,
    })
    console.log('set config', selectedWordsState)
  }, [selectedWordsState])

  const isEditPage = useMemo(() => {
    if (!currentURL) return false
    // Pathname match /lists/:id/edit
    const pathname = new URL(currentURL).pathname
    return /^\/lists\/\d+\/edit$/.test(pathname)
  }, [currentURL])

  const isListPage = useMemo(() => {
    if (!currentURL) return false
    // Pathname match /lists/:id
    const pathname = new URL(currentURL).pathname
    return /^\/lists\/\d+$/.test(pathname)
  }, [currentURL])

  const allWords = useMemo(() => {
    return data?.pages.map((page) => page.data.map((word) => word.word)).flat() || []
  }, [data])

  const toggleCheckAll = () => {
    if (selectedWords.length === allWords.length) {
      setSelectedWords([])
    } else {
      setSelectedWords(allWords)
    }
  }

  const addWordsToVocab = () => {
    if (isEditPage) {
      chrome.runtime?.sendMessage({ action: 'ADD_TO_VOCAB', words: selectedWords })
    }
  }

  const addWordsToLearned = () => {
    updateState(selectedWords.map(w => ({ word: w, state: 1 }))).then(() => {
      refetch()
      setSelectedWords([])
    })
  }

  // Listen ADD_TO_VOCAB_SUCCESS
  useEffect(() => {
    const listener = (request: any, sender: any, sendResponse: any) => {
      if (['ADD_TO_VOCAB_SUCCESS', 'ADD_TO_LEARNED_SUCCESS'].includes(request.action)) {
        refetch()
        setSelectedWords([])
      }
      if (request.action === 'CHECK_LEARNABLE_SUCCESS') {
        refetch()
      }
    }
    chrome.runtime?.onMessage.addListener(listener)
    return () => {
      chrome.runtime?.onMessage.removeListener(listener)
    }
  }, [])

  const onCheckWord = (word: string) => {
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter((w) => w !== word))
    } else {
      setSelectedWords([...selectedWords, word])
    }
  }

  return <div className={clsx('h-[40rem] overflow-y-auto')}>

    <div className='flex px-4 pt-4 space-x-2'>
      <ListSource current={currentList} onChange={setCurrentList} />
      <Setting words={allWords} />
    </div>

    <div className='px-4 py-2 flex justify-between items-center bg-white sticky top-0 border-b z-10'>
      <div className='flex justify-between items-center w-full z-10'>
        <input
          className='m-4 cursor-pointer'
          type="checkbox"
          onChange={toggleCheckAll}
          checked={selectedWords.length === allWords.length}
        />
        {
          selectedWords.length > 0 &&
          <DropdownMenu>
            <DropdownTrigger disabled={selectedWords.length === 0}>
              Actions {selectedWords.length > 0 && `(${selectedWords.length})`}
            </DropdownTrigger>
            <DropdownContent className="bg-white drop-shadow-lg rounded-md divide-y">
              {
                [
                  { label: 'Add to learned', onClick: addWordsToLearned },
                  { label: 'Add to vocab', onClick: addWordsToVocab },
                  {
                    label: 'Add to ignore', onClick: () => {
                      ignoreWords(selectedWords).then(() => {
                        refetch()
                        setSelectedWords([])
                      })
                    }
                  }
                ].map((item, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md"
                    onClick={item.onClick}
                  >{item.label}</div>
                ))
              }
            </DropdownContent>
          </DropdownMenu>
        }
        <div className='flex px-4 space-x-1 bg-white'>
          {
            Object.values(STATE).map((state) => {
              const isSelected = selectedWordsState.includes(state)
              return <div
                key={state}
                onClick={() => {
                  if (selectedWordsState.includes(state)) {
                    setSelectedWordsState(selectedWordsState.filter((s) => s !== state))
                  } else {
                    setSelectedWordsState([...selectedWordsState, state])
                  }
                }}
                className={clsx(
                  'flex items-center justify-center w-7 h-7 border-2 border-gray-300 rounded-md cursor-pointer',
                  'hover:opacity-80 hover:border-sky-300',
                  {
                    'border-gray-300': !isSelected,
                    '!border-blue-500': isSelected,
                    '!text-blue-500': isSelected,
                  }
                )}
              >{state}</div>
            })
          }
        </div>
      </div>
    </div>

    <div className='p-4'>
      <div className='min-h-[calc(100vh-12rem)] space-y-2'>
        {error && <div>{error.message}</div>}
        {isFetching ? <div className="animate-pulse space-y-2">
          {
            range(0, 20).map((i) => (
              <div key={i} className="h-12 px-4 py-3 rounded bg-slate-300"></div>
            ))
          }
        </div> :
          data?.pages.map((page, i) => (
            <React.Fragment key={i}>
              {page.data.map((word) => (
                <div
                  key={word.word}
                  className={clsx(
                    "flex justify-between select-none px-4 py-3 border rounded-md",
                  )}
                >
                  <div
                    className='flex items-center'
                    onClick={() => onCheckWord(word.word)}
                  >
                    <input
                      onChange={() => onCheckWord(word.word)}
                      checked={selectedWords.includes(word.word)}
                      className='mr-4 cursor-pointer'
                      type="checkbox"
                    />
                    <label className='text-lg cursor-pointer'>{word.word}</label>
                  </div>

                  <div className='space-x-1 hidden'>
                    <div className='w-12 h-12 bg-red-500 ef4444' />
                    <div className='w-12 h-12 bg-orange-500 f97316' />
                    <div className='w-12 h-12 bg-yellow-500 eab308' />
                    <div className='w-12 h-12 bg-green-500 22c55e' />
                  </div>

                  <div className='flex flex-none justify-end space-x-1'>
                    {
                      [
                        { state: STATE.NEW, color: '#ef4444' },
                        { state: STATE.FAMILIAR, color: '#f97316' },
                        { state: STATE.KNOWN, color: '#eab308' },
                        { state: STATE.MASTERED, color: '#22c55e' },
                      ].map(({ state, color }) => {
                        const active = mapWordState[word.word] === state || (word.state === state && !(word.word in mapWordState))
                        return <div
                          key={state}
                          onClick={() => {
                            if (
                              (

                                word.word in mapWordState &&
                                mapWordState[word.word] === state
                              ) || (
                                word.state === state
                              )
                            ) {
                              // delete
                              const { [word.word]: _, ...rest } = mapWordState
                              setMapWordState(rest)
                              return
                            }
                            setMapWordState({
                              ...mapWordState,
                              [word.word]: state as WordState
                            })
                          }}
                          className={clsx(
                            'w-7 h-7 rounded-full cursor-pointer text-gray-300 font-semibold border-2 border-gray-300',
                            'hover:opacity-80 hover:border-sky-300',
                            'relative flex items-center justify-center',
                            {
                              'prev-state-underline': word.word in mapWordState && mapWordState[word.word] !== state && word.state === state,
                            }
                          )}
                          style={{
                            color: active ? color : '#d1d5db',
                            borderColor: active ? color : '#d1d5db'
                          }}
                        >
                          {
                            state === STATE.MASTERED ?
                              <CheckIcon size={14} color={active ? color : '#d1d5db'} /> :
                              state
                          }
                        </div>
                      })}
                  </div>
                </div>
              ))}
            </React.Fragment>
          ))}
      </div>
      <div className='flex justify-center'>
        <button
          onClick={() => fetchNextPage()}
          disabled={!hasNextPage || isFetchingNextPage}
          className='bg-blue-500 text-white rounded-md px-4 my-2'
        >
          {isFetchingNextPage ? 'Loading more...' : hasNextPage ? 'Load More' : 'Nothing more to load'}
        </button>
      </div>
    </div>
    {
      Object.keys(mapWordState).length > 0 &&
      <div className='fixed inset-x-0 bottom-0 border-t bg-white p-4'>
        <button
          onClick={() => {
            updateState(Object.entries(mapWordState).map(([word, state]) => ({ word, state }))).then(() => {
              refetch()
              setMapWordState({})
            })
          }}
          className='block bg-green-500 text-white ml-auto'
        >Update state</button>
      </div>
    }
  </div>
}
export default App
