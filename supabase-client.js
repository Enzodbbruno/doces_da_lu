// supabase-client.js
const supabaseUrl = 'https://jzifqnexjbtxwnbbjsjw.supabase.co';
const supabaseKey = 'sb_publishable_-_NSN0aYsjrCnw6wHI2C3w_Y4Sug849';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

const supabaseClient = {
  // --- PRODUTOS ---
  async getProducts() {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }
    // Mapear de volta se o Postgres colocou em minúscula
    return data.map(p => ({
      db_id: p.id, // uuid do banco
      id: p.slug,  // o slug original usado na store local
      name: p.name,
      emoji: p.emoji,
      badge: p.badge,
      description: p.description,
      shortDesc: p.shortdesc,
      price: parseFloat(p.price),
      weight: p.weight,
      image: p.image,
      available: p.available,
      highlight: p.highlight
    }));
  },

  async saveProduct(product) {
    // Vamos converter a representação do front-end -> banco
    const p = {
      slug: product.id,
      name: product.name,
      emoji: product.emoji,
      badge: product.badge,
      description: product.description,
      shortdesc: product.shortDesc,
      price: product.price,
      weight: product.weight,
      image: product.image,
      available: product.available,
      highlight: product.highlight
    };

    // Usar upsert pelo slug
    const { error } = await supabase.from('products').upsert(p, { onConflict: 'slug' });
    if (error) console.error('Erro ao salvar produto:', error);
  },

  async deleteProduct(slug) {
    const { error } = await supabase.from('products').delete().eq('slug', slug);
    if (error) console.error('Erro ao deletar produto:', error);
  },

  // --- CONFIG ---
  async getConfig() {
    const { data, error } = await supabase.from('config').select('*').limit(1).single();
    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao buscar config:', error);
      return null;
    }
    if (!data) return null;
    return {
      storeName: data.storename,
      whatsapp: data.whatsapp,
      instagram: data.instagram,
      pixKey: data.pixkey,
      pixKeyType: data.pixkeytype,
      deliveryArea: data.deliveryarea,
      deliveryFee: parseFloat(data.deliveryfee || 0),
      enablePix: data.enablepix,
      enableCredit: data.enablecredit,
      mercadoPagoPublicKey: data.mercadopagopublickey
    };
  },

  async saveConfig(config) {
    // Primeiramente precisamos garantir se há um ID de config pré-existente
    const { data: existing } = await supabase.from('config').select('id').limit(1).single();
    
    const cfg = {
      storename: config.storeName,
      whatsapp: config.whatsapp,
      instagram: config.instagram,
      pixkey: config.pixKey,
      pixkeytype: config.pixKeyType,
      deliveryarea: config.deliveryArea,
      deliveryfee: config.deliveryFee,
      enablepix: config.enablePix,
      enablecredit: config.enableCredit,
      mercadopagopublickey: config.mercadoPagoPublicKey
    };

    if (existing && existing.id) {
      cfg.id = existing.id;
    }

    const { error } = await supabase.from('config').upsert(cfg);
    if (error) console.error('Erro ao salvar config:', error);
  },

  // --- ORDERS ---
  async getOrders() {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Erro ao buscar pedidos:', error);
      return [];
    }
    return data.map(o => ({
      id: o.id,
      date: o.created_at,
      items: o.items,
      subtotal: parseFloat(o.subtotal),
      shipping: parseFloat(o.shipping),
      total: parseFloat(o.total),
      customer: o.customer,
      paymentMethod: o.paymentmethod,
      status: o.status
    }));
  },

  async saveOrder(order) {
    const o = {
      id: order.id,
      created_at: order.date,
      items: order.items,
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      customer: order.customer,
      paymentmethod: order.paymentMethod,
      status: order.status || 'pending'
    };
    const { error } = await supabase.from('orders').upsert(o);
    if (error) console.error('Erro ao salvar pedido:', error);
    return !error;
  },

  async findOrdersByKey(key) {
    const all = await this.getOrders();
    const k = key.replace(/\D/g, '');
    return all.filter(o => {
      const phone = (o.customer?.phone || '').replace(/\D/g, '');
      const cpf = (o.customer?.cpf || '').replace(/\D/g, '');
      return phone.includes(k) || cpf === k;
    });
  },

  async updateOrderStatus(id, status) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) console.error('Erro ao atualizar status:', error);
    return !error;
  },
  
  async deleteOrders() {
     const { error } = await supabase.from('orders').delete().neq('id', 'clear');
     if (error) console.error('Erro deletando historico', error);
  }
};

window.supabaseClient = supabaseClient;
