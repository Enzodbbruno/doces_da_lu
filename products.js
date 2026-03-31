/**
 * DOCES DA LU — Catálogo de Produtos
 * Edite aqui para alterar preços, nomes, descrições e imagens
 * Os dados ficam também em localStorage para persistência
 */

const DEFAULT_PRODUCTS = [
  {
    id: "bolo-cenoura",
    name: "Bolo de Cenoura",
    emoji: "🍫",
    badge: "Mais Pedido",
    description: "Casca de chocolate branco, com recheio de creme de Nutella e pedaços de Kinder Bueno. Uma combinação irresistível que vai te apaixonar!",
    shortDesc: "Casca de choc. branco, creme de Nutella e Kinder Bueno",
    price: 80.00,
    weight: "350g",
    image: "images/ovo_bolo_cenoura.png",
    available: true,
    highlight: true,
  },
  {
    id: "pistache",
    name: "Pistache",
    emoji: "🤍",
    badge: "Novidade",
    description: "Casca de chocolate branco com gotas de chocolate e recheio de chocolate branco com coco. Leve, cremoso e sofisticado.",
    shortDesc: "Casca de choc. branco com gotas e recheio de choc. branco com coco",
    price: 60.00,
    weight: "350g",
    image: "images/ovo_pistache.png",
    available: true,
    highlight: false,
  },
  {
    id: "dois-amores",
    name: "Dois Amores",
    emoji: "💛",
    badge: "Clássico",
    description: "Casca de chocolate ao leite com recheio de brigadeiro belga e chocolate granulado. O clássico que nunca decepciona!",
    shortDesc: "Casca de choc. ao leite com brigadeiro belga e granulado",
    price: 60.00,
    weight: "350g",
    image: "images/ovo_dois_amores.png",
    available: true,
    highlight: false,
  },
  {
    id: "trufa-premium",
    name: "Trufa Premium",
    emoji: "🖤",
    badge: "Premium",
    description: "Casca de chocolate amargo 70% cacau recheado com trufas artesanais cobertas de cacau em pó. Para os amantes do chocolate intenso.",
    shortDesc: "Casca amarga 70% cacau com trufas artesanais e cacau em pó",
    price: 90.00,
    weight: "350g",
    image: "images/ovo_trufa.png",
    available: true,
    highlight: false,
  },
];

// Configurações da loja
const DEFAULT_CONFIG = {
  storeName: "Doces da LU",
  whatsapp: "5594984034495",
  instagram: "doces_luizaf",
  pixKey: "docesdalu@email.com",
  pixKeyType: "E-mail",
  deliveryArea: "Marabá/PA",
  deliveryFee: 0, // 0 = grátis
  enablePix: true,
  enableCredit: true,
  mercadoPagoPublicKey: "", // Inserir chave pública do Mercado Pago aqui
};

/**
 * Carrega produtos do Supabase (ou inicializa com o padrão se vazio)
 */
async function loadProducts() {
  const prods = await window.supabaseClient.getProducts();
  if (prods && prods.length > 0) return prods;
  
  // Se estiver vazio, popula com os defaults
  for (const p of DEFAULT_PRODUCTS) {
    await window.supabaseClient.saveProduct(p);
  }
  return JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
}

/**
 * Salva produtos iterando e atualizando (usado pelo admin local)
 */
async function saveProducts(products) {
  for (const p of products) {
    await window.supabaseClient.saveProduct(p);
  }
}

/**
 * Carrega config do Supabase
 */
async function loadConfig() {
  let cfg = await window.supabaseClient.getConfig();
  if (!cfg) {
    cfg = { ...DEFAULT_CONFIG };
    await window.supabaseClient.saveConfig(cfg);
  } else {
    // Corrige os placeholders velhos que ficaram presos no banco de dados
    if (cfg.whatsapp === "5594999999999") cfg.whatsapp = "5594984034495";
    if (cfg.instagram === "docesdalu") cfg.instagram = "doces_luizaf";
  }
  return cfg;
}

/**
 * Salva config no Supabase
 */
async function saveConfig(config) {
  await window.supabaseClient.saveConfig(config);
}

// Expõe globalmente
window.STORE = {
  loadProducts,
  saveProducts,
  loadConfig,
  saveConfig,
  DEFAULT_PRODUCTS,
  DEFAULT_CONFIG,
};
