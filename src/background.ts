import browser from 'webextension-polyfill';

const url = 'https://www.vocabulary.com/lists/8987753/edit';

browser.runtime.onMessage.addListener((message) => {
  if (message.action === 'ADD_TO_VOCAB') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      // @ts-ignore
      chrome.tabs.sendMessage(tabs[0].id, { action: 'ADD_TO_VOCAB', words: message.words });
    });
  }
  if (message.action === 'CHECK_LEARNABLE') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      // @ts-ignore
      chrome.tabs.sendMessage(tabs[0].id, { action: 'CHECK_LEARNABLE', words: message.words });
    });
  }
  if (message.action === 'SYNC_VOCAB') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      // @ts-ignore
      chrome.tabs.sendMessage(tabs[0].id, { action: 'SYNC_VOCAB' });
    });
  }

  if (message.action === 'GET_WORDS_FROM_YB_VIDEO') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log('GET_WORDS_FROM_YB_VIDEO'.repeat(10));
      // @ts-ignore
      chrome.tabs.sendMessage(tabs[0].id, { action: 'GET_WORDS_FROM_YB_VIDEO' });
    });
  }

  // ADD_TO_VOCAB_SUCCESS
  // browser.runtime.sendMessage({ action: 'ADD_TO_VOCAB_SUCCESS' })
});
