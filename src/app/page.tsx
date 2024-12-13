import Link from "next/link";

export default function Home() {

  return (
    <div>
      <main className="container p-4">
        <ul className="list-disc list-inside space-y-2">
          <li><Link href="convtext">ConvText</Link></li>
        </ul>
      </main>
    </div>
  )
}
