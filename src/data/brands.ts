// brands.ts — Base de données de couleurs de marques pour personnalisation automatique
// Couleurs de marque approximatives à usage de personnalisation visuelle uniquement.
// Aucun logo officiel n'est utilisé. Si une enseigne n'est pas reconnue,
// l'utilisateur choisit une couleur manuellement (palette par défaut).

export type Brand = {
  name: string;
  color: string;
  domain?: string;
  aliases?: string[];
};

export const BRANDS: Brand[] = [
  // ═══════════════════════════════════════════════════════════════════════
  // SUPERMARCHÉS / GROCERY — France
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Carrefour", color: "#0066B3", domain: "carrefour.fr", aliases: ["carrefour market", "carrefour express", "carrefour city", "carrefour contact"] },
  { name: "Leclerc", color: "#0055A4", domain: "e.leclerc", aliases: ["e.leclerc", "e leclerc"] },
  { name: "Auchan", color: "#E2001A", domain: "auchan.fr" },
  { name: "Intermarché", color: "#E2001A", domain: "intermarche.com", aliases: ["intermarche"] },
  { name: "Casino", color: "#E2001A", domain: "geantcasino.fr", aliases: ["géant casino", "geant casino"] },
  { name: "Monoprix", color: "#E6007E", domain: "monoprix.fr" },
  { name: "Lidl", color: "#0050AA", domain: "lidl.fr" },
  { name: "Aldi", color: "#00549F", domain: "aldi.fr" },
  { name: "Cora", color: "#E6007E", domain: "cora.fr" },
  { name: "Super U", color: "#E2001A", domain: "magasins-u.com", aliases: ["u express", "hyper u", "système u", "systeme u", "magasins u"] },
  { name: "Franprix", color: "#00A551", domain: "franprix.fr" },
  { name: "Spar", color: "#00A551", domain: "spar.fr" },
  { name: "Picard", color: "#0055A4", domain: "picard.fr" },
  { name: "Grand Frais", color: "#00A551", domain: "grandfrais.com" },
  { name: "Biocoop", color: "#00A551", domain: "biocoop.fr" },
  { name: "Naturalia", color: "#00A551", domain: "naturalia.fr" },
  { name: "Match", color: "#0055A4", domain: "supermarches-match.com" },
  { name: "Leader Price", color: "#E2001A", domain: "leaderprice.fr" },
  { name: "Netto", color: "#FFD200", domain: "netto.fr" },
  { name: "Colruyt", color: "#E2001A", domain: "colruyt.be" },
  { name: "G20", color: "#E2001A", domain: "g20.fr" },
  { name: "Proxi", color: "#00A551", domain: "proxi.fr" },

  // ═══════════════════════════════════════════════════════════════════════
  // SUPERMARKETS — UK / US / International
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Tesco", color: "#00539F", domain: "tesco.com" },
  { name: "Sainsbury's", color: "#F06C00", domain: "sainsburys.co.uk", aliases: ["sainsburys"] },
  { name: "ASDA", color: "#78BE20", domain: "asda.com" },
  { name: "Morrisons", color: "#FFD600", domain: "morrisons.com" },
  { name: "Waitrose", color: "#7AB800", domain: "waitrose.com" },
  { name: "Marks & Spencer", color: "#000000", domain: "marksandspencer.com", aliases: ["m&s", "marks and spencer"] },
  { name: "Walmart", color: "#0071CE", domain: "walmart.com" },
  { name: "Target", color: "#CC0000", domain: "target.com" },
  { name: "Costco", color: "#005DAA", domain: "costco.com" },
  { name: "Whole Foods", color: "#00674B", domain: "wholefoodsmarket.com" },
  { name: "Kroger", color: "#0F3876", domain: "kroger.com" },
  { name: "Trader Joe's", color: "#D5232C", domain: "traderjoes.com", aliases: ["trader joes"] },
  { name: "Iceland", color: "#E2001A", domain: "iceland.co.uk" },
  { name: "Co-op", color: "#00B1E7", domain: "coop.co.uk", aliases: ["the co-operative"] },

  // ═══════════════════════════════════════════════════════════════════════
  // SUPERMÄRKTE — Allemagne / Autriche / Suisse
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Edeka", color: "#FFD200", domain: "edeka.de" },
  { name: "Rewe", color: "#CC071E", domain: "rewe.de" },
  { name: "Penny", color: "#E30613", domain: "penny.de" },
  { name: "Kaufland", color: "#E10915", domain: "kaufland.de" },
  { name: "Real", color: "#FFCC00", domain: "real.de" },
  { name: "Netto Marken-Discount", color: "#FFD200", domain: "netto-online.de" },
  { name: "Norma", color: "#0055A4", domain: "norma-online.de" },
  { name: "Globus", color: "#E2001A", domain: "globus.de" },
  { name: "Migros", color: "#FF6600", domain: "migros.ch" },
  { name: "Coop", color: "#E2001A" },
  { name: "Billa", color: "#FFD200", domain: "billa.at" },
  { name: "Hofer", color: "#E2001A", domain: "hofer.at" },
  { name: "DM", color: "#003DA5", domain: "dm.de", aliases: ["dm drogerie"] },
  { name: "Rossmann", color: "#D40511", domain: "rossmann.de" },

  // ═══════════════════════════════════════════════════════════════════════
  // SUPERMERCADOS — Espagne
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Mercadona", color: "#00A551", domain: "mercadona.es" },
  { name: "Día", color: "#E2001A", domain: "dia.es", aliases: ["dia"] },
  { name: "Eroski", color: "#FF6600", domain: "eroski.es" },
  { name: "Alcampo", color: "#0066B3", domain: "alcampo.es" },
  { name: "El Corte Inglés", color: "#005A2A", domain: "elcorteingles.es", aliases: ["el corte ingles"] },
  { name: "Consum", color: "#00A651", domain: "consum.es" },
  { name: "Caprabo", color: "#00A651", domain: "caprabo.es" },

  // ═══════════════════════════════════════════════════════════════════════
  // SUPERMERCATI — Italie
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Esselunga", color: "#00A551", domain: "esselunga.it" },
  { name: "Conad", color: "#E2001A", domain: "conad.it" },
  { name: "Eurospin", color: "#0066B3", domain: "eurospin.it" },
  { name: "Pam", color: "#FFD200", domain: "pampanorama.it" },
  { name: "Despar", color: "#00A551", domain: "despar.it" },

  // ═══════════════════════════════════════════════════════════════════════
  // SUPERMERCADOS — Portugal
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Continente", color: "#E2001A", domain: "continente.pt" },
  { name: "Pingo Doce", color: "#00A651", domain: "pingodoce.pt" },
  { name: "Minipreço", color: "#FFD200", domain: "minipreco.pt", aliases: ["minipreco"] },

  // ═══════════════════════════════════════════════════════════════════════
  // SUPERMARKTEN — Pays-Bas / Belgique
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Albert Heijn", color: "#0078D2", domain: "ah.nl" },
  { name: "Jumbo", color: "#FFD200", domain: "jumbo.com" },
  { name: "Plus", color: "#E2001A", domain: "plus.nl" },
  { name: "Dirk", color: "#E2001A", domain: "dirk.nl" },
  { name: "Delhaize", color: "#E2001A", domain: "delhaize.be" },

  // ═══════════════════════════════════════════════════════════════════════
  // СУПЕРМАРКЕТЫ — Russie
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Magnit", color: "#E2001A", domain: "magnit.ru", aliases: ["магнит"] },
  { name: "Pyaterochka", color: "#00A551", domain: "5ka.ru", aliases: ["пятёрочка", "пятерочка"] },
  { name: "Perekrestok", color: "#00A551", domain: "perekrestok.ru", aliases: ["перекрёсток", "перекресток"] },
  { name: "Lenta", color: "#0066B3", domain: "lenta.com", aliases: ["лента"] },
  { name: "VkusVill", color: "#00A551", domain: "vkusvill.ru", aliases: ["вкусвилл"] },
  { name: "Metro", color: "#0066B3", domain: "metro.de", aliases: ["метро"] },

  // ═══════════════════════════════════════════════════════════════════════
  // BRICOLAGE / DIY / HOME IMPROVEMENT
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Leroy Merlin", color: "#78BE20", domain: "leroymerlin.com" },
  { name: "Castorama", color: "#0066B3", domain: "castorama.fr" },
  { name: "Brico Dépôt", color: "#FFD100", domain: "bricodepot.fr", aliases: ["brico depot"] },
  { name: "Bricomarché", color: "#00A651", domain: "bricomarche.com", aliases: ["bricomarche"] },
  { name: "Mr Bricolage", color: "#FFD200", domain: "mr-bricolage.fr" },
  { name: "Truffaut", color: "#00874E", domain: "truffaut.com" },
  { name: "Gamm Vert", color: "#78BE20", domain: "gammvert.fr" },
  { name: "B&Q", color: "#FF6600", domain: "diy.com" },
  { name: "Homebase", color: "#00A651", domain: "homebase.co.uk" },
  { name: "Wickes", color: "#E2001A", domain: "wickes.co.uk" },
  { name: "Screwfix", color: "#0066B3", domain: "screwfix.com" },
  { name: "Hornbach", color: "#FF6600", domain: "hornbach.de" },
  { name: "Obi", color: "#FF6600", domain: "obi.de" },
  { name: "Bauhaus", color: "#E2001A", domain: "bauhaus.info" },
  { name: "Toom", color: "#E2001A", domain: "toom.de" },
  { name: "Bricomart", color: "#FFD100", domain: "bricomart.es" },
  { name: "Praxis", color: "#FF6600", domain: "praxis.nl" },
  { name: "Gamma", color: "#FF6600", domain: "gamma.nl" },
  { name: "Karwei", color: "#0066B3", domain: "karwei.nl" },

  // ═══════════════════════════════════════════════════════════════════════
  // MODE / VÊTEMENTS / FASHION
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Zara", color: "#000000", domain: "zara.com" },
  { name: "H&M", color: "#E50010", domain: "hm.com" },
  { name: "Decathlon", color: "#0082C3", domain: "decathlon.fr" },
  { name: "Kiabi", color: "#E2001A", domain: "kiabi.com" },
  { name: "C&A", color: "#E2001A", domain: "c-and-a.com" },
  { name: "Celio", color: "#000000", domain: "celio.com" },
  { name: "Jules", color: "#000000", domain: "jules.com" },
  { name: "Camaïeu", color: "#000000", domain: "camaieu.fr", aliases: ["camaieu"] },
  { name: "Promod", color: "#E6007E", domain: "promod.fr" },
  { name: "Etam", color: "#000000", domain: "etam.com" },
  { name: "Undiz", color: "#000000", domain: "undiz.com" },
  { name: "Devred", color: "#1B1B3A", domain: "devred.fr" },
  { name: "La Halle", color: "#7A1FA2", domain: "lahalle.com" },
  { name: "Gémo", color: "#FF6600", domain: "gemo.fr", aliases: ["gemo"] },
  { name: "Uniqlo", color: "#FF0000", domain: "uniqlo.com" },
  { name: "Primark", color: "#00AEEF", domain: "primark.com" },
  { name: "Mango", color: "#1B1B1B", domain: "shop.mango.com" },
  { name: "Pull & Bear", color: "#000000", domain: "pullandbear.com", aliases: ["pull and bear"] },
  { name: "Bershka", color: "#000000", domain: "bershka.com" },
  { name: "Stradivarius", color: "#000000", domain: "stradivarius.com" },
  { name: "Massimo Dutti", color: "#000000", domain: "massimodutti.com" },
  { name: "Levi's", color: "#C8102E", domain: "levi.com", aliases: ["levis"] },
  { name: "Nike", color: "#000000", domain: "nike.com" },
  { name: "Adidas", color: "#000000", domain: "adidas.com" },
  { name: "Puma", color: "#000000", domain: "puma.com" },
  { name: "New Balance", color: "#CC0000", domain: "newbalance.com" },
  { name: "Vans", color: "#000000", domain: "vans.com" },
  { name: "Converse", color: "#000000", domain: "converse.com" },
  { name: "Gap", color: "#001E62", domain: "gap.com" },
  { name: "Next", color: "#000000", domain: "next.co.uk" },
  { name: "ASOS", color: "#000000", domain: "asos.com" },
  { name: "Boohoo", color: "#000000", domain: "boohoo.com" },
  { name: "River Island", color: "#000000", domain: "riverisland.com" },
  { name: "TK Maxx", color: "#E2231B", domain: "tkmaxx.com", aliases: ["tk maxx", "tjx"] },

  // ═══════════════════════════════════════════════════════════════════════
  // BEAUTÉ / SANTÉ / PHARMACIE
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Sephora", color: "#000000", domain: "sephora.fr" },
  { name: "Marionnaud", color: "#E6007E", domain: "marionnaud.fr" },
  { name: "Nocibé", color: "#E6007E", domain: "nocibe.fr", aliases: ["nocibe"] },
  { name: "Yves Rocher", color: "#00A551", domain: "yves-rocher.fr" },
  { name: "The Body Shop", color: "#00A651", domain: "thebodyshop.com" },
  { name: "Pharmacie", color: "#00A651" },
  { name: "Lush", color: "#000000", domain: "lush.com" },
  { name: "Boots", color: "#00539F", domain: "boots.com" },
  { name: "Superdrug", color: "#E6007E", domain: "superdrug.com" },
  { name: "DM Drogerie Markt", color: "#003DA5" },
  { name: "Douglas", color: "#000000", domain: "douglas.de" },
  { name: "Kruidvat", color: "#0066B3", domain: "kruidvat.nl" },
  { name: "Etos", color: "#E6007E", domain: "etos.nl" },
  { name: "Watsons", color: "#00A651" },

  // ═══════════════════════════════════════════════════════════════════════
  // ÉLECTRONIQUE / HIGH-TECH
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Fnac", color: "#FFC400", domain: "fnac.com" },
  { name: "Darty", color: "#E2001A", domain: "darty.com" },
  { name: "Boulanger", color: "#FF6600", domain: "boulanger.com" },
  { name: "Apple", color: "#000000", domain: "apple.com" },
  { name: "Samsung", color: "#1428A0", domain: "samsung.com" },
  { name: "Cdiscount", color: "#E2001A", domain: "cdiscount.com" },
  { name: "Media Markt", color: "#E2001A", domain: "mediamarkt.de", aliases: ["mediamarkt"] },
  { name: "Saturn", color: "#E2001A", domain: "saturn.de" },
  { name: "Currys", color: "#5C2D91", domain: "currys.co.uk" },
  { name: "Best Buy", color: "#0046BE", domain: "bestbuy.com" },
  { name: "GameStop", color: "#FF0000", domain: "gamestop.com" },
  { name: "Micromania", color: "#FFD200", domain: "micromania.fr" },

  // ═══════════════════════════════════════════════════════════════════════
  // RESTAURATION / FAST-FOOD / CAFÉ
  // ═══════════════════════════════════════════════════════════════════════
  { name: "McDonald's", color: "#27520B", domain: "mcdonaldsrestaurant.nl", aliases: ["mcdonalds", "mcdo"] },
  { name: "Starbucks", color: "#00704A", domain: "starbucks.com" },
  { name: "Burger King", color: "#EC1C24", domain: "bk.com" },
  { name: "KFC", color: "#E4002B", domain: "kfc.com" },
  { name: "Subway", color: "#008C15", domain: "subway.com" },
  { name: "Quick", color: "#E2001A", domain: "quick.fr" },
  { name: "Domino's Pizza", color: "#006491", domain: "dominos.com", aliases: ["dominos", "dominos pizza"] },
  { name: "Pizza Hut", color: "#E2001A", domain: "pizzahut.com" },
  { name: "Costa Coffee", color: "#6C1F45", domain: "costa.co.uk" },
  { name: "Five Guys", color: "#E51937", domain: "fiveguys.com" },
  { name: "Pret A Manger", color: "#5D3F23", domain: "pret.com", aliases: ["pret"] },
  { name: "Greggs", color: "#00539F", domain: "greggs.co.uk" },
  { name: "Nando's", color: "#E2001A", domain: "nandos.com", aliases: ["nandos"] },
  { name: "Tim Hortons", color: "#C8102E", domain: "timhortons.com" },
  { name: "Dunkin'", color: "#FF6600", domain: "dunkindonuts.com", aliases: ["dunkin donuts"] },
  { name: "Taco Bell", color: "#702082", domain: "tacobell.com" },
  { name: "Chipotle", color: "#A81612", domain: "chipotle.com" },
  { name: "IKEA Restaurant", color: "#0058AB" },

  // ═══════════════════════════════════════════════════════════════════════
  // MEUBLES / DÉCO / MAISON
  // ═══════════════════════════════════════════════════════════════════════
  { name: "IKEA", color: "#0058AB", domain: "ikea.com" },
  { name: "Maisons du Monde", color: "#000000", domain: "maisonsdumonde.com" },
  { name: "But", color: "#E2001A", domain: "but.fr" },
  { name: "Conforama", color: "#E2001A", domain: "conforama.fr" },
  { name: "Habitat", color: "#000000", domain: "habitat.co.uk" },
  { name: "Zara Home", color: "#000000", domain: "zarahome.com" },
  { name: "H&M Home", color: "#000000" },
  { name: "Wayfair", color: "#7F187F", domain: "wayfair.com" },

  // ═══════════════════════════════════════════════════════════════════════
  // TRANSPORT
  // ═══════════════════════════════════════════════════════════════════════
  { name: "SNCF", color: "#CA0F39", domain: "sncf.com" },
  { name: "RATP", color: "#003E7E", domain: "ratp.fr" },
  { name: "Air France", color: "#002157", domain: "airfrance.fr" },
  { name: "Uber", color: "#000000", domain: "uber.com" },
  { name: "BlaBlaCar", color: "#00AFF5", domain: "blablacar.fr" },
  { name: "Deutsche Bahn", color: "#EC0016", domain: "bahn.de" },
  { name: "Renfe", color: "#E2001A", domain: "renfe.com" },
  { name: "Trenitalia", color: "#00529B", domain: "trenitalia.com" },
  { name: "National Express", color: "#005DAA", domain: "nationalexpress.com" },
  { name: "Eurostar", color: "#FFD200", domain: "eurostar.com" },
  { name: "TGV", color: "#CA0F39" },
  { name: "Ouigo", color: "#E6007E" },
  { name: "Flixbus", color: "#73D700", domain: "flixbus.com" },
  { name: "Lufthansa", color: "#05164D", domain: "lufthansa.com" },
  { name: "British Airways", color: "#075AAA", domain: "britishairways.com" },
  { name: "Ryanair", color: "#073590", domain: "ryanair.com" },
  { name: "EasyJet", color: "#FF6600", domain: "easyjet.com", aliases: ["easyjet"] },
  { name: "Aeroflot", color: "#00529B", domain: "aeroflot.ru" },

  // ═══════════════════════════════════════════════════════════════════════
  // LOISIRS / CULTURE / CINÉMA
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Cultura", color: "#E2001A", domain: "cultura.com" },
  { name: "Pathé", color: "#E2001A", domain: "pathe.fr", aliases: ["pathe", "cinéma pathé"] },
  { name: "UGC", color: "#E2001A", domain: "ugc.fr" },
  { name: "Gaumont", color: "#E2001A", domain: "gaumont.fr" },
  { name: "Disneyland Paris", color: "#0066B3", domain: "disneylandparis.com", aliases: ["disneyland"] },
  { name: "Vue Cinemas", color: "#FFD200", domain: "myvue.com" },
  { name: "Cineworld", color: "#E2001A", domain: "cineworld.co.uk" },
  { name: "Odeon", color: "#E2001A", domain: "odeon.co.uk" },
  { name: "Cinecittà", color: "#E2001A", domain: "cinecitta.it" },
  { name: "Kinepolis", color: "#E2001A", domain: "kinepolis.com" },
  { name: "Waterstones", color: "#000000", domain: "waterstones.com" },
  { name: "WHSmith", color: "#000080", domain: "whsmith.co.uk" },
  { name: "Thalia", color: "#E30613", domain: "thalia.de" },

  // ═══════════════════════════════════════════════════════════════════════
  // BANQUES / FINANCE
  // ═══════════════════════════════════════════════════════════════════════
  { name: "BNP Paribas", color: "#00915A", domain: "bnpparibas.fr" },
  { name: "Société Générale", color: "#E2001A", domain: "societegenerale.fr", aliases: ["societe generale"] },
  { name: "Crédit Agricole", color: "#00A651", domain: "credit-agricole.fr", aliases: ["credit agricole"] },
  { name: "La Banque Postale", color: "#FFD200", domain: "labanquepostale.fr" },
  { name: "Caisse d'Épargne", color: "#E2001A", domain: "caisse-epargne.fr", aliases: ["caisse depargne", "caisse d'epargne"] },
  { name: "LCL", color: "#00A2E0", domain: "lcl.fr" },
  { name: "Boursorama", color: "#FF0000", domain: "boursorama-banque.com" },
  { name: "Revolut", color: "#000000", domain: "revolut.com" },
  { name: "N26", color: "#36F297", domain: "n26.com" },
  { name: "HSBC", color: "#DB0011", domain: "hsbc.com" },
  { name: "Barclays", color: "#00AEEF", domain: "barclays.co.uk" },
  { name: "Lloyds Bank", color: "#024731", domain: "lloydsbank.com" },
  { name: "NatWest", color: "#5A287D", domain: "natwest.com" },
  { name: "Santander", color: "#EC0000", domain: "santander.com" },
  { name: "BBVA", color: "#004481", domain: "bbva.com" },
  { name: "CaixaBank", color: "#0099CC", domain: "caixabank.com" },
  { name: "Deutsche Bank", color: "#0018A8", domain: "db.com" },
  { name: "Commerzbank", color: "#FFCC00", domain: "commerzbank.de" },
  { name: "ING", color: "#FF6600", domain: "ing.com" },
  { name: "Rabobank", color: "#FF6200", domain: "rabobank.com" },
  { name: "UniCredit", color: "#E2001A", domain: "unicredit.eu" },
  { name: "Intesa Sanpaolo", color: "#00529B", domain: "intesasanpaolo.com" },
  { name: "Millennium BCP", color: "#00A99D", domain: "millenniumbcp.pt" },
  { name: "Sberbank", color: "#21A038", domain: "sberbank.com", aliases: ["сбербанк"] },
  { name: "VTB", color: "#0039A6", domain: "vtb.com", aliases: ["втб"] },
  { name: "Tinkoff", color: "#FFDD2D", domain: "tinkoff.ru", aliases: ["тинькофф"] },
  { name: "PayPal", color: "#00457C", domain: "paypal.com" },
  { name: "Wise", color: "#9FE870", domain: "wise.com" },

  // ═══════════════════════════════════════════════════════════════════════
  // ANIMALERIE
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Maxi Zoo", color: "#E2001A", domain: "maxizoo.fr" },
  { name: "Animalis", color: "#00A651", domain: "animalis.com" },
  { name: "Pets at Home", color: "#00A651", domain: "petsathome.com" },
  { name: "Fressnapf", color: "#FF6600", domain: "fressnapf.de" },
  { name: "Kiwoko", color: "#E2001A", domain: "kiwoko.com" },

  // ═══════════════════════════════════════════════════════════════════════
  // SPORT / FITNESS
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Go Sport", color: "#00A651", domain: "go-sport.com" },
  { name: "Foot Locker", color: "#000000", domain: "footlocker.com" },
  { name: "Sport 2000", color: "#003DA5", domain: "sport2000.fr" },
  { name: "Courir", color: "#FFD200", domain: "courir.com" },
  { name: "Intersport", color: "#0066B3", domain: "intersport.fr" },
  { name: "Basic-Fit", color: "#FF6600", domain: "basic-fit.com" },
  { name: "Vivactif", color: "#E6007E" },
  { name: "Fitness Park", color: "#000000", domain: "fitnesspark.fr" },
  { name: "Neoness", color: "#E6007E", domain: "neoness.fr" },
  { name: "Sports Direct", color: "#E2001A", domain: "sportsdirect.com" },
  { name: "JD Sports", color: "#000000", domain: "jdsports.com" },
  { name: "PureGym", color: "#000000", domain: "puregym.com" },
  { name: "McFit", color: "#E2001A", domain: "mcfit.com" },

  // ═══════════════════════════════════════════════════════════════════════
  // LIBRAIRIE / BIBLIOTHÈQUE / ÉDUCATION
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Bibliothèque Municipale", color: "#8B5CF6" },
  { name: "Médiathèque", color: "#8B5CF6", aliases: ["mediatheque"] },
  { name: "Espace Culturel", color: "#0055A4" },
  { name: "Gibert Jeune", color: "#E2001A", domain: "gibertjeune.fr" },
  { name: "Decitre", color: "#1B1B3A", domain: "decitre.fr" },

  // ═══════════════════════════════════════════════════════════════════════
  // STATIONS-SERVICE / CARBURANT
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Total Energies", color: "#E2001A", domain: "totalenergies.fr", aliases: ["totalenergies", "total"] },
  { name: "Shell", color: "#FFD200", domain: "shell.com" },
  { name: "BP", color: "#00914B", domain: "bp.com" },
  { name: "Esso", color: "#ED1C24", domain: "esso.fr" },
  { name: "Avia", color: "#003DA5", domain: "avia.com" },
  { name: "Repsol", color: "#FF6600", domain: "repsol.com" },
  { name: "Cepsa", color: "#E30613", domain: "cepsa.com" },
  { name: "Galp", color: "#FF6D00", domain: "galp.com" },
  { name: "Lukoil", color: "#E2001A", domain: "lukoil.com", aliases: ["лукойл"] },
  { name: "Gazprom", color: "#0033A0", domain: "gazprom.com", aliases: ["газпром"] },
  // ═══════════════════════════════════════════════════════════════════════
  // CAVISTES / BOISSONS — France
  // ═══════════════════════════════════════════════════════════════════════
  { name: "V and B", color: "#7CB342", domain: "vandb.fr", aliases: ["v&b", "v and b"] },
  { name: "Chope et Compagnie", color: "#FF7F11", domain: "chopeetcompagnie.fr", aliases: ["chope et cie"] },
  { name: "Nicolas", color: "#7B1F2B", domain: "nicolas.com" },
  { name: "Repaire de Bacchus", color: "#7B1F2B", domain: "repairedebacchus.com" },
  { name: "Cave Ô", color: "#7B1F2B", domain: "cave-o.com" },

  // ═══════════════════════════════════════════════════════════════════════
  // RESTAURATION / FAST FOOD — France
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Buffalo Grill", color: "#8B0000", domain: "buffalo-grill.fr" },
  { name: "Hippopotamus", color: "#0033A0", domain: "hippopotamus.fr" },
  { name: "Courtepaille", color: "#E2001A", domain: "courtepaille.com" },
  { name: "Léon de Bruxelles", color: "#FFD200", domain: "leon-de-bruxelles.fr" },
  { name: "PizzaPai", color: "#E2001A", domain: "pizzapai.fr" },
  { name: "Sushi Shop", color: "#000000", domain: "sushishop.com" },
  { name: "O'Tacos", color: "#FFD200", domain: "otacos.fr" },
  { name: "Class'Croute", color: "#00A551", domain: "classcroute.com" },
  { name: "Paul", color: "#000000", domain: "paul.fr" },
  { name: "La Mie Câline", color: "#E2001A", domain: "lamiecaline.com" },
  { name: "Brioche Dorée", color: "#E2001A", domain: "briochedoree.fr" },
  { name: "Columbus Café", color: "#7B3F00", domain: "columbus-cafe.com" },

  // ═══════════════════════════════════════════════════════════════════════
  // MODE / ACCESSOIRES — France
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Sandro", color: "#000000", domain: "sandro-paris.com" },
  { name: "Maje", color: "#000000", domain: "maje.com" },
  { name: "The Kooples", color: "#000000", domain: "thekooples.com" },
  { name: "Comptoir des Cotonniers", color: "#000000", domain: "comptoirdescotonniers.com" },
  { name: "Petit Bateau", color: "#0055A4", domain: "petit-bateau.fr" },
  { name: "Okaidi", color: "#E6007E", domain: "okaidi.fr" },
  { name: "Du Pareil au Même", color: "#FFD200", domain: "dpam.com", aliases: ["dpam"] },
  { name: "Vertbaudet", color: "#00A551", domain: "vertbaudet.fr" },
  { name: "Eram", color: "#000000", domain: "eram.fr" },
  { name: "André", color: "#000000", domain: "andre.fr" },
  { name: "Bata", color: "#E2001A", domain: "bata.com" },

  // ═══════════════════════════════════════════════════════════════════════
  // BRICOLAGE / JARDIN — France
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Jardiland", color: "#00A551", domain: "jardiland.com" },
  { name: "Botanic", color: "#00A551", domain: "botanic.com" },
  { name: "Point Vert", color: "#00A551", domain: "gammvert.fr" },
  { name: "Weldom", color: "#E2001A", domain: "weldom.fr" },

  // ═══════════════════════════════════════════════════════════════════════
  // PARAPHARMACIE / SANTÉ — France
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Pharmacie Lafayette", color: "#0033A0", domain: "pharmaciedelafayette.com" },
  { name: "Newpharma", color: "#00A551", domain: "newpharma.fr" },
  { name: "Pharmashopi", color: "#00A551", domain: "pharmashopi.com" },

  // ═══════════════════════════════════════════════════════════════════════
  // AUTO / TRANSPORT — France
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Norauto", color: "#FFD200", domain: "norauto.fr" },
  { name: "Feu Vert", color: "#E2001A", domain: "feuvert.fr" },
  { name: "Speedy", color: "#E2001A", domain: "speedy.fr" },
  { name: "Midas", color: "#FFD200", domain: "midas.fr" },
  { name: "Roady", color: "#0055A4", domain: "roady.fr" },

  // ═══════════════════════════════════════════════════════════════════════
  // RESTAURATION / MODE / DIVERS — Allemagne
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Vapiano", color: "#E2001A", domain: "vapiano.de" },
  { name: "Nordsee", color: "#0055A4", domain: "nordsee.com" },
  { name: "Lindt", color: "#FFD200", domain: "lindt.de" },
  { name: "Tchibo", color: "#E2001A", domain: "tchibo.de" },
  { name: "Müller", color: "#0055A4", domain: "mueller.de" },
  { name: "Esprit", color: "#000000", domain: "esprit.de" },
  { name: "S.Oliver", color: "#000000", domain: "soliver.de", aliases: ["s oliver"] },
  { name: "Tom Tailor", color: "#0033A0", domain: "tom-tailor.com" },
  { name: "Peek & Cloppenburg", color: "#000000", domain: "peek-cloppenburg.de" },
  { name: "Galeria Karstadt Kaufhof", color: "#E2001A", domain: "galeria.de" },
  { name: "Deichmann", color: "#0055A4", domain: "deichmann.com" },
  { name: "Görtz", color: "#000000", domain: "goertz.de" },
  { name: "Thalia Bücher", color: "#E2001A", domain: "thalia.de" },
  { name: "Bauhaus DIY", color: "#E2001A", domain: "bauhaus.info" },
  { name: "Lufthansa Cargo", color: "#05164D", domain: "lufthansa.com" },
  { name: "Sixt", color: "#FF5F00", domain: "sixt.de" },
  { name: "Europcar", color: "#00A551", domain: "europcar.com" },
  { name: "ADAC", color: "#FFD200", domain: "adac.de" },

  // ═══════════════════════════════════════════════════════════════════════
  // SUPERMARCHÉS / DIVERS — Pays-Bas
  // ═══════════════════════════════════════════════════════════════════════
  { name: "HEMA", color: "#E2001A", domain: "hema.nl" },
  { name: "Blokker", color: "#E2001A", domain: "blokker.nl" },
  { name: "Action", color: "#E2001A", domain: "action.com" },
  { name: "Wehkamp", color: "#000000", domain: "wehkamp.nl" },
  { name: "Bol.com", color: "#0000A4", domain: "bol.com" },
  { name: "Coolblue", color: "#0090D6", domain: "coolblue.nl" },
  { name: "MediaMarkt Nederland", color: "#E2001A", domain: "mediamarkt.nl" },
  { name: "Intertoys", color: "#E2001A", domain: "intertoys.nl" },
  { name: "Zeeman", color: "#0055A4", domain: "zeeman.com" },
  { name: "WE Fashion", color: "#000000", domain: "we-fashion.com" },

  // ═══════════════════════════════════════════════════════════════════════
  // SUPERMARCHÉS / MODE / DIVERS — Espagne
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Druni", color: "#E6007E", domain: "druni.es" },
  { name: "Worten", color: "#E2001A", domain: "worten.es" },
  { name: "Telepizza", color: "#E2001A", domain: "telepizza.com" },
  { name: "100 Montaditos", color: "#FFD200", domain: "100montaditos.com" },
  { name: "VIPS", color: "#E2001A", domain: "vips.es" },
  { name: "Rodilla", color: "#E2001A", domain: "rodilla.es" },

  // ═══════════════════════════════════════════════════════════════════════
  // SUPERMARCHÉS / MODE / DIVERS — Italie
  // ═══════════════════════════════════════════════════════════════════════
  { name: "OVS", color: "#E2001A", domain: "ovs.it" },
  { name: "Benetton", color: "#00A551", domain: "benetton.com" },
  { name: "Yamamay", color: "#000000", domain: "yamamay.com" },
  { name: "Calzedonia", color: "#000000", domain: "calzedonia.com" },
  { name: "Intimissimi", color: "#000000", domain: "intimissimi.com" },
  { name: "Autogrill", color: "#E2001A", domain: "autogrill.com" },
  { name: "Trony", color: "#E2001A", domain: "trony.it" },
  { name: "Unieuro", color: "#E2001A", domain: "unieuro.it" },
  { name: "Mediaworld Italia", color: "#E2001A", domain: "mediaworld.it" },

  // ═══════════════════════════════════════════════════════════════════════
  // SUPERMARCHÉS / DIVERS — Russie
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Dixy", color: "#E2001A", domain: "dixy.ru", aliases: ["дикси"] },
  { name: "Okay", color: "#0055A4", domain: "okmarket.ru", aliases: ["окей"] },
  { name: "Sportmaster", color: "#E2001A", domain: "sportmaster.ru", aliases: ["спортмастер"] },
  { name: "Detsky Mir", color: "#FFD200", domain: "detmir.ru", aliases: ["детский мир"] },
  { name: "Eldorado", color: "#FFD200", domain: "eldorado.ru", aliases: ["эльдорадо"] },
  { name: "M.Video", color: "#E2001A", domain: "mvideo.ru" },
  { name: "Wildberries", color: "#7B1FA2", domain: "wildberries.ru", aliases: ["вайлдберриз"] },
  { name: "Ozon", color: "#0055A4", domain: "ozon.ru" },
  { name: "Rosneft", color: "#FFD200", domain: "rosneft.ru", aliases: ["роснефть"] },
  { name: "Yandex Market", color: "#FFCC00", domain: "market.yandex.ru" },

  // ═══════════════════════════════════════════════════════════════════════
  // SUPERMARKETS / SHOPS — UK
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Halfords", color: "#E2001A", domain: "halfords.com" },
  { name: "Argos", color: "#E2001A", domain: "argos.co.uk" },
  { name: "John Lewis", color: "#000000", domain: "johnlewis.com" },
  { name: "Debenhams", color: "#000000", domain: "debenhams.com" },
  { name: "Selfridges", color: "#FFD200", domain: "selfridges.com" },
  { name: "Topshop", color: "#000000", domain: "topshop.com" },
  { name: "Office", color: "#000000", domain: "office.co.uk" },
  { name: "Clarks", color: "#000000", domain: "clarks.com" },
  { name: "Wilko", color: "#E2001A", domain: "wilko.com" },
  { name: "Poundland", color: "#E2001A", domain: "poundland.co.uk" },
  { name: "Lakeland", color: "#0055A4", domain: "lakeland.co.uk" },
  { name: "Holland & Barrett", color: "#00543C", domain: "hollandandbarrett.com" },

  // ═══════════════════════════════════════════════════════════════════════
  // RETAIL / RESTAURANTS — US
  // ═══════════════════════════════════════════════════════════════════════
  { name: "CVS Pharmacy", color: "#CC0000", domain: "cvs.com" },
  { name: "Walgreens", color: "#E2001A", domain: "walgreens.com" },
  { name: "Home Depot", color: "#F96302", domain: "homedepot.com" },
  { name: "Lowe's", color: "#004990", domain: "lowes.com" },
  { name: "Macy's", color: "#E2001A", domain: "macys.com" },
  { name: "Nordstrom", color: "#000000", domain: "nordstrom.com" },
  { name: "TJ Maxx", color: "#E2001A", domain: "tjmaxx.tjx.com" },
  { name: "Dollar Tree", color: "#00A551", domain: "dollartree.com" },
  { name: "Publix", color: "#00A551", domain: "publix.com" },
  { name: "Safeway", color: "#E2001A", domain: "safeway.com" },
  { name: "Wegmans", color: "#E2001A", domain: "wegmans.com" },
  { name: "Panera Bread", color: "#5A8F29", domain: "panerabread.com" },
  { name: "Wendy's", color: "#E2001A", domain: "wendys.com" },
  { name: "Applebee's", color: "#8B0000", domain: "applebees.com" },
  { name: "Olive Garden", color: "#00543C", domain: "olivegarden.com" },
  { name: "Petco", color: "#E2001A", domain: "petco.com" },
  { name: "PetSmart", color: "#0033A0", domain: "petsmart.com" },
  { name: "REI", color: "#00543C", domain: "rei.com" },

  // ═══════════════════════════════════════════════════════════════════════
  // SUPERMARCHÉS / DIVERS — Portugal
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Continente", color: "#E2001A", domain: "continente.pt" },
  { name: "Pingo Doce", color: "#00A551", domain: "pingodoce.pt" },
  { name: "Modelo", color: "#E2001A", domain: "continente.pt" },
  { name: "Galp Energia", color: "#FF6D00", domain: "galp.com" },

  // ═══════════════════════════════════════════════════════════════════════
  // COMPLÉMENT MARQUES POPULAIRES
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Lego", color: "#D50000", domain: "lego.com" },
  { name: "King Jouet", color: "#0055A4", domain: "king-jouet.com" },
  { name: "JouéClub", color: "#E2001A", domain: "joueclub.fr" },
  { name: "Toys R Us", color: "#0066B3", domain: "toysrus.ca" },
  { name: "Smyths Toys", color: "#0066B3", domain: "smythstoys.com" },
  { name: "Disney Store", color: "#0033A0", domain: "shopdisney.com" },
  { name: "Ulta Beauty", color: "#FF6F61", domain: "ulta.com" },
  { name: "Sport Bittl", color: "#0055A4", domain: "sport-bittl.com" },
  { name: "Go Outdoors", color: "#00543C", domain: "gooutdoors.co.uk" },
  { name: "Snowleader", color: "#0055A4", domain: "snowleader.com" },

  // ═══════════════════════════════════════════════════════════════════════
  // MODE HOMME / FEMME / ENFANT — France
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Galeries Lafayette", color: "#8801D2", domain: "galerieslafayette.com" },
  { name: "Printemps", color: "#E6007E", domain: "printemps.com" },
  { name: "Bonobo", color: "#000000", domain: "bonobo-jeans.com" },
  { name: "Bizzbee", color: "#000000", domain: "bizzbee.com" },
  { name: "Naf Naf", color: "#E2001A", domain: "nafnaf.com" },
  { name: "Pimkie", color: "#E6007E", domain: "pimkie.fr" },
  { name: "Morgan", color: "#000000", domain: "morgan.fr" },
  { name: "Jennyfer", color: "#E6007E", domain: "jennyfer.com" },
  { name: "Brice", color: "#1A1A1A", domain: "brice.fr" },
  { name: "Burton", color: "#000000", domain: "burton.fr" },
  { name: "Tape à l'Œil", color: "#FFD200", domain: "tapealoeil.fr" },
  { name: "Orchestra", color: "#0091D6", domain: "orchestra.fr" },
  { name: "Sergent Major", color: "#003DA5", domain: "sergent-major.com" },
  { name: "Catimini", color: "#E6007E", domain: "catimini.com" },
  { name: "Jacadi", color: "#003DA5", domain: "jacadi.fr" },
  { name: "Grain de Malice", color: "#E6007E", domain: "graindemalice.fr" },
  { name: "Cache Cache", color: "#1A1A1A", domain: "cache-cache.fr" },
  { name: "Kaporal", color: "#1A1A1A", domain: "kaporal.com" },
  { name: "IKKS", color: "#1A1A1A", domain: "ikks.com" },
  { name: "Galeries Barbès", color: "#E2001A", domain: "galeriesbarbes.com" },

  // ═══════════════════════════════════════════════════════════════════════
  // MODE HOMME / FEMME / ENFANT — UK / US
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Zara UK", color: "#000000", domain: "zara.com" },
  { name: "Burberry", color: "#A1824A", domain: "burberry.com" },
  { name: "Ted Baker", color: "#000000", domain: "tedbaker.com" },
  { name: "Superdry", color: "#1A1A1A", domain: "superdry.com" },
  { name: "Fred Perry", color: "#1A4D2E", domain: "fredperry.com" },
  { name: "Reiss", color: "#1A1A1A", domain: "reiss.com" },
  { name: "Jack Wills", color: "#000033", domain: "jackwills.com" },
  { name: "Hollister", color: "#003087", domain: "hollisterco.com" },
  { name: "Abercrombie & Fitch", color: "#1A1A1A", domain: "abercrombie.com" },
  { name: "American Eagle", color: "#003DA5", domain: "ae.com" },
  { name: "Old Navy", color: "#003DA5", domain: "oldnavy.gap.com" },
  { name: "Banana Republic", color: "#1A1A1A", domain: "bananarepublic.gap.com" },
  { name: "J.Crew", color: "#1A1A1A", domain: "jcrew.com" },
  { name: "Forever 21", color: "#FFD200", domain: "forever21.com" },
  { name: "Urban Outfitters", color: "#1A1A1A", domain: "urbanoutfitters.com" },
  { name: "Express", color: "#1A1A1A", domain: "express.com" },
  { name: "Aeropostale", color: "#003DA5", domain: "aeropostale.com" },
  { name: "Carter's", color: "#E2001A", domain: "carters.com" },
  { name: "Children's Place", color: "#E6007E", domain: "childrensplace.com" },
  { name: "Zumiez", color: "#1A1A1A", domain: "zumiez.com" },

  // ═══════════════════════════════════════════════════════════════════════
  // MODE HOMME / FEMME / ENFANT — Allemagne
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Bonprix", color: "#E6007E", domain: "bonprix.de" },
  { name: "Hallhuber", color: "#1A1A1A", domain: "hallhuber.com" },
  { name: "Adler Mode", color: "#0055A4", domain: "adlermode.com" },
  { name: "Vögele", color: "#000000", domain: "voegele-shoes.com" },
  { name: "Engelhorn", color: "#000000", domain: "engelhorn.com" },
  { name: "Jack & Jones", color: "#1A1A1A", domain: "jackjones.com" },
  { name: "Vero Moda", color: "#1A1A1A", domain: "veromoda.com" },
  { name: "Only", color: "#1A1A1A", domain: "only.com" },

  // ═══════════════════════════════════════════════════════════════════════
  // MODE HOMME / FEMME / ENFANT — Espagne / Italie / Portugal
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Lefties", color: "#1A1A1A", domain: "lefties.com" },
  { name: "Women'secret", color: "#E6007E", domain: "womensecret.com" },
  { name: "Springfield", color: "#1A1A1A", domain: "springfield.com" },
  { name: "Tezenis", color: "#1A1A1A", domain: "tezenis.com" },
  { name: "Sisley", color: "#1A1A1A", domain: "sisley.com" },
  { name: "Original Marines", color: "#0091D6", domain: "originalmarines.com" },
  { name: "Prenatal", color: "#E6007E", domain: "prenatal.it" },
  { name: "Salsa Jeans", color: "#1A1A1A", domain: "salsajeans.com" },

  // ═══════════════════════════════════════════════════════════════════════
  // MODE HOMME / FEMME / ENFANT — Pays-Bas / Russie
  // ═══════════════════════════════════════════════════════════════════════
  { name: "C&A Nederland", color: "#E2001A", domain: "c-and-a.com" },
  { name: "Costes Fashion", color: "#000000", domain: "costes.nl" },
  { name: "Sportmaster Mode", color: "#E2001A", domain: "sportmaster.ru" },
  { name: "Gloria Jeans", color: "#E2001A", domain: "gloria-jeans.ru" },
  { name: "Befree", color: "#1A1A1A", domain: "befree.ru" },
  { name: "Zarina", color: "#1A1A1A", domain: "zarina.ru" },

  // ═══════════════════════════════════════════════════════════════════════
  // SPORT
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Reebok", color: "#000000", domain: "reebok.com" },
  { name: "Under Armour", color: "#1A1A1A", domain: "underarmour.com" },
  { name: "Asics", color: "#0033A0", domain: "asics.com" },
  { name: "Fila", color: "#0033A0", domain: "fila.com" },
  { name: "Columbia", color: "#1A4D8F", domain: "columbia.com" },
  { name: "The North Face", color: "#1A1A1A", domain: "thenorthface.com" },
  { name: "Quiksilver", color: "#003DA5", domain: "quiksilver.com" },
  { name: "Salomon", color: "#1A1A1A", domain: "salomon.com" },
  { name: "Lululemon", color: "#C8102E", domain: "lululemon.com" },
  { name: "Footlocker", color: "#1A1A1A", domain: "footlocker.com" },
  { name: "JD Sports", color: "#1A1A1A", domain: "jdsports.com" },

  // ═══════════════════════════════════════════════════════════════════════
  // MODE INTERNATIONALE
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Tommy Hilfiger", color: "#001E62", domain: "tommy.com" },
  { name: "Calvin Klein", color: "#1A1A1A", domain: "calvinklein.com" },
  { name: "Lacoste", color: "#1A7A3C", domain: "lacoste.com" },
  { name: "Ralph Lauren", color: "#1A1A1A", domain: "ralphlauren.com" },
  { name: "Guess", color: "#1A1A1A", domain: "guess.com" },
  { name: "Diesel", color: "#1A1A1A", domain: "diesel.com" },
  { name: "G-Star RAW", color: "#1A1A1A", domain: "g-star.com" },
  { name: "Timberland", color: "#FFC72C", domain: "timberland.com" },
  { name: "Dr. Martens", color: "#FFCC00", domain: "drmartens.com" },
  { name: "Crocs", color: "#1A1A1A", domain: "crocs.com" },
  { name: "Skechers", color: "#1A1A1A", domain: "skechers.com" },

  // ═══════════════════════════════════════════════════════════════════════
  // ÉLECTRONIQUE & MULTIMEDIA
  // ═══════════════════════════════════════════════════════════════════════
  { name: "MediaMarkt", color: "#E2001A", domain: "mediamarkt.de" },

  // ═══════════════════════════════════════════════════════════════════════
  // BEAUTÉ & SANTÉ
  // ═══════════════════════════════════════════════════════════════════════
  { name: "MAC Cosmetics", color: "#1A1A1A", domain: "maccosmetics.com" },

  // ═══════════════════════════════════════════════════════════════════════
  // MAISON & DÉCO
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Bed Bath & Beyond", color: "#0033A0", domain: "bedbathandbeyond.com" },
  { name: "Williams Sonoma", color: "#1A1A1A", domain: "williams-sonoma.com" },
  { name: "Crate & Barrel", color: "#1A1A1A", domain: "crateandbarrel.com" },
  { name: "Made.com", color: "#1A1A1A", domain: "made.com" },
  { name: "Alinéa", color: "#1A1A1A", domain: "alinea.com" },

  // ═══════════════════════════════════════════════════════════════════════
  // RESTAURATION RAPIDE
  // ═══════════════════════════════════════════════════════════════════════
  { name: "KFC", color: "#E4002B", domain: "kfc.com" },
  { name: "Dunkin'", color: "#FF671F", domain: "dunkindonuts.com" },
  { name: "Chick-fil-A", color: "#DD0033", domain: "chick-fil-a.com" },
  { name: "Popeyes", color: "#FF6600", domain: "popeyes.com" },
  { name: "Panda Express", color: "#C8102E", domain: "pandaexpress.com" },
  { name: "Sonic Drive-In", color: "#0033A0", domain: "sonicdrivein.com" },
  { name: "Jack in the Box", color: "#E2001A", domain: "jackinthebox.com" },
  { name: "Carl's Jr.", color: "#E2231A", domain: "carlsjr.com" },
  { name: "Arby's", color: "#C8102E", domain: "arbys.com" },
  { name: "Hardee's", color: "#E2231A", domain: "hardees.com" },
  { name: "In-N-Out Burger", color: "#D2232A", domain: "in-n-out.com" },
  { name: "Krispy Kreme", color: "#1A1A1A", domain: "krispykreme.com" },

  // ═══════════════════════════════════════════════════════════════════════
  // BAGAGERIE & ACCESSOIRES
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Samsonite", color: "#1A1A1A", domain: "samsonite.com" },
  { name: "Fossil", color: "#1A1A1A", domain: "fossil.com" },
  { name: "Swatch", color: "#E4002B", domain: "swatch.com" },
  { name: "Pandora", color: "#1A1A1A", domain: "pandora.net" },

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

/**
 * Recherche le domaine d'une marque (pour récupérer son logo via logo.dev).
 * Retourne le domaine si trouvé, sinon null.
 */
export function findBrandDomain(name: string): string | null {
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
    if (!brand.domain) continue;
    if (normalize(brand.name) === query) return brand.domain;
    if (brand.aliases) {
      for (const alias of brand.aliases) {
        if (normalize(alias) === query) return brand.domain;
      }
    }
  }

  // Match partiel
  if (query.length >= 3) {
    for (const brand of BRANDS) {
      if (!brand.domain) continue;
      const brandName = normalize(brand.name);
      if (query.includes(brandName) || brandName.includes(query)) return brand.domain;
      if (brand.aliases) {
        for (const alias of brand.aliases) {
          const aliasName = normalize(alias);
          if (query.includes(aliasName) || aliasName.includes(query)) return brand.domain;
        }
      }
    }
  }

  return null;
}
