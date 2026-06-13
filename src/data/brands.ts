// brands.ts — Base de données de couleurs de marques pour personnalisation automatique
// Couleurs de marque approximatives à usage de personnalisation visuelle uniquement.
// Aucun logo officiel n'est utilisé. Si une enseigne n'est pas reconnue,
// l'utilisateur choisit une couleur manuellement (palette par défaut).

export type Brand = {
  name: string;
  color: string;
  aliases?: string[];
};

export const BRANDS: Brand[] = [
  // ═══════════════════════════════════════════════════════════════════════
  // SUPERMARCHÉS / GROCERY — France
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Carrefour", color: "#0066B3", aliases: ["carrefour market", "carrefour express", "carrefour city", "carrefour contact"] },
  { name: "Leclerc", color: "#0055A4", aliases: ["e.leclerc", "e leclerc"] },
  { name: "Auchan", color: "#E2001A" },
  { name: "Intermarché", color: "#E2001A", aliases: ["intermarche"] },
  { name: "Casino", color: "#E2001A", aliases: ["géant casino", "geant casino"] },
  { name: "Monoprix", color: "#E6007E" },
  { name: "Lidl", color: "#0050AA" },
  { name: "Aldi", color: "#00549F" },
  { name: "Cora", color: "#E2001A" },
  { name: "Super U", color: "#E2001A", aliases: ["u express", "hyper u", "système u", "systeme u", "magasins u"] },
  { name: "Franprix", color: "#00A551" },
  { name: "Spar", color: "#00A551" },
  { name: "Picard", color: "#E2001A" },
  { name: "Grand Frais", color: "#00A551" },
  { name: "Biocoop", color: "#00A551" },
  { name: "Naturalia", color: "#00A551" },
  { name: "Match", color: "#E2001A" },
  { name: "Leader Price", color: "#E2001A" },
  { name: "Netto", color: "#FFD200" },
  { name: "Colruyt", color: "#E2001A" },
  { name: "G20", color: "#E2001A" },
  { name: "Proxi", color: "#00A551" },

  // ═══════════════════════════════════════════════════════════════════════
  // SUPERMARKETS — UK / US / International
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Tesco", color: "#00539F" },
  { name: "Sainsbury's", color: "#F06C00", aliases: ["sainsburys"] },
  { name: "ASDA", color: "#78BE20" },
  { name: "Morrisons", color: "#FDEA10" },
  { name: "Waitrose", color: "#7AB800" },
  { name: "Marks & Spencer", color: "#000000", aliases: ["m&s", "marks and spencer"] },
  { name: "Walmart", color: "#0071CE" },
  { name: "Target", color: "#CC0000" },
  { name: "Costco", color: "#005DAA" },
  { name: "Whole Foods", color: "#00674B" },
  { name: "Kroger", color: "#0F3876" },
  { name: "Trader Joe's", color: "#D5232C", aliases: ["trader joes"] },
  { name: "Iceland", color: "#FF6600" },
  { name: "Co-op", color: "#00B1E7", aliases: ["the co-operative"] },

  // ═══════════════════════════════════════════════════════════════════════
  // SUPERMÄRKTE — Allemagne / Autriche / Suisse
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Edeka", color: "#FFD200" },
  { name: "Rewe", color: "#CC071E" },
  { name: "Penny", color: "#E30613" },
  { name: "Kaufland", color: "#E10915" },
  { name: "Real", color: "#FFCC00" },
  { name: "Netto Marken-Discount", color: "#FFD200" },
  { name: "Norma", color: "#E2001A" },
  { name: "Globus", color: "#E2001A" },
  { name: "Migros", color: "#FF6600" },
  { name: "Coop", color: "#E2001A" },
  { name: "Spar Austria", color: "#00A551", aliases: ["spar österreich"] },
  { name: "Billa", color: "#FFD200" },
  { name: "Hofer", color: "#00549F" },
  { name: "DM", color: "#003DA5", aliases: ["dm drogerie"] },
  { name: "Rossmann", color: "#C8102E" },

  // ═══════════════════════════════════════════════════════════════════════
  // SUPERMERCADOS — Espagne
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Mercadona", color: "#00A551" },
  { name: "Carrefour España", color: "#0066B3", aliases: ["carrefour es"] },
  { name: "Día", color: "#E2001A", aliases: ["dia"] },
  { name: "Eroski", color: "#E2001A" },
  { name: "Alcampo", color: "#0066B3" },
  { name: "El Corte Inglés", color: "#005A2A", aliases: ["el corte ingles"] },
  { name: "Lidl España", color: "#0050AA" },
  { name: "Consum", color: "#E2001A" },
  { name: "Caprabo", color: "#E2001A" },

  // ═══════════════════════════════════════════════════════════════════════
  // SUPERMERCATI — Italie
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Esselunga", color: "#00A551" },
  { name: "Coop Italia", color: "#E2001A", aliases: ["coop italia"] },
  { name: "Conad", color: "#E2001A" },
  { name: "Carrefour Italia", color: "#0066B3" },
  { name: "Lidl Italia", color: "#0050AA" },
  { name: "Eurospin", color: "#0066B3" },
  { name: "Pam", color: "#E2001A" },
  { name: "Despar", color: "#00A551" },

  // ═══════════════════════════════════════════════════════════════════════
  // SUPERMERCADOS — Portugal
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Continente", color: "#E2001A" },
  { name: "Pingo Doce", color: "#00A651" },
  { name: "Auchan Portugal", color: "#E2001A" },
  { name: "Lidl Portugal", color: "#0050AA" },
  { name: "Minipreço", color: "#E2001A", aliases: ["minipreco"] },
  { name: "El Corte Inglés Portugal", color: "#005A2A" },

  // ═══════════════════════════════════════════════════════════════════════
  // SUPERMARKTEN — Pays-Bas / Belgique
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Albert Heijn", color: "#0078D2" },
  { name: "Jumbo", color: "#FFD200" },
  { name: "Lidl Nederland", color: "#0050AA" },
  { name: "Aldi Nederland", color: "#00549F" },
  { name: "Plus", color: "#E2001A" },
  { name: "Dirk", color: "#E2001A" },
  { name: "Delhaize", color: "#E2001A" },
  { name: "Carrefour Belgique", color: "#0066B3" },

  // ═══════════════════════════════════════════════════════════════════════
  // СУПЕРМАРКЕТЫ — Russie
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Magnit", color: "#E2001A", aliases: ["магнит"] },
  { name: "Pyaterochka", color: "#00A551", aliases: ["пятёрочка", "пятерочка"] },
  { name: "Perekrestok", color: "#00A551", aliases: ["перекрёсток", "перекресток"] },
  { name: "Auchan Russia", color: "#E2001A", aliases: ["ашан"] },
  { name: "Lenta", color: "#0066B3", aliases: ["лента"] },
  { name: "VkusVill", color: "#00A551", aliases: ["вкусвилл"] },
  { name: "Metro", color: "#0066B3", aliases: ["метро"] },

  // ═══════════════════════════════════════════════════════════════════════
  // BRICOLAGE / DIY / HOME IMPROVEMENT
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Leroy Merlin", color: "#78BE20" },
  { name: "Castorama", color: "#0066B3" },
  { name: "Brico Dépôt", color: "#FFD100", aliases: ["brico depot"] },
  { name: "Bricomarché", color: "#E2001A", aliases: ["bricomarche"] },
  { name: "Mr Bricolage", color: "#E2001A" },
  { name: "Truffaut", color: "#00A551" },
  { name: "Gamm Vert", color: "#78BE20" },
  { name: "B&Q", color: "#FF6600" },
  { name: "Homebase", color: "#00A651" },
  { name: "Wickes", color: "#E2001A" },
  { name: "Screwfix", color: "#0066B3" },
  { name: "Hornbach", color: "#FF6600" },
  { name: "Obi", color: "#FF6600" },
  { name: "Bauhaus", color: "#E2001A" },
  { name: "Toom", color: "#E2001A" },
  { name: "Leroy Merlin España", color: "#78BE20" },
  { name: "Bricomart", color: "#FFD100" },
  { name: "Leroy Merlin Italia", color: "#78BE20" },
  { name: "Praxis", color: "#FF6600" },
  { name: "Gamma", color: "#FF6600" },
  { name: "Karwei", color: "#0066B3" },

  // ═══════════════════════════════════════════════════════════════════════
  // MODE / VÊTEMENTS / FASHION
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Zara", color: "#000000" },
  { name: "H&M", color: "#E50010" },
  { name: "Decathlon", color: "#0082C3" },
  { name: "Kiabi", color: "#E2001A" },
  { name: "C&A", color: "#E2001A" },
  { name: "Celio", color: "#000000" },
  { name: "Jules", color: "#000000" },
  { name: "Camaïeu", color: "#000000", aliases: ["camaieu"] },
  { name: "Promod", color: "#E6007E" },
  { name: "Etam", color: "#000000" },
  { name: "Undiz", color: "#000000" },
  { name: "Devred", color: "#0055A4" },
  { name: "La Halle", color: "#E2001A" },
  { name: "Gémo", color: "#E6007E", aliases: ["gemo"] },
  { name: "Uniqlo", color: "#FF0000" },
  { name: "Primark", color: "#00AEEF" },
  { name: "Mango", color: "#000000" },
  { name: "Pull & Bear", color: "#000000", aliases: ["pull and bear"] },
  { name: "Bershka", color: "#000000" },
  { name: "Stradivarius", color: "#000000" },
  { name: "Massimo Dutti", color: "#000000" },
  { name: "Levi's", color: "#C8102E", aliases: ["levis"] },
  { name: "Nike", color: "#000000" },
  { name: "Adidas", color: "#000000" },
  { name: "Puma", color: "#000000" },
  { name: "New Balance", color: "#CC0000" },
  { name: "Vans", color: "#000000" },
  { name: "Converse", color: "#000000" },
  { name: "Gap", color: "#001E62" },
  { name: "Next", color: "#000000" },
  { name: "ASOS", color: "#000000" },
  { name: "Boohoo", color: "#000000" },
  { name: "River Island", color: "#000000" },
  { name: "TK Maxx", color: "#E2001A", aliases: ["tk maxx", "tjx"] },

  // ═══════════════════════════════════════════════════════════════════════
  // BEAUTÉ / SANTÉ / PHARMACIE
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Sephora", color: "#000000" },
  { name: "Marionnaud", color: "#E6007E" },
  { name: "Nocibé", color: "#E6007E", aliases: ["nocibe"] },
  { name: "Yves Rocher", color: "#00A551" },
  { name: "The Body Shop", color: "#00A651" },
  { name: "Pharmacie", color: "#00A651" },
  { name: "Lush", color: "#000000" },
  { name: "Boots", color: "#00539F" },
  { name: "Superdrug", color: "#E6007E" },
  { name: "DM Drogerie Markt", color: "#003DA5" },
  { name: "Douglas", color: "#000000" },
  { name: "Kruidvat", color: "#0066B3" },
  { name: "Etos", color: "#E6007E" },
  { name: "Watsons", color: "#00A651" },

  // ═══════════════════════════════════════════════════════════════════════
  // ÉLECTRONIQUE / HIGH-TECH
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Fnac", color: "#E2001A" },
  { name: "Darty", color: "#E2001A" },
  { name: "Boulanger", color: "#E2001A" },
  { name: "Apple", color: "#000000" },
  { name: "Samsung", color: "#1428A0" },
  { name: "Cdiscount", color: "#E2001A" },
  { name: "Media Markt", color: "#E2001A", aliases: ["mediamarkt"] },
  { name: "Saturn", color: "#E2001A" },
  { name: "Currys", color: "#5A1E78" },
  { name: "Best Buy", color: "#0046BE" },
  { name: "GameStop", color: "#000000" },
  { name: "Micromania", color: "#000000" },

  // ═══════════════════════════════════════════════════════════════════════
  // RESTAURATION / FAST-FOOD / CAFÉ
  // ═══════════════════════════════════════════════════════════════════════
  { name: "McDonald's", color: "#FFC72C", aliases: ["mcdonalds", "mcdo"] },
  { name: "Starbucks", color: "#00704A" },
  { name: "Burger King", color: "#EC1C24" },
  { name: "KFC", color: "#E4002B" },
  { name: "Subway", color: "#008C15" },
  { name: "Quick", color: "#E2001A" },
  { name: "Domino's Pizza", color: "#0078AE", aliases: ["dominos", "dominos pizza"] },
  { name: "Pizza Hut", color: "#EE3124" },
  { name: "Costa Coffee", color: "#6F263D" },
  { name: "Five Guys", color: "#E2001A" },
  { name: "Pret A Manger", color: "#5D3F23", aliases: ["pret"] },
  { name: "Greggs", color: "#00539F" },
  { name: "Nando's", color: "#E2001A", aliases: ["nandos"] },
  { name: "Tim Hortons", color: "#C8102E" },
  { name: "Dunkin'", color: "#FF6600", aliases: ["dunkin donuts"] },
  { name: "Taco Bell", color: "#702082" },
  { name: "Chipotle", color: "#A81612" },
  { name: "IKEA Restaurant", color: "#0058AB" },

  // ═══════════════════════════════════════════════════════════════════════
  // MEUBLES / DÉCO / MAISON
  // ═══════════════════════════════════════════════════════════════════════
  { name: "IKEA", color: "#0058AB" },
  { name: "Maisons du Monde", color: "#000000" },
  { name: "But", color: "#E2001A" },
  { name: "Conforama", color: "#E2001A" },
  { name: "Habitat", color: "#000000" },
  { name: "Zara Home", color: "#000000" },
  { name: "H&M Home", color: "#000000" },
  { name: "Wayfair", color: "#7F187F" },

  // ═══════════════════════════════════════════════════════════════════════
  // TRANSPORT
  // ═══════════════════════════════════════════════════════════════════════
  { name: "SNCF", color: "#CA0F39" },
  { name: "RATP", color: "#003E7E" },
  { name: "Air France", color: "#002157" },
  { name: "Uber", color: "#000000" },
  { name: "BlaBlaCar", color: "#00AFF5" },
  { name: "Deutsche Bahn", color: "#EC0016" },
  { name: "Renfe", color: "#E2001A" },
  { name: "Trenitalia", color: "#00529B" },
  { name: "National Express", color: "#005DAA" },
  { name: "Eurostar", color: "#FFD200" },
  { name: "TGV", color: "#CA0F39" },
  { name: "Ouigo", color: "#E6007E" },
  { name: "Flixbus", color: "#73D700" },
  { name: "Lufthansa", color: "#05164D" },
  { name: "British Airways", color: "#075AAA" },
  { name: "Ryanair", color: "#073590" },
  { name: "EasyJet", color: "#FF6600", aliases: ["easyjet"] },
  { name: "Aeroflot", color: "#00529B" },

  // ═══════════════════════════════════════════════════════════════════════
  // LOISIRS / CULTURE / CINÉMA
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Cultura", color: "#E2001A" },
  { name: "Pathé", color: "#E2001A", aliases: ["pathe", "cinéma pathé"] },
  { name: "UGC", color: "#E2001A" },
  { name: "Gaumont", color: "#E2001A" },
  { name: "Disneyland Paris", color: "#0066B3", aliases: ["disneyland"] },
  { name: "Vue Cinemas", color: "#E2001A" },
  { name: "Cineworld", color: "#E2001A" },
  { name: "Odeon", color: "#E2001A" },
  { name: "Cinecittà", color: "#E2001A" },
  { name: "Kinepolis", color: "#E2001A" },
  { name: "Waterstones", color: "#000000" },
  { name: "WHSmith", color: "#000080" },
  { name: "Thalia", color: "#E30613" },

  // ═══════════════════════════════════════════════════════════════════════
  // BANQUES / FINANCE
  // ═══════════════════════════════════════════════════════════════════════
  { name: "BNP Paribas", color: "#00915A" },
  { name: "Société Générale", color: "#E2001A", aliases: ["societe generale"] },
  { name: "Crédit Agricole", color: "#00A651", aliases: ["credit agricole"] },
  { name: "La Banque Postale", color: "#FFD200" },
  { name: "Caisse d'Épargne", color: "#E2001A", aliases: ["caisse depargne", "caisse d'epargne"] },
  { name: "LCL", color: "#005AA0" },
  { name: "Boursorama", color: "#EE0000" },
  { name: "Revolut", color: "#000000" },
  { name: "N26", color: "#36F297" },
  { name: "HSBC", color: "#DB0011" },
  { name: "Barclays", color: "#00AEEF" },
  { name: "Lloyds Bank", color: "#024731" },
  { name: "NatWest", color: "#5A287D" },
  { name: "Santander", color: "#EC0000" },
  { name: "BBVA", color: "#004481" },
  { name: "CaixaBank", color: "#0099CC" },
  { name: "Deutsche Bank", color: "#0018A8" },
  { name: "Commerzbank", color: "#FFCC00" },
  { name: "ING", color: "#FF6600" },
  { name: "Rabobank", color: "#FF6200" },
  { name: "UniCredit", color: "#E2001A" },
  { name: "Intesa Sanpaolo", color: "#00529B" },
  { name: "Millennium BCP", color: "#00A99D" },
  { name: "Sberbank", color: "#21A038", aliases: ["сбербанк"] },
  { name: "VTB", color: "#0039A6", aliases: ["втб"] },
  { name: "Tinkoff", color: "#FFDD2D", aliases: ["тинькофф"] },
  { name: "PayPal", color: "#00457C" },
  { name: "Wise", color: "#9FE870" },

  // ═══════════════════════════════════════════════════════════════════════
  // ANIMALERIE
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Maxi Zoo", color: "#E2001A" },
  { name: "Animalis", color: "#E6007E" },
  { name: "Pets at Home", color: "#E2001A" },
  { name: "Fressnapf", color: "#E2001A" },
  { name: "Kiwoko", color: "#00A551" },

  // ═══════════════════════════════════════════════════════════════════════
  // SPORT / FITNESS
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Decathlon", color: "#0082C3" },
  { name: "Go Sport", color: "#E2001A" },
  { name: "Foot Locker", color: "#000000" },
  { name: "Sport 2000", color: "#E2001A" },
  { name: "Courir", color: "#000000" },
  { name: "Intersport", color: "#0066B3" },
  { name: "Basic-Fit", color: "#FF6600" },
  { name: "Vivactif", color: "#78BE20" },
  { name: "Fitness Park", color: "#000000" },
  { name: "Neoness", color: "#000000" },
  { name: "Sports Direct", color: "#E2001A" },
  { name: "JD Sports", color: "#000000" },
  { name: "PureGym", color: "#000000" },
  { name: "McFit", color: "#E2001A" },

  // ═══════════════════════════════════════════════════════════════════════
  // LIBRAIRIE / BIBLIOTHÈQUE / ÉDUCATION
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Bibliothèque Municipale", color: "#8B5CF6" },
  { name: "Médiathèque", color: "#8B5CF6", aliases: ["mediatheque"] },
  { name: "Espace Culturel", color: "#E2001A" },
  { name: "Gibert Jeune", color: "#FFD200" },
  { name: "Decitre", color: "#E2001A" },

  // ═══════════════════════════════════════════════════════════════════════
  // STATIONS-SERVICE / CARBURANT
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Total Energies", color: "#E2001A", aliases: ["totalenergies", "total"] },
  { name: "Shell", color: "#FFD200" },
  { name: "BP", color: "#00914B" },
  { name: "Esso", color: "#E2001A" },
  { name: "Avia", color: "#0066B3" },
  { name: "Repsol", color: "#FF6600" },
  { name: "Cepsa", color: "#0066B3" },
  { name: "Galp", color: "#FF6600" },
  { name: "Lukoil", color: "#E2001A", aliases: ["лукойл"] },
  { name: "Gazprom", color: "#0033A0", aliases: ["газпром"] },
];

