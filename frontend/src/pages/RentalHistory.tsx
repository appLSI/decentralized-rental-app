import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fakeRentalHistory } from "@/lib/fakeData";
import { Calendar, User, DollarSign } from "lucide-react";

const RentalHistory = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="p-20 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Rental History</h1>
          <p className="text-muted-foreground">
            Track all your rental transactions and agreements.
          </p>
        </div>

        {/* History Timeline */}
        <div className="space-y-4">
          {fakeRentalHistory.map((rental) => (
            <Card key={rental.id} className="transition-all hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold">
                        {rental.propertyTitle}
                      </h3>
                      <Badge
                        variant={
                          rental.status === "active" ? "default" : "secondary"
                        }
                      >
                        {rental.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <User className="h-4 w-4 mr-2" />
                        <span>Tenant: {rental.tenant}</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                          {rental.startDate} → {rental.endDate}
                        </span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <span>Total: {rental.amount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default RentalHistory;
