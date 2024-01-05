const listID = "8987753";
const baseURL = "https://www.vocabulary.com";

function makeFormData(obj: any) {
  const formData = new FormData();
  Object.keys(obj).forEach((key) => formData.append(key, obj[key]));
  return formData;
}

type ResultValidation = {
  status: number;
  result: {
    words: {
      word: string;
      found: boolean;
      learnable: boolean;
    }[];
  };
}

export async function correctWords(words: string[]) {
  return await fetch(`${baseURL}/lists/validate.json`, {
    body: new URLSearchParams(words.map((word) => `words[]=${word}`).join("&")),
    method: "post"
  }).then(async (response) => {
    const res = await response.json() as ResultValidation;
    const wordsToAdd: string[] = [];
    const wordsRejection: string[] = [];
    res.result.words.forEach((word) => {
      if (word.learnable) {
        wordsToAdd.push(word.word);
      } else {
        wordsRejection.push(word.word);
      }
    });
    return {
      wordsToAdd,
      wordsRejection
    };
  });
}

export function saveWords(words: string[]) {
  const currentWordList = []
  const wordListElements = document.querySelectorAll(".page_wordlist.edit li.entry:not(.empty)");
  for (const wordListElement of wordListElements) {
    currentWordList.push(wordListElement.getAttribute("data-word"));
  }

  const formElement = document.getElementById("listForm") as HTMLFormElement;
  const inputElement = document.querySelector('input[name="wordlist.words"]');
  if (!formElement || !inputElement) {
    throw new Error("No form or input element");
  }
  const filteredWords = [...new Set([...currentWordList, ...words])]
  inputElement.setAttribute("value", JSON.stringify(filteredWords.map((word) => ({ word, example: null }))));
  formElement.submit();
}

export async function getList() {
  return await fetch(`${baseURL}/lists/load.json`, {
    body: makeFormData({ id: listID }),
    method: "post"
  }).then(async (response) => {
    const res = await response.json();
    console.log(res);
    return res;
  });
}

export async function syncList() {
  const wordListElements = document.querySelectorAll("#wordlist li");

  const results = []
  for (const wordListElement of wordListElements) {
    results.push({
      word: wordListElement.getAttribute("word"),
      progress: wordListElement.getAttribute("prog"),
    })
  }
  console.log(results);
}
