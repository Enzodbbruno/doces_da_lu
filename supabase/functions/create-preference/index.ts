import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS pré-voo necessário para chamadas do navegador
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { items, customer, orderId } = await req.json()

    // O Access Token guardado de forma segura no Supabase Secrets
    const mpAccessToken = Deno.env.get('MP_ACCESS_TOKEN');

    if (!mpAccessToken) {
      throw new Error("Variável de ambiente MP_ACCESS_TOKEN não configurada no Supabase.");
    }

    // Criar a preferência de pagamento no Mercado Pago
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${mpAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: items.map((i: any) => ({
          title: i.name,
          description: i.name,
          quantity: i.qty,
          currency_id: "BRL",
          unit_price: i.price,
        })),
        payer: {
          name: customer.name,
          email: customer.email || "contato@docesdalu.com",
          phone: {
            area_code: "55",
            number: customer.phone ? customer.phone.replace(/\D/g, '').slice(-9) : ""
          },
        },
        back_urls: {
          // O ideal é configurar o domínio real aqui futuramente
          success: req.headers.get("origin") || "http://localhost:5500",
          failure: req.headers.get("origin") || "http://localhost:5500",
          pending: req.headers.get("origin") || "http://localhost:5500"
        },
        auto_return: "approved",
        external_reference: orderId,
        payment_methods: {
          installments: 12 // Permite parcelamento em até 12x
        },
        notification_url: "https://jzifqnexjbtxwnbbjsjw.supabase.co/functions/v1/mp-webhook"
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro MP:", data);
      throw new Error(`Mercado Pago API error: ${data.message || 'Erro desconhecido'}`);
    }

    // Retorna o ID seguro e a URL de pagamento pro Checkout Pro
    return new Response(JSON.stringify({ 
      id: data.id,
      init_point: data.init_point
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
