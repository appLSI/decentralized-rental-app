import React from 'react';
import { useFormContext } from "react-hook-form";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PropertyType } from '@/features/properties/types/properties.types';
import { PropertyFormData } from '../../types/host.types';
import { TrendingUp } from 'lucide-react';

const PROPERTY_TYPES: PropertyType[] = [
    "APARTMENT", "HOUSE", "VILLA", "CONDO", "CABIN", "COTTAGE", "LOFT", "STUDIO", "TINY_HOUSE", "CASTLE", "TREEHOUSE", "BOAT", "CAMPER"
];

const BasicsStep: React.FC = () => {
    const { control, watch } = useFormContext<PropertyFormData>();
    const descriptionValue = watch('description') || "";

    return (
        <div className="space-y-10">
            <div className="space-y-8">
                <FormField
                    control={control}
                    name="title"
                    rules={{ required: "Title is required", minLength: 5 }}
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel className="text-sm font-bold text-black uppercase tracking-wide ml-1">Property Title</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g. Modern Downtown Apartment"
                                    {...field}
                                    className="h-14 px-6 rounded-2xl bg-gray-50 border-gray-200 text-black placeholder:text-gray-400 focus:border-black transition-all"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="type"
                    rules={{ required: true }}
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel className="text-sm font-bold text-black uppercase tracking-wide ml-1">Property Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className="h-14 px-6 rounded-2xl bg-gray-50 border-gray-200 text-black focus:border-black transition-all">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-2xl border-gray-200 shadow-xl">
                                    {PROPERTY_TYPES.map(type => (
                                        <SelectItem key={type} value={type} className="rounded-xl focus:bg-black focus:text-white">{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="bg-slate-50 border-2 border-slate-100 rounded-[2rem] p-6 flex items-start gap-4">
                    <div className="p-3 bg-black rounded-2xl shrink-0">
                        <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h4 className="text-black font-bold mb-1">Smart Pricing Prediction</h4>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Price will be automatically suggested based on your property details after you complete the form.
                        </p>
                    </div>
                </div>

                <FormField
                    control={control}
                    name="description"
                    rules={{ required: "Description is required", minLength: 50 }}
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel className="text-sm font-bold text-black uppercase tracking-wide ml-1">Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Describe your property in detail..."
                                    className="min-h-[200px] px-6 py-4 rounded-2xl bg-gray-50 border-gray-200 text-black placeholder:text-gray-400 focus:border-black resize-none transition-all"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription className="text-gray-400 text-xs ml-1">
                                Minimum 50 characters. Currently: <span className={descriptionValue.length < 50 ? 'text-red-500' : 'text-green-500 font-bold'}>{descriptionValue.length}</span>
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
};

export default BasicsStep;
