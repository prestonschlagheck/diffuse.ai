import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limit'
import { requireAuth, unauthorizedResponse } from '@/lib/security/authorization'
import { validateFileType, validateFileSize, validateFileName } from '@/lib/security/validation'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Extract text from PDF - import the lib directly to avoid test file issue
async function extractFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Use the lib file directly to avoid the test file loading bug
    const pdfParse = require('pdf-parse/lib/pdf-parse.js')
    const data = await pdfParse(buffer)
    return data.text?.trim() || ''
  } catch (error) {
    console.error('PDF parse error:', error)
    throw new Error('Failed to parse PDF')
  }
}

// Extract text from DOCX
async function extractFromDOCX(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer })
  return result.value.trim()
}

// Extract text from TXT (just decode the buffer)
function extractFromTXT(buffer: Buffer): string {
  return buffer.toString('utf-8').trim()
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - file upload
    const rateLimitResponse = await checkRateLimit(request, 'fileUpload')
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // Authentication check
    try {
      await requireAuth()
    } catch {
      return unauthorizedResponse()
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file name
    let sanitizedFileName
    try {
      sanitizedFileName = validateFileName(file.name)
    } catch (error: any) {
      return NextResponse.json(
        { error: 'Invalid file name', message: error.message },
        { status: 400 }
      )
    }

    // Validate file type and size
    const allowedExtensions = ['pdf', 'docx', 'txt']
    let fileType
    try {
      const validation = validateFileType(sanitizedFileName, allowedExtensions)
      fileType = validation.type
      
      // Validate file size based on type
      if (fileType === 'pdf' || fileType === 'docx') {
        validateFileSize(file.size, 'pdf')
      } else {
        validateFileSize(file.size, 'txt')
      }
    } catch (error: any) {
      return NextResponse.json(
        { error: 'File validation failed', message: error.message },
        { status: 400 }
      )
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let extractedText = ''

    // Extract text based on file type
    switch (fileType) {
      case 'pdf':
        try {
          extractedText = await extractFromPDF(buffer)
        } catch (pdfError) {
          console.error('PDF extraction error:', pdfError)
          return NextResponse.json(
            { error: 'Failed to extract text from PDF. The file may be corrupted or password-protected.' },
            { status: 400 }
          )
        }
        break
      case 'docx':
        try {
          extractedText = await extractFromDOCX(buffer)
        } catch (docxError) {
          console.error('DOCX extraction error:', docxError)
          return NextResponse.json(
            { error: 'Failed to extract text from DOCX file.' },
            { status: 400 }
          )
        }
        break
      case 'txt':
        extractedText = extractFromTXT(buffer)
        break
      default:
        return NextResponse.json(
          { error: 'Unsupported file type' },
          { status: 400 }
        )
    }

    if (!extractedText) {
      return NextResponse.json(
        { error: 'No text could be extracted from the file' },
        { status: 400 }
      )
    }

    const response = NextResponse.json({
      success: true,
      text: extractedText,
      file_name: sanitizedFileName,
      file_size: file.size,
      file_type: fileType
    })

    // Add rate limit headers
    const rateLimitHeaders = getRateLimitHeaders(request, 'fileUpload')
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response

  } catch (error: any) {
    console.error('Error extracting text:', error)
    
    // Don't expose internal error details
    return NextResponse.json(
      { error: 'Failed to extract text from file' },
      { status: 500 }
    )
  }
}
