import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyForm from '../components/PropertyForm';
import { CreatePropertyInput, PropertyFormData } from '../types/host.types';
import { useHostStore } from '../hooks/useHostStore';
import { useToast } from "@/components/ui/use-toast";

const CreateProperty: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { createProperty, uploadPropertyImages } = useHostStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreate = async (data: PropertyFormData) => {
        setIsSubmitting(true);
        try {

            const { rawImages, ...propertyData } = data;

            const input: CreatePropertyInput = {
                ...propertyData,
                characteristics: propertyData.characteristics || []
            };

            const newProperty = await createProperty(input);

            if (!newProperty || !newProperty.propertyId) {
                throw new Error("Failed to get new property ID");
            }

            // 2. Upload Images if any
            if (rawImages && rawImages.length > 0) {
                try {
                    await uploadPropertyImages(newProperty.propertyId, rawImages);
                    toast({
                        title: "Images Uploaded",
                        description: `${rawImages.length} images uploaded successfully.`,
                    });
                } catch (imgError) {
                    console.error("Failed to upload images:", imgError);
                    toast({
                        title: "Warning",
                        description: "Property created but failed to upload images.",
                        variant: "destructive"
                    });
                }
            }

            toast({
                title: "Success",
                description: "Property created successfully!",
            });
            navigate('/host/properties');
        } catch (error: any) {
            console.error("Failed to create property:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to create property",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 p-8">
            <div className="max-w-[1400px] mx-auto space-y-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold text-black mb-2">List your property</h1>
                    <p className="text-gray-500 text-lg">
                        Complete the form below to showcase your space to guests from around the world.
                    </p>
                </div>

                <PropertyForm
                    onSubmit={handleCreate}
                    isSubmitting={isSubmitting}
                />
            </div>
        </div>
    );
};

export default CreateProperty;
