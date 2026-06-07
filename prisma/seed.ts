import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function getOrCreateCategory(name: string, slug: string) {
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
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  const existing = await prisma.brand.findFirst({ where: { name } });
  if (existing) return existing;
  return prisma.brand.create({ data: { name, slug } });
}

async function main() {
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
    create: { email: "mecanico@lubritotal.cl", password: mecanicoPassword, name: "Mecánico", role: "MECANICO" },
  });

  // ── Categories ──
  const catAceites = await getOrCreateCategory("Aceites", "aceites");
  const catFiltros = await getOrCreateCategory("Filtros", "filtros");
  const catNeumaticos = await getOrCreateCategory("Neumáticos", "neumaticos");
  const catBaterias = await getOrCreateCategory("Baterías", "baterias");
  const catCorreas = await getOrCreateCategory("Correas", "correas");
  const catPlumillas = await getOrCreateCategory("Plumillas", "plumillas");
  const catAditivos = await getOrCreateCategory("Lubricantes y Aditivos", "lubricantes-y-aditivos");
  const catRepuestos = await getOrCreateCategory("Repuestos de Mantención", "repuestos-mantencion");

  // ── Subcategories ──
  const subcats: Record<string, string> = {};

  const aceiteSubs = ["0W20","0W30","0W40","5W20","5W30","5W40","10W30","10W40","15W40","20W50","Sintético","Semi Sintético","Mineral","Diésel","Gasolina","ATF","Transmisión Manual","Diferencial","Hidráulico","CVT","Alto kilometraje","Híbridos","Dirección hidráulica","Sistemas hidráulicos"];
  for (const s of aceiteSubs) { const c = await getOrCreateSubcategory(s, catAceites.id); subcats[s] = c.id; }

  const filtroSubs = ["Filtro de Aceite","Filtro de Aire","Filtro de Combustible","Filtro de Petróleo","Filtro de Cabina","Filtro de Polen","Filtro Hidráulico"];
  for (const s of filtroSubs) { const c = await getOrCreateSubcategory(s, catFiltros.id); subcats[s] = c.id; }

  const neumaticoSubs = ["HT","AT","MT","Touring","Performance","Commercial","Automóvil","SUV","Camioneta","Utilitario","Camión"];
  for (const s of neumaticoSubs) { const c = await getOrCreateSubcategory(s, catNeumaticos.id); subcats[s] = c.id; }

  const bateriaSubs = ["Convencional","Libre de Mantención","AGM","EFB","45Ah","55Ah","60Ah","65Ah","70Ah","75Ah","80Ah","90Ah","100Ah","120Ah","150Ah"];
  for (const s of bateriaSubs) { const c = await getOrCreateSubcategory(s, catBaterias.id); subcats[s] = c.id; }

  const correaSubs = ["Distribución","Correa distribución","Kit distribución","Accesorios","Correa Poly-V","Correa serpentina","Correas Tradicionales","Correa en V","Sistemas Específicos","Alternador","Dirección hidráulica","Aire acondicionado","Maquinaria","Correas agrícolas","Correas industriales"];
  for (const s of correaSubs) { const c = await getOrCreateSubcategory(s, catCorreas.id); subcats[s] = c.id; }

  const plumillaSubs = ['14"','16"','18"','20"','22"','24"','26"'];
  for (const s of plumillaSubs) { const c = await getOrCreateSubcategory(s, catPlumillas.id); subcats[s] = c.id; }

  const aditivoSubs = ["Limpia inyectores","Limpia carburador","Limpiador de frenos","Limpiador MAF","Tratamiento motor","Aditivo combustible","Anticongelante","Refrigerante","Grasa multipropósito","Lubricante silicona"];
  for (const s of aditivoSubs) { const c = await getOrCreateSubcategory(s, catAditivos.id); subcats[s] = c.id; }

  const repSubs = ["Encendido","Frenos","Suspensión","Dirección","Tren Delantero","Refrigeración","Admisión","Combustible","Escape","Distribución","Sistema Eléctrico","Sensores","Embrague","Transmisión","Motor","Accesorios de Motor","Plumillas","Iluminación","Consumibles de Taller"];
  for (const s of repSubs) { const c = await getOrCreateSubcategory(s, catRepuestos.id); subcats[s] = c.id; }

  // ── Brands ──
  const brandValvoline = await getOrCreateBrand("Valvoline");
  const brandLiquiMoly = await getOrCreateBrand("Liqui Moly");
  const brandKroonOil = await getOrCreateBrand("Kroon Oil");
  const brandSTP = await getOrCreateBrand("STP");
  const brandWurth = await getOrCreateBrand("Wurth");
  const brandMobil = await getOrCreateBrand("Mobil");
  const brandCastrol = await getOrCreateBrand("Castrol");
  const brandShell = await getOrCreateBrand("Shell");
  const brandPetronas = await getOrCreateBrand("Petronas");
  const brandMotul = await getOrCreateBrand("Motul");
  const brandTotal = await getOrCreateBrand("Total");
  const brandMann = await getOrCreateBrand("Mann Filter");
  const brandMahle = await getOrCreateBrand("Mahle");
  const brandBosch = await getOrCreateBrand("Bosch");
  const brandDonaldson = await getOrCreateBrand("Donaldson");
  const brandFleetguard = await getOrCreateBrand("Fleetguard");
  const brandFram = await getOrCreateBrand("Fram");
  const brandSakura = await getOrCreateBrand("Sakura");
  const brandTecfil = await getOrCreateBrand("Tecfil");
  const brandVic = await getOrCreateBrand("Vic");
  const brandWega = await getOrCreateBrand("Wega");
  const brandHengst = await getOrCreateBrand("Hengst");
  const brandPurflux = await getOrCreateBrand("Purflux");
  const brandKN = await getOrCreateBrand("K&N");
  const brandMichelin = await getOrCreateBrand("Michelin");
  const brandBridgestone = await getOrCreateBrand("Bridgestone");
  const brandGoodyear = await getOrCreateBrand("Goodyear");
  const brandPirelli = await getOrCreateBrand("Pirelli");
  const brandContinental = await getOrCreateBrand("Continental");
  const brandYokohama = await getOrCreateBrand("Yokohama");
  const brandHankook = await getOrCreateBrand("Hankook");
  const brandKumho = await getOrCreateBrand("Kumho");
  const brandToyo = await getOrCreateBrand("Toyo");
  const brandNexen = await getOrCreateBrand("Nexen");
  const brandFalken = await getOrCreateBrand("Falken");
  const brandLinglong = await getOrCreateBrand("Linglong");
  const brandTriangle = await getOrCreateBrand("Triangle");
  const brandSailun = await getOrCreateBrand("Sailun");
  const brandRoadstone = await getOrCreateBrand("Roadstone");
  const brandGoodride = await getOrCreateBrand("Goodride");
  // Battery brands
  const brandVarta = await getOrCreateBrand("Varta");
  const brandOptima = await getOrCreateBrand("Optima");
  const brandACDelco = await getOrCreateBrand("ACDelco");
  const brandMoura = await getOrCreateBrand("Moura");
  const brandWillard = await getOrCreateBrand("Willard");
  const brandSolite = await getOrCreateBrand("Solite");
  const brandVoltex = await getOrCreateBrand("Voltex");
  const brandGlobal = await getOrCreateBrand("Global");
  const brandPowerBattery = await getOrCreateBrand("Power Battery");
  // Belt brands
  const brandGates = await getOrCreateBrand("Gates");
  const brandDayco = await getOrCreateBrand("Dayco");
  const brandMitsuboshi = await getOrCreateBrand("Mitsuboshi");
  const brandBando = await getOrCreateBrand("Bando");
  const brandINA = await getOrCreateBrand("INA");
  const brandSKF = await getOrCreateBrand("SKF");
  const brandOptibelt = await getOrCreateBrand("Optibelt");

  // ── Vehicle models ──
  const vehicleModels = [
    "Toyota Hilux","Toyota Yaris","Toyota Corolla","Nissan Navara","Nissan Terrano",
    "Nissan Versa","Chevrolet D-Max","Chevrolet Sail","Hyundai Porter","Hyundai Tucson",
    "Mitsubishi L200","Ford Ranger","Volkswagen Amarok"
  ];
  for (const vm of vehicleModels) {
    const [brand, ...modelParts] = vm.split(" ");
    await prisma.vehicleModel.upsert({
      where: { brand_model: { brand, model: modelParts.join(" ") } },
      update: {},
      create: { brand, model: modelParts.join(" ") },
    });
  }

  let codeCounter = 100;
  function nextCode(prefix: string) { codeCounter++; return `${prefix}-${String(codeCounter).padStart(3, "0")}`; }
  const r = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  async function upsertProduct(p: {
    code: string; name: string; categoryId: string; subcategoryId?: string;
    brandId?: string; buyPrice: number; sellPrice: number; stock: number;
    minStock: number; location: string;
  }) {
    await prisma.product.upsert({
      where: { code: p.code },
      update: {},
      create: { ...p, active: true },
    });
  }

  // ── Oil products (63) ──
  const oilData = [
    { location: "A1", brandId: brandMobil.id, product: "Mobil 1 ESP", visc: "5W30", type: "100% Sintético", sub: "5W30", buy: 12500, sell1: 16990, sell4: 56000, sell5: 69900 },
    { location: "A2", brandId: brandMobil.id, product: "Mobil Super 3000", visc: "5W30", type: "Sintético", sub: "5W30", buy: 8500, sell1: 12990, sell4: 42900, sell5: 52900 },
    { location: "A3", brandId: brandMobil.id, product: "Delvac MX", visc: "15W40", type: "Diésel", sub: "Diésel", buy: 7500, sell1: 10900, sell4: 38000, sell5: 45000 },
    { location: "B1", brandId: brandCastrol.id, product: "Edge", visc: "5W30", type: "100% Sintético", sub: "5W30", buy: 13000, sell1: 15990, sell4: 52390, sell5: 67000 },
    { location: "B2", brandId: brandCastrol.id, product: "Edge", visc: "5W40", type: "100% Sintético", sub: "5W40", buy: 13500, sell1: 16500, sell4: 55000, sell5: 69000 },
    { location: "B3", brandId: brandCastrol.id, product: "Magnatec", visc: "10W40", type: "Semi Sintético", sub: "10W40", buy: 7000, sell1: 10500, sell4: 36000, sell5: 43000 },
    { location: "C1", brandId: brandValvoline.id, product: "Advanced Full Synthetic", visc: "5W30", type: "100% Sintético", sub: "5W30", buy: 14000, sell1: 17500, sell4: 58000, sell5: 70200 },
    { location: "C2", brandId: brandValvoline.id, product: "MaxLife", visc: "10W40", type: "Semi Sintético", sub: "10W40", buy: 8000, sell1: 11900, sell4: 38900, sell5: 46000 },
    { location: "C3", brandId: brandValvoline.id, product: "All Climate", visc: "20W50", type: "Mineral", sub: "20W50", buy: 5500, sell1: 8990, sell4: 29900, sell5: 35000 },
    { location: "D1", brandId: brandShell.id, product: "Helix Ultra", visc: "5W30", type: "100% Sintético", sub: "5W30", buy: 13500, sell1: 17990, sell4: 54990, sell5: 66000 },
    { location: "D2", brandId: brandShell.id, product: "Helix Ultra", visc: "5W40", type: "100% Sintético", sub: "5W40", buy: 13500, sell1: 17500, sell4: 55000, sell5: 67000 },
    { location: "D3", brandId: brandShell.id, product: "Rimula R4", visc: "15W40", type: "Diésel", sub: "Diésel", buy: 7500, sell1: 10900, sell4: 37000, sell5: 44000 },
    { location: "E1", brandId: brandPetronas.id, product: "Syntium 7000 Hybrid", visc: "0W20", type: "100% Sintético", sub: "0W20", buy: 8500, sell1: 10990, sell4: 42900, sell5: 54000 },
    { location: "E2", brandId: brandPetronas.id, product: "Syntium 7000", visc: "5W30", type: "100% Sintético", sub: "5W30", buy: 10500, sell1: 14990, sell4: 49900, sell5: 59900 },
    { location: "E3", brandId: brandPetronas.id, product: "Urania", visc: "15W40", type: "Diésel", sub: "Diésel", buy: 7000, sell1: 10500, sell4: 35900, sell5: 43000 },
    { location: "F1", brandId: brandMotul.id, product: "8100 X-Clean", visc: "5W30", type: "100% Sintético", sub: "5W30", buy: 15500, sell1: 19500, sell4: 59900, sell5: 70033 },
    { location: "F2", brandId: brandMotul.id, product: "8100 X-Cess", visc: "5W40", type: "100% Sintético", sub: "5W40", buy: 15500, sell1: 19500, sell4: 60000, sell5: 72000 },
    { location: "F3", brandId: brandMotul.id, product: "6100 Synergie", visc: "10W40", type: "Semi Sintético", sub: "10W40", buy: 8500, sell1: 12500, sell4: 39900, sell5: 47000 },
    { location: "G1", brandId: brandTotal.id, product: "Quartz 9000", visc: "5W40", type: "100% Sintético", sub: "5W40", buy: 10000, sell1: 15700, sell4: 45500, sell5: 55000 },
    { location: "G2", brandId: brandTotal.id, product: "Quartz Ineo ECS", visc: "5W30", type: "Sintético", sub: "5W30", buy: 11000, sell1: 16500, sell4: 48000, sell5: 58000 },
    { location: "G3", brandId: brandTotal.id, product: "Rubia TIR", visc: "15W40", type: "Diésel", sub: "Diésel", buy: 7000, sell1: 10500, sell4: 36000, sell5: 43000 },
  ];
  for (const o of oilData) {
    const baseName = `${o.product} ${o.visc} ${o.type}`;
    await upsertProduct({ code: nextCode("ACE"), name: `${baseName} 1L`, categoryId: catAceites.id, subcategoryId: subcats[o.sub], brandId: o.brandId, buyPrice: o.buy, sellPrice: o.sell1, stock: 2, minStock: 2, location: o.location });
    await upsertProduct({ code: nextCode("ACE"), name: `${baseName} 4L`, categoryId: catAceites.id, subcategoryId: subcats[o.sub], brandId: o.brandId, buyPrice: o.buy, sellPrice: o.sell4, stock: 2, minStock: 2, location: o.location });
    await upsertProduct({ code: nextCode("ACE"), name: `${baseName} 5L`, categoryId: catAceites.id, subcategoryId: subcats[o.sub], brandId: o.brandId, buyPrice: o.buy, sellPrice: o.sell5, stock: 2, minStock: 2, location: o.location });
  }

  // ── Filter products ──
  const filterBrands = [brandMann, brandMahle, brandBosch, brandDonaldson, brandFleetguard, brandFram, brandSakura, brandTecfil, brandVic, brandWega, brandHengst, brandPurflux, brandKN];
  const filterOilPrices = [{ type: "Económico", buy: 2500, sell: 4990 },{ type: "Estándar", buy: 4000, sell: 7990 },{ type: "Premium", buy: 7000, sell: 12990 },{ type: "Camioneta", buy: 8000, sell: 14990 },{ type: "Camión", buy: 12000, sell: 22990 }];
  const filterAirPrices = [{ type: "Automóvil", buy: 4000, sell: 8990 },{ type: "SUV", buy: 5500, sell: 11990 },{ type: "Camioneta", buy: 6000, sell: 13990 },{ type: "Utilitario", buy: 8000, sell: 16990 }];
  const filterFuelPrices = [{ type: "Gasolina", buy: 4000, sell: 7990 },{ type: "Diésel", buy: 6000, sell: 11990 },{ type: "Common Rail", buy: 8500, sell: 16990 }];
  const filterOilPrices2 = [{ type: "Convencional", buy: 7000, sell: 12990 },{ type: "Separador agua", buy: 9000, sell: 16990 },{ type: "Camión", buy: 15000, sell: 27990 }];
  const filterCabinPrices = [{ type: "Convencional", buy: 3500, sell: 7990 },{ type: "Carbón activado", buy: 5500, sell: 12990 },{ type: "Premium", buy: 8000, sell: 17990 }];

  for (const fb of filterBrands) { const t = filterOilPrices[r(0, filterOilPrices.length - 1)]; await upsertProduct({ code: nextCode("FIL"), name: `Filtro Aceite ${fb.name} ${t.type}`, categoryId: catFiltros.id, subcategoryId: subcats["Filtro de Aceite"], brandId: fb.id, buyPrice: t.buy, sellPrice: t.sell, stock: r(5, 20), minStock: 3, location: "F1" }); }
  for (const fb of filterBrands.slice(0, 8)) { const t = filterAirPrices[r(0, filterAirPrices.length - 1)]; await upsertProduct({ code: nextCode("FIL"), name: `Filtro Aire ${fb.name} ${t.type}`, categoryId: catFiltros.id, subcategoryId: subcats["Filtro de Aire"], brandId: fb.id, buyPrice: t.buy, sellPrice: t.sell, stock: r(3, 15), minStock: 3, location: "F2" }); }
  for (const fb of filterBrands.slice(0, 6)) { const t = filterFuelPrices[r(0, filterFuelPrices.length - 1)]; await upsertProduct({ code: nextCode("FIL"), name: `Filtro Combustible ${fb.name} ${t.type}`, categoryId: catFiltros.id, subcategoryId: subcats["Filtro de Combustible"], brandId: fb.id, buyPrice: t.buy, sellPrice: t.sell, stock: r(3, 12), minStock: 2, location: "F3" }); }
  for (const fb of filterBrands.slice(0, 5)) { const t = filterOilPrices2[r(0, filterOilPrices2.length - 1)]; await upsertProduct({ code: nextCode("FIL"), name: `Filtro Petróleo ${fb.name} ${t.type}`, categoryId: catFiltros.id, subcategoryId: subcats["Filtro de Petróleo"], brandId: fb.id, buyPrice: t.buy, sellPrice: t.sell, stock: r(2, 10), minStock: 2, location: "F4" }); }
  for (const fb of filterBrands.slice(0, 7)) { const t = filterCabinPrices[r(0, filterCabinPrices.length - 1)]; await upsertProduct({ code: nextCode("FIL"), name: `Filtro Cabina ${fb.name} ${t.type}`, categoryId: catFiltros.id, subcategoryId: subcats["Filtro de Cabina"], brandId: fb.id, buyPrice: t.buy, sellPrice: t.sell, stock: r(3, 12), minStock: 2, location: "F5" }); }

  // ── Tire products (40) ──
  const tires = [
    { loc: "N-A1", bid: brandMichelin.id, bn: "Michelin", m: "Primacy 4", me: "175/65R14", t: "Touring", s: "Touring", buy: 58000, sell: 84900 },
    { loc: "N-A2", bid: brandMichelin.id, bn: "Michelin", m: "Primacy 4", me: "185/65R15", t: "Touring", s: "Touring", buy: 65000, sell: 92900 },
    { loc: "N-A3", bid: brandMichelin.id, bn: "Michelin", m: "Primacy 4", me: "195/55R16", t: "Touring", s: "Touring", buy: 75000, sell: 109900 },
    { loc: "N-A4", bid: brandMichelin.id, bn: "Michelin", m: "LTX Trail", me: "225/70R16", t: "AT", s: "AT", buy: 110000, sell: 159900 },
    { loc: "N-A5", bid: brandMichelin.id, bn: "Michelin", m: "LTX Force", me: "265/65R17", t: "AT", s: "AT", buy: 145000, sell: 209900 },
    { loc: "N-B1", bid: brandBridgestone.id, bn: "Bridgestone", m: "Turanza T005", me: "175/65R14", t: "Touring", s: "Touring", buy: 55000, sell: 79900 },
    { loc: "N-B2", bid: brandBridgestone.id, bn: "Bridgestone", m: "Turanza T005", me: "185/65R15", t: "Touring", s: "Touring", buy: 62000, sell: 89900 },
    { loc: "N-B3", bid: brandBridgestone.id, bn: "Bridgestone", m: "Dueler AT", me: "265/65R17", t: "AT", s: "AT", buy: 140000, sell: 199900 },
    { loc: "N-B4", bid: brandBridgestone.id, bn: "Bridgestone", m: "Dueler HT", me: "225/70R16", t: "HT", s: "HT", buy: 98000, sell: 145900 },
    { loc: "N-B5", bid: brandBridgestone.id, bn: "Bridgestone", m: "Dueler AT", me: "265/70R16", t: "AT", s: "AT", buy: 135000, sell: 194900 },
    { loc: "N-C1", bid: brandGoodyear.id, bn: "Goodyear", m: "Assurance Maxlife", me: "175/65R14", t: "Touring", s: "Touring", buy: 50000, sell: 74900 },
    { loc: "N-C2", bid: brandGoodyear.id, bn: "Goodyear", m: "Assurance Maxlife", me: "185/65R15", t: "Touring", s: "Touring", buy: 58000, sell: 84900 },
    { loc: "N-C3", bid: brandGoodyear.id, bn: "Goodyear", m: "Wrangler AT", me: "265/65R17", t: "AT", s: "AT", buy: 135000, sell: 194900 },
    { loc: "N-C4", bid: brandGoodyear.id, bn: "Goodyear", m: "Wrangler Adventure", me: "265/70R16", t: "AT", s: "AT", buy: 140000, sell: 199900 },
    { loc: "N-C5", bid: brandGoodyear.id, bn: "Goodyear", m: "Cargo G28", me: "195R15C", t: "Commercial", s: "Commercial", buy: 82000, sell: 119900 },
    { loc: "N-D1", bid: brandPirelli.id, bn: "Pirelli", m: "Cinturato P1", me: "175/65R14", t: "Touring", s: "Touring", buy: 48000, sell: 72900 },
    { loc: "N-D2", bid: brandPirelli.id, bn: "Pirelli", m: "Cinturato P7", me: "205/55R16", t: "Touring", s: "Touring", buy: 78000, sell: 114900 },
    { loc: "N-D3", bid: brandPirelli.id, bn: "Pirelli", m: "Scorpion AT Plus", me: "265/65R17", t: "AT", s: "AT", buy: 145000, sell: 209900 },
    { loc: "N-D4", bid: brandPirelli.id, bn: "Pirelli", m: "Scorpion HT", me: "225/70R16", t: "HT", s: "HT", buy: 102000, sell: 149900 },
    { loc: "N-E1", bid: brandContinental.id, bn: "Continental", m: "UltraContact", me: "185/65R15", t: "Touring", s: "Touring", buy: 68000, sell: 98900 },
    { loc: "N-E2", bid: brandContinental.id, bn: "Continental", m: "PremiumContact", me: "205/55R16", t: "Touring", s: "Touring", buy: 80000, sell: 118900 },
    { loc: "N-E3", bid: brandContinental.id, bn: "Continental", m: "CrossContact", me: "265/65R17", t: "AT", s: "AT", buy: 150000, sell: 219900 },
    { loc: "N-F1", bid: brandHankook.id, bn: "Hankook", m: "Kinergy Eco", me: "175/65R14", t: "Touring", s: "Touring", buy: 42000, sell: 64900 },
    { loc: "N-F2", bid: brandHankook.id, bn: "Hankook", m: "Kinergy Eco", me: "185/65R15", t: "Touring", s: "Touring", buy: 48000, sell: 74900 },
    { loc: "N-F3", bid: brandHankook.id, bn: "Hankook", m: "Dynapro AT2", me: "265/65R17", t: "AT", s: "AT", buy: 120000, sell: 179900 },
    { loc: "N-F4", bid: brandHankook.id, bn: "Hankook", m: "Dynapro HT", me: "225/70R16", t: "HT", s: "HT", buy: 98000, sell: 144900 },
    { loc: "N-G1", bid: brandKumho.id, bn: "Kumho", m: "Ecowing ES31", me: "175/65R14", t: "Touring", s: "Touring", buy: 38000, sell: 59900 },
    { loc: "N-G2", bid: brandKumho.id, bn: "Kumho", m: "Ecowing ES31", me: "185/65R15", t: "Touring", s: "Touring", buy: 42000, sell: 66900 },
    { loc: "N-G3", bid: brandKumho.id, bn: "Kumho", m: "Road Venture AT52", me: "265/65R17", t: "AT", s: "AT", buy: 110000, sell: 169900 },
    { loc: "N-G4", bid: brandKumho.id, bn: "Kumho", m: "Road Venture HT", me: "225/70R16", t: "HT", s: "HT", buy: 90000, sell: 134900 },
    { loc: "N-H1", bid: brandToyo.id, bn: "Toyo", m: "Open Country AT3", me: "265/65R17", t: "AT", s: "AT", buy: 125000, sell: 184900 },
    { loc: "N-H2", bid: brandToyo.id, bn: "Toyo", m: "Open Country HT", me: "225/70R16", t: "HT", s: "HT", buy: 98000, sell: 144900 },
    { loc: "N-H3", bid: brandToyo.id, bn: "Toyo", m: "Proxes Sport", me: "205/55R16", t: "Performance", s: "Performance", buy: 82000, sell: 119900 },
    { loc: "N-I1", bid: brandYokohama.id, bn: "Yokohama", m: "Geolandar AT", me: "265/65R17", t: "AT", s: "AT", buy: 130000, sell: 189900 },
    { loc: "N-I2", bid: brandYokohama.id, bn: "Yokohama", m: "Geolandar HT", me: "225/70R16", t: "HT", s: "HT", buy: 98000, sell: 145900 },
    { loc: "N-I3", bid: brandYokohama.id, bn: "Yokohama", m: "BluEarth", me: "185/65R15", t: "Touring", s: "Touring", buy: 55000, sell: 79900 },
    { loc: "N-J1", bid: brandFalken.id, bn: "Falken", m: "Wildpeak AT3W", me: "265/70R16", t: "AT", s: "AT", buy: 128000, sell: 189900 },
    { loc: "N-J2", bid: brandFalken.id, bn: "Falken", m: "Wildpeak MT", me: "31x10.5R15", t: "MT", s: "MT", buy: 145000, sell: 214900 },
    { loc: "N-K1", bid: brandNexen.id, bn: "Nexen", m: "Roadian AT Pro", me: "265/65R17", t: "AT", s: "AT", buy: 105000, sell: 159900 },
    { loc: "N-K2", bid: brandNexen.id, bn: "Nexen", m: "N Blue HD Plus", me: "185/65R15", t: "Touring", s: "Touring", buy: 42000, sell: 65900 },
  ];
  for (const t of tires) {
    await upsertProduct({ code: nextCode("NEU"), name: `${t.bn} ${t.m} ${t.me} ${t.t}`, categoryId: catNeumaticos.id, subcategoryId: subcats[t.s], brandId: t.bid, buyPrice: t.buy, sellPrice: t.sell, stock: r(1, 4), minStock: 1, location: t.loc });
  }

  // Preserve existing products
  const existingProducts = [
    { code: "ACE-001", name: "Aceite Valvoline 5W30 Sintético 4L", categoryId: catAceites.id, subcategoryId: subcats["5W30"], brandId: brandValvoline.id, buyPrice: 25000, sellPrice: 38000, stock: 15, minStock: 5, location: "A1" },
    { code: "ACE-002", name: "Aceite Valvoline 10W40 Semi Sintético 4L", categoryId: catAceites.id, subcategoryId: subcats["10W40"], brandId: brandValvoline.id, buyPrice: 18000, sellPrice: 28000, stock: 20, minStock: 5, location: "A2" },
    { code: "ACE-003", name: "Aceite Valvoline 15W40 Mineral 4L", categoryId: catAceites.id, subcategoryId: subcats["15W40"], brandId: brandValvoline.id, buyPrice: 12000, sellPrice: 20000, stock: 10, minStock: 5, location: "A3" },
    { code: "ACE-004", name: "Aceite Liqui Moly 5W30 Sintético 5L", categoryId: catAceites.id, subcategoryId: subcats["5W30"], brandId: brandLiquiMoly.id, buyPrice: 35000, sellPrice: 52000, stock: 8, minStock: 3, location: "B1" },
    { code: "ACE-005", name: "Aceite Liqui Moly ATF Transmisión 1L", categoryId: catAceites.id, subcategoryId: subcats["ATF"], brandId: brandLiquiMoly.id, buyPrice: 12000, sellPrice: 22000, stock: 12, minStock: 4, location: "B2" },
    { code: "ACE-006", name: "Aceite Kroon Oil 5W30 Sintético 4L", categoryId: catAceites.id, subcategoryId: subcats["5W30"], brandId: brandKroonOil.id, buyPrice: 22000, sellPrice: 34000, stock: 6, minStock: 3, location: "B3" },
    { code: "ACE-007", name: "Aceite Kroon Oil 10W40 Semi Sintético 4L", categoryId: catAceites.id, subcategoryId: subcats["10W40"], brandId: brandKroonOil.id, buyPrice: 16000, sellPrice: 25000, stock: 14, minStock: 5, location: "B4" },
    { code: "FIL-001", name: "Filtro Aceite Valvoline VO-101", categoryId: catFiltros.id, subcategoryId: subcats["Filtro de Aceite"], brandId: brandValvoline.id, buyPrice: 3000, sellPrice: 5500, stock: 25, minStock: 10, location: "C1" },
    { code: "FIL-002", name: "Filtro Aire Valvoline VA-202", categoryId: catFiltros.id, subcategoryId: subcats["Filtro de Aire"], brandId: brandValvoline.id, buyPrice: 4500, sellPrice: 8500, stock: 18, minStock: 8, location: "C2" },
    { code: "FIL-003", name: "Filtro Aceite Liqui Moly LM-001", categoryId: catFiltros.id, subcategoryId: subcats["Filtro de Aceite"], brandId: brandLiquiMoly.id, buyPrice: 5000, sellPrice: 9000, stock: 20, minStock: 8, location: "C3" },
    { code: "FIL-004", name: "Filtro Aire Liqui Moly LM-002", categoryId: catFiltros.id, subcategoryId: subcats["Filtro de Aire"], brandId: brandLiquiMoly.id, buyPrice: 6500, sellPrice: 12000, stock: 12, minStock: 5, location: "C4" },
    { code: "ACE-008", name: "Aceite STP 15W40 Mineral 4L", categoryId: catAceites.id, subcategoryId: subcats["15W40"], brandId: brandSTP.id, buyPrice: 10000, sellPrice: 18000, stock: 22, minStock: 8, location: "A4" },
    { code: "ACE-009", name: "Aceite Wurth 5W30 Sintético 4L", categoryId: catAceites.id, subcategoryId: subcats["5W30"], brandId: brandWurth.id, buyPrice: 28000, sellPrice: 42000, stock: 7, minStock: 3, location: "A5" },
    { code: "ACE-010", name: "Aceite Wurth 10W40 Semi Sintético 4L", categoryId: catAceites.id, subcategoryId: subcats["10W40"], brandId: brandWurth.id, buyPrice: 20000, sellPrice: 32000, stock: 9, minStock: 4, location: "A6" },
  ];
  for (const p of existingProducts) { await prisma.product.upsert({ where: { code: p.code }, update: {}, create: { ...p, active: true } }); }

  // ── Battery products ──
  codeCounter = 500;
  const batteryData = [
    { loc: "BAT-A1", name: "Bosch S4 45Ah 400 MF", sub: "Libre de Mantención", bid: brandBosch.id, buy: 38000, sell: 59900 },
    { loc: "BAT-A2", name: "Bosch S4 55Ah 480 MF", sub: "Libre de Mantención", bid: brandBosch.id, buy: 48000, sell: 74900 },
    { loc: "BAT-A3", name: "Bosch S4 60Ah 540 MF", sub: "Libre de Mantención", bid: brandBosch.id, buy: 54000, sell: 82900 },
    { loc: "BAT-A4", name: "Bosch S5 65Ah 650 AGM", sub: "AGM", bid: brandBosch.id, buy: 88000, sell: 129900 },
    { loc: "BAT-A5", name: "Bosch S5 70Ah 760 AGM", sub: "AGM", bid: brandBosch.id, buy: 110000, sell: 159900 },
    { loc: "BAT-B1", name: "Varta Blue Dynamic 45Ah 400 MF", sub: "Libre de Mantención", bid: brandVarta.id, buy: 40000, sell: 62900 },
    { loc: "BAT-B2", name: "Varta Blue Dynamic 55Ah 480 MF", sub: "Libre de Mantención", bid: brandVarta.id, buy: 50000, sell: 76900 },
    { loc: "BAT-B3", name: "Varta Silver Dynamic 65Ah 650 AGM", sub: "AGM", bid: brandVarta.id, buy: 95000, sell: 139900 },
    { loc: "BAT-B4", name: "Varta Silver Dynamic 70Ah 760 AGM", sub: "AGM", bid: brandVarta.id, buy: 115000, sell: 169900 },
    { loc: "BAT-C1", name: "Moura M45 45Ah 420 MF", sub: "Libre de Mantención", bid: brandMoura.id, buy: 36000, sell: 56900 },
    { loc: "BAT-C2", name: "Moura M55 55Ah 500 MF", sub: "Libre de Mantención", bid: brandMoura.id, buy: 46000, sell: 72900 },
    { loc: "BAT-C3", name: "Moura M60 60Ah 550 MF", sub: "Libre de Mantención", bid: brandMoura.id, buy: 52000, sell: 79900 },
    { loc: "BAT-C4", name: "Moura M70 70Ah 650 MF", sub: "Libre de Mantención", bid: brandMoura.id, buy: 65000, sell: 98900 },
    // SUV
    { loc: "BAT-D1", name: "Bosch S4 75Ah 720", sub: "Libre de Mantención", bid: brandBosch.id, buy: 72000, sell: 109900 },
    { loc: "BAT-D2", name: "Bosch S5 80Ah 800", sub: "AGM", bid: brandBosch.id, buy: 95000, sell: 139900 },
    { loc: "BAT-D3", name: "Varta Blue Dynamic 75Ah 720", sub: "Libre de Mantención", bid: brandVarta.id, buy: 75000, sell: 114900 },
    { loc: "BAT-D4", name: "Varta Silver Dynamic 80Ah 800", sub: "AGM", bid: brandVarta.id, buy: 98000, sell: 144900 },
    { loc: "BAT-D5", name: "Moura M80 80Ah 760", sub: "Libre de Mantención", bid: brandMoura.id, buy: 78000, sell: 119900 },
    // Camionetas
    { loc: "BAT-E1", name: "Bosch T5 90Ah 800", sub: "Libre de Mantención", bid: brandBosch.id, buy: 95000, sell: 144900 },
    { loc: "BAT-E2", name: "Bosch T5 100Ah 900", sub: "Libre de Mantención", bid: brandBosch.id, buy: 110000, sell: 169900 },
    { loc: "BAT-E3", name: "Varta Pro 90Ah 830", sub: "Libre de Mantención", bid: brandVarta.id, buy: 98000, sell: 149900 },
    { loc: "BAT-E4", name: "Varta Pro 100Ah 900", sub: "Libre de Mantención", bid: brandVarta.id, buy: 115000, sell: 174900 },
    { loc: "BAT-E5", name: "Moura M100 100Ah 850", sub: "Libre de Mantención", bid: brandMoura.id, buy: 105000, sell: 159900 },
    { loc: "BAT-E6", name: "Willard Premium 90Ah 820", sub: "Libre de Mantención", bid: brandWillard.id, buy: 92000, sell: 139900 },
    // Utilitarios
    { loc: "BAT-F1", name: "Solite Commercial 90Ah", sub: "Libre de Mantención", bid: brandSolite.id, buy: 88000, sell: 134900 },
    { loc: "BAT-F2", name: "Solite Commercial 100Ah", sub: "Libre de Mantención", bid: brandSolite.id, buy: 102000, sell: 154900 },
    { loc: "BAT-F3", name: "Hankook Commercial 100Ah", sub: "Libre de Mantención", bid: brandHankook.id, buy: 100000, sell: 149900 },
    { loc: "BAT-F4", name: "Bosch T5 110Ah", sub: "Libre de Mantención", bid: brandBosch.id, buy: 120000, sell: 179900 },
    // Camiones
    { loc: "BAT-G1", name: "Bosch Truck 120Ah 950", sub: "Convencional", bid: brandBosch.id, buy: 145000, sell: 214900 },
    { loc: "BAT-G2", name: "Bosch Truck 150Ah 1100", sub: "Convencional", bid: brandBosch.id, buy: 175000, sell: 259900 },
    { loc: "BAT-G3", name: "Varta Promotive 120Ah 950", sub: "Convencional", bid: brandVarta.id, buy: 150000, sell: 219900 },
    { loc: "BAT-G4", name: "Varta Promotive 150Ah 1100", sub: "Convencional", bid: brandVarta.id, buy: 180000, sell: 269900 },
    { loc: "BAT-G5", name: "Moura Truck 150Ah 1050", sub: "Convencional", bid: brandMoura.id, buy: 170000, sell: 249900 },
    { loc: "BAT-G6", name: "Willard Heavy Duty 150Ah 1050", sub: "Convencional", bid: brandWillard.id, buy: 168000, sell: 244900 },
    // AGM Premium
    { loc: "BAT-H1", name: "Bosch S5 AGM 60Ah 680", sub: "AGM", bid: brandBosch.id, buy: 95000, sell: 139900 },
    { loc: "BAT-H2", name: "Bosch S5 AGM 70Ah 760", sub: "AGM", bid: brandBosch.id, buy: 110000, sell: 159900 },
    { loc: "BAT-H3", name: "Varta Silver AGM 70Ah 760", sub: "AGM", bid: brandVarta.id, buy: 115000, sell: 169900 },
    { loc: "BAT-H4", name: "Varta Silver AGM 80Ah 800", sub: "AGM", bid: brandVarta.id, buy: 135000, sell: 194900 },
    { loc: "BAT-H5", name: "Optima Yellow Top 75Ah 975", sub: "AGM", bid: brandOptima.id, buy: 220000, sell: 319900 },
    { loc: "BAT-H6", name: "Optima Red Top 50Ah 800", sub: "AGM", bid: brandOptima.id, buy: 190000, sell: 279900 },
  ];
  for (const b of batteryData) { await upsertProduct({ code: nextCode("BAT"), name: b.name, categoryId: catBaterias.id, subcategoryId: subcats[b.sub], brandId: b.bid, buyPrice: b.buy, sellPrice: b.sell, stock: 2, minStock: 1, location: b.loc }); }

  // ── Belt products ──
  codeCounter = 600;
  const beltData = [
    { loc: "COR-A1", name: "Gates T145", sub: "Correa distribución", bid: brandGates.id, buy: 12000, sell: 21900 },
    { loc: "COR-A2", name: "Gates T168", sub: "Correa distribución", bid: brandGates.id, buy: 14000, sell: 24900 },
    { loc: "COR-A3", name: "Gates T187", sub: "Correa distribución", bid: brandGates.id, buy: 15000, sell: 27900 },
    { loc: "COR-A4", name: "Gates T211", sub: "Correa distribución", bid: brandGates.id, buy: 18000, sell: 31900 },
    { loc: "COR-A5", name: "Gates T254", sub: "Correa distribución", bid: brandGates.id, buy: 20000, sell: 34900 },
    { loc: "COR-A6", name: "Dayco 94100", sub: "Correa distribución", bid: brandDayco.id, buy: 12000, sell: 22900 },
    { loc: "COR-A7", name: "Dayco 94250", sub: "Correa distribución", bid: brandDayco.id, buy: 15000, sell: 27900 },
    { loc: "COR-A8", name: "Continental CT1028", sub: "Correa distribución", bid: brandContinental.id, buy: 18000, sell: 32900 },
    { loc: "COR-A9", name: "Continental CT1108", sub: "Correa distribución", bid: brandContinental.id, buy: 22000, sell: 39900 },
    { loc: "COR-A10", name: "Mitsuboshi MBT125", sub: "Correa distribución", bid: brandMitsuboshi.id, buy: 18000, sell: 33900 },
    { loc: "KIT-A1", name: "Gates PowerGrip", sub: "Kit distribución", bid: brandGates.id, buy: 45000, sell: 69900 },
    { loc: "KIT-A2", name: "Gates PowerGrip Plus", sub: "Kit distribución", bid: brandGates.id, buy: 58000, sell: 84900 },
    { loc: "KIT-A3", name: "Dayco Kit Completo", sub: "Kit distribución", bid: brandDayco.id, buy: 48000, sell: 74900 },
    { loc: "KIT-A4", name: "SKF VKMA", sub: "Kit distribución", bid: brandSKF.id, buy: 62000, sell: 94900 },
    { loc: "KIT-A5", name: "INA Timing Kit", sub: "Kit distribución", bid: brandINA.id, buy: 68000, sell: 99900 },
    // Poly-V
    { loc: "COR-B1", name: "Correa Poly-V 4PK780", sub: "Correa Poly-V", buy: 3000, sell: 6900 },
    { loc: "COR-B2", name: "Correa Poly-V 4PK850", sub: "Correa Poly-V", buy: 3200, sell: 7500 },
    { loc: "COR-B3", name: "Correa Poly-V 4PK900", sub: "Correa Poly-V", buy: 3500, sell: 7900 },
    { loc: "COR-B4", name: "Correa Poly-V 5PK850", sub: "Correa Poly-V", buy: 4000, sell: 8900 },
    { loc: "COR-B5", name: "Correa Poly-V 5PK950", sub: "Correa Poly-V", buy: 4200, sell: 9500 },
    { loc: "COR-B6", name: "Correa Poly-V 5PK1050", sub: "Correa Poly-V", buy: 4500, sell: 9900 },
    { loc: "COR-B7", name: "Correa Poly-V 5PK1100", sub: "Correa Poly-V", buy: 4800, sell: 10900 },
    { loc: "COR-B8", name: "Correa Poly-V 6PK1050", sub: "Correa Poly-V", buy: 5000, sell: 11900 },
    { loc: "COR-B9", name: "Correa Poly-V 6PK1200", sub: "Correa Poly-V", buy: 5500, sell: 12900 },
    { loc: "COR-B10", name: "Correa Poly-V 6PK1350", sub: "Correa Poly-V", buy: 6000, sell: 13900 },
    { loc: "COR-B11", name: "Correa Poly-V 6PK1500", sub: "Correa Poly-V", buy: 6500, sell: 14900 },
    { loc: "COR-B12", name: "Correa Poly-V 6PK1700", sub: "Correa Poly-V", buy: 7000, sell: 15900 },
    { loc: "COR-C1", name: "Correa Poly-V 7PK1500", sub: "Correa Poly-V", buy: 7000, sell: 15900 },
    { loc: "COR-C2", name: "Correa Poly-V 7PK1700", sub: "Correa Poly-V", buy: 7500, sell: 16900 },
    { loc: "COR-C3", name: "Correa Poly-V 7PK1850", sub: "Correa Poly-V", buy: 8000, sell: 17900 },
    { loc: "COR-C4", name: "Correa Poly-V 7PK2000", sub: "Correa Poly-V", buy: 9000, sell: 19900 },
    { loc: "COR-C5", name: "Correa Poly-V 8PK1800", sub: "Correa Poly-V", buy: 10000, sell: 22900 },
    { loc: "COR-C6", name: "Correa Poly-V 8PK2100", sub: "Correa Poly-V", buy: 11000, sell: 24900 },
    { loc: "COR-C7", name: "Correa Poly-V 8PK2400", sub: "Correa Poly-V", buy: 12000, sell: 27900 },
    // V belts
    { loc: "COR-D1", name: "Correa en V A30", sub: "Correa en V", buy: 2000, sell: 4900 },
    { loc: "COR-D2", name: "Correa en V A35", sub: "Correa en V", buy: 2200, sell: 5500 },
    { loc: "COR-D3", name: "Correa en V A40", sub: "Correa en V", buy: 2500, sell: 5900 },
    { loc: "COR-D4", name: "Correa en V A45", sub: "Correa en V", buy: 2800, sell: 6500 },
    { loc: "COR-D5", name: "Correa en V B40", sub: "Correa en V", buy: 3500, sell: 7900 },
    { loc: "COR-D6", name: "Correa en V B50", sub: "Correa en V", buy: 4000, sell: 8900 },
    { loc: "COR-D7", name: "Correa en V B60", sub: "Correa en V", buy: 4500, sell: 9900 },
  ];
  for (const bl of beltData) { await upsertProduct({ code: nextCode("COR"), name: bl.name, categoryId: catCorreas.id, subcategoryId: subcats[bl.sub], brandId: bl.bid, buyPrice: bl.buy, sellPrice: bl.sell, stock: r(3, 10), minStock: 2, location: bl.loc }); }

  // Sample client
  await prisma.client.upsert({
    where: { id: "cliente-ejemplo" },
    update: {},
    create: { id: "cliente-ejemplo", name: "Cliente Ejemplo", rut: "12.345.678-9", phone: "+56 9 1234 5678", address: "Av. Siempre Viva 123, Santiago", email: "cliente@ejemplo.cl" },
  });

  console.log("Seed completed successfully");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
