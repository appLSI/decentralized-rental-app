import React, { useState, useEffect } from 'react';
import { useFormContext } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PropertyFormData, PricePredictionRequest } from '../../types/host.types';
import { useToast } from "@/components/ui/use-toast";
import { Loader2, TrendingUp, DollarSign } from "lucide-react";

const PricePredictionStep: React.FC = () => {
    const { control, watch, setValue } = useFormContext<PropertyFormData>();
    const { toast } = useToast();
    const [isPredicting, setIsPredicting] = useState(false);
    const [prediction, setPrediction] = useState<{ suggested_price: number; yield_optimized_15: number } | null>(null);
    const [useSuggestedPrice, setUseSuggestedPrice] = useState(true);

    const watchedValues = watch(['nbOfGuests', 'nbOfBedrooms', 'nbOfBeds', 'nbOfBathrooms', 'type', 'country', 'city']);
    const [nbOfGuests, nbOfBedrooms, nbOfBeds, nbOfBathrooms, type, country, city] = watchedValues;

    const predictPrice = async () => {
        if (!nbOfGuests || !nbOfBedrooms || !nbOfBeds || !nbOfBathrooms) {
            toast({
                title: "Missing Information",
                description: "Please complete all capacity details first.",
                variant: "destructive"
            });
            return;
        }

        setIsPredicting(true);
        try {
            const predictionRequest: PricePredictionRequest = {
                nb_of_guests: nbOfGuests,
                nb_of_bedrooms: nbOfBedrooms,
                nb_of_beds: nbOfBeds,
                nb_of_bathrooms: nbOfBathrooms,
                country: country || 'France',
                city: city || 'Paris',
                type: type?.toLowerCase() || 'apartment'
            };

            const response = await fetch('http://localhost:8000/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(predictionRequest)
            });

            if (response.ok) {
                const data = await response.json();
                setPrediction(data);
                setValue('pricePerNight', data.suggested_price);
                toast({
                    title: "Price Predicted",
                    description: `AI suggests €${data.suggested_price}/night`,
                });
            } else {
                throw new Error('Prediction failed');
            }
        } catch (error) {
            console.error("Price prediction error:", error);
            toast({
                title: "Prediction Failed",
                description: "Unable to get price suggestion. Please set price manually.",
                variant: "destructive"
            });
        } finally {
            setIsPredicting(false);
        }
    };

    useEffect(() => {
        if (nbOfGuests && nbOfBedrooms && nbOfBeds && nbOfBathrooms && type) {
            predictPrice();
        }
    }, [nbOfGuests, nbOfBedrooms, nbOfBeds, nbOfBathrooms, type]);

    return (
        <div className="space-y-10">
            <div className="space-y-8">
                <div className="flex items-center space-x-4 mb-2">
                    <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-xl">
                        <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-black uppercase tracking-tight">Smart Pricing</h3>
                        <p className="text-sm text-gray-500 font-medium tracking-wide">AI-powered price suggestions based on your property details</p>
                    </div>
                </div>

                {prediction && (
                    <div className="rounded-[2.5rem] bg-gradient-to-br from-gray-900 via-black to-gray-900 border-none shadow-2xl overflow-hidden p-8 text-white relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <DollarSign className="w-32 h-32 text-white" />
                        </div>

                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-2 text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                                <span className="w-8 h-[2px] bg-white/20"></span>
                                AI Price Suggestion
                            </div>

                            <div className="grid md:grid-cols-2 gap-10 items-end">
                                <div className="space-y-2">
                                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Suggested Base Price</span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-black tracking-tighter">€{prediction.suggested_price}</span>
                                        <span className="text-gray-400 font-medium">/night</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider">Yield Optimized (+15%)</span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-black tracking-tighter text-cyan-400">€{prediction.yield_optimized_15}</span>
                                        <span className="text-gray-500 font-medium">/night</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 pt-4">
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setUseSuggestedPrice(true);
                                        setValue('pricePerNight', prediction.suggested_price);
                                    }}
                                    className={`rounded-full px-8 h-12 font-bold transition-all ${useSuggestedPrice
                                            ? "bg-white text-black hover:bg-gray-100"
                                            : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                                        }`}
                                >
                                    Use Suggested Price
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setUseSuggestedPrice(false);
                                    }}
                                    className={`rounded-full px-8 h-12 font-bold transition-all ${!useSuggestedPrice
                                            ? "bg-white text-black hover:bg-gray-100"
                                            : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                                        }`}
                                >
                                    Set Custom Price
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                <FormField
                    control={control}
                    name="pricePerNight"
                    rules={{ required: "Price is required", min: 1 }}
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel className="text-sm font-bold text-black uppercase tracking-wide ml-1">
                                Price per Night (€)
                                {prediction && !useSuggestedPrice && (
                                    <span className="text-[10px] text-gray-400 ml-3 uppercase tracking-widest font-black">Manual override</span>
                                )}
                            </FormLabel>
                            <FormControl>
                                <div className="relative group">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400 group-focus-within:text-black transition-colors">€</span>
                                    <Input
                                        type="number"
                                        {...field}
                                        onChange={(e) => {
                                            field.onChange(Number(e.target.value));
                                            if (prediction) {
                                                setUseSuggestedPrice(false);
                                            }
                                        }}
                                        className="h-16 pl-12 pr-8 rounded-2xl bg-gray-50 border-gray-200 text-2xl font-black text-black placeholder:text-gray-400 focus:border-black transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {!prediction && (nbOfGuests && nbOfBedrooms && nbOfBeds && nbOfBathrooms && type) && (
                    <Button
                        type="button"
                        onClick={predictPrice}
                        disabled={isPredicting}
                        className="w-full h-14 rounded-2xl bg-black hover:bg-gray-800 text-white font-bold shadow-xl transition-all"
                    >
                        {isPredicting ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                Analyzing market data...
                            </>
                        ) : (
                            <>
                                <TrendingUp className="w-5 h-5 mr-3" />
                                Get AI Price Suggestion
                            </>
                        )}
                    </Button>
                )}

                {!prediction && (!nbOfGuests || !nbOfBedrooms || !nbOfBeds || !nbOfBathrooms || !type) && (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2rem] p-8 text-center">
                        <p className="text-gray-500 font-medium">
                            Complete capacity details and property type to enable AI price prediction.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PricePredictionStep;