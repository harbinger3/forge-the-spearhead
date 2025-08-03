import { Link, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, ArrowLeft } from 'lucide-react';

// Faction data by game system
const factionsBySystem = {
  "warhammer-40k": [
    {
      id: "ultramarines",
      name: "Ultramarines",
      description: "Noble sons of Guilliman",
      color: "bg-gradient-to-r from-blue-600 to-blue-800",
      unitCount: 45
    },
    {
      id: "orks",
      name: "Orks", 
      description: "The green tide of destruction",
      color: "bg-gradient-to-r from-green-600 to-green-800",
      unitCount: 38
    },
    // Placeholder for future factions
    {
      id: "blood-angels",
      name: "Blood Angels",
      description: "Sons of Sanguinius",
      color: "bg-gradient-to-r from-red-600 to-red-800",
      unitCount: 42
    }
  ],
  "age-of-sigmar": [
    {
      id: "stormcast-eternals",
      name: "Stormcast Eternals",
      description: "Sigmar's chosen warriors",
      color: "bg-gradient-to-r from-yellow-600 to-amber-600",
      unitCount: 40
    },
    {
      id: "khorne-bloodbound",
      name: "Khorne Bloodbound",
      description: "Warriors of the Blood God",
      color: "bg-gradient-to-r from-red-700 to-red-900",
      unitCount: 35
    }
  ]
};

const systemNames = {
  "warhammer-40k": "Warhammer 40,000",
  "age-of-sigmar": "Age of Sigmar"
};

const FactionSelection = () => {
  const { systemId } = useParams<{ systemId: string }>();
  
  if (!systemId || !factionsBySystem[systemId as keyof typeof factionsBySystem]) {
    return <div>Game system not found</div>;
  }

  const factions = factionsBySystem[systemId as keyof typeof factionsBySystem];
  const systemName = systemNames[systemId as keyof typeof systemNames];

  return (
    <div className="min-h-screen bg-gradient-void">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Game Systems
          </Link>
          
          <div className="text-center">
            <h1 className="text-5xl font-bold text-foreground mb-4 animate-glow">
              {systemName} Factions
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Choose your faction and forge your destiny
            </p>
            <Badge variant="secondary" className="bg-gradient-plasma animate-plasma-pulse">
              {factions.length} Factions Available
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Factions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {factions.map((faction) => (
            <Card key={faction.id} className="bg-card border-border shadow-elevation hover:shadow-plasma transition-all duration-300 group">
              <div className={`h-32 ${faction.color} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute bottom-4 left-4 z-10">
                  <h3 className="text-xl font-bold text-white">{faction.name}</h3>
                  <p className="text-white/80 text-sm">{faction.description}</p>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary" className="text-xs">
                    {faction.unitCount} units available
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <Link to={`/army/${faction.id}`}>
                    <Button className="w-full" variant="default">
                      <Shield className="h-4 w-4 mr-2" />
                      View Army Info
                    </Button>
                  </Link>
                  
                  <Link to={`/army-builder/${faction.id}`}>
                    <Button className="w-full" variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      Build Army List
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Coming Soon placeholder for remaining factions */}
        {factions.length < 25 && (
          <div className="mt-12 text-center">
            <Card className="bg-card/50 border-border border-dashed">
              <CardContent className="p-12">
                <h3 className="text-2xl font-bold text-muted-foreground mb-2">More Factions Coming Soon</h3>
                <p className="text-muted-foreground">
                  {25 - factions.length} additional factions will be added to complete the {systemName} roster
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default FactionSelection;