import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Minus, ChevronDown, Printer, Download, Trash2 } from 'lucide-react';

// Mock data for factions and units
const factions = {
  ultramarines: {
    name: "Ultramarines",
    color: "accent",
    units: {
      hq: [
        {
          id: "captain",
          name: "Captain in Tactical Dreadnought Armour",
          points: 115,
          stats: "M6 WS2+ BS2+ S4 T4 W5 A4 Ld9 Sv2+",
          wargear: ["Storm bolter", "Power fist"],
          abilities: ["Deep Strike", "Rites of Battle"]
        },
        {
          id: "librarian",
          name: "Librarian",
          points: 90,
          stats: "M6 WS3+ BS3+ S4 T4 W4 A3 Ld9 Sv3+",
          wargear: ["Force weapon", "Bolt pistol"],
          abilities: ["Psychic Powers", "Know No Fear"]
        }
      ],
      troops: [
        {
          id: "intercessors",
          name: "Intercessor Squad",
          points: 100,
          minSize: 5,
          maxSize: 10,
          unitCost: 20,
          stats: "M6 WS3+ BS3+ S4 T4 W2 A2 Ld7 Sv3+",
          wargear: ["Bolt rifle", "Frag & Krak grenades"],
          abilities: ["Combat Squads", "Rapid Fire"]
        },
        {
          id: "tactical",
          name: "Tactical Squad",
          points: 90,
          minSize: 5,
          maxSize: 10,
          unitCost: 18,
          stats: "M6 WS3+ BS3+ S4 T4 W1 A1 Ld7 Sv3+",
          wargear: ["Boltgun", "Frag & Krak grenades"],
          abilities: ["Combat Squads", "Bolter Discipline"]
        }
      ],
      heavySupport: [
        {
          id: "devastators",
          name: "Devastator Squad",
          points: 90,
          minSize: 5,
          maxSize: 10,
          unitCost: 18,
          stats: "M6 WS3+ BS3+ S4 T4 W1 A1 Ld7 Sv3+",
          wargear: ["Heavy weapon", "Frag & Krak grenades"],
          abilities: ["Signum", "Fire Discipline"]
        }
      ]
    }
  },
  orks: {
    name: "Orks",
    color: "destructive",
    units: {
      hq: [
        {
          id: "warboss",
          name: "Warboss",
          points: 80,
          stats: "M6 WS2+ BS5+ S5 T5 W5 A4 Ld8 Sv4+",
          wargear: ["Power klaw", "Slugga"],
          abilities: ["Waaagh!", "'Ere We Go"]
        },
        {
          id: "weirdboy",
          name: "Weirdboy",
          points: 70,
          stats: "M6 WS4+ BS5+ S4 T4 W4 A2 Ld7 Sv6+",
          wargear: ["Weirdboy staff"],
          abilities: ["Psychic Powers", "Waaagh! Energy"]
        }
      ],
      troops: [
        {
          id: "boyz",
          name: "Boyz",
          points: 90,
          minSize: 10,
          maxSize: 30,
          unitCost: 9,
          stats: "M6 WS3+ BS5+ S4 T4 W1 A2 Ld6 Sv6+",
          wargear: ["Slugga", "Choppa"],
          abilities: ["Mob Rule", "'Ere We Go"]
        },
        {
          id: "grots",
          name: "Gretchin",
          points: 40,
          minSize: 10,
          maxSize: 30,
          unitCost: 4,
          stats: "M6 WS5+ BS4+ S2 T3 W1 A1 Ld4 Sv7+",
          wargear: ["Grot blaster"],
          abilities: ["Expendable"]
        }
      ],
      heavySupport: [
        {
          id: "lootas",
          name: "Lootas",
          points: 85,
          minSize: 5,
          maxSize: 15,
          unitCost: 17,
          stats: "M6 WS3+ BS5+ S4 T4 W1 A2 Ld6 Sv6+",
          wargear: ["Deffgun"],
          abilities: ["Dakka Dakka Dakka"]
        }
      ]
    }
  }
};

type Unit = {
  id: string;
  name: string;
  points: number;
  minSize?: number;
  maxSize?: number;
  unitCost?: number;
  stats: string;
  wargear: string[];
  abilities: string[];
};

type ArmyUnit = {
  unit: Unit;
  size: number;
  category: string;
};

