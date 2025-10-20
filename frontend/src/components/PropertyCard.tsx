import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, BedDouble, Bath } from 'lucide-react';
import { Property } from '@/lib/fakeData';

interface PropertyCardProps {
  property: Property;
  onViewDetails?: (property: Property) => void;
}

const PropertyCard = ({ property, onViewDetails }: PropertyCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'rented':
        return 'bg-yellow-500';
      case 'owned':
        return 'bg-blue-500';
      default:
        return 'bg-muted';
    }
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="relative overflow-hidden h-48">
        <img
          src={property.imageUrl}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <Badge className={`absolute top-3 right-3 ${getStatusColor(property.status)} border-0`}>
          {property.status}
        </Badge>
      </div>
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg mb-1">{property.title}</h3>
          <div className="flex items-center text-muted-foreground text-sm">
            <MapPin className="h-4 w-4 mr-1" />
            {property.location}
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <BedDouble className="h-4 w-4 mr-1" />
            {property.bedrooms} beds
          </div>
          <div className="flex items-center">
            <Bath className="h-4 w-4 mr-1" />
            {property.bathrooms} baths
          </div>
        </div>

        <div className="text-xl font-bold gradient-primary bg-clip-text text-transparent">
          {property.price}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full gradient-accent"
          onClick={() => onViewDetails?.(property)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PropertyCard;
