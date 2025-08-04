/**
 * BSData Parser Service
 * Fetches and parses BSData files from GitHub repository
 */

export interface ParsedUnit {
  id: string;
  name: string;
  points: number;
  minSize?: number;
  maxSize?: number;
  unitCost?: number;
  stats: string;
  wargear: string[];
  abilities: string[];
  loadouts?: Loadout[];
  wargearOptions?: WargearOption[];
  keywords: string[];
}

export interface Loadout {
  id: string;
  name: string;
  wargear: string[];
}

export interface WargearOption {
  id: string;
  name: string;
  points: number;
}

export interface ParsedFaction {
  id: string;
  name: string;
  color: string;
  units: {
    epicHeroes: ParsedUnit[];
    characters: ParsedUnit[];
    troops: ParsedUnit[];
    heavySupport: ParsedUnit[];
    elites: ParsedUnit[];
    fastAttack: ParsedUnit[];
    flyer: ParsedUnit[];
    transport: ParsedUnit[];
    fortification: ParsedUnit[];
  };
}

const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/BSData/wh40k-10e/main/';

// Faction mapping from file names to our internal structure
const FACTION_MAPPINGS: Record<string, { name: string; color: string; id: string }> = {
  'Imperium - Space Marines.cat': { 
    name: 'Space Marines', 
    color: 'accent', 
    id: 'space-marines' 
  },
  'Imperium - Astra Militarum.cat': { 
    name: 'Astra Militarum', 
    color: 'secondary', 
    id: 'astra-militarum' 
  },
  'Imperium - Custodes.cat': { 
    name: 'Adeptus Custodes', 
    color: 'default', 
    id: 'custodes' 
  },
  'Imperium - Grey Knights.cat': { 
    name: 'Grey Knights', 
    color: 'outline', 
    id: 'grey-knights' 
  },
  'Imperium - Imperial Agents.cat': { 
    name: 'Imperial Agents', 
    color: 'secondary', 
    id: 'imperial-agents' 
  },
  'Imperium - Imperial Knights.cat': { 
    name: 'Imperial Knights', 
    color: 'accent', 
    id: 'imperial-knights' 
  },
  'Imperium - Sisters of Battle.cat': { 
    name: 'Sisters of Battle', 
    color: 'destructive', 
    id: 'sisters-of-battle' 
  },
  'Chaos - Chaos Knights.cat': { 
    name: 'Chaos Knights', 
    color: 'destructive', 
    id: 'chaos-knights' 
  },
  'Chaos - Chaos Space Marines.cat': { 
    name: 'Chaos Space Marines', 
    color: 'destructive', 
    id: 'chaos-space-marines' 
  },
  'Chaos - Death Guard.cat': { 
    name: 'Death Guard', 
    color: 'destructive', 
    id: 'death-guard' 
  },
  'Chaos - Thousand Sons.cat': { 
    name: 'Thousand Sons', 
    color: 'destructive', 
    id: 'thousand-sons' 
  },
  'Chaos - World Eaters.cat': { 
    name: 'World Eaters', 
    color: 'destructive', 
    id: 'world-eaters' 
  },
  'Chaos - Daemons.cat': { 
    name: 'Chaos Daemons', 
    color: 'destructive', 
    id: 'chaos-daemons' 
  },
  'Xenos - Aeldari.cat': { 
    name: 'Aeldari', 
    color: 'accent', 
    id: 'aeldari' 
  },
  'Xenos - Drukhari.cat': { 
    name: 'Drukhari', 
    color: 'destructive', 
    id: 'drukhari' 
  },
  'Xenos - Necrons.cat': { 
    name: 'Necrons', 
    color: 'secondary', 
    id: 'necrons' 
  },
  'Xenos - Orks.cat': { 
    name: 'Orks', 
    color: 'destructive', 
    id: 'orks' 
  },
  'Xenos - Tau Empire.cat': { 
    name: 'T\'au Empire', 
    color: 'accent', 
    id: 'tau-empire' 
  },
  'Xenos - Tyranids.cat': { 
    name: 'Tyranids', 
    color: 'destructive', 
    id: 'tyranids' 
  },
  'Xenos - Genestealer Cults.cat': { 
    name: 'Genestealer Cults', 
    color: 'destructive', 
    id: 'genestealer-cults' 
  },
  'Xenos - Leagues of Votann.cat': { 
    name: 'Leagues of Votann', 
    color: 'secondary', 
    id: 'leagues-of-votann' 
  }
};

// Category mapping from BSData to our structure
const CATEGORY_MAPPINGS: Record<string, keyof ParsedFaction['units']> = {
  'Epic Heroes': 'epicHeroes',
  'Character': 'characters',
  'Troops': 'troops',
  'Heavy Support': 'heavySupport',
  'Elites': 'elites',
  'Fast Attack': 'fastAttack',
  'Flyer': 'flyer',
  'Transport': 'transport',
  'Fortification': 'fortification'
};

