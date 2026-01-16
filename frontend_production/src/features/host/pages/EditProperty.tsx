import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PropertyForm from '../components/PropertyForm';
import { UpdatePropertyInput, PropertyFormData } from '../types/host.types';
import { useHostStore } from '../hooks/useHostStore';
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EditProperty: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Use host store for updates and fetching my properties (to ensure ownership)
    const {
        updateProperty,
        uploadPropertyImages,
        fetchProperty,
        currentProperty: property,
        loading: hostLoading,
        error: hostError,
        clearError
    } = useHostStore();

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (id) {
            fetchProperty(id).catch(err => {
                console.error("Failed to fetch property:", err);
            });
        }
        return () => clearError();
    }, [id, fetchProperty, clearError]);

    const handleUpdate = async (data: PropertyFormData | UpdatePropertyInput) => {
        if (!id) return;
        setIsSubmitting(true);
        try {
            // Properly handle data based on whether it's PropertyFormData or UpdatePropertyInput
            const rawImages = (data as PropertyFormData).rawImages;
            const { rawImages: _, ...updateData } = data as PropertyFormData;

            await updateProperty(id, updateData);

            if (rawImages && Array.isArray(rawImages) && rawImages.length > 0) {
                await uploadPropertyImages(id, rawImages);
                toast({
                    title: "Images Uploaded",
                    description: `${rawImages.length} new images uploaded.`,
                });
            }

            toast({
                title: "Success",
                description: "Property updated successfully!",
            });
            navigate('/host/properties');
        } catch (error: any) {
            console.error("Failed to update property:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to update property",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (hostLoading && !property) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
                <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-black/5 animate-ping"></div>
                    <Loader2 className="h-12 w-12 text-black animate-spin relative" />
                </div>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Retrieving Property Data...</p>
            </div>
        );
    }

    if (hostError || (!property && !hostLoading)) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-6 bg-gray-50">
                <div className="h-24 w-24 rounded-[2rem] bg-gray-100 flex items-center justify-center shadow-inner">
                    <Loader2 className="h-10 w-10 text-gray-300" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-black font-black text-xl">{hostError || "Property not found"}</h2>
                    <p className="text-gray-500 font-medium">You may not have permission to edit this property or it does not exist.</p>
                </div>
                <Button
                    onClick={() => navigate('/host/properties')}
                    className="rounded-full px-8 h-12 bg-black text-white hover:bg-gray-800 font-bold shadow-xl transition-all"
                >
                    Return to Portfolio
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 p-6 md:p-10">
            <div className="max-w-[1400px] mx-auto space-y-10">
                <div className="space-y-2">
                    <h1 className="text-5xl font-black text-black tracking-tighter">Edit your listing</h1>
                    <p className="text-gray-500 font-medium text-lg max-w-2xl">
                        Update details and photos of your property to keep your listing accurate and engaging.
                    </p>
                </div>

                <PropertyForm
                    initialData={property}
                    onSubmit={handleUpdate}
                    isSubmitting={isSubmitting}
                    isEdit
                />
            </div>
        </div>
    );
};

export default EditProperty;
