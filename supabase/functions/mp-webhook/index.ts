import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const url = new URL(req.url);
    
    // O Mercado Pago pode mandar os dados via Query String ou JSON Body (depende da configuração IPN vs Webhook)
    // Para capturar todas as possibilidades com segurança:
    let body = {};
    try {
      body = await req.json();
    } catch {
      // Body vazio ou inválido, tentaremos pegar da URL params (IPN antigo)
    }

    const topic = url.searchParams.get("topic") || body.type;
    const paymentId = url.searchParams.get("id") || body?.data?.id;

    if (topic !== "payment" || !paymentId) {
      // Ignora eventos que não sejam de pagamento
      return new Response(JSON.stringify({ message: "Evento ignorado" }), { status: 200 });
    }

    const mpAccessToken = Deno.env.get('MP_ACCESS_TOKEN');
    if (!mpAccessToken) {
      throw new Error("Missing MP_ACCESS_TOKEN");
    }

    // 1. Consultar a API do Mercado Pago para conferir se o pagamento existe e é verdadeiro
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        "Authorization": `Bearer ${mpAccessToken}`
      }
    });

    const paymentData = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error("Erro ao buscar pagamento", paymentData);
      throw new Error("Falha ao consultar Mercado Pago");
    }

    // Verificamos o status do pagamento 
    if (paymentData.status === "approved" && paymentData.external_reference) {
      const orderId = paymentData.external_reference;
      console.log(`Pagamento aprovado para o Pedido: ${orderId}`);

      // 2. Atualizar no banco Supabase
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      // Usamos o Service Role Key pois a função atua como administrador do banco
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error } = await supabase
        .from('orders')
        .update({ status: 'confirmed' })
        .eq('id', orderId);

      if (error) {
        console.error("Falha ao salvar no banco", error);
        throw error;
      }
    }

    // Responder 200 OK pro Mercado Pago parar de tentar enviar o aviso
    return new Response(JSON.stringify({ received: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
})
