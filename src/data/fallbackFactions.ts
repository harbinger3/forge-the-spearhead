/**
 * Fallback faction data for when BSData is unavailable
 * This ensures the app always works while BSData is being loaded
 */

import type { ParsedFaction } from '@/services/bsDataParser';

export const fallbackFactions: Record<string, ParsedFaction> = {
  'space-marines': {
    id: 'space-marines',
    name: 'Space Marines',
    color: 'accent',
    units: {
      epicHeroes: [
        {
          id: 'captain-calgar',
          name: 'Marneus Calgar',
          points: 185,
          stats: 'M6 WS2+ BS2+ S4 T5 W6 A5 Ld9 Sv2+',
          wargear: ['Gauntlets of Ultramar', 'Armor of Heraclus'],
          abilities: ['Deep Strike', 'Rites of Battle', 'Adept of the Codex'],
          keywords: ['Epic Hero', 'Character'],
          loadouts: [
            { id: 'standard', name: 'Standard Loadout', wargear: ['Gauntlets of Ultramar', 'Armor of Heraclus'] }
          ]
        }
      ],
      characters: [
        {
          id: 'captain',
          name: 'Captain in Terminator Armour',
          points: 115,
          stats: 'M5 WS2+ BS2+ S4 T5 W6 A4 Ld9 Sv2+',
          wargear: ['Storm bolter', 'Power fist'],
          abilities: ['Deep Strike', 'Rites of Battle'],
          keywords: ['Character', 'Terminator'],
          loadouts: [
            { id: 'standard', name: 'Standard Loadout', wargear: ['Storm bolter', 'Power fist'] },
            { id: 'relic', name: 'Relic Blade', wargear: ['Storm bolter', 'Relic blade'] }
          ],
          wargearOptions: [
            { id: 'relic-blade', name: 'Relic Blade', points: 10 },
            { id: 'digital-weapons', name: 'Digital Weapons', points: 5 }
          ]
        }
      ],
      troops: [
        {
          id: 'intercessors',
          name: 'Intercessor Squad',
          points: 100,
          minSize: 5,
          maxSize: 10,
          unitCost: 20,
          stats: 'M6 WS3+ BS3+ S4 T4 W2 A2 Ld7 Sv3+',
          wargear: ['Bolt rifle', 'Frag & Krak grenades'],
          abilities: ['Combat Squads'],
          keywords: ['Troops', 'Primaris'],
          loadouts: [
            { id: 'standard', name: 'Bolt Rifles', wargear: ['Bolt rifle', 'Frag & Krak grenades'] },
            { id: 'auto', name: 'Auto Bolt Rifles', wargear: ['Auto bolt rifle', 'Frag & Krak grenades'] }
          ]
        }
      ],
      elites: [],
      fastAttack: [],
      heavySupport: [
        {
          id: 'devastators',
          name: 'Devastator Squad',
          points: 90,
          minSize: 5,
          maxSize: 10,
          unitCost: 18,
          stats: 'M6 WS3+ BS3+ S4 T4 W1 A1 Ld7 Sv3+',
          wargear: ['Heavy weapon', 'Frag & Krak grenades'],
          abilities: ['Signum'],
          keywords: ['Heavy Support'],
          loadouts: [
            { id: 'missile', name: 'Missile Launchers', wargear: ['Missile launcher', 'Frag & Krak grenades'] },
            { id: 'lascannon', name: 'Lascannons', wargear: ['Lascannon', 'Frag & Krak grenades'] }
          ]
        }
      ],
      flyer: [],
      transport: [],
      fortification: []
    }
  }
};