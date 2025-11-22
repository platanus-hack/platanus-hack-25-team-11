import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

interface RequestBody {
  cartHTML: string;
  userContext: string;
}

interface AnthropicResponse {
  content: Array<{
    text: string;
    type: string;
  }>;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
  id: string;
  model: string;
  role: string;
  stop_reason: string;
  type: string;
}

/**
 * Genera el prompt para Claude
 */
function PROMPT_TEMPLATE(cartHTML: string, userContext: string): string {
  
  return `Eres un coach financiero amigable y chistoso que ayuda a las personas a reflexionar sobre sus compras online de manera ligera y sin juzgar.

<CONTEXTO_DEL_USUARIO>
${userContext || 'No se proporcionó contexto del usuario'}
</CONTEXTO_DEL_USUARIO>

<HTML_DEL_CARRITO>
${cartHTML}
</HTML_DEL_CARRITO>

TU TAREA:
Analiza el carrito de compras y el contexto del usuario, y genera UNA SOLA PREGUNTA que:

1. Sea específica a los productos que está comprando (menciona al menos uno por nombre o categoría)
2. Relacione la compra con su contexto personal de manera natural (si se proporcionó contexto)
3. Sea chistosa o ligera, usando humor sutil (máximo 2 emojis)
4. Haga reflexionar sin ser moralizante ni hacer sentir mal
5. Sea conversacional, como si fuera un amigo preguntando con curiosidad genuina
6. No exceda 2-3 oraciones máximo
7. Si el usuario mencionó metas, situación financiera o prioridades en su contexto, relaciónalo creativamente

ESTILO:
- Tono: Amigable, cálido, con un toque de humor
- Evita: Sermones, regaños, juicios, sarcasmo agresivo, dramatismo excesivo
- Busca: Generar una sonrisa + un momento de reflexión genuina
- Dirígete al usuario de "tú"

EJEMPLOS DE BUEN TONO:

✅ "Vi que tienes 4 camisas nuevas por $180... ¿tu clóset está pidiendo ayuda o estás evitando hacer la lavandería? 👕"

✅ "Esa Nintendo Switch se ve tentadora, pero ¿y si ese dinero lo guardas 2 meses más y te vas a ese viaje que tanto quieres? 🏖️"

FORMATO DE RESPUESTA:
Responde SOLO con la pregunta. Sin preámbulos, sin explicaciones, sin comillas, sin formato markdown. Solo el texto de la pregunta directamente.

Genera la pregunta ahora:`;
}

/**
 * Lambda handler function
 * @param event - API Gateway proxy event
 * @returns API Gateway proxy result
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  try {
    // Solo aceptar POST requests
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Method not allowed. Use POST.' }),
      };
    }

    // Parse request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Missing request body' }),
      };
    }

    const { cartHTML, userContext }: RequestBody = JSON.parse(event.body);
    
    if (!cartHTML) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'Missing required field: cartHTML' 
        }),
      };
    }

    // Validar que tenemos la API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY no configurada');
    }

    // Llamar a Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        temperature: 0.8,
        messages: [
          {
            role: 'user',
            content: PROMPT_TEMPLATE(cartHTML, userContext || ''),
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Anthropic API error:', errorData);
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json() as AnthropicResponse;
    
    // Claude responde con el texto de la pregunta
    const question = data.content[0].text.trim();
    
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ 
        question: question,
        tokensUsed: data.usage.input_tokens + data.usage.output_tokens,
      }),
    };
    
  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
