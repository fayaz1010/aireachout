
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, FileX } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Card className="border-0 shadow-xl">
          <CardContent className="p-12 text-center">
            <FileX className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Blog Post Not Found
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
              The blog post you&apos;re looking for doesn&apos;t exist or may have been moved.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/blog">
                <Button className="group">
                  <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  Back to Blog
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline">
                  Go Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
