import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const N8N_WEBHOOK_URL = 'https://ushealthconnect.app.n8n.cloud/webhook/diffuse-workflow'

// Helper to extract the actual article JSON from various n8n/OpenAI response formats
function extractArticleContent(n8nResult: any): string {
  try {
    // Case 1: Direct output string (Simplify Output ON)
    if (typeof n8nResult.output === 'string') {
      return n8nResult.output
    }

    // Case 2: Array response from OpenAI (Simplify Output OFF)
    if (Array.isArray(n8nResult)) {
      const firstItem = n8nResult[0]
      
      // Check for nested output array with message content
      if (firstItem?.output && Array.isArray(firstItem.output)) {
        const message = firstItem.output.find((o: any) => o.type === 'message')
        if (message?.content && Array.isArray(message.content)) {
          const textContent = message.content.find((c: any) => c.type === 'output_text')
          if (textContent?.text) {
            return textContent.text
          }
        }
      }
      
      // Check for direct content
      if (firstItem?.content) {
        if (Array.isArray(firstItem.content)) {
          const textContent = firstItem.content.find((c: any) => c.type === 'output_text' || c.text)
          if (textContent?.text) {
            return textContent.text
          }
        }
        return typeof firstItem.content === 'string' ? firstItem.content : JSON.stringify(firstItem.content)
      }
    }

    // Case 3: Object with output array
    if (n8nResult.output && Array.isArray(n8nResult.output)) {
      const message = n8nResult.output.find((o: any) => o.type === 'message')
      if (message?.content && Array.isArray(message.content)) {
        const textContent = message.content.find((c: any) => c.type === 'output_text')
        if (textContent?.text) {
          return textContent.text
        }
      }
    }

    // Case 4: Direct content property
    if (n8nResult.content) {
      return typeof n8nResult.content === 'string' ? n8nResult.content : JSON.stringify(n8nResult.content)
    }

    // Fallback: stringify the whole thing
    return JSON.stringify(n8nResult)
  } catch (error) {
    console.error('Error extracting content:', error)
    return JSON.stringify(n8nResult)
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { project_id } = body

    if (!project_id) {
      return NextResponse.json({ error: 'project_id is required' }, { status: 400 })
    }

    // Fetch all inputs for this project
    const { data: inputs, error: inputsError } = await supabase
      .from('diffuse_project_inputs')
      .select('*')
      .eq('project_id', project_id)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })

    if (inputsError) {
      console.error('Error fetching inputs:', inputsError)
      return NextResponse.json({ error: 'Failed to fetch inputs' }, { status: 500 })
    }

    if (!inputs || inputs.length === 0) {
      return NextResponse.json({ error: 'No inputs found for this project' }, { status: 400 })
    }

    // Prepare payload for n8n
    // For images, include the storage URL instead of content
    // For text/audio/document, include the text content
    const n8nPayload = {
      project_id,
      inputs: inputs.map(input => ({
        id: input.id,
        type: input.type,
        content: input.content || '',
        file_name: input.file_name || 'Untitled',
        // Include image URL for image inputs so n8n can process them
        image_url: input.type === 'image' ? input.metadata?.storage_url : undefined,
        file_path: input.file_path || undefined
      }))
    }

    // Call n8n webhook
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nPayload),
    })

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text()
      console.error('n8n webhook error:', errorText)
      return NextResponse.json({ error: 'Workflow execution failed' }, { status: 500 })
    }

    const n8nResult = await n8nResponse.json()
    
    // Extract the AI-generated content from n8n response
    const extractedContent = extractArticleContent(n8nResult)
    
    // Try to parse as JSON and add author field
    let finalContent = extractedContent
    try {
      const parsed = JSON.parse(extractedContent)
      // Add default author
      parsed.author = 'Diffuse.AI'
      finalContent = JSON.stringify(parsed)
    } catch {
      // Not valid JSON, use as-is
    }

    // Save the output to Supabase
    const { data: output, error: outputError } = await supabase
      .from('diffuse_project_outputs')
      .insert({
        project_id,
        input_id: inputs[0].id,
        content: finalContent,
        workflow_status: 'completed',
      })
      .select()
      .single()

    if (outputError) {
      console.error('Error saving output:', outputError)
      return NextResponse.json({ error: 'Failed to save output' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      output,
      message: 'Article generated successfully'
    })

  } catch (error) {
    console.error('Workflow API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