const ArmyBuilder = () => {
  const [selectedFaction, setSelectedFaction] = useState<string>('ultramarines');
  const [army, setArmy] = useState<ArmyUnit[]>([]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    hq: true,
    troops: true,
    heavySupport: false
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const addUnit = (unit: Unit, category: string) => {
    const newUnit: ArmyUnit = {
      unit,
      size: unit.minSize || 1,
      category
    };
    setArmy(prev => [...prev, newUnit]);
  };

  const removeUnit = (index: number) => {
    setArmy(prev => prev.filter((_, i) => i !== index));
  };

  const updateUnitSize = (index: number, change: number) => {
    setArmy(prev => prev.map((armyUnit, i) => {
      if (i === index) {
        const newSize = Math.max(
          armyUnit.unit.minSize || 1,
          Math.min(armyUnit.unit.maxSize || 1, armyUnit.size + change)
        );
        return { ...armyUnit, size: newSize };
      }
      return armyUnit;
    }));
  };

  const calculateUnitPoints = (armyUnit: ArmyUnit) => {
    if (armyUnit.unit.unitCost) {
      return armyUnit.unit.points + (armyUnit.unit.unitCost * (armyUnit.size - (armyUnit.unit.minSize || 1)));
    }
    return armyUnit.unit.points;
  };

  const totalPoints = army.reduce((total, armyUnit) => total + calculateUnitPoints(armyUnit), 0);

  const faction = factions[selectedFaction as keyof typeof factions];

  return (
    <div className="min-h-screen bg-gradient-void p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2 animate-glow">
            WARHAMMER 40,000
          </h1>
          <p className="text-lg text-muted-foreground">Army Builder</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Faction Selection & Unit Browser */}
          <div className="lg:col-span-2 space-y-6">
            {/* Faction Selection */}
            <Card className="bg-card border-border shadow-elevation">
              <CardHeader>
                <CardTitle className="text-primary">Select Faction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(factions).map(([key, faction]) => (
                    <Button
                      key={key}
                      variant={selectedFaction === key ? "default" : "outline"}
                      onClick={() => setSelectedFaction(key)}
                      className="h-auto p-4 text-left"
                    >
                      <div>
                        <div className="font-semibold">{faction.name}</div>
                        <div className="text-sm opacity-70">
                          {Object.values(faction.units).flat().length} units available
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Unit Browser */}
            <Card className="bg-card border-border shadow-elevation">
              <CardHeader>
                <CardTitle className="text-primary">{faction.name} Units</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(faction.units).map(([category, units]) => (
                  <Collapsible
                    key={category}
                    open={openSections[category]}
                    onOpenChange={() => toggleSection(category)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-4 h-auto">
                        <span className="text-lg font-semibold capitalize">
                          {category.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${openSections[category] ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-3 mt-3">
                      {units.map((unit) => (
                        <Card key={unit.id} className="bg-muted border-border">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-semibold text-card-foreground">{unit.name}</h4>
                                <Badge variant="secondary" className="mt-1">
                                  {unit.points} pts
                                  {unit.unitCost && ` + ${unit.unitCost}/model`}
                                </Badge>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => addUnit(unit, category)}
                                className="shrink-0"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div>{unit.stats}</div>
                              <div><strong>Wargear:</strong> {unit.wargear.join(', ')}</div>
                              <div><strong>Abilities:</strong> {unit.abilities.join(', ')}</div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Army List */}
          <div className="space-y-6">
            <Card className="bg-card border-border shadow-plasma sticky top-4">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-primary">Army Roster</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs">
                      <Printer className="h-3 w-3 mr-1" />
                      Print
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs">
                      <Download className="h-3 w-3 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-muted-foreground">{faction.name}</span>
                  <Badge variant="default" className="bg-gradient-plasma animate-plasma-pulse">
                    {totalPoints} Points
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {army.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <p>No units selected</p>
                      <p className="text-xs mt-1">Add units from the browser to build your army</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {army.map((armyUnit, index) => (
                        <Card key={index} className="bg-muted/50 border-border">
                          <CardContent className="p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-sm text-card-foreground truncate">
                                  {armyUnit.unit.name}
                                </h5>
                                <Badge variant="outline" className="text-xs mt-1">
                                  {armyUnit.category.replace(/([A-Z])/g, ' $1').trim()}
                                </Badge>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeUnit(index)}
                                className="text-destructive hover:text-destructive h-6 w-6 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            {armyUnit.unit.unitCost ? (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateUnitSize(index, -1)}
                                    disabled={armyUnit.size <= (armyUnit.unit.minSize || 1)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="text-sm font-medium w-8 text-center">
                                    {armyUnit.size}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateUnitSize(index, 1)}
                                    disabled={armyUnit.size >= (armyUnit.unit.maxSize || 1)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  {calculateUnitPoints(armyUnit)} pts
                                </Badge>
                              </div>
                            ) : (
                              <div className="flex justify-end">
                                <Badge variant="secondary" className="text-xs">
                                  {armyUnit.unit.points} pts
                                </Badge>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArmyBuilder;