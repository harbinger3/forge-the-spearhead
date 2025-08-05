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

    // Get all selection entries (the actual unit definitions)
    const selectionEntries = xmlDoc.querySelectorAll('selectionEntry');
    const unitMap = new Map<string, ParsedUnit>();

    selectionEntries.forEach(entry => {
      const unitName = entry.getAttribute('name');
      if (!unitName || unitName.includes('[Legends]')) return;

      // Get the base unit name (remove weapon variations)
      const baseUnitName = this.getBaseUnitName(unitName);
      const unitId = this.generateId(baseUnitName);

      // Determine category
      const category = this.determineUnitCategory(entry, unitName);
      
      // Check if we already have this base unit
      let unit = unitMap.get(unitId);
      
      if (!unit) {
        // Create new unit
        const stats = this.extractStats(entry);
        const points = this.extractPoints(entry);
        
        unit = {
          id: unitId,
          name: baseUnitName,
          points: points.base,
          stats: stats,
          wargear: [],
          abilities: this.extractAbilities(entry),
          keywords: this.extractKeywords(entry),
          loadouts: []
        };

        // Add squad size for non-character units
        if (!['epicHeroes', 'characters'].includes(category)) {
          unit.minSize = points.minSize || 5;
          unit.maxSize = points.maxSize || 10;
          unit.unitCost = points.unitCost || 20;
        }

        // Add wargear options for characters
        if (['epicHeroes', 'characters'].includes(category)) {
          unit.wargearOptions = this.extractWargearOptions(entry);
        }

        unitMap.set(unitId, unit);
        units[category].push(unit);
      }

      // Add loadout for this variant
      const loadout = this.createLoadout(entry, unitName);
      if (loadout && !unit.loadouts.some(l => l.id === loadout.id)) {
        unit.loadouts.push(loadout);
      }
    });

    return {
      id: factionInfo.id,
      name: factionInfo.name,
      color: factionInfo.color,
      units
    };
  }

  private getBaseUnitName(unitName: string): string {
    // Expanded weapon suffixes to catch more variants
    const weaponSuffixes = [
      ' with bolt rifles',
      ' with stalker bolt rifles', 
      ' with auto bolt rifles',
      ' with heavy bolt rifles',
      ' with assault bolt rifles',
      ' with plasma incinerators',
      ' with melta rifles',
      ' with heavy plasma incinerators',
      ' with thunder hammers',
      ' with storm bolters',
      ' with chainswords',
      ' with plasma pistols',
      ' with power fists',
      ' with power swords',
      ' with combi-weapons',
      ' with missile launchers',
      ' with heavy bolters',
      ' with lascannons',
      ' with multi-meltas',
      ' with assault cannons',
      ' with flamers',
      ' with meltaguns',
      ' with plasma guns',
      ' with grav-guns',
      ' with volkite weapons',
      ' with inferno pistols',
      ' with master-crafted',
      ' with relic',
      ' with terminator',
      ' armed with',
      ' equipped with'
    ];
    
    let baseName = unitName;
    for (const suffix of weaponSuffixes) {
      if (baseName.toLowerCase().includes(suffix)) {
        baseName = baseName.replace(new RegExp(suffix, 'gi'), '');
        break;
      }
    }
    
    return baseName.trim();
  }

  private determineUnitCategory(entry: Element, unitName: string): keyof ParsedFaction['units'] {
    const categoryLinks = entry.querySelectorAll('categoryLink');
    let isEpicHero = false;
    let isCharacter = false;
    let category: keyof ParsedFaction['units'] = 'troops'; // default

    categoryLinks.forEach(catLink => {
      const catName = catLink.getAttribute('name');
      if (catName === 'Epic Heroes') {
        isEpicHero = true;
        category = 'epicHeroes';
      } else if (catName === 'Character') {
        isCharacter = true;
        if (!isEpicHero) {
          category = 'characters';
        }
      } else if (catName && CATEGORY_MAPPINGS[catName] && !isEpicHero && !isCharacter) {
        category = CATEGORY_MAPPINGS[catName];
      }
    });

    // Fallback character detection using keywords if no categoryLink
    if (!isEpicHero && !isCharacter && this.isCharacterUnit(unitName)) {
      category = 'characters';
    }

    return category;
  }

  private isCharacterUnit(unitName: string): boolean {
    const characterKeywords = [
      'captain', 'chaplain', 'librarian', 'lieutenant', 'techmarine', 
      'apothecary', 'ancient', 'champion', 'judiciar', 'master', 'biologis'
    ];
    
    return characterKeywords.some(keyword => 
      unitName.toLowerCase().includes(keyword)
    );
  }

  private extractStats(entry: Element): string {
    const profiles = entry.querySelectorAll('profile[typeName="Unit"]');
    if (profiles.length === 0) return 'No stats available';

    const profile = profiles[0];
    const characteristics = profile.querySelectorAll('characteristic');
    const stats: string[] = [];

    characteristics.forEach(char => {
      const name = char.getAttribute('name');
      const value = char.getAttribute('value') || char.textContent?.trim() || '-';
      
      if (name) {
        // Map characteristic names to short forms
        const shortName = this.getStatShortName(name);
        if (shortName) {
          stats.push(`${shortName}${value}`);
        }
      }
    });

    return stats.length > 0 ? stats.join(' ') : 'No stats available';
  }

  private getStatShortName(name: string): string | null {
    const mapping: Record<string, string> = {
      'Movement': 'M',
      'M': 'M', 
      'Weapon Skill': 'WS',
      'WS': 'WS',
      'Ballistic Skill': 'BS', 
      'BS': 'BS',
      'Strength': 'S',
      'S': 'S',
      'Toughness': 'T',
      'T': 'T', 
      'Wounds': 'W',
      'W': 'W',
      'Attacks': 'A',
      'A': 'A',
      'Leadership': 'Ld',
      'Ld': 'Ld',
      'Save': 'Sv',
      'Sv': 'Sv'
    };
    
    return mapping[name] || null;
  }

  private extractPoints(entry: Element): { base: number; minSize?: number; maxSize?: number; unitCost?: number } {
    let basePoints = 0;
    let minSize: number | undefined;
    let maxSize: number | undefined;
    let unitCost: number | undefined;
    
    // Extract base cost - check both current entry and parent
    const costs = entry.querySelectorAll('cost[name="pts"], cost[name="points"]');
    costs.forEach(cost => {
      const value = parseFloat(cost.getAttribute('value') || '0');
      if (value > 0) {
        basePoints += value;
      }
    });

    // Extract constraints for squad sizes
    const constraints = entry.querySelectorAll('constraint');
    constraints.forEach(constraint => {
      const type = constraint.getAttribute('type');
      const field = constraint.getAttribute('field');
      const value = parseFloat(constraint.getAttribute('value') || '0');
      
      if (field === 'selections' || field === 'limit') {
        if (type === 'min' && value > 0) {
          minSize = value;
        } else if (type === 'max' && value > 0) {
          maxSize = value;
        }
      }
    });

    // Look for modifiers that might indicate per-model costs
    const modifiers = entry.querySelectorAll('modifier');
    modifiers.forEach(modifier => {
      const type = modifier.getAttribute('type');
      const field = modifier.getAttribute('field');
      
      if (type === 'multiply' && field === 'selections') {
        // This suggests the cost is per-model
        const value = parseFloat(modifier.getAttribute('value') || '1');
        if (minSize && value > 0) {
          unitCost = Math.round(basePoints / minSize);
        }
      }
    });

    // Fallback calculation for per-model cost
    if (!unitCost && minSize && minSize > 1 && basePoints > 0) {
      unitCost = Math.round(basePoints / minSize);
    }

    return {
      base: basePoints,
      minSize,
      maxSize,
      unitCost
    };
  }

  private extractAbilities(entry: Element): string[] {
    const abilities: string[] = [];
    const rules = entry.querySelectorAll('rule');
    
    rules.forEach(rule => {
      const name = rule.getAttribute('name');
      if (name) {
        abilities.push(name);
      }
    });

    return abilities.length > 0 ? abilities : ['No special abilities'];
  }

  private extractKeywords(entry: Element): string[] {
    const keywords: string[] = [];
    const categoryLinks = entry.querySelectorAll('categoryLink');
    
    categoryLinks.forEach(catLink => {
      const name = catLink.getAttribute('name');
      if (name && !CATEGORY_MAPPINGS[name] && name !== 'Epic Heroes') {
        keywords.push(name);
      }
    });

    return keywords;
  }

  private extractWargearOptions(entry: Element): WargearOption[] {
    const options: WargearOption[] = [];
    const selectionEntryGroups = entry.querySelectorAll('selectionEntryGroup');
    
    selectionEntryGroups.forEach(group => {
      const groupEntries = group.querySelectorAll('selectionEntry');
      
      groupEntries.forEach(optionEntry => {
        const name = optionEntry.getAttribute('name');
        if (name) {
          const costs = optionEntry.querySelectorAll('cost');
          let points = 0;
          
          costs.forEach(cost => {
            const costName = cost.getAttribute('name');
            if (costName === 'pts' || costName === 'points') {
              points = parseFloat(cost.getAttribute('value') || '0');
            }
          });

          options.push({
            id: this.generateId(name),
            name: name,
            points: points
          });
        }
      });
    });

    return options;
  }

  private createLoadout(entry: Element, unitName: string): Loadout | null {
    const wargear: string[] = [];
    
    // Extract wargear from weapon profiles
    const weaponProfiles = entry.querySelectorAll('profile[typeName="Weapon"]');
    weaponProfiles.forEach(profile => {
      const weaponName = profile.getAttribute('name');
      if (weaponName) {
        wargear.push(weaponName);
      }
    });

    // Extract from nested selection entries (weapons and equipment)
    const selections = entry.querySelectorAll('selectionEntry, selectionEntryLink');
    selections.forEach(selection => {
      const name = selection.getAttribute('name');
      if (name && this.isWargearItem(name)) {
        wargear.push(name);
      }
    });

    // Extract from entry links (shared equipment references)
    const entryLinks = entry.querySelectorAll('entryLink');
    entryLinks.forEach(link => {
      const name = link.getAttribute('name');
      if (name && this.isWargearItem(name)) {
        wargear.push(name);
      }
    });

    // Extract from selectionEntryGroups (weapon options)
    const selectionGroups = entry.querySelectorAll('selectionEntryGroup > selectionEntry');
    selectionGroups.forEach(selection => {
      const name = selection.getAttribute('name');
      if (name && this.isWargearItem(name)) {
        wargear.push(name);
      }
    });

    // Remove duplicates
    const uniqueWargear = [...new Set(wargear)];

    if (uniqueWargear.length === 0) {
      uniqueWargear.push('Standard Equipment');
    }

    // Create loadout name based on primary weapon or unit variant
    const loadoutName = this.generateLoadoutName(unitName, uniqueWargear);

    return {
      id: this.generateId(loadoutName),
      name: loadoutName,
      wargear: uniqueWargear
    };
  }

  private isWargearItem(name: string): boolean {
    const lower = name.toLowerCase();
    
    // Skip non-wargear categories
    const excludeKeywords = [
      'upgrade', 'psyker', 'mark of', 'warlord', 'detachment', 'enhancement'
    ];
    
    if (excludeKeywords.some(keyword => lower.includes(keyword))) {
      return false;
    }
    
    const wargearKeywords = [
      'bolt', 'plasma', 'melta', 'flamer', 'rifle', 'pistol', 'sword', 
      'hammer', 'axe', 'shield', 'armour', 'grenade', 'launcher',
      'cannon', 'gun', 'weapon', 'blade', 'staff', 'spear', 'claw',
      'whip', 'chain', 'power', 'force', 'storm', 'heavy', 'assault',
      'rapid fire', 'combi', 'multi', 'twin', 'master-crafted', 'relic'
    ];
    
    return wargearKeywords.some(keyword => lower.includes(keyword));
  }

  private generateLoadoutName(unitName: string, wargear: string[]): string {
    // If unit name has weapon info, extract it first
    const weaponMatch = unitName.match(/with (.+)$/);
    if (weaponMatch) {
      return weaponMatch[1];
    }
    
    // Filter out non-weapon items and get primary weapons
    const weapons = wargear.filter(w => {
      const lower = w.toLowerCase();
      return !lower.includes('grenades') && 
             !lower.includes('armour') && 
             !lower.includes('equipment') &&
             (lower.includes('rifle') || 
              lower.includes('cannon') ||
              lower.includes('launcher') ||
              lower.includes('pistol') ||
              lower.includes('sword') ||
              lower.includes('hammer') ||
              lower.includes('bolter') ||
              lower.includes('plasma') ||
              lower.includes('melta') ||
              lower.includes('flamer'));
    });
    
    if (weapons.length > 0) {
      // Join multiple weapons with " & "
      if (weapons.length > 2) {
        return weapons.slice(0, 2).join(' & ') + ' & more';
      }
      return weapons.join(' & ');
    }
    
    return 'Standard Loadout';
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