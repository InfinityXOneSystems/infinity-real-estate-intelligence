/**
 * Treasure Coast Market Configuration
 *
 * Defines the primary market focus: South Florida Treasure Coast
 * Includes 12 target municipalities with high distressed property density
 */

export interface TreasureCoastMarket {
  city: string;
  state: string;
  county: string;
  zip?: string;
  lat?: number;
  lng?: number;
  priority: "high" | "medium" | "low";
  description: string;
  estimatedPopulation?: number;
  homeValueRange?: [number, number]; // min, max
}

export const TREASURE_COAST_MARKETS: TreasureCoastMarket[] = [
  {
    city: "Port St. Lucie",
    state: "FL",
    county: "St. Lucie",
    zip: "34952,34953,34954,34955",
    lat: 27.2811,
    lng: -80.3626,
    priority: "high",
    description: "Largest city in Treasure Coast, high growth, strong distressed property market",
    estimatedPopulation: 200000,
    homeValueRange: [250000, 600000],
  },
  {
    city: "Fort Pierce",
    state: "FL",
    county: "St. Lucie",
    zip: "34950,34951",
    lat: 27.4427,
    lng: -80.3255,
    priority: "high",
    description: "County seat, urban center, mixed income areas, foreclosure activity",
    estimatedPopulation: 45000,
    homeValueRange: [200000, 500000],
  },
  {
    city: "Stuart",
    state: "FL",
    county: "Martin",
    zip: "34994,34995,34996",
    lat: 27.1989,
    lng: -80.2511,
    priority: "high",
    description: "Affluent coastal community, waterfront properties, estate sales",
    estimatedPopulation: 15000,
    homeValueRange: [400000, 1200000],
  },
  {
    city: "West Palm Beach",
    state: "FL",
    county: "Palm Beach",
    zip: "33401,33402,33403,33404,33405",
    lat: 26.7153,
    lng: -80.0534,
    priority: "high",
    description: "Major urban center, diverse neighborhoods, significant distressed inventory",
    estimatedPopulation: 111000,
    homeValueRange: [200000, 800000],
  },
  {
    city: "Jupiter",
    state: "FL",
    county: "Palm Beach",
    zip: "33458,33469",
    lat: 26.9337,
    lng: -80.0892,
    priority: "high",
    description: "Upscale residential, waterfront luxury, estate market activity",
    estimatedPopulation: 62000,
    homeValueRange: [500000, 1500000],
  },
  {
    city: "Okeechobee",
    state: "FL",
    county: "Okeechobee",
    zip: "34974,34975",
    lat: 27.2549,
    lng: -80.8265,
    priority: "medium",
    description: "Rural market, agricultural area, lower price points, distressed opportunities",
    estimatedPopulation: 6000,
    homeValueRange: [100000, 300000],
  },
  {
    city: "Miami",
    state: "FL",
    county: "Miami-Dade",
    zip: "33101,33102,33103,33104,33105,33106,33107,33108,33109,33110,33111,33112,33113,33114,33115,33116,33117,33118,33119,33120,33121,33122,33123,33124,33125,33126,33127,33128,33129,33130,33131,33132,33133,33134,33135,33136,33137,33138,33139,33140,33141,33142,33143,33144,33145,33146,33147,33148,33149,33150,33151,33152,33153,33154,33155,33156,33157,33158,33159,33160,33161,33162,33163,33164,33165,33166,33167,33168,33169,33170,33171,33172,33173,33174,33175,33176,33177,33178,33179,33180,33181,33182,33183,33184,33185,33186,33187,33188,33189,33190,33191,33192,33193,33194,33195,33196,33197,33198,33199",
    lat: 25.7617,
    lng: -80.1918,
    priority: "high",
    description: "Major metropolitan area, diverse markets, significant opportunity across all neighborhoods",
    estimatedPopulation: 467000,
    homeValueRange: [150000, 1000000],
  },
  {
    city: "Vero Beach",
    state: "FL",
    county: "Indian River",
    zip: "32960,32961,32962,32963,32964",
    lat: 27.6393,
    lng: -80.3934,
    priority: "medium",
    description: "Coastal community, affluent areas, waterfront market segment",
    estimatedPopulation: 17000,
    homeValueRange: [350000, 900000],
  },
  {
    city: "Delray Beach",
    state: "FL",
    county: "Palm Beach",
    zip: "33444,33445,33446,33447",
    lat: 26.4614,
    lng: -80.0728,
    priority: "medium",
    description: "Trendy coastal city, young professionals, mixed residential/commercial",
    estimatedPopulation: 68000,
    homeValueRange: [300000, 800000],
  },
  {
    city: "Pompano Beach",
    state: "FL",
    county: "Broward",
    zip: "33060,33061,33062,33063,33064,33065,33066",
    lat: 26.2386,
    lng: -80.1229,
    priority: "medium",
    description: "Waterfront city, fishing community, diverse neighborhoods, rental market",
    estimatedPopulation: 104000,
    homeValueRange: [250000, 700000],
  },
  {
    city: "Tampa",
    state: "FL",
    county: "Hillsborough",
    zip: "33602,33603,33604,33605,33606,33607,33608,33609,33610,33611,33612,33613,33614,33615,33616,33617,33618,33619,33620,33621,33622,33623,33624,33625,33626,33627,33628,33629,33630,33631,33632,33633,33634,33635,33636,33637,33638,33646,33647,33648,33649",
    lat: 27.9506,
    lng: -82.4572,
    priority: "medium",
    description: "Major state city, economic hub, diverse neighborhoods, strong rental market",
    estimatedPopulation: 399000,
    homeValueRange: [200000, 600000],
  },
];

export const TREASURE_COAST_FOCUS = {
  name: "Treasure Coast + Miami + Tampa Corridor",
  markets: TREASURE_COAST_MARKETS,
  description: "Premium distressed property market focus across South Florida",
  totalMarkets: TREASURE_COAST_MARKETS.length,
  priorityMarkets: TREASURE_COAST_MARKETS.filter((m) => m.priority === "high").length,
  estimatedTotalProperties: 2500000,
};
