import React from 'react';
import { useFormContext } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { usePropertiesStore } from '@/features/properties/hooks/usePropertiesStore';
import { PropertyFormData } from '../../types/host.types';

const DetailsAmenitiesStep: React.FC = () => {
    const { control } = useFormContext<PropertyFormData>();
    const { characteristics } = usePropertiesStore();

    return (
        <div className="space-y-12">
            <div className="space-y-6">
                <FormLabel className="text-sm font-bold text-black uppercase tracking-wide ml-1 block mb-4">Property Capacity & Rooms</FormLabel>
                <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
                    <FormField
                        control={control}
                        name="nbOfGuests"
                        rules={{ min: 1 }}
                        render={({ field }) => (
                            <FormItem className="text-center space-y-3">
                                <FormLabel className="text-gray-500 text-xs font-bold uppercase tracking-wider">Guests</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        onChange={e => field.onChange(Number(e.target.value))}
                                        className="h-20 text-center text-3xl font-black rounded-3xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-black transition-all"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="nbOfBedrooms"
                        rules={{ min: 0 }}
                        render={({ field }) => (
                            <FormItem className="text-center space-y-3">
                                <FormLabel className="text-gray-500 text-xs font-bold uppercase tracking-wider">Bedrooms</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        onChange={e => field.onChange(Number(e.target.value))}
                                        className="h-20 text-center text-3xl font-black rounded-3xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-black transition-all"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="nbOfBeds"
                        rules={{ min: 0 }}
                        render={({ field }) => (
                            <FormItem className="text-center space-y-3">
                                <FormLabel className="text-gray-500 text-xs font-bold uppercase tracking-wider">Beds</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        onChange={e => field.onChange(Number(e.target.value))}
                                        className="h-20 text-center text-3xl font-black rounded-3xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-black transition-all"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="nbOfBathrooms"
                        rules={{ min: 0 }}
                        render={({ field }) => (
                            <FormItem className="text-center space-y-3">
                                <FormLabel className="text-gray-500 text-xs font-bold uppercase tracking-wider">Bathrooms</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        onChange={e => field.onChange(Number(e.target.value))}
                                        className="h-20 text-center text-3xl font-black rounded-3xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-black transition-all"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            <div className="pt-10 border-t-2 border-gray-100">
                <FormLabel className="text-sm font-bold text-black uppercase tracking-wide ml-1 block mb-8">Amenities & Features</FormLabel>
                <FormField
                    control={control}
                    name="characteristics"
                    render={() => (
                        <FormItem>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {characteristics.map((char) => (
                                    <FormField
                                        key={char.id}
                                        control={control}
                                        name="characteristics"
                                        render={({ field }) => {
                                            const isChecked = field.value?.some(c => c.id === char.id);
                                            return (
                                                <FormItem
                                                    key={char.id}
                                                    className={`flex flex-row items-center space-x-4 space-y-0 p-5 rounded-[1.5rem] border-2 transition-all cursor-pointer ${isChecked
                                                        ? 'bg-black border-black shadow-xl'
                                                        : 'bg-gray-50 border-gray-50 hover:border-gray-200'
                                                        }`}
                                                    onClick={() => {
                                                        const newValue = isChecked
                                                            ? field.value?.filter(v => v.id !== char.id)
                                                            : [...(field.value || []), { id: char.id }];
                                                        field.onChange(newValue);
                                                    }}
                                                >
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={isChecked}
                                                            onCheckedChange={(checked) => {
                                                                return checked
                                                                    ? field.onChange([...(field.value || []), { id: char.id }])
                                                                    : field.onChange(
                                                                        field.value?.filter(
                                                                            (value) => value.id !== char.id
                                                                        )
                                                                    )
                                                            }}
                                                            className={`h-6 w-6 rounded-lg border-2 transition-colors ${isChecked
                                                                    ? 'bg-white border-white data-[state=checked]:bg-white data-[state=checked]:text-black'
                                                                    : 'border-gray-300'
                                                                }`}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </FormControl>
                                                    <div className="flex-1">
                                                        <FormLabel className={`text-sm font-bold cursor-pointer block mb-0.5 transition-colors ${isChecked ? 'text-white' : 'text-black'}`}>
                                                            {char.name}
                                                        </FormLabel>
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isChecked ? 'text-gray-400' : 'text-gray-400'}`}>
                                                            {char.typeCaracteristique?.name || 'Amenity'}
                                                        </span>
                                                    </div>
                                                </FormItem>
                                            )
                                        }}
                                    />
                                ))}
                            </div>
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
};

export default DetailsAmenitiesStep;
