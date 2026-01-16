import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Form,
} from "@/components/ui/form";
import { Property } from '@/features/properties/types/properties.types';
import { UpdatePropertyInput, PropertyFormData } from '../types/host.types';
import { usePropertiesStore } from '@/features/properties/hooks/usePropertiesStore';
import { Loader2, ChevronRight, ChevronLeft, Home, MapPinned, Settings2, TrendingUp, ImageIcon, Check } from 'lucide-react';

// Sub-components
import BasicsStep from './property-form/BasicsStep';
import LocationStep from './property-form/LocationStep';
import DetailsAmenitiesStep from './property-form/DetailsAmenitiesStep';
import PricePredictionStep from './property-form/PricePredictionStep';
import PhotosStep from './property-form/PhotosStep';

interface PropertyFormProps {
    initialData?: Property;
    onSubmit: (data: PropertyFormData | UpdatePropertyInput) => Promise<void>;
    isSubmitting?: boolean;
    isEdit?: boolean;
}

const PropertyForm: React.FC<PropertyFormProps> = ({
    initialData,
    onSubmit,
    isSubmitting = false,
    isEdit = false
}) => {
    const { characteristics, fetchCharacteristics } = usePropertiesStore();
    const [currentStep, setCurrentStep] = useState(0);
    const [existingImages, setExistingImages] = useState<string[]>(initialData?.imageFolderPath || []);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const defaultLocation = { latitude: 33.5731, longitude: -7.5898 };

    const methods = useForm<PropertyFormData>({
        defaultValues: initialData ? {
            title: initialData.title,
            description: initialData.description,
            type: initialData.type,
            pricePerNight: initialData.pricePerNight,
            addressName: initialData.addressName,
            city: initialData.city,
            country: initialData.country,
            state: initialData.state || "",
            codePostale: initialData.codePostale || "",
            latitude: initialData.latitude,
            longitude: initialData.longitude,
            nbOfGuests: initialData.nbOfGuests,
            nbOfBedrooms: initialData.nbOfBedrooms,
            nbOfBeds: initialData.nbOfBeds,
            nbOfBathrooms: initialData.nbOfBathrooms,
            characteristics: initialData.characteristics.map(c => ({ id: c.id })),
            rawImages: []
        } : {
            title: "",
            description: "",
            type: "APARTMENT",
            pricePerNight: 0,
            addressName: "",
            city: "",
            country: "",
            state: "",
            codePostale: "",
            latitude: defaultLocation.latitude,
            longitude: defaultLocation.longitude,
            nbOfGuests: 1,
            nbOfBedrooms: 1,
            nbOfBeds: 1,
            nbOfBathrooms: 1,
            characteristics: [],
            rawImages: []
        }
    });

    useEffect(() => {
        if (characteristics.length === 0) {
            fetchCharacteristics();
        }
    }, [characteristics.length, fetchCharacteristics]);

    useEffect(() => {
        return () => {
            previewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previewUrls]);

    const steps = [
        {
            id: 'basics',
            title: 'Basics',
            icon: Home,
            description: 'Property information'
        },
        {
            id: 'location',
            title: 'Location',
            icon: MapPinned,
            description: 'Where is it?'
        },
        {
            id: 'details',
            title: 'Details & Amenities',
            icon: Settings2,
            description: 'Setup & features'
        },
        {
            id: 'pricing',
            title: 'Smart Pricing',
            icon: TrendingUp,
            description: 'AI-powered pricing'
        },
        {
            id: 'photos',
            title: 'Photos',
            icon: ImageIcon,
            description: 'Showcase your space'
        }
    ];

    const handleSubmit = async (data: PropertyFormData) => {
        const submitData = {
            ...data,
            rawImages: selectedFiles
        };
        await onSubmit(submitData);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            setSelectedFiles(prev => [...prev, ...newFiles]);
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newPreviews]);
        }
    };

    const handleRemoveSelectedFile = (index: number) => {
        const newFiles = [...selectedFiles];
        newFiles.splice(index, 1);
        setSelectedFiles(newFiles);
        const urlToRemove = previewUrls[index];
        URL.revokeObjectURL(urlToRemove);
        const newPreviews = [...previewUrls];
        newPreviews.splice(index, 1);
        setPreviewUrls(newPreviews);
    };

    const handleRemoveExistingImage = (index: number) => {
        const newImages = [...existingImages];
        newImages.splice(index, 1);
        setExistingImages(newImages);
    };

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const isStepComplete = (stepIndex: number) => {
        const step = steps[stepIndex];
        const values = methods.getValues();

        switch (step.id) {
            case 'basics':
                return !!(values.title && values.description && values.type);
            case 'location':
                return !!(values.addressName && values.city && values.country);
            case 'details':
                return !!(values.nbOfGuests && values.nbOfBedrooms && values.nbOfBeds && values.nbOfBathrooms);
            case 'pricing':
                return !!(values.pricePerNight && values.pricePerNight > 0);
            case 'photos':
                return (selectedFiles.length > 0 || existingImages.length > 0);
            default:
                return false;
        }
    };

    return (
        <div className="min-h-screen bg-transparent">
            {/* Progress Header */}
            <div className="bg-white/40 backdrop-blur-xl border-b border-white/40">
                <div className="max-w-[1400px] mx-auto px-6 py-6">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-black">
                                {isEdit ? 'Edit Property' : 'Create New Listing'}
                            </h2>
                            <p className="text-gray-500 text-sm font-medium">Step {currentStep + 1} of {steps.length}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-black font-bold uppercase tracking-widest text-xs">{steps[currentStep].title}</p>
                            <p className="text-gray-500 text-xs mt-1">{steps[currentStep].description}</p>
                        </div>
                    </div>

                    {/* Step Indicators */}
                    <div className="flex items-center gap-1">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = index === currentStep;
                            const isComplete = isStepComplete(index);
                            const isPast = index < currentStep;

                            return (
                                <React.Fragment key={step.id}>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(index)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${isActive
                                            ? 'bg-black text-white shadow-lg'
                                            : isPast
                                                ? 'text-black hover:bg-black/5'
                                                : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        <div className={`flex items-center justify-center w-6 h-6 rounded-full ${isActive
                                            ? 'bg-white text-black'
                                            : isPast && isComplete
                                                ? 'bg-black text-white'
                                                : 'bg-gray-100 text-gray-400'
                                            }`}>
                                            {isPast && isComplete ? (
                                                <Check className="w-3 h-3" />
                                            ) : (
                                                <Icon className="w-3 h-3" />
                                            )}
                                        </div>
                                        <span className={`text-xs font-bold uppercase tracking-wider hidden md:block`}>
                                            {step.title}
                                        </span>
                                    </button>
                                    {index < steps.length - 1 && (
                                        <div className="flex-1 h-[2px] bg-gray-200 mx-2 hidden md:block" />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <div className="max-w-4xl mx-auto px-6 py-12">
                <FormProvider {...methods}>
                    <Form {...methods}>
                        <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-12 pb-32">
                            <div className="rounded-[2rem] bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden p-8 md:p-12">
                                {currentStep === 0 && <BasicsStep />}
                                {currentStep === 1 && <LocationStep />}
                                {currentStep === 2 && <DetailsAmenitiesStep />}
                                {currentStep === 3 && <PricePredictionStep />}
                                {currentStep === 4 && (
                                    <PhotosStep
                                        existingImages={existingImages}
                                        onRemoveExistingImage={handleRemoveExistingImage}
                                        previewUrls={previewUrls}
                                        onRemoveSelectedFile={handleRemoveSelectedFile}
                                        onFileSelect={handleFileSelect}
                                    />
                                )}
                            </div>

                            {/* Navigation Buttons */}
                            <div className="fixed bottom-0 left-0 right-0 bg-white/40 backdrop-blur-xl border-t border-white/40 py-6 px-10 z-40">
                                <div className="max-w-[1400px] mx-auto flex justify-between items-center">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={prevStep}
                                        disabled={currentStep === 0}
                                        className="rounded-full px-8 h-12 text-gray-500 hover:text-black hover:bg-gray-100 font-bold transition-all"
                                    >
                                        <ChevronLeft className="w-5 h-5 mr-2" />
                                        Back
                                    </Button>

                                    <div className="flex gap-4">
                                        {currentStep < steps.length - 1 ? (
                                            <Button
                                                type="button"
                                                onClick={nextStep}
                                                disabled={!isStepComplete(currentStep)}
                                                className="rounded-full px-10 h-12 bg-black hover:bg-gray-800 text-white font-bold shadow-xl transition-all"
                                            >
                                                Next Step
                                                <ChevronRight className="w-5 h-5 ml-2" />
                                            </Button>
                                        ) : (
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting || !isStepComplete(currentStep)}
                                                className="rounded-full px-10 h-12 bg-black hover:bg-gray-800 text-white font-bold shadow-xl transition-all"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                        {isEdit ? 'Updating...' : 'Creating...'}
                                                    </>
                                                ) : (
                                                    isEdit ? 'Save Changes' : 'Create Listing'
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </form>
                    </Form>
                </FormProvider>
            </div>
        </div>
    );
};

export default PropertyForm;