/**
 * Recherche une marque par nom (insensible à la casse et aux accents).
 * Retourne la couleur de marque si trouvée, sinon null.
 */
export function findBrandColor(name: string): string | null {
  if (!name || name.trim().length < 2) return null;

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const query = normalize(name);

  // Match exact
  for (const brand of BRANDS) {
    if (normalize(brand.name) === query) return brand.color;
    if (brand.aliases) {
      for (const alias of brand.aliases) {
        if (normalize(alias) === query) return brand.color;
      }
    }
  }

  // Match partiel (le nom contient ou est contenu dans le nom de la marque)
  if (query.length >= 3) {
    for (const brand of BRANDS) {
      const brandName = normalize(brand.name);
      if (query.includes(brandName) || brandName.includes(query)) return brand.color;
      if (brand.aliases) {
        for (const alias of brand.aliases) {
          const aliasName = normalize(alias);
          if (query.includes(aliasName) || aliasName.includes(query)) return brand.color;
        }
      }
    }
  }

  return null;
}

/**
 * Liste de suggestions de marques pour autocomplétion (max N résultats)
 */
export function searchBrands(query: string, max: number = 5): Brand[] {
  if (!query || query.trim().length < 2) return [];

  const normalize = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  const q = normalize(query);
  const results: Brand[] = [];

  for (const brand of BRANDS) {
    if (normalize(brand.name).startsWith(q)) {
      results.push(brand);
      if (results.length >= max) break;
    }
  }

  return results;
}
