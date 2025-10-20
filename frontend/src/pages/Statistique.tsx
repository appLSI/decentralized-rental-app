import {
  Building2,
  Home,
  DollarSign,
  TrendingUp,
  Activity,
  Users,
  FileText,
  Clock,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import PropertyCard from "@/components/PropertyCard";
import { fakeProperties } from "@/lib/fakeData";
import { useAuthStore } from "@/stores/authStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Dashboard = () => {
  const { user } = useAuthStore();
  const myProperties = fakeProperties.filter((p) => p.ownerId === user?.id);
  const rentedProperties = fakeProperties.filter(
    (p) => p.status === "rented" && p.ownerId === user?.id
  );
  const recentProperties = fakeProperties.slice(0, 3);

  const revenueData = [
    { month: "Jan", revenue: 8.2, transactions: 12 },
    { month: "Feb", revenue: 9.5, transactions: 15 },
    { month: "Mar", revenue: 11.3, transactions: 18 },
    { month: "Apr", revenue: 10.8, transactions: 16 },
    { month: "May", revenue: 13.2, transactions: 21 },
    { month: "Jun", revenue: 12.5, transactions: 19 },
  ];

  const propertyTypeData = [
    { name: "Apartments", value: 45, color: "hsl(var(--primary))" },
    { name: "Houses", value: 30, color: "hsl(var(--secondary))" },
    { name: "Commercial", value: 15, color: "hsl(var(--accent))" },
    { name: "Land", value: 10, color: "hsl(var(--muted-foreground))" },
  ];

  const recentTransactions = [
    {
      id: 1,
      type: "Rent Payment",
      property: "Modern Loft Downtown",
      amount: "2.5 ETH",
      status: "completed",
      time: "2 hours ago",
    },
    {
      id: 2,
      type: "Security Deposit",
      property: "Seaside Villa",
      amount: "5.0 ETH",
      status: "pending",
      time: "5 hours ago",
    },
    {
      id: 3,
      type: "Rent Payment",
      property: "Urban Studio",
      amount: "1.8 ETH",
      status: "completed",
      time: "1 day ago",
    },
    {
      id: 4,
      type: "Lease Agreement",
      property: "Luxury Penthouse",
      amount: "8.0 ETH",
      status: "completed",
      time: "2 days ago",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="p-20 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome back,{" "}
              <span className="font-semibold text-white">
                {user?.name || user?.email?.split("@")[0] || "User"}
              </span>
            </h1>
            <p className="text-muted-foreground">
              Monitor your smart contract portfolio and rental analytics
            </p>
          </div>
          <div className="glass px-4 py-2 rounded-lg">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-medium">Network Active</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Portfolio Value"
            value="156.8 ETH"
            icon={DollarSign}
            gradient
          />
          <StatsCard
            title="Active Contracts"
            value={myProperties.length.toString()}
            icon={FileText}
          />
          <StatsCard
            title="Rented Properties"
            value={rentedProperties.length.toString()}
            icon={Building2}
          />
          <StatsCard title="Monthly Revenue" value="+24.5%" icon={TrendingUp} />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>
                Monthly rental income and transaction volume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Property Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Distribution</CardTitle>
              <CardDescription>Properties by type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={propertyTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {propertyTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {propertyTypeData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions and Properties */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Smart Contract Transactions</CardTitle>
              <CardDescription>
                Latest blockchain activities on your properties
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="gradient-primary h-10 w-10 rounded-lg flex items-center justify-center shadow-glow">
                        <DollarSign className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">{transaction.type}</div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.property}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{transaction.amount}</div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            transaction.status === "completed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {transaction.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {transaction.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Insights</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Occupancy Rate</span>
                  <span className="font-bold">94%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="gradient-primary h-2 rounded-full"
                    style={{ width: "94%" }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Contract Success Rate
                  </span>
                  <span className="font-bold">98.5%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="gradient-accent h-2 rounded-full"
                    style={{ width: "98.5%" }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-medium">Active Tenants</span>
                </div>
                <div className="text-3xl font-bold">47</div>
                <p className="text-sm text-muted-foreground mt-1">
                  +8 this month
                </p>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="font-medium">Avg. Lease Duration</span>
                </div>
                <div className="text-3xl font-bold">18 mo</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Above market average
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Properties */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Featured Properties</h2>
              <p className="text-muted-foreground">
                Top performing assets in your portfolio
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
