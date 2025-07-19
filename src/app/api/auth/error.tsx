import { useRouter } from 'next/router'

export default function ErrorPage() {
  const router = useRouter()
  const { error } = router.query
  
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Authentication Error</h1>
      <p className="text-red-500">{error}</p>
    </div>
  )
}