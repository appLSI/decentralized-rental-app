import {
  Building2,
  DollarSign,
  TrendingUp,
  Activity,
  Users,
  FileText,
  Clock,
  Home,
  MapPin,
  Star,
} from "lucide-react";
import Navbar from "@/components/Navbar";
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Footer from "@/components/Footer";

const Dashboard = () => {
  const { user } = useAuthStore();

  // Mock data for demonstration
  const myProperties = [
    { id: 1, title: "Modern Downtown Apartment", status: "rented" },
    { id: 2, title: "Seaside Villa", status: "available" },
  ];

  const rentedProperties = myProperties.filter((p) => p.status === "rented");

  const revenueData = [
    { month: "Jan", revenue: 8.2, transactions: 12 },
    { month: "Feb", revenue: 9.5, transactions: 15 },
    { month: "Mar", revenue: 11.3, transactions: 18 },
    { month: "Apr", revenue: 10.8, transactions: 16 },
    { month: "May", revenue: 13.2, transactions: 21 },
    { month: "Jun", revenue: 12.5, transactions: 19 },
  ];

  const propertyTypeData = [
    { name: "Apartments", value: 45, color: "#edbf6d" },
    { name: "Houses", value: 30, color: "#1b2e3f" },
    { name: "Commercial", value: 15, color: "#2d4458" },
    { name: "Land", value: 10, color: "#94a3b8" },
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

  // Stats Card Component
  const StatsCard = ({ title, value, icon: Icon, gradient = false }) => (
    <Card
      className={`relative overflow-hidden ${
        gradient ? "border-[#edbf6d]" : ""
      }`}
    >
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#edbf6d] to-[#f4d19a] opacity-10" />
      )}
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p
              className={`text-2xl font-bold mt-2 ${
                gradient ? "text-[#1b2e3f]" : "text-gray-900"
              }`}
            >
              {value}
            </p>
          </div>
          <div
            className={`p-3 rounded-lg ${
              gradient ? "bg-[#edbf6d]" : "bg-[#1b2e3f]"
            }`}
          >
            <Icon
              className={`h-6 w-6 ${
                gradient ? "text-[#1b2e3f]" : "text-[#edbf6d]"
              }`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="p-20 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back,{" "}
              <span className="text-[#1b2e3f]">
                {user?.name || user?.email?.split("@")[0] || "User"}
              </span>
            </h1>
            <p className="text-gray-600">
              Monitor your smart contract portfolio and rental analytics
            </p>
          </div>
          <div className="bg-[#f8fafc] px-4 py-2 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#edbf6d] animate-pulse" />
              <span className="text-sm font-medium text-gray-700">
                Network Active
              </span>
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
          <Card className="lg:col-span-2 border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-gray-900">Revenue Analytics</CardTitle>
              <CardDescription className="text-gray-600">
                Monthly rental income and transaction volume
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
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
                      <stop offset="5%" stopColor="#edbf6d" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#edbf6d" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#edbf6d"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Property Distribution */}
          <Card className="border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-gray-900">
                Portfolio Distribution
              </CardTitle>
              <CardDescription className="text-gray-600">
                Properties by type
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={propertyTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {propertyTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 mt-6">
                {propertyTypeData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-700">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions and Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <Card className="lg:col-span-2 border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-gray-900">
                Recent Smart Contract Transactions
              </CardTitle>
              <CardDescription className="text-gray-600">
                Latest blockchain activities on your properties
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-[#edbf6d] h-10 w-10 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-[#1b2e3f]" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {transaction.type}
                        </div>
                        <div className="text-sm text-gray-600">
                          {transaction.property}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">
                        {transaction.amount}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          className={
                            transaction.status === "completed"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-yellow-100 text-yellow-800 border-yellow-200"
                          }
                        >
                          {transaction.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
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
          <Card className="border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-gray-900">Quick Insights</CardTitle>
              <CardDescription className="text-gray-600">
                Key performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Occupancy Rate</span>
                  <span className="font-bold text-gray-900">94%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#edbf6d] h-2 rounded-full"
                    style={{ width: "94%" }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Contract Success Rate</span>
                  <span className="font-bold text-gray-900">98.5%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#1b2e3f] h-2 rounded-full"
                    style={{ width: "98.5%" }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="h-5 w-5 text-[#edbf6d]" />
                  <span className="font-medium text-gray-900">
                    Active Tenants
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900">47</div>
                <p className="text-sm text-gray-600 mt-1">+8 this month</p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="h-5 w-5 text-[#edbf6d]" />
                  <span className="font-medium text-gray-900">
                    Avg. Lease Duration
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900">18 mo</div>
                <p className="text-sm text-gray-600 mt-1">
                  Above market average
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
