import { differenceInDays } from "date-fns"
import { request } from "./factorioserver"

export class WikiPage {
  constructor(
    public pageid: string,
    public title: string,
    public content?: string,
    public pageidEn?: string,
    public revidCur?: string,
    public dateCur: Date = new Date(),
    public dateLatest: Date = new Date(),
    public timeDiffInDay?: number,
  ) {}
}

interface OutdatedPages {
  query: {
    categorymembers: [
      {
        pageid: string,
        title: string,
      }
    ]
  }
}

async function fetchOutdatedPages(): Promise<WikiPage[]> {
  const res = await request<OutdatedPages>({
    list: 'categorymembers',
    cmtitle: 'Category:Outdated_translations/ja',
    cmlimit: '500',
  })

  const pages: WikiPage[] = res['query']['categorymembers'].map((data) => new WikiPage(data['pageid'], data['title']))

  return pages
}

async function addRevisionIDtoEachPages(pages: WikiPage[]) {
  await addContents(pages)
  for (let i = 0; i < pages.length; i++) {
    pages[i].revidCur = extractRevinioIDfromContent(pages[i].content!)
  }
}

function extractRevinioIDfromContent(content: string): string {
  const regex = /revisionID=(\d+)/g
  const res = regex.exec(content)

  if (res == null) return ''

  console.assert(res.length == 2)
  return res[1]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function chunkArray(array: any[], size: number) {
  const chunks = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

async function addContents(pages: WikiPage[]) {
  const pagesChunks = chunkArray(pages, 50)
  const contentsPromises = pagesChunks.map(fetchContents50)
  const results = await Promise.all(contentsPromises)
  const res = results.reduce((res1, res2) => ({...res1, ...res2}))
  for (let i = 0; i < pages.length; i++) {
    const data = res[pages[i].pageid]
    pages[i].content = data['revisions'][0]['slots']['main']['*']
  }
}

interface Contents {
  query: {
    pages: {
      [pageid: string]: {
        revisions: [
          {
            slots: {
              main: {
                '*': string
              }
            }
          }
        ]
      }
    }
  }
}

interface ContentsSlim {
  [pageid: string]: {
    revisions: [
      {
        slots: {
          main: {
            '*': string
          }
        }
      }
    ]
  }
}

 
async function fetchContents50(pages: WikiPage[]): Promise<ContentsSlim> {
  console.assert(pages.length <= 50)
  const pageids = pages.map((page) => page['pageid'])
  const res =  await request<Contents>({
    prop: 'revisions',
    pageids: pageids.join('|'),
    rvprop: 'content',
    rvslots: 'main',
  })
  return res['query']['pages']
}

async function addCurrentDates(pages: WikiPage[]) {
  const pagesChunks = chunkArray(pages, 50)
  const curDatesPromises = pagesChunks.map(fetchCurrentDates50)
  const results = await Promise.all(curDatesPromises)
  const res = results.reduce((res1, res2) => ({...res1, ...res2}))
  for (let i = 0; i < pages.length; i++) {
    pages[i].dateCur = new Date(res[pages[i].revidCur!]['timestamp'])
    pages[i].pageidEn = res[pages[i].revidCur!]['pageidEn']
  }
}

interface CurDates {
  query: {
    pages: {
      [pageidEn: string]: {
        revisions: [
          {
            revid: string,
            timestamp: string,
          }
        ]
      }
    }
  }
}

interface CurDatesDict {
  [revid: string]: {
    pageidEn: string,
    timestamp: Date,
  }
}

 
async function fetchCurrentDates50(pages: WikiPage[]): Promise<CurDatesDict> {
  console.assert(pages.length <= 50)
  const revids = pages.map((page) => page.revidCur)
  const res =  await request<CurDates>({
    prop: 'revisions',
    revids: revids.join('|'),
    rvprop: 'timestamp|ids',
  })
  const curDates: CurDatesDict = {}
  for (const pageidEn in res['query']['pages']) {
    const revid = res['query']['pages'][pageidEn]['revisions'][0]['revid']
    const timestamp = new Date(res['query']['pages'][pageidEn]['revisions'][0]['timestamp'])
    curDates[revid] = {pageidEn: pageidEn, timestamp: timestamp}
  }
  return curDates
}

async function addLatestDates(pages: WikiPage[]) {
  const pagesChunks = chunkArray(pages, 50)
  const latestDatesPromises = pagesChunks.map(fetchLatestDates50)
  const results = await Promise.all(latestDatesPromises)
  const res = results.reduce((res1, res2) => ({...res1, ...res2}))
  for (let i = 0; i < pages.length; i++) {
    pages[i].dateLatest = new Date(res[pages[i].pageidEn!]['revisions'][0]['timestamp'])
  }
}

interface LatestDates {
  query: {
    pages: {
      [pageidEn: string]: {
        revisions: [
          {
            timestamp: string,
          }
        ]
      }
    }
  }
}

interface LatestDatesDict {
  [pageidEn: string]: {
    revisions: [
      {
        timestamp: string,
      }
    ]
  }
}

 
async function fetchLatestDates50(pages: WikiPage[]): Promise<LatestDatesDict> {
  console.assert(pages.length <= 50)
  const pageidsEn = pages.map((page) => page.pageidEn)
  const res =  await request<LatestDates>({
    prop: 'revisions',
    pageids: pageidsEn.join('|'),
    rvprop: 'timestamp',
  })
  return res['query']['pages']
}

function addTimeDiff(pages: WikiPage[]) {
  for (let i = 0; i < pages.length; i++) {
    pages[i].timeDiffInDay = differenceInDays(pages[i].dateLatest, pages[i].dateCur)
  }
}

export async function fetchOutdatedJaPagesInOldestOrder(): Promise<WikiPage[]> {
  const pages = await fetchOutdatedPages()
  await addRevisionIDtoEachPages(pages)
  await addCurrentDates(pages)
  await addLatestDates(pages)
  addTimeDiff(pages)

  pages.sort((a, b) => b.timeDiffInDay! - a.timeDiffInDay!)

  return pages
}
