import React from 'react';
import { Button } from "@/components/ui/button";
import { Upload, ImageIcon } from 'lucide-react';

interface PhotosStepProps {
    existingImages: string[];
    onRemoveExistingImage: (index: number) => void;
    previewUrls: string[];
    onRemoveSelectedFile: (index: number) => void;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PhotosStep: React.FC<PhotosStepProps> = ({
    existingImages,
    onRemoveExistingImage,
    previewUrls,
    onRemoveSelectedFile,
    onFileSelect
}) => {
    return (
        <div className="space-y-10">
            <div className="space-y-8">
                <div>
                    <h3 className="text-xl font-bold text-black uppercase tracking-tight mb-2">Property Gallery</h3>
                    <p className="text-sm text-gray-500 font-medium tracking-wide mb-8">Showcase your space to attract more guests</p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                        {/* Existing Images */}
                        {existingImages.map((img, i) => (
                            <div key={`existing-${i}`} className="relative aspect-square rounded-3xl overflow-hidden group shadow-lg border-2 border-transparent hover:border-black transition-all">
                                <img src={img} alt="" className="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => onRemoveExistingImage(i)}
                                        type="button"
                                        className="rounded-full h-10 w-full font-bold shadow-xl"
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}

                        {/* New File Previews */}
                        {previewUrls.map((url, i) => (
                            <div key={`new-${i}`} className="relative aspect-square rounded-3xl overflow-hidden group shadow-lg border-2 border-black/20">
                                <img src={url} alt="" className="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute top-3 right-3 bg-black text-white text-[10px] px-3 py-1 rounded-full font-black tracking-widest shadow-xl px-4 py-2">
                                    NEW
                                </div>
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => onRemoveSelectedFile(i)}
                                        type="button"
                                        className="rounded-full h-10 w-full font-bold shadow-xl"
                                    >
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        ))}

                        {/* Upload Button */}
                        <label className="flex flex-col items-center justify-center aspect-square rounded-[2rem] border-2 border-dashed border-gray-200 hover:border-black hover:bg-gray-50 cursor-pointer transition-all group relative bg-gray-50/50 shadow-inner">
                            <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-black transition-all">
                                <Upload className="h-6 w-6 text-gray-400 group-hover:text-white" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-500 group-hover:text-black transition-colors">Add Photos</span>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={onFileSelect}
                            />
                        </label>
                    </div>
                </div>

                <div className="bg-slate-50 border-2 border-slate-100 rounded-[2rem] p-8 flex items-start gap-5">
                    <div className="p-4 bg-white rounded-2xl text-black shadow-md border border-slate-100">
                        <ImageIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-black font-bold mb-1">Photography Guidelines</h4>
                        <p className="text-sm text-gray-500 leading-relaxed max-w-lg">
                            Upload at least 5 clear, high-resolution photos. We recommend including wide shots of all rooms and unique features to help your listing stand out.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhotosStep;
