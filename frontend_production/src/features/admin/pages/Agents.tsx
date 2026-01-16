import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    UserPlus,
    Trash2,
    Mail,
    Phone,
    Search,
    ChevronLeft,
    ChevronRight,
    Shield,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useAdminStore } from '../hooks/useAdminStore';
import { AgentData, CreateAgentInput } from '../types/admin.types';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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

const Agents: React.FC = () => {
    const { user } = useAuthStore();
    const {
        agents,
        loading,
        error,
        fetchAgents,
        createAgent,
        deleteAgent
    } = useAdminStore();
    const navigate = useNavigate();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredAgents, setFilteredAgents] = useState<AgentData[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [agentsPerPage] = useState(10);
    const [agentToDelete, setAgentToDelete] = useState<{ id: string, name: string } | null>(null);

    const [newAgent, setNewAgent] = useState<CreateAgentInput>({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        phone: '',
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (user) fetchAgents();
    }, [user, fetchAgents]);

    useEffect(() => {
        const filtered = agents.filter(agent =>
            (agent?.firstname?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (agent?.lastname?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (agent?.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (agent?.phone?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredAgents(filtered);
        setCurrentPage(1);
    }, [searchTerm, agents]);

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        if (!newAgent.firstname.trim()) errors.firstname = 'Le prénom est requis';
        if (!newAgent.lastname.trim()) errors.lastname = 'Le nom est requis';
        if (!newAgent.email.trim()) {
            errors.email = 'L\'email est requis';
        } else if (!/\S+@\S+\.\S+/.test(newAgent.email)) {
            errors.email = 'L\'email est invalide';
        }
        if (!newAgent.password) {
            errors.password = 'Le mot de passe est requis';
        } else if (newAgent.password.length < 6) {
            errors.password = 'Minimum 6 caractères';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreateAgent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            await createAgent(newAgent);
            setShowCreateModal(false);
            setNewAgent({
                firstname: '',
                lastname: '',
                email: '',
                password: '',
                phone: '',
            });
            setFormErrors({});
        } catch (error) {
            console.error('Failed to create agent:', error);
        }
    };

    const confirmDelete = async () => {
        if (agentToDelete) {
            try {
                await deleteAgent(agentToDelete.id);
                setAgentToDelete(null);
            } catch (error) {
                console.error('Failed to delete agent:', error);
            }
        }
    };

    const indexOfLastAgent = currentPage * agentsPerPage;
    const indexOfFirstAgent = indexOfLastAgent - agentsPerPage;
    const currentAgents = filteredAgents.slice(indexOfFirstAgent, indexOfLastAgent);
    const totalPages = Math.ceil(filteredAgents.length / agentsPerPage);

    if (!user || user.roles[0] !== 'ADMIN') return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold text-black tracking-tight">
                            Gestion des Agents
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Gérez les comptes d'agents et leurs permissions.
                        </p>
                    </div>
                    <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2 rounded-full bg-black text-white hover:bg-gray-800 self-start">
                                <UserPlus className="h-4 w-4" />
                                Nouvel Agent
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] bg-white rounded-[2rem] border-0 shadow-2xl">
                            <form onSubmit={handleCreateAgent}>
                                <DialogHeader className="p-8 pb-4">
                                    <DialogTitle className="text-2xl font-bold text-black">Créer un nouvel agent</DialogTitle>
                                    <DialogDescription className="text-gray-600 mt-2">
                                        Remplissez les informations pour créer un nouveau compte agent.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="px-8 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstname" className="text-sm font-bold text-black">Prénom</Label>
                                            <Input
                                                id="firstname"
                                                placeholder="Jean"
                                                value={newAgent.firstname}
                                                onChange={(e) => setNewAgent({ ...newAgent, firstname: e.target.value })}
                                                className={`px-4 py-3 bg-gray-50 border-2 ${formErrors.firstname ? 'border-red-300' : 'border-gray-200'} rounded-2xl text-black placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black transition-colors`}
                                            />
                                            {formErrors.firstname && <p className="text-xs text-red-600">{formErrors.firstname}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastname" className="text-sm font-bold text-black">Nom</Label>
                                            <Input
                                                id="lastname"
                                                placeholder="Dupont"
                                                value={newAgent.lastname}
                                                onChange={(e) => setNewAgent({ ...newAgent, lastname: e.target.value })}
                                                className={`px-4 py-3 bg-gray-50 border-2 ${formErrors.lastname ? 'border-red-300' : 'border-gray-200'} rounded-2xl text-black placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black transition-colors`}
                                            />
                                            {formErrors.lastname && <p className="text-xs text-red-600">{formErrors.lastname}</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-bold text-black">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="jean.dupont@example.com"
                                            value={newAgent.email}
                                            onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                                            className={`px-4 py-3 bg-gray-50 border-2 ${formErrors.email ? 'border-red-300' : 'border-gray-200'} rounded-2xl text-black placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black transition-colors`}
                                        />
                                        {formErrors.email && <p className="text-xs text-red-600">{formErrors.email}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-sm font-bold text-black">Mot de passe</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={newAgent.password}
                                            onChange={(e) => setNewAgent({ ...newAgent, password: e.target.value })}
                                            className={`px-4 py-3 bg-gray-50 border-2 ${formErrors.password ? 'border-red-300' : 'border-gray-200'} rounded-2xl text-black placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black transition-colors`}
                                        />
                                        {formErrors.password && <p className="text-xs text-red-600">{formErrors.password}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-sm font-bold text-black">Téléphone (Optionnel)</Label>
                                        <Input
                                            id="phone"
                                            placeholder="06 12 34 56 78"
                                            value={newAgent.phone}
                                            onChange={(e) => setNewAgent({ ...newAgent, phone: e.target.value })}
                                            className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl text-black placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black transition-colors"
                                        />
                                    </div>
                                </div>
                                <DialogFooter className="p-6 mt-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                                    <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} className="rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-100">
                                        Annuler
                                    </Button>
                                    <Button type="submit" className="rounded-xl bg-black text-white hover:bg-gray-800">
                                        Créer le compte
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Search Card */}
                <Card className="bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white/20 shadow-xl">
                    <CardContent className="p-6">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                placeholder="Rechercher par nom, email..."
                                className="pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl text-black placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black transition-colors"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Agents Table */}
                <Card className="bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white/20 shadow-xl overflow-hidden">
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex h-[400px] items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                            </div>
                        ) : filteredAgents.length === 0 ? (
                            <div className="flex h-[400px] flex-col items-center justify-center gap-4">
                                <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center">
                                    <Users className="h-10 w-10 text-gray-400" />
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-semibold text-black">Aucun agent trouvé</p>
                                    <p className="text-gray-600">Essaie de modifier tes critères de recherche.</p>
                                </div>
                                <Button variant="outline" onClick={() => setSearchTerm('')} className="border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100">
                                    Effacer la recherche
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto p-8">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-gray-200 hover:bg-transparent">
                                                <TableHead className="text-left py-4 px-2 text-sm font-bold text-black uppercase tracking-wide">Agent</TableHead>
                                                <TableHead className="text-left py-4 px-2 text-sm font-bold text-black uppercase tracking-wide">Contact</TableHead>
                                                <TableHead className="text-left py-4 px-2 text-sm font-bold text-black uppercase tracking-wide">Rôles</TableHead>
                                                <TableHead className="text-left py-4 px-2 text-sm font-bold text-black uppercase tracking-wide">Statut</TableHead>
                                                <TableHead className="text-right py-4 px-2 text-sm font-bold text-black uppercase tracking-wide">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {currentAgents.map((agent) => (
                                                <TableRow key={agent.userId} className="border-b border-gray-100 hover:bg-gray-50/50">
                                                    <TableCell className="py-4 px-2">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-10 w-10 rounded-full bg-black text-white border-2 border-gray-200">
                                                                <AvatarImage src="" alt={`${agent.firstname} ${agent.lastname}`} />
                                                                <AvatarFallback className="bg-black text-white font-bold text-sm">
                                                                    {agent.firstname?.[0] || ''}{agent.lastname?.[0] || ''}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-black text-sm">{agent.firstname} {agent.lastname}</span>
                                                                <span className="text-xs text-gray-500">ID: {agent.userId?.slice(0, 12) || 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4 px-2">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center text-xs text-gray-600">
                                                                <Mail className="mr-2 h-3 w-3 text-gray-400" />
                                                                {agent.email}
                                                            </div>
                                                            {agent.phone && (
                                                                <div className="flex items-center text-xs text-gray-600">
                                                                    <Phone className="mr-2 h-3 w-3 text-gray-400" />
                                                                    {agent.phone}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4 px-2">
                                                        <div className="flex flex-wrap gap-1">
                                                            {agent.roles.map((role) => (
                                                                <Badge key={role} variant="secondary" className="bg-gray-100 text-gray-700 text-xs font-medium rounded-full border-0 hover:bg-gray-100">
                                                                    {role === 'AGENT' && <Shield className="mr-1 h-3 w-3" />}
                                                                    {role}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4 px-2">
                                                        <Badge variant="outline" className="bg-gray-100 text-gray-700 border-2 border-gray-200 rounded-full">
                                                            Actif
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="py-4 px-2 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-9 w-9 rounded-xl border-2 border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                                            onClick={() => setAgentToDelete({ id: agent.userId, name: `${agent.firstname} ${agent.lastname}` })}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between px-8 py-6 border-t border-gray-200/50">
                                        <p className="text-sm text-gray-600">
                                            Affichage de {indexOfFirstAgent + 1} à {Math.min(indexOfLastAgent, filteredAgents.length)} sur {filteredAgents.length} agents
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-9 w-9 rounded-xl border-2 border-gray-200 hover:bg-gray-100"
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <div className="text-sm font-semibold text-black">Page {currentPage} sur {totalPages}</div>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-9 w-9 rounded-xl border-2 border-gray-200 hover:bg-gray-100"
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                disabled={currentPage === totalPages}
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={!!agentToDelete} onOpenChange={(open) => !open && setAgentToDelete(null)}>
                    <AlertDialogContent className="bg-white rounded-[2rem] border-0 shadow-2xl">
                        <AlertDialogHeader className="p-8 pb-4">
                            <AlertDialogTitle className="text-2xl font-bold text-black">Êtes-vous sûr ?</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-600 mt-2">
                                Cette action supprimera le compte de <strong>{agentToDelete?.name}</strong>.
                                Cette action est irréversible.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="p-6 bg-gray-50 border-t border-gray-100">
                            <AlertDialogCancel className="rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-100">
                                Annuler
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDelete} className="rounded-xl bg-black text-white hover:bg-gray-800">
                                Supprimer
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
};

export default Agents;