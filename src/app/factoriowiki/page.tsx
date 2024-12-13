'use client'

import { useEffect, useState } from "react";
import { fetchOutdatedJaPagesInOldestOrder, WikiPage } from "./factoriowiki";
import { format } from "date-fns"
import Link from "next/link"

const WIKI_URL = 'https://wiki.factorio.com/'

export default function Page() {
  const [pages, setPages] = useState<WikiPage[]>([])

  useEffect(() => {
    async function fetchPages() {
      const fetchedPages = await fetchOutdatedJaPagesInOldestOrder()
      setPages(fetchedPages)
    }
    fetchPages()
  }, [])

  if (!pages) return <div>Loading...</div>

  return (
    <div>
      <main className="container p-4">
        {WikiPagesTable(pages)}
      </main>
    </div>
  );
}

function WikiPagesTable(pages: WikiPage[]) {
  return (
    <table className="table-auto [&_th]:p-4 [&_td]:p-2 border-2 border-foreground">
      <thead className="bg-main-200 dark:bg-main-600 border-2 border-foreground">
        <tr>
          <th></th>
          <th>Title</th>
          <th>JA Page ID</th>
          <th>EN Page ID</th>
          <th>RevID</th>
          <th>Current Date</th>
          <th>Latest Date</th>
          <th>Oldness[Day]</th>
        </tr>
      </thead>
      <tbody className="bg-main-100 dark:bg-main-700">
        {pages.map((page, index) => 
          <tr key={page.pageid} className="border-b border-foreground">
            <td>{index}</td>
            <td className="font-bold underline"><Link href={WIKI_URL + page.title.replace(' ', '_')} target="_blank">{page.title}</Link></td>
            <td>{page.pageid}</td>
            <td>{page.pageidEn}</td>
            <td>{page.revidCur}</td>
            <td>{format(page.dateCur, "yyyy/MM/dd HH:mm")}</td>
            <td>{format(page.dateLatest, "yyyy/MM/dd HH:mm")}</td>
            <td className="text-right">{page.timeDiffInDay}</td>
          </tr>
        )}
      </tbody>
    </table>
  )
}
