'use client'
import { Dispatch, SetStateAction, useState } from "react"

export default function Page() {
  const [inText, setInText] = useState('')
  const [outText, setOutText] = useState('')

  function convert(): string {
    const convedText = convertText(inText)
    setOutText(convedText)
    return convedText
  }

  function openTranslatorPage(url: string, text: string) {
    const request_url = url + encodeURI(text)
    window.open(request_url, "_blank")
  }

  interface ButtonData {
    text: string
    func: () => void
  }

  const buttonDatas: ButtonData[] = [
    {
      text: 'Convert', 
      func: () => {
        convert()
      }
    },
    {
      text: 'Copy', 
      func: () => {
        navigator.clipboard.writeText(outText)
      }
    },
    {
      text: 'Google Translator', 
      func: () => {
        const convedText = convert()
        const url = "https://translate.google.co.jp/?op=translate&sl=en&tl=ja&text="
        openTranslatorPage(url, convedText)
      }
    },
    {
      text: 'DeepL Translator', 
      func: () => {
        const convedText = convert()
        const url = "https://www.deepl.com/translator#en/ja/"
        openTranslatorPage(url, convedText)
      }
    },
    {
      text: 'Clear',
      func: () => {
        setInText('')
        setOutText('')
      }
    },
  ]

  const myTextarea = (value: string, setFunc: Dispatch<SetStateAction<string>>) =>
        <textarea value={value} onChange={(e) => {setFunc(e.target.value)}}
            className="h-48 text-foreground dark:text-background bg-main-50 rounded ps-2 pt-1 border border-foreground"/>

  return (
    <div>
      <main className="container p-4 flex flex-col gap-4">
        {myTextarea(inText, setInText)}

        <div className="flex flex-row gap-4">
          {buttonDatas.map((data) => 
            <button key={data.text} type="button" onClick={data.func}
              className="text-foreground bg-background border border-foreground hover:bg-main-200 rounded px-3 py-2.5 dark:hover:bg-main-600" >
              {data.text}
            </button>
          )}
        </div>

        {myTextarea(outText, setOutText)}
      </main>
    </div>
  )
}

function convertText(text: string): string {
  console.log(text)
  text = text.replace(/-\n/gm, '')
  text = text.replace(/- /gm, '')

  text = text.replace(/\r\n/gm, ' ')
  text = text.replace(/\n/gm, ' ')
  text = text.replace(/\r/gm, ' ')
  text = text.replace(/\s+/gm, ' ')

  text = text.replace(/Fig\./gm, 'Figure')
  text = text.replace(/Sec\./gm, 'Section')
  text = text.replace(/Eq\./gm, 'Equation')

  text = text.replace(/e\.g\./gm, 'e,g,')
  text = text.replace(/i\.e\./gm, 'i,e,')
  text = text.replace(/et al\./gm, 'et al,')
  text = text.replace(/(\d+)\.(\d+)/gm, '$1,$2')
  text = text.replace(/\.\.\./gm, ',,,')

  text = text.replace(/\./gm, '.\n\n')

  text = text.replace(/e,g,/gm, 'e.g.')
  text = text.replace(/i,e,/gm, 'i.e.')
  text = text.replace(/et al,/gm, 'et al.')
  text = text.replace(/(\d+),(\d+)/gm, '$1.$2')
  text = text.replace(/,,,/gm, '...')

  text = text.replace(/\.\n\n\s/gm, '.\n\n')
  text = text.trim()

  return text
}


