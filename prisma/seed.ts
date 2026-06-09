import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

async function getOrCreateCategory(name: string) {
  const slug = toSlug(name);
  const existing = await prisma.category.findFirst({ where: { name } });
  if (existing) return existing;
  return prisma.category.create({ data: { name, slug } });
}

async function getOrCreateSubcategory(name: string, categoryId: string) {
  const existing = await prisma.subcategory.findFirst({ where: { name, categoryId } });
  if (existing) return existing;
  return prisma.subcategory.create({ data: { name, categoryId } });
}

async function getOrCreateBrand(name: string) {
  const slug = toSlug(name);
  const existing = await prisma.brand.findFirst({ where: { name } });
  if (existing) return existing;
  return prisma.brand.create({ data: { name, slug } });
}

async function main() {
  // ── Users ──
  const adminPassword = await bcrypt.hash("12345678", 12);
  const vendedorPassword = await bcrypt.hash("vendedor123", 12);
  const mecanicoPassword = await bcrypt.hash("mecanico123", 12);

  await prisma.user.upsert({
    where: { email: "giannicuver11@gmail.com" },
    update: {},
    create: { email: "giannicuver11@gmail.com", password: adminPassword, name: "Admin", role: "DESARROLLADOR" },
  });
  await prisma.user.upsert({
    where: { email: "vendedor@lubritotal.cl" },
    update: {},
    create: { email: "vendedor@lubritotal.cl", password: vendedorPassword, name: "Vendedor", role: "VENDEDOR" },
  });
  await prisma.user.upsert({
    where: { email: "mecanico@lubritotal.cl" },
    update: {},
    create: { email: "mecanico@lubritotal.cl", password: mecanicoPassword, name: "Mec\u00e1nico", role: "MECANICO" },
  });

  // ── Categories ──
  const catAceites = await getOrCreateCategory("Aceites");
  const catFiltros = await getOrCreateCategory("Filtros");
  const catNeumaticos = await getOrCreateCategory("Neum\u00e1ticos");
  const catBaterias = await getOrCreateCategory("Bater\u00edas");
  const catCorreas = await getOrCreateCategory("Correas");
  const catAccesorios = await getOrCreateCategory("Accesorios");
  const catLubAditivos = await getOrCreateCategory("Lubricantes y Aditivos");
  const catRepuestos = await getOrCreateCategory("Repuestos");

  // ── Subcategories ──
  const subMap: Record<string, string> = {};

  for (const s of ["Motor", "ATF", "CVT", "Diferencial", "Hidr\u00e1ulico", "Transmisi\u00f3n Manual"]) {
    const c = await getOrCreateSubcategory(s, catAceites.id);
    subMap[s] = c.id;
  }
  for (const s of ["Filtro Aceite", "Filtro Aire", "Filtro Combustible", "Filtro Petr\u00f3leo", "Filtro Cabina", "Filtro Polen"]) {
    const c = await getOrCreateSubcategory(s, catFiltros.id);
    subMap[s] = c.id;
  }
  for (const s of ["Correa Distribuci\u00f3n", "Correa Alternador", "Correa Poli-V"]) {
    const c = await getOrCreateSubcategory(s, catCorreas.id);
    subMap[s] = c.id;
  }
  for (const s of ["Focos", "Escobillas", "Cables", "Aditivos"]) {
    const c = await getOrCreateSubcategory(s, catAccesorios.id);
    subMap[s] = c.id;
  }
  for (const s of ["Lubricantes", "Aditivos"]) {
    const c = await getOrCreateSubcategory(s, catLubAditivos.id);
    subMap[s] = c.id;
  }
  for (const s of ["Frenos", "Suspensi\u00f3n"]) {
    const c = await getOrCreateSubcategory(s, catRepuestos.id);
    subMap[s] = c.id;
  }

  // ── Brands ──
  const brandNames = [
    "Mobil", "Shell", "Castrol", "Valvoline", "Petronas", "Motul", "Total",
    "Liqui Moly", "STP", "Kroon Oil", "Wurth", "Mann", "Mahle", "Sakura",
    "Bosch", "Fram", "Fleetguard", "Donaldson", "Tecfil", "Wega", "Vic",
    "Michelin", "Bridgestone", "Goodyear", "Pirelli", "Continental", "Hankook",
    "Kumho", "Yokohama", "Toyo", "Falken", "Nexen", "Maxxis", "BFGoodrich",
    "Cooper", "Firestone", "Sailun", "Goodride", "Linglong", "Triangle",
    "Double Coin", "Varta", "Solite", "Rocket", "AC Delco", "Tudor", "AtlasBX",
  ];
  const brandMap: Record<string, string> = {};
  for (const name of brandNames) {
    const b = await getOrCreateBrand(name);
    brandMap[name] = b.id;
  }

  // ── Helper ──
  async function upsertProduct(data: {
    code: string; name: string; categoryId: string; subcategoryId?: string;
    brandId?: string; buyPrice: number; sellPrice: number; stock: number;
    minStock: number; location: string; viscosity?: string; technology?: string;
    presentation?: string; tireType?: string; tireMeasure?: string;
    amperage?: string; voltage?: string; engineType?: string;
  }) {
    await prisma.product.upsert({
      where: { code: data.code },
      update: {},
      create: { ...data, active: true },
    });
  }

  // ═══════════════════════════════════════════════════
  // ACEITES DE MOTOR (ACE0001 - ACE0040)
  // ═══════════════════════════════════════════════════
  const motorOilData: [string, string, string, string, string, string, number, number, number, string][] = [
    ["ACE0001","Mobil 1 ESP","5W30","Sintético","Mobil","1L",8900,14990,12,"Rack A-A01"],
    ["ACE0002","Mobil 1 ESP","5W30","Sintético","Mobil","4L",32900,49990,8,"Rack A-A01"],
    ["ACE0003","Mobil Super 2000","10W40","Semi Sintético","Mobil","1L",5900,10490,18,"Rack A-A02"],
    ["ACE0004","Mobil Super 2000","10W40","Semi Sintético","Mobil","4L",22900,35990,10,"Rack A-A02"],
    ["ACE0005","Mobil Delvac MX","15W40","Mineral","Mobil","1L",4900,8990,20,"Rack A-A03"],
    ["ACE0006","Mobil Delvac MX","15W40","Mineral","Mobil","20L",69900,99990,5,"Rack A-A03"],
    ["ACE0007","Shell Helix Ultra","5W40","Sintético","Shell","1L",8200,13990,14,"Rack A-A04"],
    ["ACE0008","Shell Helix Ultra","5W40","Sintético","Shell","4L",31900,48990,8,"Rack A-A04"],
    ["ACE0009","Shell Helix HX7","10W40","Semi Sintético","Shell","1L",5400,9990,22,"Rack A-A05"],
    ["ACE0010","Shell Helix HX7","10W40","Semi Sintético","Shell","4L",21500,33990,10,"Rack A-A05"],
    ["ACE0011","Castrol Edge","5W30","Sintético","Castrol","1L",8500,14490,16,"Rack A-A06"],
    ["ACE0012","Castrol Edge","5W30","Sintético","Castrol","4L",32900,49990,7,"Rack A-A06"],
    ["ACE0013","Castrol Magnatec","10W40","Semi Sintético","Castrol","1L",5600,9990,20,"Rack A-A07"],
    ["ACE0014","Castrol Magnatec","10W40","Semi Sintético","Castrol","4L",21900,34990,10,"Rack A-A07"],
    ["ACE0015","Valvoline SynPower","5W40","Sintético","Valvoline","1L",7900,12990,15,"Rack A-A08"],
    ["ACE0016","Valvoline SynPower","5W40","Sintético","Valvoline","4L",29900,46990,8,"Rack A-A08"],
    ["ACE0017","Valvoline All Climate","10W40","Semi Sintético","Valvoline","1L",5200,9490,20,"Rack A-A09"],
    ["ACE0018","Valvoline All Climate","10W40","Semi Sintético","Valvoline","4L",20900,32990,12,"Rack A-A09"],
    ["ACE0019","Petronas Syntium 3000","5W40","Sintético","Petronas","1L",7800,12990,12,"Rack A-A10"],
    ["ACE0020","Petronas Syntium 3000","5W40","Sintético","Petronas","4L",29500,45990,8,"Rack A-A10"],
    ["ACE0021","Petronas Urania","15W40","Mineral","Petronas","20L",65900,95990,5,"Rack A-A11"],
    ["ACE0022","Motul 8100 X-Clean","5W40","Sintético","Motul","1L",9500,15990,10,"Rack A-A12"],
    ["ACE0023","Motul 8100 X-Clean","5W40","Sintético","Motul","5L",42900,62990,6,"Rack A-A12"],
    ["ACE0024","Motul 6100 Synergie","10W40","Semi Sintético","Motul","1L",6900,11990,12,"Rack A-A13"],
    ["ACE0025","Total Quartz 9000","5W40","Sintético","Total","1L",7900,13490,18,"Rack A-A14"],
    ["ACE0026","Total Quartz 9000","5W40","Sintético","Total","4L",29900,45990,9,"Rack A-A14"],
    ["ACE0027","Total Quartz 7000","10W40","Semi Sintético","Total","1L",5400,9490,20,"Rack A-A15"],
    ["ACE0028","Liqui Moly Top Tec 4200","5W30","Sintético","Liqui Moly","1L",10900,17990,8,"Rack A-A16"],
    ["ACE0029","Liqui Moly Top Tec 4200","5W30","Sintético","Liqui Moly","5L",48900,72990,5,"Rack A-A16"],
    ["ACE0030","Liqui Moly Leichtlauf","10W40","Semi Sintético","Liqui Moly","1L",7900,12990,12,"Rack A-A17"],
    ["ACE0031","STP Synthetic","5W30","Sintético","STP","1L",6900,11990,15,"Rack A-A18"],
    ["ACE0032","STP Synthetic","5W30","Sintético","STP","4L",25900,39990,8,"Rack A-A18"],
    ["ACE0033","Kroon Oil Emperol","5W40","Sintético","Kroon Oil","1L",8500,13990,10,"Rack A-A19"],
    ["ACE0034","Kroon Oil Emperol","5W40","Sintético","Kroon Oil","4L",31900,48990,6,"Rack A-A19"],
    ["ACE0035","Wurth High Performance","5W30","Sintético","Wurth","1L",8900,14990,8,"Rack A-A20"],
    ["ACE0036","Wurth High Performance","5W30","Sintético","Wurth","4L",33900,51990,5,"Rack A-A20"],
    ["ACE0037","Mobil Delvac Modern","15W40","Mineral","Mobil","208L",699000,999000,1,"Bodega Aceites"],
    ["ACE0038","Shell Rimula R4","15W40","Mineral","Shell","208L",689000,979000,1,"Bodega Aceites"],
    ["ACE0039","Total Rubia TIR","15W40","Mineral","Total","208L",679000,969000,1,"Bodega Aceites"],
    ["ACE0040","Petronas Urania Daily","15W40","Mineral","Petronas","208L",669000,959000,1,"Bodega Aceites"],
  ];
  for (const [code, name, visc, tech, brand, pres, buy, sell, stock, loc] of motorOilData) {
    await upsertProduct({
      code, name,
      categoryId: catAceites.id, subcategoryId: subMap["Motor"],
      brandId: brandMap[brand], viscosity: visc, technology: tech, presentation: pres,
      buyPrice: buy, sellPrice: sell, stock, minStock: Math.max(2, Math.floor(stock / 3)),
      location: loc,
    });
  }

  // ═══════════════════════════════════════════════════
  // ACEITES ATF (ACE0041 - ACE0056)
  // ═══════════════════════════════════════════════════
  const atfData: [string, string, string, string, string, string, number, number, number, string][] = [
    ["ACE0041","Mobil ATF 220","ATF","Mineral","Mobil","1L",5900,10990,15,"Rack A-B01"],
    ["ACE0042","Mobil ATF 220","ATF","Mineral","Mobil","20L",75900,109900,4,"Rack A-B01"],
    ["ACE0043","Mobil ATF Multi Vehicle","ATF","Sintético","Mobil","1L",7900,13990,12,"Rack A-B02"],
    ["ACE0044","Mobil ATF Multi Vehicle","ATF","Sintético","Mobil","20L",109000,159900,3,"Rack A-B02"],
    ["ACE0045","Shell Spirax S4 ATF HDX","ATF","Sintético","Shell","1L",7900,13990,10,"Rack A-B03"],
    ["ACE0046","Shell Spirax S4 ATF HDX","ATF","Sintético","Shell","20L",105000,154900,4,"Rack A-B03"],
    ["ACE0047","Castrol Transmax Dex III","ATF","Mineral","Castrol","1L",6200,10990,18,"Rack A-B04"],
    ["ACE0048","Castrol Transmax Dex III","ATF","Mineral","Castrol","20L",77900,114900,3,"Rack A-B04"],
    ["ACE0049","Valvoline MaxLife ATF","ATF","Sintético","Valvoline","1L",8500,14990,10,"Rack A-B05"],
    ["ACE0050","Valvoline MaxLife ATF","ATF","Sintético","Valvoline","20L",115000,169900,3,"Rack A-B05"],
    ["ACE0051","Petronas Tutela ATF 900","ATF","Sintético","Petronas","1L",7900,13990,10,"Rack A-B06"],
    ["ACE0052","Motul Multi ATF","ATF","Sintético","Motul","1L",9500,16990,8,"Rack A-B07"],
    ["ACE0053","Liqui Moly Top Tec ATF 1800","ATF","Sintético","Liqui Moly","1L",10900,18990,8,"Rack A-B08"],
    ["ACE0054","Total Fluide ATX","ATF","Sintético","Total","1L",7900,13990,12,"Rack A-B09"],
    ["ACE0055","Kroon Oil SP Matic","ATF","Sintético","Kroon Oil","1L",8500,14990,8,"Rack A-B10"],
    ["ACE0056","Wurth ATF Dexron III","ATF","Semi Sintético","Wurth","1L",7900,13990,10,"Rack A-B11"],
  ];
  for (const [code, name, visc, tech, brand, pres, buy, sell, stock, loc] of atfData) {
    await upsertProduct({
      code, name,
      categoryId: catAceites.id, subcategoryId: subMap["ATF"],
      brandId: brandMap[brand], viscosity: visc, technology: tech, presentation: pres,
      buyPrice: buy, sellPrice: sell, stock, minStock: Math.max(2, Math.floor(stock / 3)),
      location: loc,
    });
  }

  // ═══════════════════════════════════════════════════
  // ACEITES CVT (ACE0057 - ACE0064)
  // ═══════════════════════════════════════════════════
  const cvtData: [string, string, string, string, string, number, number, number, string][] = [
    ["ACE0057","Mobil CVTF Multi Vehicle","Sintético","Mobil","1L",9900,17990,8,"Rack A-C01"],
    ["ACE0058","Shell Spirax CVT","Sintético","Shell","1L",10500,18990,6,"Rack A-C02"],
    ["ACE0059","Castrol Transmax CVT","Sintético","Castrol","1L",10500,18990,8,"Rack A-C03"],
    ["ACE0060","Valvoline CVT Fluid","Sintético","Valvoline","1L",9900,17990,10,"Rack A-C04"],
    ["ACE0061","Petronas Tutela CVT","Sintético","Petronas","1L",9900,17990,8,"Rack A-C05"],
    ["ACE0062","Motul Multi CVTF","Sintético","Motul","1L",11900,20990,5,"Rack A-C06"],
    ["ACE0063","Liqui Moly CVT Fluid","Sintético","Liqui Moly","1L",12900,22990,5,"Rack A-C07"],
    ["ACE0064","Total Fluidmatic CVT","Sintético","Total","1L",9900,17990,8,"Rack A-C08"],
  ];
  for (const [code, name, tech, brand, pres, buy, sell, stock, loc] of cvtData) {
    await upsertProduct({
      code, name,
      categoryId: catAceites.id, subcategoryId: subMap["CVT"],
      brandId: brandMap[brand], viscosity: "CVTF", technology: tech, presentation: "1L",
      buyPrice: buy, sellPrice: sell, stock, minStock: Math.max(2, Math.floor(stock / 3)),
      location: loc,
    });
  }

  // ═══════════════════════════════════════════════════
  // ACEITES DIFERENCIAL (ACE0065 - ACE0074)
  // ═══════════════════════════════════════════════════
  const diffData: [string, string, string, string, string, string, number, number, number, string][] = [
    ["ACE0065","Mobilube HD","80W90","Mineral","Mobil","1L",6900,11990,12,"Rack A-D01"],
    ["ACE0066","Mobilube HD","80W90","Mineral","Mobil","20L",89900,129900,4,"Rack A-D01"],
    ["ACE0067","Mobilube SHC","75W90","Sintético","Mobil","1L",10900,18990,8,"Rack A-D02"],
    ["ACE0068","Shell Spirax S5 ATE","75W90","Sintético","Shell","1L",10900,18990,10,"Rack A-D03"],
    ["ACE0069","Castrol Axle EPX","80W90","Mineral","Castrol","1L",6900,11990,12,"Rack A-D04"],
    ["ACE0070","Valvoline Gear Oil","75W90","Sintético","Valvoline","1L",9900,17990,10,"Rack A-D05"],
    ["ACE0071","Motul Gear 300","75W90","Sintético","Motul","1L",12900,22990,8,"Rack A-D06"],
    ["ACE0072","Liqui Moly Gear Oil","75W90","Sintético","Liqui Moly","1L",13900,23990,5,"Rack A-D07"],
    ["ACE0073","Total Transmission Gear 8","80W90","Mineral","Total","1L",6900,11990,10,"Rack A-D08"],
    ["ACE0074","Petronas Gear Syn","75W90","Sintético","Petronas","1L",10900,18990,8,"Rack A-D09"],
  ];
  for (const [code, name, visc, tech, brand, pres, buy, sell, stock, loc] of diffData) {
    await upsertProduct({
      code, name,
      categoryId: catAceites.id, subcategoryId: subMap["Diferencial"],
      brandId: brandMap[brand], viscosity: visc, technology: tech, presentation: pres,
      buyPrice: buy, sellPrice: sell, stock, minStock: Math.max(2, Math.floor(stock / 3)),
      location: loc,
    });
  }

  // ═══════════════════════════════════════════════════
  // ACEITES HIDRÁULICOS (ACE0075 - ACE0084)
  // ═══════════════════════════════════════════════════
  const hydData: [string, string, string, string, string, string, number, number, number, string][] = [
    ["ACE0075","Mobil DTE 24","ISO 32","Mineral","Mobil","20L",89900,129900,4,"Rack A-H01"],
    ["ACE0076","Mobil DTE 25","ISO 46","Mineral","Mobil","20L",89900,129900,4,"Rack A-H01"],
    ["ACE0077","Shell Tellus S2 M32","ISO 32","Mineral","Shell","20L",87900,124900,4,"Rack A-H02"],
    ["ACE0078","Shell Tellus S2 M46","ISO 46","Mineral","Shell","20L",87900,124900,4,"Rack A-H02"],
    ["ACE0079","Castrol Hyspin AWS 46","ISO 46","Mineral","Castrol","20L",89900,129900,3,"Rack A-H03"],
    ["ACE0080","Valvoline Hydraulic Oil","ISO 46","Mineral","Valvoline","20L",84900,119900,3,"Rack A-H04"],
    ["ACE0081","Petronas Hydraulic HLP 46","ISO 46","Mineral","Petronas","20L",84900,119900,3,"Rack A-H05"],
    ["ACE0082","Total Azolla ZS 46","ISO 46","Mineral","Total","20L",84900,119900,3,"Rack A-H06"],
    ["ACE0083","Kroon Oil Hydraul 46","ISO 46","Mineral","Kroon Oil","20L",85900,122900,2,"Rack A-H07"],
    ["ACE0084","Wurth Hydraulic Oil 46","ISO 46","Mineral","Wurth","20L",85900,122900,2,"Rack A-H08"],
  ];
  for (const [code, name, visc, tech, brand, pres, buy, sell, stock, loc] of hydData) {
    await upsertProduct({
      code, name,
      categoryId: catAceites.id, subcategoryId: subMap["Hidráulico"],
      brandId: brandMap[brand], viscosity: visc, technology: tech, presentation: pres,
      buyPrice: buy, sellPrice: sell, stock, minStock: Math.max(1, Math.floor(stock / 2)),
      location: loc,
    });
  }

  // ═══════════════════════════════════════════════════
  // FILTROS DE ACEITE (FIL0001 - FIL0030)
  // ═══════════════════════════════════════════════════
  const filtroAceiteData: [string, string, string, string, number, number, number, string][] = [
    ["FIL0001","Sakura C-1123","Sakura","Toyota Hilux 2.4 Diesel",3500,6990,15,"Rack F-A01"],
    ["FIL0002","Mann W712/95","Mann","Toyota Hilux 2.8 Diesel",4500,8990,10,"Rack F-A01"],
    ["FIL0003","Mahle OC534","Mahle","Toyota Yaris 1.5 Gasolina",3800,7490,12,"Rack F-A02"],
    ["FIL0004","Bosch P3274","Bosch","Toyota Corolla 1.8 Gasolina",3900,7990,10,"Rack F-A02"],
    ["FIL0005","Sakura C-1110","Sakura","Nissan Navara 2.5 Diesel",3600,6990,18,"Rack F-A03"],
    ["FIL0006","Mann W811/80","Mann","Nissan Terrano 2.5 Diesel",4500,8990,8,"Rack F-A03"],
    ["FIL0007","Mahle OC707","Mahle","Chevrolet D-Max 3.0 Diesel",3900,7990,10,"Rack F-A04"],
    ["FIL0008","Sakura C-1008","Sakura","Chevrolet Sail 1.5 Gasolina",3200,6490,14,"Rack F-A04"],
    ["FIL0009","Bosch P4057","Bosch","Hyundai Porter 2.5 Diesel",4100,8490,12,"Rack F-A05"],
    ["FIL0010","Mann W67/2","Mann","Hyundai Tucson 2.0 Gasolina",4200,8490,10,"Rack F-A05"],
    ["FIL0011","Mahle OC467","Mahle","Mitsubishi L200 2.5 Diesel",3900,7990,15,"Rack F-A06"],
    ["FIL0012","Sakura C-1515","Sakura","Ford Ranger 3.2 Diesel",3900,7990,10,"Rack F-A06"],
    ["FIL0013","Mann W950/26","Mann","Volkswagen Amarok 2.0 TDI",5200,9990,8,"Rack F-A07"],
    ["FIL0014","Bosch P7220","Bosch","Kia Frontier 2.5 Diesel",3900,7990,10,"Rack F-A07"],
    ["FIL0015","Sakura C-1107","Sakura","Toyota Corolla 1.6 Gasolina",3200,6490,15,"Rack F-A08"],
    ["FIL0016","Fleetguard LF16015","Fleetguard","Toyota Hilux 2.8 Diesel",5900,10990,12,"Rack F-A09"],
    ["FIL0017","Donaldson P550162","Donaldson","Toyota Hilux 2.4 Diesel",6200,11990,10,"Rack F-A09"],
    ["FIL0018","Tecfil PSL962","Tecfil","Toyota Yaris 1.5 Gasolina",3500,6990,15,"Rack F-A10"],
    ["FIL0019","Wega WO540","Wega","Toyota Corolla 1.8 Gasolina",3400,6990,15,"Rack F-A10"],
    ["FIL0020","Vic C225","Vic","Toyota Corolla 1.6 Gasolina",3900,7990,10,"Rack F-A11"],
    ["FIL0021","Fleetguard LF3970","Fleetguard","Nissan Navara 2.5 Diesel",5500,10990,10,"Rack F-A11"],
    ["FIL0022","Donaldson P550318","Donaldson","Nissan Terrano 2.5 Diesel",5900,11490,8,"Rack F-A12"],
    ["FIL0023","Tecfil PSL55","Tecfil","Chevrolet Sail 1.5 Gasolina",3200,6490,18,"Rack F-A12"],
    ["FIL0024","Wega WO150","Wega","Chevrolet D-Max 3.0 Diesel",3900,7990,10,"Rack F-A13"],
    ["FIL0025","Vic C307","Vic","Hyundai Porter 2.5 Diesel",4200,8490,10,"Rack F-A13"],
    ["FIL0026","Fleetguard LF16035","Fleetguard","Mitsubishi L200 2.5 Diesel",5900,10990,10,"Rack F-A14"],
    ["FIL0027","Donaldson P550520","Donaldson","Ford Ranger 3.2 Diesel",6200,11990,8,"Rack F-A14"],
    ["FIL0028","Tecfil PSL134","Tecfil","Volkswagen Amarok 2.0 TDI",4500,8990,10,"Rack F-A15"],
    ["FIL0029","Wega WO345","Wega","Kia Frontier 2.5 Diesel",3900,7990,12,"Rack F-A15"],
    ["FIL0030","Vic C110","Vic","Hyundai Tucson 2.0 Gasolina",3900,7990,10,"Rack F-A16"],
  ];
  for (const [code, name, brand, engine, buy, sell, stock, loc] of filtroAceiteData) {
    await upsertProduct({
      code, name,
      categoryId: catFiltros.id, subcategoryId: subMap["Filtro Aceite"],
      brandId: brandMap[brand], engineType: engine,
      buyPrice: buy, sellPrice: sell, stock, minStock: Math.max(3, Math.floor(stock / 3)),
      location: loc,
    });
  }

  // ═══════════════════════════════════════════════════
  // FILTROS DE AIRE (FIL0031 - FIL0050)
  // ═══════════════════════════════════════════════════
  const filtroAireData: [string, string, string, string, number, number, number, string][] = [
    ["FIL0031","Sakura A-1118","Sakura","Toyota Hilux 2.8 Diesel",4900,9990,10,"Rack F-B01"],
    ["FIL0032","Mann C27009","Mann","Toyota Yaris 1.5 Gasolina",5200,10990,10,"Rack F-B01"],
    ["FIL0033","Mahle LX1780","Mahle","Toyota Corolla 1.8 Gasolina",5100,10490,12,"Rack F-B02"],
    ["FIL0034","Bosch A8705","Bosch","Nissan Navara 2.5 Diesel",5500,11490,10,"Rack F-B02"],
    ["FIL0035","Sakura A-1852","Sakura","Nissan Terrano 2.5 Diesel",4900,9990,10,"Rack F-B03"],
    ["FIL0036","Mann C3698","Mann","Chevrolet D-Max 3.0 Diesel",5900,11990,8,"Rack F-B03"],
    ["FIL0037","Mahle LX2012","Mahle","Chevrolet Sail 1.5 Gasolina",4900,9990,12,"Rack F-B04"],
    ["FIL0038","Bosch A2268","Bosch","Hyundai Tucson 2.0 Gasolina",5900,11990,8,"Rack F-B04"],
    ["FIL0039","Sakura A-2824","Sakura","Mitsubishi L200 2.5 Diesel",4900,9990,12,"Rack F-B05"],
    ["FIL0040","Mann C30130","Mann","Ford Ranger 3.2 Diesel",6500,12990,8,"Rack F-B05"],
    ["FIL0041","Fleetguard AF25557","Fleetguard","Toyota Hilux 2.8 Diesel",6900,13990,8,"Rack F-B06"],
    ["FIL0042","Donaldson P822768","Donaldson","Toyota Hilux 2.4 Diesel",7200,14490,8,"Rack F-B06"],
    ["FIL0043","Tecfil ARL2204","Tecfil","Toyota Yaris 1.5 Gasolina",4900,9990,10,"Rack F-B07"],
    ["FIL0044","Wega JFA430","Wega","Toyota Corolla 1.8 Gasolina",5200,10490,10,"Rack F-B07"],
    ["FIL0045","Vic A1005","Vic","Nissan Navara 2.5 Diesel",5900,11990,8,"Rack F-B08"],
    ["FIL0046","Fleetguard AF25354","Fleetguard","Chevrolet D-Max 3.0 Diesel",6900,13990,8,"Rack F-B08"],
    ["FIL0047","Donaldson P608667","Donaldson","Ford Ranger 3.2 Diesel",7900,14990,6,"Rack F-B09"],
    ["FIL0048","Tecfil ARL4156","Tecfil","Mitsubishi L200 2.5 Diesel",5500,10990,10,"Rack F-B09"],
    ["FIL0049","Wega JFA800","Wega","Hyundai Tucson 2.0 Gasolina",5900,11990,8,"Rack F-B10"],
    ["FIL0050","Vic A2010","Vic","Volkswagen Amarok 2.0 TDI",6200,12490,8,"Rack F-B10"],
  ];
  for (const [code, name, brand, engine, buy, sell, stock, loc] of filtroAireData) {
    await upsertProduct({
      code, name,
      categoryId: catFiltros.id, subcategoryId: subMap["Filtro Aire"],
      brandId: brandMap[brand], engineType: engine,
      buyPrice: buy, sellPrice: sell, stock, minStock: Math.max(3, Math.floor(stock / 3)),
      location: loc,
    });
  }

  // ═══════════════════════════════════════════════════
  // FILTROS COMBUSTIBLE / PETRÓLEO (FIL0051 - FIL0068)
  // ═══════════════════════════════════════════════════
  const filtroCombustibleData: [string, string, string, string, string, number, number, number, string][] = [
    ["FIL0051","Sakura FC-1004","Filtro Combustible","Sakura","Toyota Hilux 2.8 Diesel",6900,12990,10,"Rack F-C01"],
    ["FIL0052","Mann WK940/7","Filtro Combustible","Mann","Toyota Hilux 2.8 Diesel",7900,14990,10,"Rack F-C01"],
    ["FIL0053","Mahle KL582","Filtro Combustible","Mahle","Nissan Navara 2.5 Diesel",7500,14990,8,"Rack F-C02"],
    ["FIL0054","Bosch N2030","Filtro Combustible","Bosch","Mitsubishi L200 2.5 Diesel",7500,14990,8,"Rack F-C02"],
    ["FIL0055","Sakura FC-1804","Filtro Combustible","Sakura","Ford Ranger 3.2 Diesel",7900,14990,8,"Rack F-C03"],
    ["FIL0056","Mann WK842","Filtro Combustible","Mann","Chevrolet D-Max 3.0 Diesel",7900,14990,8,"Rack F-C03"],
    ["FIL0057","Mahle KL440","Filtro Combustible","Mahle","Hyundai Porter 2.5 Diesel",6900,12990,10,"Rack F-C04"],
    ["FIL0058","Bosch N1880","Filtro Combustible","Bosch","Kia Frontier 2.5 Diesel",6900,12990,10,"Rack F-C04"],
    ["FIL0059","Fleetguard FF5488","Filtro Petr\u00f3leo","Fleetguard","Toyota Hilux 2.8 Diesel",7900,14990,8,"Rack F-C05"],
    ["FIL0060","Donaldson P551313","Filtro Petr\u00f3leo","Donaldson","Toyota Hilux 2.4 Diesel",8200,15990,8,"Rack F-C05"],
    ["FIL0061","Tecfil PSC706","Filtro Petr\u00f3leo","Tecfil","Nissan Navara 2.5 Diesel",6900,12990,10,"Rack F-C06"],
    ["FIL0062","Wega FCD222","Filtro Petr\u00f3leo","Wega","Nissan Terrano 2.5 Diesel",6900,12990,10,"Rack F-C06"],
    ["FIL0063","Vic FC120","Filtro Petr\u00f3leo","Vic","Chevrolet D-Max 3.0 Diesel",6900,12990,10,"Rack F-C07"],
    ["FIL0064","Fleetguard FF5636","Filtro Petr\u00f3leo","Fleetguard","Ford Ranger 3.2 Diesel",8200,15990,8,"Rack F-C07"],
    ["FIL0065","Donaldson P551434","Filtro Petr\u00f3leo","Donaldson","Mitsubishi L200 2.5 Diesel",7900,14990,8,"Rack F-C08"],
    ["FIL0066","Tecfil PSC410","Filtro Petr\u00f3leo","Tecfil","Hyundai Porter 2.5 Diesel",6900,12990,10,"Rack F-C08"],
    ["FIL0067","Wega FCD950","Filtro Petr\u00f3leo","Wega","Kia Frontier 2.5 Diesel",6900,12990,10,"Rack F-C09"],
    ["FIL0068","Vic FC220","Filtro Petr\u00f3leo","Vic","Volkswagen Amarok 2.0 TDI",7900,14990,8,"Rack F-C09"],
  ];
  for (const [code, name, sub, brand, engine, buy, sell, stock, loc] of filtroCombustibleData) {
    const subName = sub === "Filtro Combustible" ? "Filtro Combustible" : "Filtro Petr\u00f3leo";
    await upsertProduct({
      code, name,
      categoryId: catFiltros.id, subcategoryId: subMap[subName],
      brandId: brandMap[brand], engineType: engine,
      buyPrice: buy, sellPrice: sell, stock, minStock: Math.max(2, Math.floor(stock / 3)),
      location: loc,
    });
  }

  // ═══════════════════════════════════════════════════
  // FILTROS CABINA / POLEN (FIL0069 - FIL0083)
  // ═══════════════════════════════════════════════════
  const filtroCabinaData: [string, string, string, string, string, number, number, number, string][] = [
    ["FIL0069","Sakura CA-1110","Filtro Cabina","Sakura","Toyota Corolla",4900,9990,10,"Rack F-D01"],
    ["FIL0070","Mann CU1829","Filtro Cabina","Mann","Toyota Yaris",5900,11990,8,"Rack F-D01"],
    ["FIL0071","Mahle LA54","Filtro Polen","Mahle","Hyundai Tucson",6200,12490,8,"Rack F-D02"],
    ["FIL0072","Bosch CF10285","Filtro Polen","Bosch","Nissan Versa",6200,12490,8,"Rack F-D02"],
    ["FIL0073","Sakura CA-1904","Filtro Cabina","Sakura","Chevrolet Sail",4900,9990,10,"Rack F-D03"],
    ["FIL0074","Mann FP25007","Filtro Polen","Mann","Volkswagen Amarok",7500,14990,6,"Rack F-D03"],
    ["FIL0075","Mahle LAK888","Filtro Polen","Mahle","Ford Ranger",7500,14990,6,"Rack F-D04"],
    ["FIL0076","Wega AKX356","Filtro Cabina","Wega","Toyota Yaris",4900,9990,10,"Rack F-D05"],
    ["FIL0077","Tecfil ACP901","Filtro Polen","Tecfil","Toyota Corolla",5200,10490,10,"Rack F-D05"],
    ["FIL0078","Vic AC120","Filtro Cabina","Vic","Hyundai Tucson",5500,10990,8,"Rack F-D06"],
    ["FIL0079","Wega AKX204","Filtro Polen","Wega","Nissan Versa",5500,10990,8,"Rack F-D06"],
    ["FIL0080","Tecfil ACP110","Filtro Cabina","Tecfil","Chevrolet Sail",4900,9990,10,"Rack F-D07"],
    ["FIL0081","Vic AC450","Filtro Polen","Vic","Ford Ranger",6900,13990,6,"Rack F-D07"],
    ["FIL0082","Wega AKX777","Filtro Polen","Wega","Volkswagen Amarok",6900,13990,6,"Rack F-D08"],
    ["FIL0083","Tecfil ACP999","Filtro Cabina","Tecfil","Mitsubishi L200",5900,11990,8,"Rack F-D08"],
  ];
  for (const [code, name, sub, brand, engine, buy, sell, stock, loc] of filtroCabinaData) {
    const subName = sub === "Filtro Cabina" ? "Filtro Cabina" : "Filtro Polen";
    await upsertProduct({
      code, name,
      categoryId: catFiltros.id, subcategoryId: subMap[subName],
      brandId: brandMap[brand], engineType: engine,
      buyPrice: buy, sellPrice: sell, stock, minStock: Math.max(2, Math.floor(stock / 3)),
      location: loc,
    });
  }

  // ═══════════════════════════════════════════════════
  // FILTROS TOYOTA (FIL0084 - FIL0090)
  // ═══════════════════════════════════════════════════
  const filtroToyotaData: [string, string, string, string, string, number, number, number, string][] = [
    ["FIL0084","Mann W68/3","Filtro Aceite","Mann","Toyota Yaris 1.3 Gasolina",4200,8490,12,"Rack F-A17"],
    ["FIL0085","Sakura C-1136","Filtro Aceite","Sakura","Toyota RAV4 2.0 Gasolina",3900,7990,10,"Rack F-A17"],
    ["FIL0086","Mahle OC1254","Filtro Aceite","Mahle","Toyota Fortuner 2.8 Diesel",4900,9490,8,"Rack F-A18"],
    ["FIL0087","Wega WO820","Filtro Aire","Wega","Toyota Hilux 2.8 Diesel",5900,11990,10,"Rack F-B11"],
    ["FIL0088","Tecfil ARL889","Filtro Aire","Tecfil","Toyota Corolla 2.0 Gasolina",5500,10990,10,"Rack F-B11"],
    ["FIL0089","Sakura FC-1701","Filtro Combustible","Sakura","Toyota Fortuner 2.8 Diesel",7900,14990,8,"Rack F-C10"],
    ["FIL0090","Mann CU22011","Filtro Polen","Mann","Toyota RAV4",6900,13990,6,"Rack F-D09"],
  ];
  for (const [code, name, sub, brand, engine, buy, sell, stock, loc] of filtroToyotaData) {
    await upsertProduct({
      code, name,
      categoryId: catFiltros.id, subcategoryId: subMap[sub],
      brandId: brandMap[brand], engineType: engine,
      buyPrice: buy, sellPrice: sell, stock, minStock: Math.max(2, Math.floor(stock / 3)),
      location: loc,
    });
  }

  // ═══════════════════════════════════════════════════
  // FILTROS NISSAN (FIL0091 - FIL0097)
  // ═══════════════════════════════════════════════════
  const filtroNissanData: [string, string, string, string, string, number, number, number, string][] = [
    ["FIL0091","Bosch P7011","Filtro Aceite","Bosch","Nissan Versa 1.6 Gasolina",3900,7990,12,"Rack F-A18"],
    ["FIL0092","Mahle OC998","Filtro Aceite","Mahle","Nissan Qashqai 2.0 Gasolina",4200,8490,10,"Rack F-A19"],
    ["FIL0093","Wega WO765","Filtro Aceite","Wega","Nissan NP300 2.3 Diesel",4500,8990,10,"Rack F-A19"],
    ["FIL0094","Sakura A-1877","Filtro Aire","Sakura","Nissan Qashqai 2.0 Gasolina",5900,11990,8,"Rack F-B12"],
    ["FIL0095","Mann C25016","Filtro Aire","Mann","Nissan NP300 2.3 Diesel",6200,12490,8,"Rack F-B12"],
    ["FIL0096","Bosch N3341","Filtro Combustible","Bosch","Nissan NP300 2.3 Diesel",7900,14990,8,"Rack F-C11"],
    ["FIL0097","Wega AKX552","Filtro Polen","Wega","Nissan Qashqai",6900,13990,6,"Rack F-D10"],
  ];
  for (const [code, name, sub, brand, engine, buy, sell, stock, loc] of filtroNissanData) {
    await upsertProduct({
      code, name,
      categoryId: catFiltros.id, subcategoryId: subMap[sub],
      brandId: brandMap[brand], engineType: engine,
      buyPrice: buy, sellPrice: sell, stock, minStock: Math.max(2, Math.floor(stock / 3)),
      location: loc,
    });
  }

  // ═══════════════════════════════════════════════════
  // FILTROS HYUNDAI (FIL0098 - FIL0104)
  // ═══════════════════════════════════════════════════
  const filtroHyundaiData: [string, string, string, string, string, number, number, number, string][] = [
    ["FIL0098","Mann W811/81","Filtro Aceite","Mann","Hyundai Accent 1.4 Gasolina",3900,7990,12,"Rack F-A20"],
    ["FIL0099","Sakura C-1018","Filtro Aceite","Sakura","Hyundai H1 2.5 Diesel",3900,7990,10,"Rack F-A20"],
    ["FIL0100","Mahle OC1048","Filtro Aceite","Mahle","Hyundai Santa Fe 2.2 Diesel",4500,8990,8,"Rack F-A21"],
    ["FIL0101","Wega JFA980","Filtro Aire","Wega","Hyundai Accent 1.4 Gasolina",5200,10490,10,"Rack F-B13"],
    ["FIL0102","Bosch A5533","Filtro Aire","Bosch","Hyundai H1 2.5 Diesel",6200,12490,8,"Rack F-B13"],
    ["FIL0103","Mann WK720","Filtro Combustible","Mann","Hyundai Santa Fe 2.2 Diesel",7900,14990,8,"Rack F-C12"],
    ["FIL0104","Tecfil ACP777","Filtro Polen","Tecfil","Hyundai Tucson",6200,12490,8,"Rack F-D11"],
  ];
  for (const [code, name, sub, brand, engine, buy, sell, stock, loc] of filtroHyundaiData) {
    await upsertProduct({
      code, name,
      categoryId: catFiltros.id, subcategoryId: subMap[sub],
      brandId: brandMap[brand], engineType: engine,
      buyPrice: buy, sellPrice: sell, stock, minStock: Math.max(2, Math.floor(stock / 3)),
      location: loc,
    });
  }

  // ═══════════════════════════════════════════════════
  // FILTROS KIA (FIL0105 - FIL0111)
  // ═══════════════════════════════════════════════════
  const filtroKiaData: [string, string, string, string, string, number, number, number, string][] = [
    ["FIL0105","Bosch P8110","Filtro Aceite","Bosch","Kia Rio 1.4 Gasolina",3900,7990,12,"Rack F-A22"],
    ["FIL0106","Sakura C-1155","Filtro Aceite","Sakura","Kia Sportage 2.0 Diesel",4200,8490,10,"Rack F-A22"],
    ["FIL0107","Mahle OC1150","Filtro Aceite","Mahle","Kia Morning 1.2 Gasolina",3500,6990,12,"Rack F-A23"],
    ["FIL0108","Mann C29012","Filtro Aire","Mann","Kia Sportage 2.0 Diesel",5900,11990,8,"Rack F-B14"],
    ["FIL0109","Wega JFA1050","Filtro Aire","Wega","Kia Rio 1.4 Gasolina",5200,10490,10,"Rack F-B14"],
    ["FIL0110","Bosch N5560","Filtro Combustible","Bosch","Kia Frontier 2.5 Diesel",6900,12990,10,"Rack F-C13"],
    ["FIL0111","Mann CU2450","Filtro Polen","Mann","Kia Sportage",6900,13990,6,"Rack F-D12"],
  ];
  for (const [code, name, sub, brand, engine, buy, sell, stock, loc] of filtroKiaData) {
    await upsertProduct({
      code, name,
      categoryId: catFiltros.id, subcategoryId: subMap[sub],
      brandId: brandMap[brand], engineType: engine,
      buyPrice: buy, sellPrice: sell, stock, minStock: Math.max(2, Math.floor(stock / 3)),
      location: loc,
    });
  }

  // ═══════════════════════════════════════════════════
  // FILTROS MAZDA (FIL0112 - FIL0118)
  // ═══════════════════════════════════════════════════
  const filtroMazdaData: [string, string, string, string, string, number, number, number, string][] = [
    ["FIL0112","Sakura C-1128","Filtro Aceite","Sakura","Mazda BT-50 3.2 Diesel",4500,8990,10,"Rack F-A24"],
    ["FIL0113","Mahle OC1258","Filtro Aceite","Mahle","Mazda 3 2.0 Gasolina",3900,7990,12,"Rack F-A24"],
    ["FIL0114","Mann W920/45","Filtro Aceite","Mann","Mazda CX-5 2.2 Diesel",4900,9490,8,"Rack F-A25"],
    ["FIL0115","Wega JFA1120","Filtro Aire","Wega","Mazda BT-50 3.2 Diesel",6200,12490,8,"Rack F-B15"],
    ["FIL0116","Bosch A7744","Filtro Aire","Bosch","Mazda 3 2.0 Gasolina",5500,10990,10,"Rack F-B15"],
    ["FIL0117","Mahle KL988","Filtro Combustible","Mahle","Mazda CX-5 2.2 Diesel",7900,14990,8,"Rack F-C14"],
    ["FIL0118","Sakura CA-445","Filtro Polen","Sakura","Mazda CX-5",6900,13990,6,"Rack F-D13"],
  ];
  for (const [code, name, sub, brand, engine, buy, sell, stock, loc] of filtroMazdaData) {
    await upsertProduct({
      code, name,
      categoryId: catFiltros.id, subcategoryId: subMap[sub],
      brandId: brandMap[brand], engineType: engine,
      buyPrice: buy, sellPrice: sell, stock, minStock: Math.max(2, Math.floor(stock / 3)),
      location: loc,
    });
  }

  // ═══════════════════════════════════════════════════
  // FILTROS SUZUKI (FIL0119 - FIL0125)
  // ═══════════════════════════════════════════════════
  const filtroSuzukiData: [string, string, string, string, string, number, number, number, string][] = [
    ["FIL0119","Bosch P5502","Filtro Aceite","Bosch","Suzuki Swift 1.2 Gasolina",3500,6990,12,"Rack F-A26"],
    ["FIL0120","Sakura C-1085","Filtro Aceite","Sakura","Suzuki Grand Vitara 2.4 Gasolina",3900,7990,10,"Rack F-A26"],
    ["FIL0121","Mann W610/6","Filtro Aceite","Mann","Suzuki Jimny 1.5 Gasolina",3900,7990,10,"Rack F-A27"],
    ["FIL0122","Wega JFA1188","Filtro Aire","Wega","Suzuki Swift 1.2 Gasolina",4900,9990,10,"Rack F-B16"],
    ["FIL0123","Bosch A8011","Filtro Aire","Bosch","Suzuki Grand Vitara 2.4 Gasolina",5500,10990,8,"Rack F-B16"],
    ["FIL0124","Sakura FC-908","Filtro Combustible","Sakura","Suzuki Jimny 1.5 Gasolina",4900,9990,10,"Rack F-C15"],
    ["FIL0125","Mann CU21003","Filtro Polen","Mann","Suzuki Swift",5900,11990,8,"Rack F-D14"],
  ];
  for (const [code, name, sub, brand, engine, buy, sell, stock, loc] of filtroSuzukiData) {
    await upsertProduct({
      code, name,
      categoryId: catFiltros.id, subcategoryId: subMap[sub],
      brandId: brandMap[brand], engineType: engine,
      buyPrice: buy, sellPrice: sell, stock, minStock: Math.max(2, Math.floor(stock / 3)),
      location: loc,
    });
  }

  // ═══════════════════════════════════════════════════
  // NEUMÁTICOS AUTOMÓVIL (NEU0001 - NEU0015)
  // ═══════════════════════════════════════════════════
  const autoTireData: [string, string, string, string, string, number, number, number, string][] = [
    ["NEU0001","Michelin Energy XM2+","Autom\u00f3vil","Michelin","175/65R14",48900,69990,8,"Rack N-A01"],
    ["NEU0002","Michelin Primacy 4","Autom\u00f3vil","Michelin","185/65R15",59900,84990,8,"Rack N-A01"],
    ["NEU0003","Michelin Primacy 4","Autom\u00f3vil","Michelin","195/65R15",67900,94990,6,"Rack N-A02"],
    ["NEU0004","Bridgestone Ecopia EP150","Autom\u00f3vil","Bridgestone","175/65R14",45900,65990,10,"Rack N-A02"],
    ["NEU0005","Bridgestone Turanza T005","Autom\u00f3vil","Bridgestone","205/55R16",72900,99990,6,"Rack N-A03"],
    ["NEU0006","Goodyear Assurance MaxLife","Autom\u00f3vil","Goodyear","185/65R15",52900,74990,8,"Rack N-A03"],
    ["NEU0007","Goodyear Eagle Sport","Autom\u00f3vil","Goodyear","205/55R16",68900,96990,6,"Rack N-A04"],
    ["NEU0008","Pirelli Cinturato P1","Autom\u00f3vil","Pirelli","185/65R15",53900,76990,8,"Rack N-A04"],
    ["NEU0009","Continental ComfortContact","Autom\u00f3vil","Continental","195/65R15",65900,93990,6,"Rack N-A05"],
    ["NEU0010","Hankook Kinergy Eco2","Autom\u00f3vil","Hankook","175/65R14",42900,61990,10,"Rack N-A05"],
    ["NEU0011","Kumho Ecowing ES31","Autom\u00f3vil","Kumho","185/65R15",41900,59990,10,"Rack N-A06"],
    ["NEU0012","Yokohama BlueEarth GT","Autom\u00f3vil","Yokohama","205/55R16",65900,92990,6,"Rack N-A06"],
    ["NEU0013","Nexen NBlue HD Plus","Autom\u00f3vil","Nexen","195/55R16",42900,62990,8,"Rack N-A07"],
    ["NEU0014","Toyo Proxes CF2","Autom\u00f3vil","Toyo","205/55R16",61900,88990,8,"Rack N-A07"],
    ["NEU0015","Firestone F700","Autom\u00f3vil","Firestone","185/65R15",43900,62990,8,"Rack N-A08"],
  ];

  // ═══════════════════════════════════════════════════
  // NEUMÁTICOS SUV (NEU0016 - NEU0025)
  // ═══════════════════════════════════════════════════
  const suvTireData: [string, string, string, string, string, number, number, number, string][] = [
    ["NEU0016","Michelin Latitude Tour HP","SUV","Michelin","225/65R17",99900,139990,4,"Rack N-B01"],
    ["NEU0017","Michelin Primacy SUV","SUV","Michelin","235/60R18",119900,169990,4,"Rack N-B01"],
    ["NEU0018","Bridgestone Dueler H/T","SUV","Bridgestone","225/65R17",89900,129990,4,"Rack N-B02"],
    ["NEU0019","Goodyear Wrangler SUV","SUV","Goodyear","225/65R17",87900,124990,4,"Rack N-B02"],
    ["NEU0020","Pirelli Scorpion Verde","SUV","Pirelli","235/60R18",114900,159990,4,"Rack N-B03"],
    ["NEU0021","Continental CrossContact","SUV","Continental","225/65R17",99900,139990,4,"Rack N-B03"],
    ["NEU0022","Hankook Dynapro HP2","SUV","Hankook","235/60R18",89900,129990,4,"Rack N-B04"],
    ["NEU0023","Kumho Crugen HP71","SUV","Kumho","225/65R17",79900,114990,6,"Rack N-B04"],
    ["NEU0024","Yokohama Geolandar G91","SUV","Yokohama","225/65R17",84900,119990,6,"Rack N-B05"],
    ["NEU0025","Toyo Open Country U/T","SUV","Toyo","235/60R18",89900,129990,4,"Rack N-B05"],
  ];

  // ═══════════════════════════════════════════════════
  // NEUMÁTICOS CAMIONETA (NEU0026 - NEU0035)
  // ═══════════════════════════════════════════════════
  const truckTireData: [string, string, string, string, string, number, number, number, string][] = [
    ["NEU0026","BFGoodrich All Terrain KO2","Camioneta","BFGoodrich","265/65R17",169900,239990,8,"Rack N-C01"],
    ["NEU0027","BFGoodrich Mud Terrain KM3","Camioneta","BFGoodrich","265/70R17",199900,279990,6,"Rack N-C01"],
    ["NEU0028","Michelin LTX Trail","Camioneta","Michelin","265/65R17",149900,219990,6,"Rack N-C02"],
    ["NEU0029","Bridgestone Dueler AT002","Camioneta","Bridgestone","265/65R17",139900,199990,8,"Rack N-C02"],
    ["NEU0030","Goodyear Wrangler AT Adventure","Camioneta","Goodyear","265/65R17",139900,199990,8,"Rack N-C03"],
    ["NEU0031","Pirelli Scorpion AT Plus","Camioneta","Pirelli","265/70R16",129900,189990,8,"Rack N-C03"],
    ["NEU0032","Hankook Dynapro AT2","Camioneta","Hankook","265/65R17",119900,174990,10,"Rack N-C04"],
    ["NEU0033","Yokohama Geolandar AT G015","Camioneta","Yokohama","265/70R16",129900,189990,8,"Rack N-C04"],
    ["NEU0034","Falken Wildpeak AT3W","Camioneta","Falken","265/65R17",129900,189990,8,"Rack N-C05"],
    ["NEU0035","Maxxis Razr AT","Camioneta","Maxxis","265/70R16",114900,169990,10,"Rack N-C05"],
  ];

  // ═══════════════════════════════════════════════════
  // NEUMÁTICOS MEDIDAS GRANDES (NEU0036 - NEU0040)
  // ═══════════════════════════════════════════════════
  const largeTireData: [string, string, string, string, string, number, number, number, string][] = [
    ["NEU0036","BFGoodrich All Terrain KO2 31x10.5R15","Camioneta","BFGoodrich","31x10.5R15",189900,269990,6,"Rack N-D01"],
    ["NEU0037","BFGoodrich Mud Terrain KM3 33x12.5R15","Camioneta","BFGoodrich","33x12.5R15",239900,339990,4,"Rack N-D01"],
    ["NEU0038","Falken Wildpeak MT01","Camioneta","Falken","33x12.5R15",219900,309990,4,"Rack N-D02"],
    ["NEU0039","Maxxis Razr MT","Camioneta","Maxxis","33x12.5R15",209900,299990,4,"Rack N-D02"],
    ["NEU0040","Cooper Discoverer STT Pro","Camioneta","Cooper","33x12.5R15",229900,319990,4,"Rack N-D03"],
  ];

  // ═══════════════════════════════════════════════════
  // NEUMÁTICOS UTILITARIOS (NEU0041 - NEU0050)
  // ═══════════════════════════════════════════════════
  const utilTireData: [string, string, string, string, string, number, number, number, string][] = [
    ["NEU0041","Hankook Vantra LT","Utilitario","Hankook","195R15C",69900,99990,8,"Rack N-E01"],
    ["NEU0042","Kumho PorTran KC53","Utilitario","Kumho","195R15C",67900,96990,8,"Rack N-E01"],
    ["NEU0043","Michelin Agilis 3","Utilitario","Michelin","195R15C",89900,129990,6,"Rack N-E02"],
    ["NEU0044","Goodyear Cargo G26","Utilitario","Goodyear","195R15C",74900,109990,8,"Rack N-E02"],
    ["NEU0045","Bridgestone Duravis R660","Utilitario","Bridgestone","195R15C",79900,114990,8,"Rack N-E03"],
    ["NEU0046","Continental VanContact","Utilitario","Continental","205/75R16C",89900,129990,6,"Rack N-E03"],
    ["NEU0047","Michelin Agilis","Utilitario","Michelin","205/75R16C",99900,139990,6,"Rack N-E04"],
    ["NEU0048","Hankook Vantra LT","Utilitario","Hankook","205/75R16C",77900,109990,8,"Rack N-E04"],
    ["NEU0049","Kumho PorTran","Utilitario","Kumho","215/75R16C",79900,114990,8,"Rack N-E05"],
    ["NEU0050","Goodyear Cargo Marathon","Utilitario","Goodyear","215/75R16C",84900,119990,8,"Rack N-E05"],
  ];

  // ═══════════════════════════════════════════════════
  // NEUMÁTICOS CAMIÓN LIVIANO (NEU0051 - NEU0060)
  // ═══════════════════════════════════════════════════
  const truckHeavyData: [string, string, string, string, string, number, number, number, string][] = [
    ["NEU0051","Bridgestone R150","Cami\u00f3n","Bridgestone","7.50R16",159900,229990,8,"Rack N-F01"],
    ["NEU0052","Michelin X Multi","Cami\u00f3n","Michelin","7.50R16",179900,259990,6,"Rack N-F01"],
    ["NEU0053","Goodyear G32 Cargo","Cami\u00f3n","Goodyear","7.50R16",159900,229990,8,"Rack N-F02"],
    ["NEU0054","Hankook AH11","Cami\u00f3n","Hankook","7.50R16",139900,199990,10,"Rack N-F02"],
    ["NEU0055","Kumho KRS50","Cami\u00f3n","Kumho","7.50R16",129900,189990,10,"Rack N-F03"],
    ["NEU0056","Michelin XZE2+","Cami\u00f3n","Michelin","215/75R17.5",249900,349990,6,"Rack N-F03"],
    ["NEU0057","Bridgestone R268","Cami\u00f3n","Bridgestone","215/75R17.5",229900,319990,6,"Rack N-F04"],
    ["NEU0058","Goodyear Regional RHS","Cami\u00f3n","Goodyear","215/75R17.5",219900,309990,6,"Rack N-F04"],
    ["NEU0059","Hankook SmartFlex","Cami\u00f3n","Hankook","215/75R17.5",209900,289990,8,"Rack N-F05"],
    ["NEU0060","Kumho KRS03","Cami\u00f3n","Kumho","215/75R17.5",199900,279990,8,"Rack N-F05"],
  ];

  // ═══════════════════════════════════════════════════
  // NEUMÁTICOS ECONÓMICOS (NEU0061 - NEU0070)
  // ═══════════════════════════════════════════════════
  const ecoTireData: [string, string, string, string, string, number, number, number, string][] = [
    ["NEU0061","Sailun Atrezzo Elite","Autom\u00f3vil","Sailun","175/65R14",27900,44990,15,"Rack N-G01"],
    ["NEU0062","Sailun Atrezzo Elite","Autom\u00f3vil","Sailun","185/65R15",31900,49990,15,"Rack N-G01"],
    ["NEU0063","Sailun Atrezzo SH406","Autom\u00f3vil","Sailun","195/65R15",34900,54990,12,"Rack N-G02"],
    ["NEU0064","Goodride RP28","Autom\u00f3vil","Goodride","175/65R14",25900,42990,15,"Rack N-G02"],
    ["NEU0065","Goodride RP28","Autom\u00f3vil","Goodride","185/65R15",29900,47990,15,"Rack N-G03"],
    ["NEU0066","Linglong GreenMax","Autom\u00f3vil","Linglong","195/65R15",32900,52990,12,"Rack N-G03"],
    ["NEU0067","Triangle ReliaX","Autom\u00f3vil","Triangle","205/55R16",39900,62990,10,"Rack N-G04"],
    ["NEU0068","Double Coin DC88","Autom\u00f3vil","Double Coin","185/65R15",31900,49990,12,"Rack N-G04"],
    ["NEU0069","Sailun Terramax AT","Camioneta","Sailun","265/70R16",89900,139990,10,"Rack N-G05"],
    ["NEU0070","Goodride SL369 AT","Camioneta","Goodride","265/70R16",84900,129990,10,"Rack N-G05"],
  ];

  // ═══════════════════════════════════════════════════
  // NEUMÁTICOS PREMIUM (NEU0071 - NEU0080)
  // ═══════════════════════════════════════════════════
  const premiumTireData: [string, string, string, string, string, number, number, number, string][] = [
    ["NEU0071","Michelin Pilot Sport 5","Autom\u00f3vil","Michelin","225/45R17",119900,179990,6,"Rack N-H01"],
    ["NEU0072","Continental PremiumContact 7","Autom\u00f3vil","Continental","225/45R17",109900,169990,6,"Rack N-H01"],
    ["NEU0073","Bridgestone Potenza Sport","Autom\u00f3vil","Bridgestone","225/45R17",109900,169990,6,"Rack N-H02"],
    ["NEU0074","Goodyear Eagle F1","Autom\u00f3vil","Goodyear","225/45R17",99900,159990,6,"Rack N-H02"],
    ["NEU0075","Pirelli P Zero","Autom\u00f3vil","Pirelli","225/45R17",119900,179990,6,"Rack N-H03"],
    ["NEU0076","Michelin Latitude Sport 3","SUV","Michelin","255/55R18",179900,259990,4,"Rack N-H03"],
    ["NEU0077","Continental SportContact","SUV","Continental","255/55R18",169900,249990,4,"Rack N-H04"],
    ["NEU0078","Pirelli Scorpion Zero","SUV","Pirelli","255/55R18",169900,249990,4,"Rack N-H04"],
    ["NEU0079","Bridgestone Alenza","SUV","Bridgestone","265/60R18",159900,229990,4,"Rack N-H05"],
    ["NEU0080","Yokohama Geolandar X-CV","SUV","Yokohama","265/60R18",149900,219990,4,"Rack N-H05"],
  ];

  // Create all tires
  for (const [code, name, tireType, brand, measure, buy, sell, stock, loc] of autoTireData) {
    await upsertProduct({
      code, name,
      categoryId: catNeumaticos.id, brandId: brandMap[brand],
      tireType, tireMeasure: measure,
      buyPrice: buy, sellPrice: sell, stock, minStock: Math.max(2, Math.floor(stock / 3)),
      location: loc,
    });
  }
  for (const [code, name, tireType, brand, measure, buy, sell, stock, loc] of suvTireData) {
    await upsertProduct({
      code, name,
      categoryId: catNeumaticos.id, brandId: brandMap[brand],
      tireType, tireMeasure: measure,
      buyPrice: buy, sellPrice: sell, stock, minStock: Math.max(1, Math.floor(stock / 2)),
      location: loc,
    });
  }
  for (const [code, name, tireType, brand, measure, buy, sell, stock, loc] of truckTireData) {
    await upsertProduct({
      code, name,
      categoryId: catNeumaticos.id, brandId: brandMap[brand],
      tireType, tireMeasure: measure,
      buyPrice: buy, sellPrice: sell, stock, minStock: Math.max(2, Math.floor(stock / 3)),
      location: loc,
    });
  }
  for (const [code, name, tireType, brand, measure, buy, sell, stock, loc] of largeTireData) {
    await upsertProduct({
      code, name,
      categoryId: catNeumaticos.id, brandId: brandMap[brand],
      tireType, tireMeasure: measure,
      buyPrice: buy, sellPrice: sell, stock, minStock: Math.max(1, Math.floor(stock / 2)),
      location: loc,
    });
  }
  for (const [code, name, tireType, brand, measure, buy, sell, stock, loc] of utilTireData) {
    await upsertProduct({
      code, name,
      categoryId: catNeumaticos.id, brandId: brandMap[brand],
      tireType, tireMeasure: measure,
      buyPrice: buy, sellPrice: sell, stock, minStock: Math.max(2, Math.floor(stock / 3)),
      location: loc,
    });
  }
  for (const [code, name, tireType, brand, measure, buy, sell, stock, loc] of truckHeavyData) {
    await upsertProduct({
      code, name,
      categoryId: catNeumaticos.id, brandId: brandMap[brand],
      tireType, tireMeasure: measure,
      buyPrice: buy, sellPrice: sell, stock, minStock: Math.max(2, Math.floor(stock / 3)),
      location: loc,
    });
  }
  for (const [code, name, tireType, brand, measure, buy, sell, stock, loc] of ecoTireData) {
    await upsertProduct({
      code, name,
      categoryId: catNeumaticos.id, brandId: brandMap[brand],
      tireType, tireMeasure: measure,
      buyPrice: buy, sellPrice: sell, stock, minStock: Math.max(3, Math.floor(stock / 3)),
      location: loc,
    });
  }
  for (const [code, name, tireType, brand, measure, buy, sell, stock, loc] of premiumTireData) {
    await upsertProduct({
      code, name,
      categoryId: catNeumaticos.id, brandId: brandMap[brand],
      tireType, tireMeasure: measure,
      buyPrice: buy, sellPrice: sell, stock, minStock: Math.max(1, Math.floor(stock / 2)),
      location: loc,
    });
  }

  // ═══════════════════════════════════════════════════
  // BATERÍAS 45Ah (BAT0001 - BAT0005)
  // ═══════════════════════════════════════════════════
  const bat45Data: [string, string, string, string, string, string, number, number, number, string][] = [
    ["BAT0001","Bosch S4 45Ah","Autom\u00f3vil","Bosch","45Ah","12V",42900,69990,8,"Rack B-A01"],
    ["BAT0002","Varta Blue Dynamic 45Ah","Autom\u00f3vil","Varta","45Ah","12V",44900,72990,8,"Rack B-A01"],
    ["BAT0003","Solite 45Ah","Autom\u00f3vil","Solite","45Ah","12V",39900,64990,10,"Rack B-A02"],
    ["BAT0004","Rocket 45Ah","Autom\u00f3vil","Rocket","45Ah","12V",38900,62990,10,"Rack B-A02"],
    ["BAT0005","AC Delco 45Ah","Autom\u00f3vil","AC Delco","45Ah","12V",39900,64990,10,"Rack B-A03"],
  ];

  // ═══════════════════════════════════════════════════
  // BATERÍAS 55Ah (BAT0006 - BAT0010)
  // ═══════════════════════════════════════════════════
  const bat55Data: [string, string, string, string, string, string, number, number, number, string][] = [
    ["BAT0006","Bosch S4 55Ah","Autom\u00f3vil","Bosch","55Ah","12V",49900,79990,8,"Rack B-A03"],
    ["BAT0007","Varta Blue Dynamic 55Ah","Autom\u00f3vil","Varta","55Ah","12V",52900,84990,8,"Rack B-A04"],
    ["BAT0008","Solite 55Ah","Autom\u00f3vil","Solite","55Ah","12V",45900,74990,10,"Rack B-A04"],
    ["BAT0009","Rocket 55Ah","Autom\u00f3vil","Rocket","55Ah","12V",44900,72990,10,"Rack B-A05"],
    ["BAT0010","Tudor 55Ah","Autom\u00f3vil","Tudor","55Ah","12V",49900,79990,8,"Rack B-A05"],
  ];

  // ═══════════════════════════════════════════════════
  // BATERÍAS 60Ah (BAT0011 - BAT0015)
  // ═══════════════════════════════════════════════════
  const bat60Data: [string, string, string, string, string, string, number, number, number, string][] = [
    ["BAT0011","Bosch S4 60Ah","Autom\u00f3vil","Bosch","60Ah","12V",56900,89990,8,"Rack B-A06"],
    ["BAT0012","Varta Blue Dynamic 60Ah","Autom\u00f3vil","Varta","60Ah","12V",58900,92990,8,"Rack B-A06"],
    ["BAT0013","Solite 60Ah","Autom\u00f3vil","Solite","60Ah","12V",52900,84990,10,"Rack B-A07"],
    ["BAT0014","Rocket 60Ah","Autom\u00f3vil","Rocket","60Ah","12V",51900,82990,10,"Rack B-A07"],
    ["BAT0015","AtlasBX 60Ah","Autom\u00f3vil","AtlasBX","60Ah","12V",54900,87990,8,"Rack B-A08"],
  ];

  // ═══════════════════════════════════════════════════
  // BATERÍAS 65Ah (BAT0016 - BAT0020)
  // ═══════════════════════════════════════════════════
  const bat65Data: [string, string, string, string, string, string, number, number, number, string][] = [
    ["BAT0016","Bosch S4 65Ah","SUV","Bosch","65Ah","12V",62900,99990,8,"Rack B-A08"],
    ["BAT0017","Varta Blue Dynamic 65Ah","SUV","Varta","65Ah","12V",64900,102990,8,"Rack B-A09"],
    ["BAT0018","Solite 65Ah","SUV","Solite","65Ah","12V",59900,94990,10,"Rack B-A09"],
    ["BAT0019","Rocket 65Ah","SUV","Rocket","65Ah","12V",58900,92990,10,"Rack B-A10"],
    ["BAT0020","Tudor 65Ah","SUV","Tudor","65Ah","12V",62900,99990,8,"Rack B-A10"],
  ];

  // ═══════════════════════════════════════════════════
  // BATERÍAS 75Ah (BAT0021 - BAT0025)
  // ═══════════════════════════════════════════════════
  const bat75Data: [string, string, string, string, string, string, number, number, number, string][] = [
    ["BAT0021","Bosch S4 75Ah","Camioneta","Bosch","75Ah","12V",69900,109990,8,"Rack B-B01"],
    ["BAT0022","Varta Blue Dynamic 75Ah","Camioneta","Varta","75Ah","12V",72900,114990,8,"Rack B-B01"],
    ["BAT0023","Solite 75Ah","Camioneta","Solite","75Ah","12V",66900,104990,10,"Rack B-B02"],
    ["BAT0024","Rocket 75Ah","Camioneta","Rocket","75Ah","12V",65900,102990,10,"Rack B-B02"],
    ["BAT0025","AC Delco 75Ah","Camioneta","AC Delco","75Ah","12V",67900,106990,8,"Rack B-B03"],
  ];

  // ═══════════════════════════════════════════════════
  // BATERÍAS 90Ah (BAT0026 - BAT0030)
  // ═══════════════════════════════════════════════════
  const bat90Data: [string, string, string, string, string, string, number, number, number, string][] = [
    ["BAT0026","Bosch S4 90Ah","Camioneta","Bosch","90Ah","12V",84900,129990,6,"Rack B-B03"],
    ["BAT0027","Varta Blue Dynamic 90Ah","Camioneta","Varta","90Ah","12V",87900,134990,6,"Rack B-B04"],
    ["BAT0028","Solite 90Ah","Camioneta","Solite","90Ah","12V",79900,124990,8,"Rack B-B04"],
    ["BAT0029","Rocket 90Ah","Camioneta","Rocket","90Ah","12V",78900,122990,8,"Rack B-B05"],
    ["BAT0030","AtlasBX 90Ah","Camioneta","AtlasBX","90Ah","12V",81900,127990,8,"Rack B-B05"],
  ];

  // ═══════════════════════════════════════════════════
  // BATERÍAS 100Ah (BAT0031 - BAT0035)
  // ═══════════════════════════════════════════════════
  const bat100Data: [string, string, string, string, string, string, number, number, number, string][] = [
    ["BAT0031","Bosch T5 100Ah","Utilitario","Bosch","100Ah","12V",99900,149990,6,"Rack B-C01"],
    ["BAT0032","Varta Promotive 100Ah","Utilitario","Varta","100Ah","12V",104900,154990,6,"Rack B-C01"],
    ["BAT0033","Solite 100Ah","Utilitario","Solite","100Ah","12V",94900,144990,8,"Rack B-C02"],
    ["BAT0034","Rocket 100Ah","Utilitario","Rocket","100Ah","12V",92900,139990,8,"Rack B-C02"],
    ["BAT0035","AC Delco 100Ah","Utilitario","AC Delco","100Ah","12V",96900,146990,6,"Rack B-C03"],
  ];

  // ═══════════════════════════════════════════════════
  // BATERÍAS 150Ah CAMIÓN (BAT0036 - BAT0040)
  // ═══════════════════════════════════════════════════
  const bat150Data: [string, string, string, string, string, string, number, number, number, string][] = [
    ["BAT0036","Bosch T5 150Ah","Cami\u00f3n","Bosch","150Ah","12V",149900,219990,4,"Rack B-D01"],
    ["BAT0037","Varta Promotive 150Ah","Cami\u00f3n","Varta","150Ah","12V",154900,229990,4,"Rack B-D01"],
    ["BAT0038","Solite 150Ah","Cami\u00f3n","Solite","150Ah","12V",139900,209990,6,"Rack B-D02"],
    ["BAT0039","Rocket 150Ah","Cami\u00f3n","Rocket","150Ah","12V",139900,209990,6,"Rack B-D02"],
    ["BAT0040","AtlasBX 150Ah","Cami\u00f3n","AtlasBX","150Ah","12V",144900,214990,4,"Rack B-D03"],
  ];

  for (const [code, name, tireType, brand, amp, volt, buy, sell, stock, loc] of bat45Data) {
    await upsertProduct({
      code, name, categoryId: catBaterias.id, brandId: brandMap[brand],
      tireType, amperage: amp, voltage: volt,
      buyPrice: buy, sellPrice: sell, stock, minStock: Math.max(2, Math.floor(stock / 3)), location: loc,
    });
  }
  for (const [code, name, tireType, brand, amp, volt, buy, sell, stock, loc] of bat55Data) {
    await upsertProduct({
      code, name, categoryId: catBaterias.id, brandId: brandMap[brand],
      tireType, amperage: amp, voltage: volt,
      buyPrice: buy, sellPrice: sell, stock, minStock: Math.max(2, Math.floor(stock / 3)), location: loc,
    });
  }
  for (const [code, name, tireType, brand, amp, volt, buy, sell, stock, loc] of bat60Data) {
    await upsertProduct({
      code, name, categoryId: catBaterias.id, brandId: brandMap[brand],
      tireType, amperage: amp, voltage: volt,
      buyPrice: buy, sellPrice: sell, stock, minStock: Math.max(2, Math.floor(stock / 3)), location: loc,
    });
  }
  for (const [code, name, tireType, brand, amp, volt, buy, sell, stock, loc] of bat65Data) {
    await upsertProduct({
      code, name, categoryId: catBaterias.id, brandId: brandMap[brand],
      tireType, amperage: amp, voltage: volt,
      buyPrice: buy, sellPrice: sell, stock, minStock: Math.max(2, Math.floor(stock / 3)), location: loc,
    });
  }
  for (const [code, name, tireType, brand, amp, volt, buy, sell, stock, loc] of bat75Data) {
    await upsertProduct({
      code, name, categoryId: catBaterias.id, brandId: brandMap[brand],
      tireType, amperage: amp, voltage: volt,
      buyPrice: buy, sellPrice: sell, stock, minStock: Math.max(2, Math.floor(stock / 3)), location: loc,
    });
  }
  for (const [code, name, tireType, brand, amp, volt, buy, sell, stock, loc] of bat90Data) {
    await upsertProduct({
      code, name, categoryId: catBaterias.id, brandId: brandMap[brand],
      tireType, amperage: amp, voltage: volt,
      buyPrice: buy, sellPrice: sell, stock, minStock: Math.max(1, Math.floor(stock / 3)), location: loc,
    });
  }
  for (const [code, name, tireType, brand, amp, volt, buy, sell, stock, loc] of bat100Data) {
    await upsertProduct({
      code, name, categoryId: catBaterias.id, brandId: brandMap[brand],
      tireType, amperage: amp, voltage: volt,
      buyPrice: buy, sellPrice: sell, stock, minStock: Math.max(1, Math.floor(stock / 3)), location: loc,
    });
  }
  for (const [code, name, tireType, brand, amp, volt, buy, sell, stock, loc] of bat150Data) {
    await upsertProduct({
      code, name, categoryId: catBaterias.id, brandId: brandMap[brand],
      tireType, amperage: amp, voltage: volt,
      buyPrice: buy, sellPrice: sell, stock, minStock: Math.max(1, Math.floor(stock / 3)), location: loc,
    });
  }

  // ── Vehicle Models (from filter data) ──
  const vehicleModels = [
    "Toyota Hilux","Toyota Yaris","Toyota Corolla","Toyota RAV4","Toyota Fortuner",
    "Nissan Navara","Nissan Terrano","Nissan Versa","Nissan Qashqai","Nissan NP300",
    "Chevrolet D-Max","Chevrolet Sail","Hyundai Porter","Hyundai Tucson","Hyundai Accent",
    "Hyundai H1","Hyundai Santa Fe","Mitsubishi L200","Ford Ranger","Volkswagen Amarok",
    "Kia Frontier","Kia Rio","Kia Sportage","Kia Morning","Mazda BT-50","Mazda 3",
    "Mazda CX-5","Suzuki Swift","Suzuki Grand Vitara","Suzuki Jimny",
  ];
  for (const vm of vehicleModels) {
    const [brand, ...modelParts] = vm.split(" ");
    await prisma.vehicleModel.upsert({
      where: { brand_model: { brand, model: modelParts.join(" ") } },
      update: {},
      create: { brand, model: modelParts.join(" ") },
    });
  }

  console.log("Seed completed successfully");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