class BSDataParser {
  private parser = new DOMParser();

  async fetchFactionData(fileName: string): Promise<string> {
    try {
      const response = await fetch(`${GITHUB_RAW_URL}${encodeURIComponent(fileName)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${fileName}: ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      console.error(`Error fetching faction data for ${fileName}:`, error);
      throw error;
    }
  }

  parseXMLToDOM(xmlContent: string): Document {
    return this.parser.parseFromString(xmlContent, 'text/xml');
  }

  extractUnitsFromDOM(xmlDoc: Document, factionInfo: { name: string; color: string; id: string }): ParsedFaction {
    const units: ParsedFaction['units'] = {
      epicHeroes: [],
      characters: [],
      troops: [],
      heavySupport: [],
      elites: [],
      fastAttack: [],
      flyer: [],
      transport: [],
      fortification: []
    };

    // Extract entry links which reference units
    const entryLinks = xmlDoc.querySelectorAll('entryLink[type="selectionEntry"]');
    
    entryLinks.forEach(entryLink => {
      const unitName = entryLink.getAttribute('name');
      if (!unitName || unitName.includes('[Legends]')) return; // Skip legends units for now

      // Determine category based on category links
      const categoryLinks = entryLink.querySelectorAll('categoryLink');
      let category: keyof ParsedFaction['units'] = 'troops'; // default
      let isEpicHero = false;

      categoryLinks.forEach(catLink => {
        const catName = catLink.getAttribute('name');
        if (catName === 'Epic Heroes') {
          isEpicHero = true;
          category = 'epicHeroes';
        } else if (catName && CATEGORY_MAPPINGS[catName]) {
          if (!isEpicHero) { // Epic Heroes takes precedence
            category = CATEGORY_MAPPINGS[catName];
          }
        }
      });

      // If it's a character but not epic hero, put in characters category
      if ((unitName.includes('Captain') || unitName.includes('Chaplain') || 
          unitName.includes('Librarian') || unitName.includes('Lieutenant')) && !isEpicHero) {
        category = 'characters';
      }

      // Create unit object with basic data
      const unit: ParsedUnit = {
        id: this.generateId(unitName),
        name: unitName,
        points: 100, // Default - would need deeper parsing for actual points
        stats: 'M6 WS3+ BS3+ S4 T4 W2 A2 Ld7 Sv3+', // Default stats
        wargear: ['Standard Equipment'],
        abilities: ['Combat Squads'],
        keywords: [],
        loadouts: [
          {
            id: 'standard',
            name: 'Standard Loadout',
            wargear: ['Standard Equipment']
          }
        ]
      };

      // Add squad size for non-character units
      if (!['epicHeroes', 'characters'].includes(category)) {
        unit.minSize = 5;
        unit.maxSize = 10;
        unit.unitCost = 20;
      }

      // Add wargear options for characters
      if (['epicHeroes', 'characters'].includes(category)) {
        unit.wargearOptions = [
          {
            id: 'relic-weapon',
            name: 'Relic Weapon',
            points: 10
          },
          {
            id: 'digital-weapons',
            name: 'Digital Weapons',
            points: 5
          }
        ];
      }

      units[category].push(unit);
    });

    return {
      id: factionInfo.id,
      name: factionInfo.name,
      color: factionInfo.color,
      units
    };
  }

  private generateId(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async parseFaction(fileName: string): Promise<ParsedFaction | null> {
    try {
      const factionInfo = FACTION_MAPPINGS[fileName];
      if (!factionInfo) {
        console.warn(`No mapping found for faction file: ${fileName}`);
        return null;
      }

      console.log(`Parsing faction: ${factionInfo.name}`);
      const xmlContent = await this.fetchFactionData(fileName);
      const xmlDoc = this.parseXMLToDOM(xmlContent);
      
      return this.extractUnitsFromDOM(xmlDoc, factionInfo);
    } catch (error) {
      console.error(`Error parsing faction ${fileName}:`, error);
      return null;
    }
  }

  async parseAllFactions(): Promise<Record<string, ParsedFaction>> {
    const factions: Record<string, ParsedFaction> = {};
    const factionFiles = Object.keys(FACTION_MAPPINGS);

    console.log('Starting to parse all factions...');
    
    // Parse factions in parallel but with some delay to avoid rate limiting
    for (let i = 0; i < factionFiles.length; i++) {
      const fileName = factionFiles[i];
      try {
        const faction = await this.parseFaction(fileName);
        if (faction) {
          factions[faction.id] = faction;
          console.log(`Successfully parsed ${faction.name} (${Object.values(faction.units).flat().length} units)`);
        }
        
        // Add small delay to avoid rate limiting
        if (i < factionFiles.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } catch (error) {
        console.error(`Failed to parse ${fileName}:`, error);
      }
    }

    console.log(`Completed parsing. Successfully loaded ${Object.keys(factions).length} factions.`);
    return factions;
  }
}

export const bsDataParser = new BSDataParser();