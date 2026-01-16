import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../hooks/useAdminStore';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    CheckCircle,
    AlertCircle,
    Eye,
    Clock,
    MapPin,
    DollarSign,
    Search,
    Users as UsersIcon,
    Bed,
    Bath,
    Home as HomeIcon,
    Calendar as CalendarIcon,
    X,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { AdminPropertyData } from '../types/admin.types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PropertyIcons } from '@/constants/PropertyIcons';
import { resolveImageUrl } from '@/features/properties/types/properties.types';

const AdminProperties: React.FC = () => {
    const {
        pendingProperties,
        loading,
        fetchPendingProperties,
        validateProperty,
        rejectProperty,
        pendingPropertiesPagination
    } = useAdminStore();
    const navigate = useNavigate();

    const [rejectionReason, setRejectionReason] = useState('');
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPendingProperties(0, 50);
    }, [fetchPendingProperties]);

    const handleConfirmApprove = async () => {
        if (selectedPropertyId) {
            await validateProperty(selectedPropertyId);
            setIsApproveDialogOpen(false);
            setSelectedPropertyId(null);
        }
    };

    const handleReject = async () => {
        if (selectedPropertyId && rejectionReason) {
            await rejectProperty(selectedPropertyId, { reason: rejectionReason });
            setIsRejectDialogOpen(false);
            setRejectionReason('');
            setSelectedPropertyId(null);
        }
    };

    const filteredProperties = pendingProperties.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold text-black tracking-tight">
                        Gestion des Propriétés
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Validez les annonces soumises par les hôtes.
                    </p>
                </div>

                {/* Main Card */}
                <Card className="bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white/20 shadow-xl overflow-hidden">

                    {/* Card Header */}
                    <CardHeader className="p-8 border-b border-gray-200/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-bold text-black">File d'attente de validation</CardTitle>
                                <CardDescription className="text-gray-600 mt-1">
                                    {pendingProperties.length} propriétés en attente.
                                </CardDescription>
                            </div>
                            <div className="relative w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    placeholder="Rechercher..."
                                    className="pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl text-black placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black transition-colors"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>

                    {/* Card Content */}
                    <CardContent className="p-8">
                        {loading ? (
                            <div className="flex h-[400px] items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                            </div>
                        ) : filteredProperties.length === 0 ? (
                            <div className="flex h-[300px] flex-col items-center justify-center gap-4">
                                <CheckCircle className="h-16 w-16 text-gray-300" />
                                <p className="text-gray-600 font-medium">Aucune propriété en attente.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b border-gray-200 hover:bg-transparent">
                                            <TableHead className="text-left py-4 px-2 text-sm font-bold text-black uppercase tracking-wide">Propriété</TableHead>
                                            <TableHead className="text-left py-4 px-2 text-sm font-bold text-black uppercase tracking-wide">Hôte</TableHead>
                                            <TableHead className="text-left py-4 px-2 text-sm font-bold text-black uppercase tracking-wide">Prix/Nuit</TableHead>
                                            <TableHead className="text-left py-4 px-2 text-sm font-bold text-black uppercase tracking-wide">Soumis le</TableHead>
                                            <TableHead className="text-right py-4 px-2 text-sm font-bold text-black uppercase tracking-wide">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredProperties.map((property: AdminPropertyData) => (
                                            <TableRow key={property.propertyId} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                                <TableCell className="py-4 px-2">
                                                    <div className="flex items-center gap-4">
                                                        <Avatar className="h-14 w-14 rounded-2xl border-2 border-gray-200">
                                                            <AvatarImage src={property.imageFolderPath?.[0]} className="object-cover" />
                                                            <AvatarFallback className="rounded-2xl bg-gray-100 text-gray-600">Img</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-black">{property.title}</span>
                                                            <div className="flex items-center text-sm text-gray-500 gap-2 mt-1">
                                                                <MapPin className="h-3 w-3" />
                                                                <span>{property.city}</span>
                                                                <Badge variant="outline" className="bg-gray-100 text-gray-700 text-xs font-medium rounded-full border-0 px-2 py-0.5">
                                                                    {property.type}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4 px-2">
                                                    <span className="text-sm text-gray-600">
                                                        ID: {property.ownerId.substring(0, 8)}...
                                                    </span>
                                                </TableCell>
                                                <TableCell className="py-4 px-2">
                                                    <div className="font-semibold text-black flex items-center">
                                                        <DollarSign className="h-4 w-4 text-gray-400" />
                                                        {property.pricePerNight}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4 px-2">
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                                        {property.createdAt ? format(new Date(property.createdAt), 'dd MMM yyyy') : 'N/A'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4 px-2">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-9 w-9 p-0 rounded-xl border-2 border-gray-200 text-gray-700 hover:bg-gray-100"
                                                            title="Approuver"
                                                            onClick={() => {
                                                                setSelectedPropertyId(property.propertyId);
                                                                setIsApproveDialogOpen(true);
                                                            }}
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-9 w-9 p-0 rounded-xl border-2 border-gray-200 text-gray-700 hover:bg-gray-100"
                                                            title="Rejeter"
                                                            onClick={() => {
                                                                setSelectedPropertyId(property.propertyId);
                                                                setIsRejectDialogOpen(true);
                                                            }}
                                                        >
                                                            <AlertCircle className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            className="h-9 w-9 p-0 rounded-xl text-gray-600 hover:bg-gray-100"
                                                            onClick={() => {
                                                                navigate(`/admin/properties/${property.propertyId}/view`);
                                                            }}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
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

                {/* Reject Dialog */}
                <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                    <DialogContent className="bg-white rounded-[2rem] shadow-2xl border-0 max-w-md">
                        <DialogHeader className="p-8 pb-4">
                            <DialogTitle className="text-2xl font-bold text-black">Refuser la propriété</DialogTitle>
                            <DialogDescription className="text-gray-600 mt-2">
                                Veuillez indiquer la raison du refus pour notifier l'hôte.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="px-8 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="reason" className="text-sm font-bold text-black">Motif de refus</Label>
                                <Textarea
                                    id="reason"
                                    placeholder="Ex: Photos floues, description incomplète..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl text-black placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black transition-colors resize-none"
                                    rows={4}
                                />
                            </div>
                        </div>
                        <DialogFooter className="p-6 bg-gray-50 border-t border-gray-100">
                            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)} className="rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-100">
                                Annuler
                            </Button>
                            <Button onClick={handleReject} disabled={!rejectionReason.trim()} className="rounded-xl bg-black text-white hover:bg-gray-800 disabled:opacity-50">
                                Refuser la propriété
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Approve Confirmation */}
                <AlertDialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
                    <AlertDialogContent className="bg-white rounded-[2rem] shadow-2xl border-0">
                        <AlertDialogHeader className="p-8 pb-4">
                            <AlertDialogTitle className="text-2xl font-bold text-black">Approuver la propriété</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-600 mt-2">
                                Êtes-vous sûr de vouloir approuver cette propriété ? Elle sera immédiatement visible par tous les utilisateurs.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="p-6 bg-gray-50 border-t border-gray-100">
                            <AlertDialogCancel onClick={() => setSelectedPropertyId(null)} className="rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-100">
                                Annuler
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={handleConfirmApprove} className="rounded-xl bg-black text-white hover:bg-gray-800">
                                Approuver
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

            </div>
        </div>
    );
};

export default AdminProperties;