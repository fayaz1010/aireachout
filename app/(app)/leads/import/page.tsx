'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { ArrowLeft, Upload, FileText, AlertCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

export default function ImportLeadsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [projectId, setProjectId] = useState('')

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    redirect('/login')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast.error('Please select a CSV file')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile || !projectId) {
      toast.error('Please select a file and project')
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('projectId', projectId)

      const response = await fetch('/api/leads/import', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Successfully imported ${data.count} leads`)
        router.push('/leads')
      } else {
        toast.error(data.error || 'Failed to import leads')
      }
    } catch (error) {
      toast.error('An error occurred during import')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">      
      <main className="max-w-4xl mx-auto py-6 px-4">
        <PageHeader
          title="Import Leads"
          description="Upload your existing prospect list from a CSV file."
          action={
            <Link href="/leads">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Leads
              </Button>
            </Link>
          }
        />

        <div className="mt-8 space-y-6">
          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                CSV Format Requirements
              </CardTitle>
              <CardDescription>
                Make sure your CSV file includes the following columns for best results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Required Columns:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• email (required)</li>
                    <li>• firstName</li>
                    <li>• lastName</li>
                    <li>• companyName</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Optional Columns:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• jobTitle</li>
                    <li>• phone</li>
                    <li>• website</li>
                    <li>• location</li>
                    <li>• industry</li>
                    <li>• linkedinUrl</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload Form */}
          <Card>
            <CardHeader>
              <CardTitle>Upload CSV File</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleImport} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="projectId">Select Project *</Label>
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose project to import leads to" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="demo">Demo Project (placeholder)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="csvFile">CSV File *</Label>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="csvFile"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">CSV files only</p>
                        {selectedFile && (
                          <p className="mt-2 text-sm text-blue-600 font-medium">
                            Selected: {selectedFile.name}
                          </p>
                        )}
                      </div>
                      <input
                        id="csvFile"
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={isLoading}
                      />
                    </label>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Import Notes</h4>
                      <ul className="text-sm text-blue-700 mt-1 space-y-1">
                        <li>• Duplicate emails will be skipped automatically</li>
                        <li>• AI analysis will be applied to imported leads</li>
                        <li>• All imported leads will be tagged with "imported"</li>
                        <li>• Maximum file size: 10MB</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Link href="/leads">
                    <Button type="button" variant="outline" disabled={isLoading}>
                      Cancel
                    </Button>
                  </Link>
                  <Button 
                    type="submit" 
                    disabled={!selectedFile || !projectId || isLoading}
                  >
                    {isLoading ? 'Importing...' : 'Import Leads'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
