import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash2, Eye, MoreHorizontal, Home, Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { useHostStore } from '../hooks/useHostStore';
import { PropertyStatus } from '@/features/properties/types/properties.types';
import { useToast } from "@/components/ui/use-toast";

const MyProperties: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const {
        myProperties,
        loading: isLoading,
        fetchMyProperties,
        deleteProperty,
        submitProperty,
        hideProperty,
        showProperty,
        getPropertyStatusInfo
    } = useHostStore();

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<PropertyStatus | "ALL">("ALL");

    useEffect(() => {
        fetchMyProperties();
    }, [fetchMyProperties]);

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this property?")) {
            try {
                await deleteProperty(id);
                toast({
                    title: "Success",
                    description: "Property deleted successfully",
                });
            } catch (error: any) {
                toast({
                    title: "Error",
                    description: error.message || "Failed to delete property",
                    variant: "destructive"
                });
            }
        }
    };

    const handleStatusAction = async (id: string, action: 'activate' | 'hide' | 'submit') => {
        try {
            if (action === 'activate') await showProperty(id);
            else if (action === 'hide') await hideProperty(id);
            else if (action === 'submit') await submitProperty(id);

            toast({
                title: "Success",
                description: `Property status updated successfully`,
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to update property status",
                variant: "destructive"
            });
        }
    };

    const filteredProperties = myProperties.filter(property => {
        const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            property.city.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || property.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 p-6 md:p-10">
            <div className="max-w-[1400px] mx-auto space-y-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-5xl font-black text-black tracking-tighter">
                            My Properties
                        </h1>
                        <p className="text-gray-500 font-medium text-lg max-w-xl">
                            Manage and optimize your global real estate portfolio from one central command.
                        </p>
                    </div>
                    <Button
                        onClick={() => navigate('/host/properties/create')}
                        className="rounded-full px-10 h-14 bg-black hover:bg-gray-800 text-white font-bold shadow-2xl transition-all gap-3 text-base"
                    >
                        <Plus className="w-6 h-6" />
                        List Your Space
                    </Button>
                </div>

                {/* Main Content Card */}
                <Card className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/40 shadow-2xl overflow-hidden border-t-white/60">

                    {/* Filters & Search Bar */}
                    <div className="p-8 md:p-10 border-b border-gray-100">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                            <div className="flex-1 max-w-2xl">
                                <Tabs defaultValue="ALL" className="w-full" onValueChange={(val) => setStatusFilter(val as PropertyStatus | "ALL")}>
                                    <TabsList className="h-14 bg-gray-100/80 p-1.5 rounded-2xl gap-1 w-fit">
                                        <TabsTrigger
                                            value="ALL"
                                            className="rounded-xl px-8 h-full font-bold data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-xl transition-all"
                                        >
                                            All
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="ACTIVE"
                                            className="rounded-xl px-8 h-full font-bold data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-xl transition-all"
                                        >
                                            Active
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="PENDING"
                                            className="rounded-xl px-8 h-full font-bold data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-xl transition-all"
                                        >
                                            Pending
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="DRAFT"
                                            className="rounded-xl px-8 h-full font-bold data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-xl transition-all"
                                        >
                                            Drafts
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>

                            <div className="relative w-full lg:w-96 group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
                                <Input
                                    placeholder="Search by title or city..."
                                    className="h-14 pl-14 pr-6 bg-gray-50/50 border-2 border-gray-100 rounded-2xl text-black font-semibold placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <CardContent className="p-0">
                        {isLoading && filteredProperties.length === 0 ? (
                            <div className="flex h-[500px] flex-col items-center justify-center gap-4 bg-gray-50/30">
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-full bg-black/5 animate-ping"></div>
                                    <Loader2 className="h-12 w-12 text-black animate-spin relative" />
                                </div>
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Accessing Portfolio...</p>
                            </div>
                        ) : filteredProperties.length === 0 ? (
                            <div className="flex h-[400px] flex-col items-center justify-center gap-6 bg-gray-50/30">
                                <div className="h-24 w-24 rounded-[2rem] bg-gray-100 flex items-center justify-center shadow-inner">
                                    <Home className="h-10 w-10 text-gray-300" />
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-black font-black text-xl">No properties found</p>
                                    <p className="text-gray-500 font-medium">Try adjusting your filters or search query.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b border-gray-100 hover:bg-transparent px-10">
                                            <TableHead className="py-6 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Property</TableHead>
                                            <TableHead className="py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Location</TableHead>
                                            <TableHead className="py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Rate</TableHead>
                                            <TableHead className="py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Status</TableHead>
                                            <TableHead className="py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Updated</TableHead>
                                            <TableHead className="py-6 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredProperties.map((property) => (
                                            <TableRow key={property.propertyId} className="border-b border-gray-50 group hover:bg-gray-50/80 transition-all duration-300">
                                                <TableCell className="py-6 px-10">
                                                    <div className="flex items-center gap-6">
                                                        <div className="h-16 w-20 rounded-2xl overflow-hidden bg-gray-100 shadow-md ring-2 ring-transparent group-hover:ring-black/5 transition-all">
                                                            {property.imageFolderPath?.[0] ? (
                                                                <img
                                                                    src={property.imageFolderPath?.[0]}
                                                                    alt={property.title}
                                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                                />
                                                            ) : (
                                                                <div className="flex items-center justify-center h-full text-gray-300">
                                                                    <Home className="h-8 w-8" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-base font-bold text-black group-hover:translate-x-1 transition-transform">{property.title}</p>
                                                            <p className="text-xs text-gray-400 font-medium tracking-wide uppercase mt-0.5">{property.type}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-6 px-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-black">{property.city}</span>
                                                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{property.country}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-6 px-4">
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-lg font-black text-black">€{property.pricePerNight}</span>
                                                        <span className="text-xs text-gray-400 font-bold uppercase">/night</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-6 px-4">
                                                    <Badge className={`${getPropertyStatusInfo(property.status).bgColor} ${getPropertyStatusInfo(property.status).color} border-0 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-sm`}>
                                                        {getPropertyStatusInfo(property.status).label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="py-6 px-4 text-right">
                                                    <p className="text-sm font-bold text-black">{new Date(property.lastUpdateAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                </TableCell>
                                                <TableCell className="py-6 px-10 text-right">
                                                    <div className="flex justify-end gap-3 opacity-100 transition-all group-hover:translate-x-0">

                                                        <Button
                                                            variant="ghost"
                                                            className="h-10 w-10 p-0 rounded-full text-gray-400 hover:text-black hover:bg-white hover:shadow-xl border border-transparent hover:border-gray-100 transition-all"
                                                            onClick={() => navigate(`/host/properties/${property.propertyId}`)}
                                                            title="Edit Property"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            className="h-10 w-10 p-0 rounded-full text-gray-400 hover:text-black hover:bg-white hover:shadow-xl border border-transparent hover:border-gray-100 transition-all"
                                                            onClick={() => navigate(`/host/properties/${property.propertyId}/preview`)}
                                                            title="Preview"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    className="h-10 w-10 p-0 rounded-full text-gray-400 hover:text-black hover:bg-white hover:shadow-xl border border-transparent hover:border-gray-100 transition-all"
                                                                >
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="rounded-2xl p-2 border-gray-100 shadow-2xl min-w-[200px]">
                                                                <DropdownMenuLabel className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Management Actions</DropdownMenuLabel>
                                                                <DropdownMenuSeparator className="bg-gray-50" />
                                                                {property.status === 'DRAFT' && (
                                                                    <DropdownMenuItem onClick={() => handleStatusAction(property.propertyId, 'submit')} className="rounded-xl px-4 py-3 font-bold text-sm focus:bg-black focus:text-white transition-colors cursor-pointer">
                                                                        Submit for Review
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {property.status === 'ACTIVE' && (
                                                                    <DropdownMenuItem onClick={() => handleStatusAction(property.propertyId, 'hide')} className="rounded-xl px-4 py-3 font-bold text-sm focus:bg-black focus:text-white transition-colors cursor-pointer">
                                                                        Hide Listing
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {property.status === 'HIDDEN' && (
                                                                    <DropdownMenuItem onClick={() => handleStatusAction(property.propertyId, 'activate')} className="rounded-xl px-4 py-3 font-bold text-sm focus:bg-black focus:text-white transition-colors cursor-pointer">
                                                                        Activate Listing
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuSeparator className="bg-gray-50" />
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDelete(property.propertyId)}
                                                                    className="text-red-600 focus:text-white focus:bg-red-600 rounded-xl px-4 py-3 font-bold text-sm transition-colors cursor-pointer"
                                                                >
                                                                    <Trash2 className="mr-3 h-4 w-4" /> Delete Property
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default MyProperties;
