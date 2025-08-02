import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, Sword } from 'lucide-react';

// Game systems data
const gameSystems = [
  {
    id: "warhammer-40k",
    name: "Warhammer 40,000",
    description: "In the grim darkness of the far future, there is only war",
    version: "10th Edition",
    factions: [
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
      }
    ]
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-void">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-6xl font-bold text-foreground mb-4 animate-glow">
            FORGE THE SPEARHEAD
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Build armies for the grim darkness of the far future
          </p>
          <Badge variant="secondary" className="bg-gradient-plasma animate-plasma-pulse">
            Army Builder v2.0
          </Badge>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Game Systems */}
        <div className="space-y-12">
          {gameSystems.map((system) => (
            <div key={system.id}>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-primary mb-2">{system.name}</h2>
                <p className="text-muted-foreground">{system.description}</p>
                <Badge variant="outline" className="mt-2">{system.version}</Badge>
              </div>

              {/* Factions Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {system.factions.map((faction) => (
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
                            Quick Builder
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card/50 border-border text-center">
            <CardContent className="p-6">
              <Sword className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="text-2xl font-bold text-primary">2</h3>
              <p className="text-muted-foreground">Factions Available</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 border-border text-center">
            <CardContent className="p-6">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="text-2xl font-bold text-primary">83</h3>
              <p className="text-muted-foreground">Total Units</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 border-border text-center">
            <CardContent className="p-6">
              <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="text-2xl font-bold text-primary">1</h3>
              <p className="text-muted-foreground">Game Systems</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
